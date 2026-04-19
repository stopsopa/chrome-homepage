const customLink = localStorage.getItem('customNewTabLink');

if (customLink) {
    // Immediately replace the current page with the target URL
    // We use replace() so the new tab doesn't clutter the history
    window.location.replace(customLink);
}
