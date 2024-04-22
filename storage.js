document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.sendMessage({query: "checkStorage"}, function(response) {
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
