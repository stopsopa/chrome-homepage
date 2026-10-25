const SNOOZE_KEY = 'landingPageSnoozedUntil';
const COUNT_KEY = 'newTabCount';
const CUSTOM_LINK_KEY = 'customNewTabLink';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const customLink = localStorage.getItem(CUSTOM_LINK_KEY);

if (!customLink) {
    const noLinkContainer = document.getElementById('noLinkContainer');
    if (noLinkContainer) {
        noLinkContainer.style.display = 'block';
    }
} else {
    let count = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10);
    count += 1;
    localStorage.setItem(COUNT_KEY, count.toString());

    const snoozedUntil = parseInt(localStorage.getItem(SNOOZE_KEY) || '0', 10);
    const isSnoozed = Date.now() < snoozedUntil;
    const isTenth = (count % 10 === 0);

    if (!isTenth || isSnoozed) {
        window.location.replace(customLink);
    } else {
        const landingContainer = document.getElementById('landingContainer');
        const countdownEl = document.getElementById('countdown');
        const snoozeBtn = document.getElementById('snoozeBtn');

        if (landingContainer) {
            landingContainer.style.display = 'block';
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
    }
}
