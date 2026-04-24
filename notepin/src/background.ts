chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== 'object') return;
  if ((message as any).type !== 'OPEN_OPTIONS_PAGE') return;

  try {
    if (typeof chrome.runtime.openOptionsPage === 'function') {
      chrome.runtime.openOptionsPage(() => {
        sendResponse({ ok: !chrome.runtime.lastError });
      });
      return true;
    }
  } catch {
    sendResponse({ ok: false });
    return;
  }
  sendResponse({ ok: false });
});
