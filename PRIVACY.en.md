# Tibo Reset Watcher Privacy Notice

Last updated: 2026-08-02

Tibo Reset Watcher is a local, single-purpose browser extension. It monitors public X posts from `@thsottiaux` and alerts users to ChatGPT, Codex, and ChatGPT Work quota resets, increases, or rule changes.

## Accounts

- You do not create or sign in to an extension account.
- You must remain signed in to X.com in the same Edge or Chrome profile in which the extension is installed so X can display public search results.
- The extension never asks for your X username or password.

## Data processed and stored locally

The extension stores only monitoring data in `chrome.storage.local`: settings; check timestamps and status; processed post IDs and deduplication metadata; the most recently seen post ID; errors and backfill summaries; a rolling 72-hour union of observed public post IDs, publication and observation times, and local classification results; and up to 50 quota-related events matched by local rules. The rolling cache does not store ordinary post text. A matched event may contain public post text, ID, publication time, URL, post type, author, discovery time, and local classification.

Deduplication IDs are retained for 14 days by default and are capped. Event history is limited to 50 items.

## Data the extension does not read, collect, store, or upload

The extension does not intentionally access or transmit X passwords, cookies, session tokens, authentication headers, direct messages, user profiles, browsing history, ChatGPT accounts or conversations, actual quota balances, contacts, location, payment data, device identifiers, advertising identifiers, or unrelated data.

There is no developer server, analytics, advertising, telemetry, cross-device synchronization, or remotely loaded code. Local data is not sent to the developer.

## Public information read

The content script runs only on relevant X search and Tibo profile pages and accepts only public post URLs belonging to `@thsottiaux`. It processes post text, post ID, publication time, URL, post type, and author. Post IDs are used to deduplicate the same post across page layouts.

## Permissions

| Permission | Purpose |
| --- | --- |
| `storage` | Store settings, runtime status, deduplication IDs, and up to 50 quota-related events locally. |
| `alarms` | Wake the Manifest V3 service worker for scheduled checks, retries, and timeout protection. |
| `notifications` | Show quota alerts, X-login warnings, and repeated-failure notices. |
| `https://x.com/*` | Create, refresh, and read visible public Tibo posts on X pages. |

The extension does not request `tabs`, `cookies`, `history`, `downloads`, `<all_urls>`, or unrelated permissions.

## Third-party service

When you visit X.com, X handles the page and network requests under its own terms and privacy policy, just as during an ordinary visit. This extension does not represent or control X and does not bypass sign-in, CAPTCHA, access restrictions, or rate limits.

## Your controls

You can pause monitoring in the popup, clear quota-event history in settings, close the monitoring tab, disable or uninstall the extension from `edge://extensions/` or `chrome://extensions/`, and remove all extension-local data by uninstalling it. Clearing history intentionally keeps deduplication IDs so old posts do not notify again.

## Future changes

If a future version adds a server, API, analytics, synchronization, remote model, or new data use, this notice, the README, permissions, and store disclosures must be updated before release.

## Contact

After the project is published on GitHub, privacy questions should be submitted through the repository Issues page or the maintainer contact listed there. A public HTTPS privacy-policy URL and official support link must be added before store submission.
