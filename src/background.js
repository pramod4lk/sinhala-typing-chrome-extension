// Service worker: keyboard-shortcut toggle and toolbar icon state.
// chrome.storage.sync { enabled } is the single source of truth; keep no state here.

const ICON_SIZES = [16, 32, 48, 128];
const iconSet = (prefix) =>
  Object.fromEntries(ICON_SIZES.map((s) => [s, `/icons/${prefix}${s}.png`]));
const ON_ICONS = iconSet('icon');
const OFF_ICONS = iconSet('off-');

// No badge text: it rendered as a second icon over the toolbar button.
// The icon itself turns grey when typing on pages is paused.
function updateAction(enabled) {
  chrome.action.setBadgeText({ text: '' });
  chrome.action.setIcon({ path: enabled ? ON_ICONS : OFF_ICONS });
  chrome.action.setTitle({
    title: `Singlish → Sinhala: ${enabled ? 'ON' : 'OFF'} (Alt+Shift+S to toggle)`,
  });
}

function refreshAction() {
  chrome.storage.sync.get({ enabled: true }, (items) => updateAction(items.enabled));
}

chrome.runtime.onInstalled.addListener(refreshAction);
chrome.runtime.onStartup.addListener(refreshAction);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.enabled) updateAction(changes.enabled.newValue);
});

chrome.commands.onCommand.addListener((command) => {
  if (command !== 'toggle-conversion') return;
  chrome.storage.sync.get({ enabled: true }, (items) => {
    chrome.storage.sync.set({ enabled: !items.enabled });
  });
});
