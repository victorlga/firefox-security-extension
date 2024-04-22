const thirdPartyRequests = {};

chrome.tabs.onRemoved.addListener(function(tabId) {
  delete thirdPartyRequests[tabId];
});

// Listen to all web requests
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const parser = document.createElement('a');
    parser.href = details.url;
    const domain = parser.hostname;
    const tabId = details.tabId;

    if (tabId < 0) return; // Ignore requests from background processes

    chrome.tabs.get(tabId, tab => {
      if (chrome.runtime.lastError) {
        // Handle errors such as when the tab has been closed
        return;
      }

      const tabDomain = new URL(tab.url).hostname;

      // Check if the domain is different from the tab's main domain
      if (domain !== tabDomain) {
        // Store third-party requests
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

function countCookies(domain) {
  return new Promise(resolve => {
    chrome.cookies.getAll({}, function(cookies) {
      const cookieDetails = {
        total: cookies.length,
        firstParty: 0,
        thirdParty: 0,
        sessionCookies: 0,
        persistentCookies: 0
      };

      cookies.forEach(cookie => {
        if (cookie.domain === domain) {
          cookieDetails.firstParty++;
        } else {
          cookieDetails.thirdParty++;
        }

        if ("session" in cookie && cookie.session) {
          cookieDetails.sessionCookies++;
        } else {
          cookieDetails.persistentCookies++;
        }
      });

      resolve(cookieDetails);
    });
  });
}


// Handle messages from the popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.query === 'getThirdPartyDomains') {
    sendResponse(Array.from(thirdPartyRequests[msg.tabId] || []));
  }

  if (msg.action === "countCookies") {
    countCookies(msg.domain).then(cookieDetails => {
      sendResponse(cookieDetails);
    });
    return true;  // Keep the message channel open for the response
  }

  if (msg.query === "checkLocalStorage") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(tabs[0].id, {
        code: 'Object.keys(localStorage).length'
      }, function(results) {
        if (chrome.runtime.lastError) {
          sendResponse({error: chrome.runtime.lastError.message});
        } else {
          sendResponse({data: results[0]});
        }
      });
    });
    return true;
  }
});
