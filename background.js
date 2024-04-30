const thirdPartyRequests = {};
const cookieDetailsByTabId = {};
const storageCountsByTabId = {};
const hasUnusualPort = {};

chrome.tabs.onRemoved.addListener(function(tabId) {
  delete thirdPartyRequests[tabId];
  gradeScore = 0;
});

function getBaseDomain(domain) {
  const parts = domain.split('.').reverse();
  if (parts.length >= 2) {
    const tld = parts[0];
    const sld = parts[1];
    return `${sld}.${tld}`;
  }
  return domain;
}

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);
    const domain = url.hostname;
    const tabId = details.tabId;

    if (tabId < 0) return; // Ignore requests from background processes

    chrome.tabs.get(tabId, function(tab) {
      if (chrome.runtime.lastError) {
        // Handle errors such as when the tab has been closed
        return;
      }

      const tabDomain = new URL(tab.url).hostname;
      const baseDomain = getBaseDomain(domain);
      const baseTabDomain = getBaseDomain(tabDomain);

      // Check if the base domain is different from the tab's base main domain
      if (baseDomain !== baseTabDomain) {
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


function countCookies(tabId, domain) {
  return new Promise(resolve => {
    chrome.cookies.getAll({}, function(cookies) {
      const details = {
        total: cookies.length,
        firstParty: 0,
        thirdParty: 0,
        sessionCookies: 0,
        persistentCookies: 0
      };

      cookies.forEach(cookie => {
        if (cookie.domain === domain) {
          details.firstParty++;
        } else {
          details.thirdParty++;
        }

        if ("session" in cookie && cookie.session) {
          details.sessionCookies++;
        } else {
          details.persistentCookies++;
        }
      });

      // Store the details in the global object under the tabId key
      cookieDetailsByTabId[tabId] = details;
      resolve(details);
    });
  });
}


function checkStorageForTab(tabId, sendResponse) {
  chrome.tabs.executeScript(tabId, {
    code: `({
      localStorageCount: Object.keys(localStorage).length,
      sessionStorageCount: Object.keys(sessionStorage).length
    })`
  }, function(results) {
    if (chrome.runtime.lastError) {
      sendResponse({error: chrome.runtime.lastError.message});
    } else {
      const storageCounts = results[0];
      storageCountsByTabId[tabId] = storageCounts; // Store counts in global object
      sendResponse({data: storageCounts});
    }
  });
}

const suspectBehaviorByTab = {};

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);
    const port = url.port || (url.protocol === "https:" ? 443 : 80);  // Default ports for HTTP and HTTPS
    const tabId = details.tabId;

    if (tabId < 0) return; // Ignore requests from background processes

    // Initialize if undefined
    if (!suspectBehaviorByTab[tabId]) {
      suspectBehaviorByTab[tabId] = false;
    }

    // Update the suspect behavior flag specific to the tab
    if (port !== "80" && port !== "443") {
      suspectBehaviorByTab[tabId] = true;
    } else {
      suspectBehaviorByTab[tabId] = false;
    }
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);

function calculateGrade(tabId) {

  let gradeScore = 10;
  gradeScore -= thirdPartyRequests[tabId].size * 0.1;
  gradeScore -= cookieDetailsByTabId[tabId].total * 0.01;
  gradeScore -= storageCountsByTabId[tabId].localStorageCount * 0.1;
  if (suspectBehaviorByTab[tabId] || false) {
    gradeScore -= 1;
  }

  gradeScore = Math.max(0, gradeScore);

  if (gradeScore > 8) return 'A';
  else if (gradeScore > 6) return 'B';
  else if (gradeScore > 4) return 'C';
  else if (gradeScore > 2) return 'D';
  else return 'E';
}

// Handle messages from the popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.action === 'getThirdPartyDomains') {
    sendResponse(Array.from(thirdPartyRequests[msg.tabId] || []));
  }

  if (msg.action === 'canvasFingerprintDetected') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!chrome.runtime.lastError && tabs.length > 0) {
        chrome.browserAction.setBadgeText({text: '!', tabId: tabs[0].id});
        chrome.browserAction.setBadgeBackgroundColor({color: '#FF0000', tabId: tabs[0].id});
      }
    });
    sendResponse({status: 'Detection alert updated'});
    return true;
  }

  if (msg.action === "calculateGrade") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length > 0) {
        const currentTabId = tabs[0].id;
        const grade = calculateGrade(currentTabId);
        sendResponse({grade: grade});
      } else {
        sendResponse({error: "No active tab found"});
      }
    });
    return true; // This is necessary to use sendResponse asynchronously
  }

  if (msg.action === "countCookies") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length > 0) {
        countCookies(tabs[0].id, msg.domain).then(cookieDetails => {
          sendResponse(cookieDetails);
        });
      } else {
        sendResponse({error: "No active tab found"});
      }
    });
    return true; // Indicates async response
  }

  if (msg.action === "checkStorage") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length > 0) {
        checkStorageForTab(tabs[0].id, sendResponse);
      } else {
        sendResponse({error: "No active tab found"});
      }
    });
    return true;
  }

  if (msg.action === "checkPorts") {
    const tabId = msg.tabId;  // Ensure that msg includes tabId
    const isSuspect = suspectBehaviorByTab[tabId] || false;  // Default to false if no data exists
    hasUnusualPort[tabId] = isSuspect;
    sendResponse({suspect: isSuspect});
  }
});

// Ensure content script is injected when tab is updated
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'loading') {
    gradeScore = 0; // Reset when a new page starts loading
  }
});

