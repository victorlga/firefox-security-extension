const thirdPartyRequests = {};
let gradeScore = 0;

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
      sendResponse({data: results[0]});
    }
  });
}

let suspectBehaviorDetected = false;

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);
    const port = url.port || (url.protocol === "https:" ? 443 : 80);  // Default ports for HTTP and HTTPS

    if (port !== "80" && port !== "443") {
      suspectBehaviorDetected = true; // Set the flag if a non-standard port is used
    }
    else {
      suspectBehaviorDetected = false;
    }
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);

function calculateGrade() {
  if (gradeScore <= 1) return 'A';
  else if (gradeScore <= 3) return 'B';
  else if (gradeScore <= 5) return 'C';
  else if (gradeScore <= 7) return 'D';
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
  }

  if (msg.action === "calculateGrade") {
    const grade = calculateGrade();
    sendResponse({grade: grade});
  }

  if (msg.action === "countCookies") {
    countCookies(msg.domain).then(cookieDetails => {
      sendResponse(cookieDetails);
    });
    return true;
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
    sendResponse({suspect: suspectBehaviorDetected});
  }
});

// Ensure content script is injected when tab is updated
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'loading') {
    gradeScore = 0; // Reset when a new page starts loading
  }
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.tabs.executeScript(tabId, {file: 'content.js'});
  }
});

