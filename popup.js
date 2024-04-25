document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({action: "checkPorts"}, function(response) {
        const portsDiv = document.getElementById('ports');
        if (!response || response.error) {
            console.error('Error:', response ? response.error : "No response from background script");
            portsDiv.textContent = 'Error in detecting port usage.';
        } else if (response.suspect) {
            // If suspect behavior is detected
            const content = "Suspect behavior detected: Non-standard ports in use.";
            const p = document.createElement('p');
            p.textContent = content;
            portsDiv.appendChild(p);
        } else {
            // If no suspect behavior is detected
            portsDiv.textContent = 'No suspect behavior detected.';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const gradeDisplay = document.getElementById('grade');
    const checkGradeButton = document.getElementById('checkGrade');

    // Function to fetch the grade from the background script
    function fetchGrade() {
        chrome.runtime.sendMessage({action: "calculateGrade"}, function(response) {
            if (response && response.grade) {
                gradeDisplay.textContent = `Your Privacy Grade: ${response.grade}`;
            } else {
                gradeDisplay.textContent = 'Failed to calculate grade.';
            }
        });
    }

    // Event listener for the button
    checkGradeButton.addEventListener('click', function() {
        gradeDisplay.textContent = 'Calculating...';
        fetchGrade();
    });
});

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

  document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      var url = new URL(activeTab.url);
      var domain = url.hostname;
  
      chrome.runtime.sendMessage({action: "countCookies", domain: domain}, function(response) {
        document.getElementById('totalCookies').textContent = response.total;
        document.getElementById('firstPartyCookies').textContent = response.firstParty;
        document.getElementById('thirdPartyCookies').textContent = response.thirdParty;
        document.getElementById('sessionCookies').textContent = response.sessionCookies;
        document.getElementById('persistentCookies').textContent = response.persistentCookies;
      });
    });
  });
  
  const context = document.createElement('canvas').getContext('2d');

  // Overriding the CanvasRenderingContext2D prototype to detect suspicious calls
  const originalToDataURL = CanvasRenderingContext2D.prototype.toDataURL;
  CanvasRenderingContext2D.prototype.toDataURL = function() {
    alert('Canvas fingerprinting attempt detected!');
    chrome.runtime.sendMessage({action: 'canvasFingerprintDetected'});
    return originalToDataURL.apply(this, arguments);
  };
  
  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData = function() {
    alert('Canvas fingerprinting attempt detected!');
    chrome.runtime.sendMessage({action: 'canvasFingerprintDetected'});
    return originalGetImageData.apply(this, arguments);
  };

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
  
  document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({action: "checkStorage"}, function(response) {
      if (response.error) {
        console.error('Error:', response.error);
        document.getElementById("resultLocalStorage").textContent = 'Error checking storage';
        document.getElementById("resultSessionStorage").textContent = 'Error checking storage';
      } else {
        // Assuming response.data contains { localStorageCount: <number>, sessionStorageCount: <number> }
        document.getElementById("resultLocalStorage").textContent = 'Local Storage Items: ' + response.data.localStorageCount;
        document.getElementById("resultSessionStorage").textContent = 'Session Storage Items: ' + response.data.sessionStorageCount;
      }
    });
  });
  