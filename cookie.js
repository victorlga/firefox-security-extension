document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      var url = new URL(activeTab.url);
      var domain = url.hostname;
  
      chrome.runtime.sendMessage({action: "countCookies", domain: domain}, function(response) {
        document.getElementById('cookie-count').textContent = 'Cookies: ' + response.count;
      });
    });
  });
  