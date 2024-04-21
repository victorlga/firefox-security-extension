const thirdPartyRequests = {};

// Listen to all web requests
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const parser = document.createElement('a');
    parser.href = details.url;

    // Get the domain from the URL
    const domain = parser.hostname;
    const tabId = details.tabId;

    // Ignore requests from background processes
    if (tabId < 0) return;

    chrome.tabs.get(tabId, tab => {
      if (chrome.runtime.lastError) {
        // Handle errors (e.g., tab has been closed)
        return;
      }

      const tabDomain = new URL(tab.url).hostname;

      // Check if the domain is different from the tab's main domain
      if (domain !== tabDomain) {
        if (!thirdPartyRequests[tabId]) {
          thirdPartyRequests[tabId] = new Set();
        }
        thirdPartyRequests[tabId].add(domain);
      }
    });
  },
  {urls: ["<all_urls>"]},
  []
);

// Handle message from the popup
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.query === 'getThirdPartyDomains') {
    response(thirdPartyRequests[msg.tabId] || []);
  }
});
