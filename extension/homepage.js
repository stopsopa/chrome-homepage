const SNOOZE_KEY = 'landingPageSnoozedUntil';
const COUNT_KEY = 'newTabCount';
const CUSTOM_LINK_KEY = 'customNewTabLink';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const noLinkContainer = document.getElementById('noLinkContainer');
const homeLinkInput = document.getElementById('homeLinkInput');
const homeClearBtn = document.getElementById('homeClearBtn');
const homeSaveBtn = document.getElementById('homeSaveBtn');
const homeStatus = document.getElementById('homeStatus');

const landingContainer = document.getElementById('landingContainer');
const targetLink = document.getElementById('targetLink');
const countdownEl = document.getElementById('countdown');
const snoozeBtn = document.getElementById('snoozeBtn');
const editUrlBtn = document.getElementById('editUrlBtn');

let customLink = localStorage.getItem(CUSTOM_LINK_KEY);

const updateClearBtn = () => {
    if (homeClearBtn && homeLinkInput) {
        homeClearBtn.style.display = homeLinkInput.value ? 'block' : 'none';
    }
};

if (homeLinkInput) {
    homeLinkInput.addEventListener('input', updateClearBtn);
    homeLinkInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && homeSaveBtn) {
            homeSaveBtn.click();
        }
    });
}

if (homeClearBtn) {
    homeClearBtn.addEventListener('click', () => {
        if (homeLinkInput) {
            homeLinkInput.value = '';
            updateClearBtn();
            homeLinkInput.focus();
        }
    });
}

if (homeSaveBtn) {
    homeSaveBtn.addEventListener('click', () => {
        const link = (homeLinkInput ? homeLinkInput.value : '').trim();
        if (link) {
            let finalLink = link;
            if (!/^https?:\/\//i.test(finalLink)) {
                finalLink = 'https://' + finalLink;
            }
            localStorage.setItem(CUSTOM_LINK_KEY, finalLink);
            if (homeLinkInput) {
                homeLinkInput.value = finalLink;
                updateClearBtn();
            }
            if (homeStatus) {
                homeStatus.textContent = 'Saved! Redirecting...';
                homeStatus.style.color = 'var(--success-color, #28a745)';
                homeStatus.style.display = 'block';
            }
            setTimeout(() => {
                window.location.replace(finalLink);
            }, 400);
        } else {
            // Clear URL completely like it was never set
            localStorage.removeItem(CUSTOM_LINK_KEY);
            localStorage.removeItem(COUNT_KEY);
            localStorage.removeItem(SNOOZE_KEY);
            if (homeLinkInput) {
                homeLinkInput.value = '';
                updateClearBtn();
            }
            if (homeStatus) {
                homeStatus.textContent = 'URL cleared! Reset to default.';
                homeStatus.style.color = 'var(--success-color, #28a745)';
                homeStatus.style.display = 'block';
            }
            setTimeout(() => {
                if (homeStatus) homeStatus.style.display = 'none';
            }, 2500);
        }
    });
}

if (!customLink) {
    // URL is not set: show the landing page without countdown
    if (noLinkContainer) {
        noLinkContainer.style.display = 'block';
    }
    updateClearBtn();
} else {
    // URL is set: track counts and show landing page every 10th time
    let count = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10);
    count += 1;
    localStorage.setItem(COUNT_KEY, count.toString());

    const snoozedUntil = parseInt(localStorage.getItem(SNOOZE_KEY) || '0', 10);
    const isSnoozed = Date.now() < snoozedUntil;
    const isTenth = (count % 10 === 0);

    if (!isTenth || isSnoozed) {
        // 9 out of 10 times (or if snoozed): redirect immediately
        window.location.replace(customLink);
    } else {
        // 1 out of 10 times: show landing page with countdown to the user-set URL
        if (landingContainer) {
            landingContainer.style.display = 'block';
        }

        if (targetLink) {
            targetLink.textContent = customLink;
            targetLink.href = customLink;
        }

        let secondsLeft = 3;
        if (countdownEl) {
            countdownEl.textContent = secondsLeft.toString();
        }

        const intervalId = setInterval(() => {
            secondsLeft -= 1;
            if (countdownEl) {
                countdownEl.textContent = secondsLeft.toString();
            }
            if (secondsLeft <= 0) {
                clearInterval(intervalId);
                window.location.replace(customLink);
            }
        }, 1000);

        if (snoozeBtn) {
            snoozeBtn.addEventListener('click', () => {
                clearInterval(intervalId);
                localStorage.setItem(SNOOZE_KEY, (Date.now() + ONE_WEEK_MS).toString());
                window.location.replace(customLink);
            });
        }

        if (editUrlBtn) {
            editUrlBtn.addEventListener('click', () => {
                clearInterval(intervalId);
                if (landingContainer) {
                    landingContainer.style.display = 'none';
                }
                if (noLinkContainer) {
                    noLinkContainer.style.display = 'block';
                    if (homeLinkInput) {
                        homeLinkInput.value = customLink;
                        updateClearBtn();
                        homeLinkInput.focus();
                    }
                }
            });
        }
    }
}
