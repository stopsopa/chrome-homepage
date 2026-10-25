const SNOOZE_KEY = 'landingPageSnoozedUntil';
const COUNT_KEY = 'newTabCount';
const CUSTOM_LINK_KEY = 'customNewTabLink';

document.addEventListener('DOMContentLoaded', () => {
    const linkInput = document.getElementById('linkInput');
    const clearBtn = document.getElementById('clearBtn');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');
    const resetPromoBtn = document.getElementById('resetPromoBtn');
    const resetStatus = document.getElementById('resetStatus');

    const updateClearBtn = () => {
        if (clearBtn && linkInput) {
            clearBtn.style.display = linkInput.value ? 'block' : 'none';
        }
    };

    // Load existing link
    const existingLink = localStorage.getItem(CUSTOM_LINK_KEY);
    if (existingLink) {
        linkInput.value = existingLink;
    }
    updateClearBtn();

    if (linkInput) {
        linkInput.addEventListener('input', updateClearBtn);
        linkInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveBtn.click();
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            linkInput.value = '';
            updateClearBtn();
            linkInput.focus();
        });
    }

    saveBtn.addEventListener('click', () => {
        const link = linkInput.value.trim();
        
        if (link) {
            // Basic URL validation/formatting
            let finalLink = link;
            if (!/^https?:\/\//i.test(finalLink)) {
                finalLink = 'https://' + finalLink;
            }
            
            localStorage.setItem(CUSTOM_LINK_KEY, finalLink);
            linkInput.value = finalLink;
            updateClearBtn();
            status.textContent = 'Saved successfully!';
            status.style.color = 'var(--success-color, #28a745)';
        } else {
            // Clears the user url, like it was never set
            localStorage.removeItem(CUSTOM_LINK_KEY);
            localStorage.removeItem(COUNT_KEY);
            localStorage.removeItem(SNOOZE_KEY);
            linkInput.value = '';
            updateClearBtn();
            status.textContent = 'URL cleared! Reset to default.';
            status.style.color = 'var(--success-color, #28a745)';
        }
        
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 2000);
    });

    // Reset landing page to default behaviour (shows every 10th load)
    if (resetPromoBtn) {
        resetPromoBtn.addEventListener('click', () => {
            localStorage.removeItem(SNOOZE_KEY);
            localStorage.setItem(COUNT_KEY, '0');
            if (resetStatus) {
                resetStatus.textContent = 'Reset! Landing page will appear every 10th new tab.';
                resetStatus.style.display = 'block';
                setTimeout(() => {
                    resetStatus.style.display = 'none';
                }, 2500);
            }
        });
    }
});
