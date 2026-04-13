// Checks the URL cus I don't wanna broke the extension and also destroy user experience

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (!details.url || !details.tabId) return;
  chrome.tabs.sendMessage(details.tabId, { type: 'NAVIGATED', url: details.url }, () => {
    chrome.runtime.lastError; 
  });
}, {
  url: [
    { hostContains: 'music.youtube.com', schemes: ['https'] }
  ]
});
