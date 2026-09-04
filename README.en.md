# Tibo Reset Watcher

[简体中文](README.md) · [English](README.en.md)

An Edge-first, Chrome-compatible Manifest V3 extension that watches public X posts from [@thsottiaux](https://x.com/thsottiaux) and sends local notifications when a post appears to concern ChatGPT, Codex, or ChatGPT Work quota resets, increases, or rule changes.

> Current version: `0.5.2`. This project is not affiliated with or endorsed by OpenAI, X Corp., Microsoft, or Thibault Sottiaux.

## Quick start for non-developers

No coding, server, X API, or OpenAI API is required.

### 1. Download and unzip

Open [GitHub Releases](https://github.com/lonelyisle1/tibo-reset-watcher/releases) and download:

```text
tibo-reset-watcher-edge-v0.5.2.zip
```

Right-click the ZIP and extract it. Do not select the ZIP itself when installing the extension.

### 2. Load the extension

| Browser | Open in the address bar |
| --- | --- |
| Microsoft Edge | `edge://extensions/` |
| Google Chrome | `chrome://extensions/` |

Then:

1. Enable **Developer mode**.
2. Click **Load unpacked**.
3. Select the extracted folder that directly contains `manifest.json`.
4. Pin **Tibo Reset Watcher** to the browser toolbar.

If the browser says the manifest is missing, you selected the ZIP, its parent folder, or the wrong subfolder.

### 3. First run

1. Sign in to [X.com](https://x.com/) in the same browser profile.
2. Open the extension popup. The first check normally starts automatically.
3. If needed, click **Check now**.
4. Leave the pinned X monitoring tab open while the first 72-hour backfill runs. It may take several minutes.
5. Click **Test notification** and make sure Windows allows notifications from Edge or Chrome.

## Understanding the numbers

| Popup field | Meaning |
| --- | --- |
| This scan | Posts that X returned during the latest web-page scan. This number may fluctuate. |
| Known across 72 hours | The union of post IDs observed across multiple scans within the rolling 72-hour window. |
| Quota-related | Posts matched locally as resets, limit increases, or rule changes. |
| Resets | Upcoming, possible, or completed resets among the matched posts. |
| Filtered | Posts returned by X but classified locally as ordinary content; this does not mean the fetch failed. |
| Possibly incomplete | X did not provide a complete visible result set for at least one date segment. |

Open **View per-date diagnostics** to see scan counts, cumulative counts, relevant matches, scrolls, and completion status for each UTC date segment.

## What it does

- Monitors only `@thsottiaux` in the first release.
- Uses broad date-segmented `from:thsottiaux` searches, then classifies posts locally.
- Recognizes upcoming, possible, and completed resets, plus limit and rule changes.
- Covers observed wording such as `reset will land at`, `we are resetting usage`, `reset has been propagated`, `brand new usage`, and `usage allocation`.
- Treats Tibo-style implicit phrases such as `in need of a reset` as lower-confidence possible-reset signals while filtering explicit laptop, password, router, and other non-quota resets.
- Reclassifies posts after a classifier-version update, so a previously filtered post can trigger a delayed alert without repeating notifications already sent.
- Handles common negated phrases such as “No reset is planned.”
- Distinguishes realtime and delayed discovery.
- Deduplicates notifications by post ID.
- Keeps at most 50 quota-related history events.
- Keeps a rolling 72-hour union without storing ordinary post text.
- Automatically uses English or Chinese based on browser UI language.
- Detects Microsoft Edge or Google Chrome and shows matching guidance.

## Important limitations

- You must remain signed in to X in the browser running the extension.
- Monitoring cannot run while the computer is off, asleep, offline, or the browser is fully exited.
- X controls which search results are visible. This extension cannot guarantee API-level completeness.
- X can change its page structure, which may require an extension update.
- Local rules can miss new wording or produce occasional false positives.
- Edge and Chrome keep separate local state. Running both may duplicate alerts and increase X search traffic, so using one primary browser is recommended.
- An unpacked GitHub installation does not update automatically. Replace the local files and click **Reload** on the extensions page after downloading a new version.

## Privacy

There is no developer server, analytics, advertising, telemetry, or remote code. The extension does not read or upload X passwords, cookies, session tokens, DMs, browsing history, or ChatGPT content. See [the English privacy notice](PRIVACY.en.md) for details.

## Development and testing

Requires Node.js 20 or newer:

```bash
npm test
npm run check
```

Manual testing instructions are in [docs/TESTING.md](docs/TESTING.md). Contribution guidance is in [CONTRIBUTING.md](CONTRIBUTING.md).

## Support

Open a GitHub Issue with the browser name and version, extension version, a popup screenshot, and the per-date diagnostics. Never upload cookies, passwords, or a complete browser profile.

## License

[MIT](LICENSE)
