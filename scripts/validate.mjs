import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8"));
const requiredFiles = [
  manifest.background?.service_worker,
  manifest.action?.default_popup,
  manifest.options_page,
  ...(manifest.content_scripts || []).flatMap((entry) => entry.js || []),
  ...Object.values(manifest.icons || {}),
  "icons/notification-urgent.png",
  "icons/notification-possible.png",
  "icons/notification-completed.png",
  "icons/notification-change.png",
  "icons/notification-system.png",
  "lib/check-stats.js",
  "lib/i18n.js",
  "lib/processing-state.js",
  "lib/rolling-observations.js",
  "_locales/en/messages.json",
  "_locales/zh_CN/messages.json",
  "_locales/zh_TW/messages.json",
  "README.md",
  "README.en.md",
  "PRIVACY.md",
  "PRIVACY.en.md",
  "docs/TESTING.md",
  "docs/CHECKLISTS.md",
  "store/EDGE_LISTING.md",
  "LICENSE"
].filter(Boolean);

if (manifest.manifest_version !== 3) throw new Error("manifest_version must be 3");
if (manifest.default_locale !== "en") throw new Error("The default extension locale must remain English");
if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) throw new Error("version must use x.y.z format");
const allowedPermissions = new Set(["storage", "alarms", "notifications"]);
for (const permission of manifest.permissions || []) {
  if (!allowedPermissions.has(permission)) throw new Error(`Unexpected broad permission: ${permission}`);
}
if ((manifest.permissions || []).includes("tabs")) throw new Error("The tabs permission is intentionally not needed");
if (JSON.stringify(manifest.host_permissions || []) !== JSON.stringify(["https://x.com/*"])) {
  throw new Error("Host permissions must remain limited to https://x.com/*");
}

for (const relativePath of requiredFiles) {
  const info = await stat(resolve(root, relativePath));
  if (!info.isFile()) throw new Error(`Expected a file: ${relativePath}`);
}

const background = await readFile(resolve(root, "background.js"), "utf8");
const contentFiles = ["content.js", "lib/page-fetcher.js"];
const contentSources = await Promise.all(contentFiles.map((file) => readFile(resolve(root, file), "utf8")));
for (const [name, source] of [["background.js", background], ...contentFiles.map((file, index) => [file, contentSources[index]])]) {
  if (/\beval\s*\(|\bnew Function\s*\(/.test(source)) {
    throw new Error(`${name} contains remotely unsafe dynamic code execution`);
  }
}

for (const stateField of [
  "lastSuccessfulCheckAt", "lastAttemptAt", "processedPostIds", "lastSeenPostId", "lastError", "monitoringStatus"
]) {
  if (!background.includes(stateField)) throw new Error(`Missing required persistent state field: ${stateField}`);
}
if (/slice\(\s*0\s*,\s*20\s*\)/.test(contentSources.join("\n"))) {
  throw new Error("Backfill must not use a hard recent-20-post limit");
}
const contentMatches = (manifest.content_scripts || []).flatMap((entry) => entry.matches || []);
if (!contentMatches.includes("https://x.com/thsottiaux*")) {
  throw new Error("The profile fallback content-script match is missing");
}
if (/notifications\.create\(\s*["']system:test["']/.test(background)) {
  throw new Error("Test notifications must use a unique ID so every click can surface a new notification");
}
if (!background.includes("buildBackfillSegments") || !contentSources.join("\n").includes("waitForNewContent")) {
  throw new Error("Date-segmented backfill and adaptive page waiting must remain enabled");
}
if (!background.includes("matchedPostTypes") || !background.includes("stageLastActivityAt")) {
  throw new Error("Local match statistics and progress-aware timeout recovery must remain enabled");
}
if (!background.includes("recentObservedPosts") || !background.includes("rollingKnown")) {
  throw new Error("The rolling 72-hour observation union must remain enabled");
}
if (!background.includes("CLASSIFIER_VERSION") || !background.includes("shouldClassifyPost")) {
  throw new Error("Classifier-version reprocessing must remain enabled");
}

const { tr } = await import(pathToFileURL(resolve(root, "lib/i18n.js")).href);
for (const page of ["popup/popup.html", "options/options.html"]) {
  const html = await readFile(resolve(root, page), "utf8");
  const keys = [...html.matchAll(/data-i18n(?:-title|-aria)?="([^"]+)"/g)].map((match) => match[1]);
  for (const key of keys) {
    if (tr(key, {}, "en") === key || tr(key, {}, "zh-CN") === key) {
      throw new Error(`Missing localized UI message ${key} referenced by ${page}`);
    }
  }
}

console.log(`Validated Manifest V${manifest.manifest_version} extension ${manifest.name} ${manifest.version}`);
console.log(`Checked ${requiredFiles.length} referenced and project files`);
