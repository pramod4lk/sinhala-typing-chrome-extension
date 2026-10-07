// Service worker: keyboard-shortcut toggle and toolbar badge.
// chrome.storage.sync { enabled } is the single source of truth; keep no state here.

function updateBadge(enabled) {
  chrome.action.setBadgeText({ text: enabled ? 'සිං' : '' });
  chrome.action.setBadgeBackgroundColor({ color: '#8a1538' });
  chrome.action.setTitle({
    title: `Singlish → Sinhala: ${enabled ? 'ON' : 'OFF'} (Alt+Shift+S to toggle)`,
  });
}

function refreshBadge() {
  chrome.storage.sync.get({ enabled: true }, (items) => updateBadge(items.enabled));
}

chrome.runtime.onInstalled.addListener(refreshBadge);
chrome.runtime.onStartup.addListener(refreshBadge);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.enabled) updateBadge(changes.enabled.newValue);
});

chrome.commands.onCommand.addListener((command) => {
  if (command !== 'toggle-conversion') return;
  chrome.storage.sync.get({ enabled: true }, (items) => {
    chrome.storage.sync.set({ enabled: !items.enabled });
  });
});
