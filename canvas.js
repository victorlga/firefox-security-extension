document.addEventListener('DOMContentLoaded', function() {
    const statusDisplay = document.getElementById('status');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length > 0 && tabs[0].id != null) {
        chrome.browserAction.getBadgeText({tabId: tabs[0].id}, function(result) {
          if (!chrome.runtime.lastError) {
            if (result !== '') {
              statusDisplay.textContent = 'Canvas fingerprinting detected!';
            } else {
              statusDisplay.textContent = 'No canvas fingerprinting detected.';
            }
          } else {
            // Error handling: Show an error or default message if there's an issue fetching the badge text
            statusDisplay.textContent = 'Unable to determine detection status.';
            console.error(chrome.runtime.lastError.message);
          }
        });
      } else {
        // If no active tab could be found, display a default message
        statusDisplay.textContent = 'No active tab detected.';
      }
    });
  });
  