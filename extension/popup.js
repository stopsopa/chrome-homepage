document.addEventListener('DOMContentLoaded', () => {
    const linkInput = document.getElementById('linkInput');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');

    // Load existing link
    const existingLink = localStorage.getItem('customNewTabLink');
    if (existingLink) {
        linkInput.value = existingLink;
    }

    saveBtn.addEventListener('click', () => {
        const link = linkInput.value.trim();
        
        if (link) {
            // Basic URL validation/formatting
            let finalLink = link;
            if (!/^https?:\/\//i.test(finalLink)) {
                finalLink = 'https://' + finalLink;
            }
            
            localStorage.setItem('customNewTabLink', finalLink);
            linkInput.value = finalLink;
            status.textContent = 'Saved successfully!';
            status.style.color = '#28a745';
        } else {
            localStorage.removeItem('customNewTabLink');
            status.textContent = 'Link cleared!';
            status.style.color = '#dc3545';
        }
        
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 2000);
    });
    
    // Allow pressing Enter to save
    linkInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    });
});
