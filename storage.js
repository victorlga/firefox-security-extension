document.getElementById("checkStorageBtn").addEventListener("click", function() {
  chrome.runtime.sendMessage({query: "checkLocalStorage"}, function(response) {
    if (response.error) {
      console.error('Error:', response.error);
      document.getElementById("resultLocalStorage").textContent = 'Error checking local storage';
    } else {
      document.getElementById("resultLocalStorage").textContent = 'Local storage count: ' + response.data;
    }
  });
});
