# Host Permissions Justification for Custom New Tab Dashboard

## Executive Summary

The **Custom New Tab Dashboard** extension requests host permissions for a limited set of AI-driven platforms to enhance the search experience and facilitate seamless query handling.

## Requested Hosts

- `https://gemini.google.com/*`
- `https://chatgpt.com/*`
- `https://claude.ai/*`
- `https://t3.chat/*`

## Justification

These permissions are required for the following core functionalities:

1.  **AI Search Integration**: The extension allows users to search multiple AI platforms simultaneously from a single unified dashboard. Host permissions allow for content scripts to interact with these specific pages to ensure queries are handled correctly when opened via the extension.
2.  **Prompt Optimization**: To provide a seamless transition from the dashboard to these AI tools, limited scripting is used to manage the initial state of the search query, ensuring the user's selected "Skills" and prompts are accurately reflected in the target platform's interface.
3.  **Strictly Limited Scope**: Host permissions are restricted *only* to the specific AI domains listed above. The extension does not request or require access to `<all_urls>` or any other unrelated websites.

## Data Privacy

- **No Data Inspection**: While the extension has permission to interact with these specific hosts, it does not collect, store, or transmit any user data or conversations from these platforms.
- **Local Operation**: All logic related to these permissions is executed locally on the user's machine. No external servers are involved in the search redirection or prompt injection process.
