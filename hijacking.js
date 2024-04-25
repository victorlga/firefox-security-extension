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
