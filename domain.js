document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.runtime.sendMessage({
        action: 'getThirdPartyDomains',
        tabId: tabs[0].id
      },
      function(response) {
        const domainList = document.getElementById('domainList');
        const showMoreBtn = document.getElementById('showMoreBtn');
        const showLessBtn = document.getElementById('showLessBtn');
        let itemCount = 0;
        
        response.forEach(domain => {
          const li = document.createElement('li');
          li.textContent = domain;
          li.style.display = itemCount < 5 ? 'block' : 'none'; // Initially show only the first 5 items
          domainList.appendChild(li);
          itemCount++;
        });

        if (response.length > 5) {
          showMoreBtn.style.display = 'block'; // Show the "Show More" button only if there are more than 5 domains
          showMoreBtn.onclick = function() {
            // Expand the list to show all domains
            Array.from(domainList.children).forEach((item, index) => {
              item.style.display = 'block';
            });
            showMoreBtn.style.display = 'none'; // Hide "Show More" button
            showLessBtn.style.display = 'block'; // Show "Show Less" button
          };

          showLessBtn.onclick = function() {
            // Collapse the list back to showing only the first 5 domains
            Array.from(domainList.children).forEach((item, index) => {
              if (index >= 5) item.style.display = 'none';
            });
            showLessBtn.style.display = 'none'; // Hide "Show Less" button
            showMoreBtn.style.display = 'block'; // Show "Show More" button
          };
        }
      }
    );
  });
});
