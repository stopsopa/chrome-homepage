# Privacy Justifications for Custom New Tab Redirect

## Single Purpose Description

Custom New Tab Redirect is a minimalist productivity extension designed to allow users to override their browser's default new tab page with a custom URL of their choice.

## Detailed Permissions Justifications

### No Special Permissions Required

**Usage**: The extension is built with a zero-permission architecture.

**Justification**: The extension utilizes standard features available to extension pages:
- **`chrome_url_overrides`**: Used in `manifest.json` to replace the default `newtab` with `homepage.html`.
- **`localStorage`**: A standard web API used natively within the extension's `popup.html` and `homepage.html` to save and read the user's custom URL. No `chrome.storage` or external storage permissions are required.

**Data Handled**: The extension only saves the single URL string provided by the user. This data is strictly local and is never accessed outside of the extension's own pages.

## Data Usage Compliance

### Chrome Web Store Policy Compliance

**No Data Collection**: Custom New Tab Redirect does not collect, store, or transmit:
- Personal information.
- Browsing history.
- Analytics or usage statistics.

**Local Processing**: The redirect logic is executed 100% locally within the browser.

**User Control**:
- Users have full control over the target URL.
- Users can clear the URL at any time to disable the redirect.

### Privacy-First Architecture

**Zero Data Principle**: The extension requests zero special permissions. It is fundamentally incapable of tracking users or interacting with standard web pages.

**Transparency**: The source code is extremely minimal, open, and available for inspection. The extension makes zero external network requests.
