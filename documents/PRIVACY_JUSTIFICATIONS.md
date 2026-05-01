# Privacy Justifications for Custom New Tab Dashboard

## Single Purpose Description

Custom New Tab Dashboard is a privacy-first productivity tool that allows users to replace their default new tab page with a customizable dashboard featuring visual bookmark management, unified AI search, and local prompt management.

## Detailed Permissions Justifications

### Bookmarks (`bookmarks`)

- **Usage**: The extension creates and manages a dedicated folder (named `_`) within the user's bookmarks.
- **Justification**: This permission is required to store the user's dashboard links and "AI Skills" (prompts). By using the native bookmark system, the extension ensures that your data is stored locally, can be managed via standard browser tools, and remains entirely under your control without requiring a third-party database.

### Tabs (`tabs`)

- **Usage**: Used to open search results in new tabs.
- **Justification**: Essential for the multi-select search feature, which allows a single query to be executed across multiple search engines and AI platforms simultaneously, each in its own tab.

### Scripting (`scripting`) and Host Permissions

- **Usage**: Limited to specific AI domains (Gemini, ChatGPT, Claude, T3).
- **Justification**: Used to optimize the transition between the dashboard and AI search tools. This ensures that the user's search queries and prepended "Skills" are correctly processed by the target platform's interface. Access is strictly limited to the domains required for these specific integrations.

## Data Usage Compliance

### Chrome Web Store Policy Compliance

- **No Remote Data Collection**: The extension does not collect, store, or transmit any personal information, browsing history, or analytics to external servers.
- **Local Storage**: All settings, link positions, and AI skills are stored locally using the browser's native `localStorage` and `bookmarks` APIs.
- **No Third-Party Access**: Your data never leaves your machine. We do not use any third-party analytics or tracking tools.

### Privacy-First Architecture

- **User Ownership**: Users have full control over all data stored in the `_` bookmark folder. Deleting the folder or clearing `localStorage` completely resets the extension.
- **Zero Tracking**: The extension makes zero background network requests and does not track user behavior or search history.
- **Transparency**: The extension is designed to be lightweight and transparent, using standard browser APIs for all its core functionalities.
