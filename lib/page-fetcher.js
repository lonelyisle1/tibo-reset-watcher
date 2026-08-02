(() => {
  const HANDLE = "thsottiaux";
  const STATUS_PATH = new RegExp(`^/${HANDLE}/status/(\\d+)`, "i");
  const LOGIN_TEXT = ["sign in to x", "log in to x", "登录 x", "登入 x"];
  const FAILURE_TEXT = ["rate limit exceeded", "something went wrong", "try reloading", "超过速率限制", "出错了"];
  const EMPTY_TEXT = ["no results for", "try searching for something else", "没有找到结果", "暂无结果"];
  const UI_IS_ZH = String(chrome.i18n?.getUILanguage?.() || navigator.language || "").toLowerCase().startsWith("zh");
  const BROWSER_NAME = /Edg\//i.test(navigator.userAgent) ? "Microsoft Edge" : /Chrome\//i.test(navigator.userAgent) ? "Google Chrome" : "Chromium";
  const copy = (zh, en) => UI_IS_ZH ? zh : en;

  const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

  function normalizedText(node) {
    return String(node?.innerText || node?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function statusAnchorFor(article) {
    for (const time of article.querySelectorAll("time")) {
      const anchor = time.closest('a[href*="/status/"]');
      if (!anchor) continue;
      const path = new URL(anchor.href, location.origin).pathname;
      if (STATUS_PATH.test(path)) return anchor;
    }
    return [...article.querySelectorAll('a[href*="/status/"]')].find((anchor) => {
      try { return STATUS_PATH.test(new URL(anchor.href, location.origin).pathname); }
      catch { return false; }
    }) || null;
  }

  function detectPostType(article) {
    const text = normalizedText(article).toLocaleLowerCase();
    const socialContext = normalizedText(article.querySelector('[data-testid="socialContext"]')).toLocaleLowerCase();
    if (socialContext.includes("repost") || socialContext.includes("转发")) return "repost";
    if (text.includes("replying to") || text.includes("回复给") || text.includes("正在回复")) return "reply";
    if (article.querySelectorAll('[data-testid="tweetText"]').length > 1 || article.querySelector('[data-testid="card.wrapper"]')) {
      return "quote";
    }
    return "original";
  }

  function isPinnedPost(article) {
    const socialContext = normalizedText(article.querySelector('[data-testid="socialContext"]')).toLocaleLowerCase();
    return socialContext.includes("pinned") || socialContext.includes("置顶");
  }

  function pageSource() {
    return location.pathname === "/search" ? "x_search_page" : "x_profile_with_replies";
  }

  function readPost(article) {
    const statusAnchor = statusAnchorFor(article);
    const textNode = article.querySelector('[data-testid="tweetText"]');
    if (!statusAnchor || !textNode) return null;

    const url = new URL(statusAnchor.href, location.origin);
    const match = url.pathname.match(STATUS_PATH);
    const text = normalizedText(textNode);
    const time = statusAnchor.querySelector("time") || article.querySelector("time");
    if (!match || !text) return null;

    return {
      id: match[1],
      text,
      url: `https://x.com/${HANDLE}/status/${match[1]}`,
      publishedAt: time?.dateTime || time?.getAttribute("datetime") || null,
      postType: detectPostType(article),
      authorHandle: HANDLE,
      source: pageSource(),
      isPinned: isPinnedPost(article)
    };
  }

  function inspectPageState() {
    const pageText = normalizedText(document.body).toLocaleLowerCase();
    const articleCount = document.querySelectorAll('article[data-testid="tweet"]').length;
    const loginRequired = location.pathname.startsWith("/i/flow/login") ||
      Boolean(document.querySelector('input[autocomplete="username"]')) ||
      (articleCount === 0 && LOGIN_TEXT.some((text) => pageText.includes(text)));
    if (loginRequired) {
      return { ok: false, code: "login_required", message: copy(`X登录状态可能已失效，请先在${BROWSER_NAME}中登录X，然后重新检查。`, `Your X login may have expired. Sign in to X in ${BROWSER_NAME}, then check again.`) };
    }
    const failure = FAILURE_TEXT.find((text) => pageText.includes(text));
    if (failure) return { ok: false, code: "x_page_error", message: copy(`X页面返回错误：${failure}`, `X returned a page error: ${failure}`) };
    const empty = articleCount === 0 && EMPTY_TEXT.some((text) => pageText.includes(text));
    if (empty) return { ok: true, code: "empty_results", message: copy("该日期区间没有X可见结果。", "X shows no visible results for this date segment."), empty: true };
    return { ok: true, code: "ready", message: copy("X页面可读取", "The X page is readable."), empty: false };
  }

  function visiblePosts() {
    const posts = [...document.querySelectorAll('article[data-testid="tweet"]')]
      .map(readPost)
      .filter(Boolean);
    return [...new Map(posts.map((post) => [post.id, post])).values()];
  }

  async function waitForInitialContent(maxWaitMs = 20_000) {
    const started = Date.now();
    while (Date.now() - started < maxWaitMs) {
      const state = inspectPageState();
      if (!state.ok || state.empty || visiblePosts().length > 0) return state;
      await pause(500);
    }
    return inspectPageState();
  }

  async function waitForNewContent(previousIds, previousHeight, maxWaitMs = 5_500) {
    const started = Date.now();
    while (Date.now() - started < maxWaitMs) {
      const state = inspectPageState();
      if (!state.ok) return { changed: false, state };
      const posts = visiblePosts();
      const hasNewId = posts.some((post) => !previousIds.has(post.id));
      const heightChanged = document.documentElement.scrollHeight > previousHeight + 20;
      if (hasNewId || heightChanged) return { changed: true, state };
      await pause(300);
    }
    return { changed: false, state: inspectPageState() };
  }

  async function scan(config, callbacks = {}) {
    const startedAt = Date.now();
    const cutoff = Date.parse(config.cutoffAt);
    const collected = new Map();
    let oldestSeenAt = null;
    let newestSeenAt = null;
    let scrolls = 0;
    let stalledRounds = 0;
    let reachedCutoff = false;
    let foundStopPost = false;
    let completionReason = "unknown";

    window.scrollTo({ top: 0, behavior: "instant" });
    await pause(1_000);
    const initialState = await waitForInitialContent();
    if (!initialState.ok) {
      return { ok: false, errorCode: initialState.code, error: initialState.message, postsFound: 0, scrolls: 0 };
    }
    if (initialState.empty && config.mode === "segment") {
      return {
        ok: true,
        complete: true,
        completionReason: "explicit_empty_results",
        postsFound: 0,
        scrolls: 0,
        durationMs: Date.now() - startedAt,
        pageSource: pageSource()
      };
    }

    while (scrolls <= config.maxScrolls && Date.now() - startedAt < config.maxDurationMs) {
      const pageState = inspectPageState();
      if (!pageState.ok) {
        return {
          ok: false,
          errorCode: pageState.code,
          error: pageState.message,
          postsFound: collected.size,
          scrolls,
          oldestSeenAt,
          newestSeenAt
        };
      }

      const posts = visiblePosts();
      const batch = [];
      for (const post of posts) {
        if (!collected.has(post.id)) batch.push(post);
        collected.set(post.id, post);
        if (post.id === config.stopPostId) foundStopPost = true;
        const timestamp = Date.parse(post.publishedAt || "");
        if (Number.isFinite(timestamp) && !post.isPinned) {
          if (!oldestSeenAt || timestamp < Date.parse(oldestSeenAt)) oldestSeenAt = post.publishedAt;
          if (!newestSeenAt || timestamp > Date.parse(newestSeenAt)) newestSeenAt = post.publishedAt;
          if (Number.isFinite(cutoff) && timestamp <= cutoff) reachedCutoff = true;
        }
      }

      if (batch.length) await callbacks.onBatch?.(batch);
      await callbacks.onProgress?.({ postsFound: collected.size, scrolls, oldestSeenAt, newestSeenAt });

      if (config.mode === "quick" && foundStopPost) {
        completionReason = "last_seen_post_reached";
        break;
      }
      if (config.mode === "backfill" && reachedCutoff) {
        completionReason = "lookback_boundary_reached";
        break;
      }

      const previousIds = new Set(posts.map((post) => post.id));
      const previousHeight = document.documentElement.scrollHeight;
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
      scrolls += 1;
      const waitResult = await waitForNewContent(previousIds, previousHeight);
      if (!waitResult.state.ok) {
        return {
          ok: false,
          errorCode: waitResult.state.code,
          error: waitResult.state.message,
          postsFound: collected.size,
          scrolls,
          oldestSeenAt,
          newestSeenAt
        };
      }
      stalledRounds = waitResult.changed ? 0 : stalledRounds + 1;
      const maxStalledRounds = config.mode === "segment" ? 4 : 5;
      if (stalledRounds >= maxStalledRounds) {
        completionReason = config.mode === "segment" ? "segment_results_exhausted" : "no_more_visible_results";
        break;
      }
    }

    if (completionReason === "unknown") {
      completionReason = scrolls > config.maxScrolls ? "scroll_safety_limit" : "time_safety_limit";
    }

    const complete = config.mode === "segment"
      ? completionReason === "segment_results_exhausted"
      : config.mode === "quick"
        ? foundStopPost || reachedCutoff
        : reachedCutoff;
    const hasReadableResult = collected.size > 0 || (config.mode === "segment" && completionReason === "explicit_empty_results");
    return {
      ok: hasReadableResult,
      errorCode: hasReadableResult ? null : "no_posts_visible",
      error: hasReadableResult ? null : copy("X页面已打开，但没有读取到任何Tibo帖子。", "The X page opened, but no readable Tibo posts were found."),
      complete,
      completionReason,
      postsFound: collected.size,
      scrolls,
      oldestSeenAt,
      newestSeenAt,
      reachedCutoff,
      foundStopPost,
      durationMs: Date.now() - startedAt,
      pageSource: pageSource()
    };
  }

  globalThis.TiboPageFetcher = Object.freeze({ scan, visiblePosts, inspectPageState });
})();
