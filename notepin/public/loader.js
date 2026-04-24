(async () => {
  const src = chrome.runtime.getURL('content.js');
  const contentScript = await import(src);
  // The content script will run automatically on import
})();
