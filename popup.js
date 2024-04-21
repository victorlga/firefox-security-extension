document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.runtime.sendMessage({
          query: 'getThirdPartyDomains',
          tabId: tabs[0].id
        },
        function(response) {
          const domainList = document.getElementById('domainList');
          response.forEach(domain => {
            const li = document.createElement('li');
            li.textContent = domain;
            domainList.appendChild(li);
          });
        }
      );
    });
  });
  