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

The privacy grade in FireFoxSec is calculated based on several factors that assess the security and privacy posture of the website you are visiting. The factors include all the features mentioned above, such as third-party requests, cookie count, local storage usage, and suspect behavior detection.

Based on these factors, the privacy grade is calculated using the following formula:

```plaintext
gradeScore = 10
gradeScore -= thirdPartyRequests[tabId].size * 0.1
gradeScore -= cookieDetailsByTabId[tabId].total * 0.01
gradeScore -= storageCountsByTabId[tabId].localStorageCount * 0.1

// Additional deduction if suspect behavior is detected
if (suspectBehaviorByTab[tabId] || false) {
  gradeScore -= 1
}

gradeScore = Math.max(0, gradeScore)

// Determine the grade based on the grade score
if (gradeScore > 8) return 'A'
else if (gradeScore > 6) return 'B'
else if (gradeScore > 4) return 'C'
else if (gradeScore > 2) return 'D'
else return 'E'
```

This formula calculates a grade score based on deductions for various privacy and security risks. The score is then mapped to a letter grade to provide an overall assessment of the website's privacy and security posture.

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