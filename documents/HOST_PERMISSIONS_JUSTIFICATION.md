# Host Permissions Justification for Custom New Tab Redirect

## Executive Summary

The **Custom New Tab Redirect** extension requires **NO host permissions** (`<all_urls>` or specific domains). 

It operates entirely using the `chrome_url_overrides` feature for the new tab page, and stores the user's configuration using standard, sandboxed browser `localStorage`. 

Since it simply redirects the user to a provided URL using `window.location.replace()`, it does not need to inspect, modify, or inject scripts into any web pages. Therefore, no host permissions are requested or required.
