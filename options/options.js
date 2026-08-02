import { DEFAULT_SETTINGS } from "../lib/config.js";
import { detectBrowser, getUiLocale, localizeDocument, tr } from "../lib/i18n.js";

const browser = detectBrowser();
const locale = getUiLocale();
localizeDocument(document, browser, locale);
document.querySelector("#settings-eyebrow").textContent = tr("settingsEyebrow", { browser: browser.name }, locale);
document.querySelector("#interval-help").textContent = tr("intervalHelp", { browser: browser.name }, locale);
document.querySelector("#background-settings-title").textContent = tr("backgroundSettingsTitle", { browser: browser.name }, locale);
document.querySelector("#background-settings-body").textContent = tr(browser.key === "edge" ? "backgroundEdge" : "backgroundChrome", {}, locale);

const form = document.querySelector("#settings-form");
const interval = document.querySelector("#interval");
const supplementalTerms = document.querySelector("#supplemental-terms");
const notifyRuleChanges = document.querySelector("#notify-rule-changes");
const saveStatus = document.querySelector("#save-status");

function termsFromTextarea(textarea) {
  return [...new Set(textarea.value.split("\n").map((item) => item.trim()).filter(Boolean))];
}

async function load() {
  const { settings = {} } = await chrome.storage.local.get("settings");
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  interval.value = String(merged.intervalMinutes);
  supplementalTerms.value = merged.supplementalTerms.join("\n");
  notifyRuleChanges.checked = merged.notifyRuleChanges !== false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const { settings = {} } = await chrome.storage.local.get("settings");
  const next = {
    ...DEFAULT_SETTINGS,
    ...settings,
    intervalMinutes: Number(interval.value),
    supplementalTerms: termsFromTextarea(supplementalTerms),
    notifyRuleChanges: notifyRuleChanges.checked
  };
  await chrome.storage.local.set({ settings: next });
  await chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED" });
  saveStatus.textContent = tr("settingsSaved", {}, locale);
  setTimeout(() => { saveStatus.textContent = ""; }, 1800);
});

document.querySelector("#test-notification").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ type: "TEST_NOTIFICATION" });
  saveStatus.textContent = tr("testSent", {}, locale);
});

document.querySelector("#clear-history").addEventListener("click", async () => {
  if (!confirm(tr("clearConfirm", {}, locale))) return;
  await chrome.storage.local.set({ history: [] });
  saveStatus.textContent = tr("historyCleared", {}, locale);
});

load();
