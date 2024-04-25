# FireFoxSec - Privacy and Security Extension

FireFoxSec is a Mozilla Firefox extension designed to identify potential security vulnerabilities and privacy issues on websites. The extension provides a range of features that can help improve your online privacy and security by analyzing the website you're visiting.

## Features

### 1. Third-Party Requests Blocking

FireFoxSec continuously monitors the requests made by the website and blocks any third-party requests from untrusted sources. This mechanism helps prevent data leaks and ensures that your sensitive information is not shared with external entities.

### 2. Hook and Hijacking Detection

This feature checks for hook or hijacking attacks, by monitoring the usage of non-standard ports. Unusual or non-standard ports may indicate a potential security risk. If a non-standard port is detected, FireFoxSec sets off an alert for the user.

### 3. Canvas Fingerprinting Detection

FireFoxSec checks for canvas fingerprinting by intercepting `toDataURL()` and `getImageData()` calls. When fingerprinting attempts are detected, the extension sends an alert, allowing users to handle the risk accordingly.

### 4. Local Storage and Session Storage

FireFoxSec checks for excessive usage of Local Storage and Session Storage on websites. Limiting the usage of these features can help prevent unintended storage of sensitive data that could be misused.

### 5. Cookie Count

FireFoxSec counts the number of cookies and identifies the origin of these cookies (first-party vs. third-party). Limiting the number of cookies can help maintain better control over which websites have access to your browsing context and browsing habits.

## Grade Calculation

The extension calculates the user's privacy and security grade based on the following features:

1. **Third-Party Requests Blocking**: 20%
   - If all third-party requests are blocked, 20% is added to the grade.

2. **Hook and Hijacking Detection (Non-standard Ports)**: 10%
   - If no hook or hijacking attacks or non-standard ports are detected, 10% is added to the grade.

3. **Canvas Fingerprint Detection**: 20%
   - If canvas fingerprinting attempts are detected, 20% is deducted from the grade.

4. **Local Storage and Session Storage**: 20%
   - If local storage and session storage are used sparingly (less than 20 items combined), 20% is added to the grade.

5. **Cookies Count and Origin**: 30%
   - If the number of cookies is limited (fewer than 5), and origin analysis shows mostly first-party cookies, 30% is added to the grade.

The extension calculates the percentages based on the status of each feature, converts the percentage into a letter grade, and displays the result. A grade score of A indicates a higher level of online security and privacy, while E suggests a lower level of security and privacy.

To calculate the grade, FireFoxSec evaluates the features while taking into account the following aspects:

- Browser security and privacy settings
- Extensions used and their impact on security and privacy
- Websites visited and their inherent security practices
- User behavior, including cookie and browsing history management

## How to Use

1. **Installation**: To install the FireFoxSec extension, follow these steps:

   a. Download the extension from the GitHub repository.
   b. Open the Mozilla Firefox browser.
   c. Go to `about:debugging#/runtime/this-firefox`.
   d. Select "Load Temporary Add-on" and navigate to the downloaded extension file.

2. **Browser Action Button**: After installation, FireFoxSec will add a browser action button to your toolbar. Click on the button to view the status of the following features:
   * Hook and hijacking detection
   * Canvas fingerprinting detection
   * Cookies count and origin
   * Local storage and session storage usage

3. **Privacy Grade**: Click the "Check Grade" button to see a privacy score based on the features mentioned above.

## Additional Resources

- [Mozilla Firefox Extension Development](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons)
- [WebExtensions Tutorial](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Chrome Extension Migration Guide (for moving from Chrome to Firefox)](https://extensionworkshop.com/documentation/develop/chrome-extension-migrate-to-firefox/)