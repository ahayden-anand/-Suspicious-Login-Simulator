// STEP 1: Build frontend login form

const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

// Detect incognito/private mode
async function isIncognito() {
    try {
        const test = '__incognito_test__';
        localStorage.setItem(test, 'true');
        localStorage.removeItem(test);
        return false; // Not incognito
    } catch (e) {
        return true; // Incognito mode (storage blocked)
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const incognito = await isIncognito();

    // Clear previous message
    messageDiv.textContent = '';
    messageDiv.className = 'message';

    try {
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        // Send login request to server with incognito flag
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, incognito })
        });

        const data = await response.json();

        if (data.success) {
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            
            // Show success message
            messageDiv.textContent = data.message;
            messageDiv.classList.add('success');

            // Show dramatic alert
            if (data.dramaticAlert) {
                const alertDiv = document.createElement('div');
                alertDiv.className = 'message warning';
                alertDiv.textContent = data.dramaticAlert;
                alertDiv.style.marginTop = '10px';
                messageDiv.parentNode.insertBefore(alertDiv, messageDiv.nextSibling);
            }

            // Show suspicious login warning if detected
            if (data.suspicious) {
                const warningDiv = document.createElement('div');
                warningDiv.className = 'message warning';
                warningDiv.textContent = `⚠️ ${data.suspiciousReason}`;
                warningDiv.style.marginTop = '10px';
                messageDiv.parentNode.insertBefore(warningDiv, messageDiv.nextSibling);
            }

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
        } else {
            // Show error message
            messageDiv.textContent = data.message;
            messageDiv.classList.add('error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        messageDiv.textContent = 'Error connecting to server: ' + error.message;
        messageDiv.classList.add('error');
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});
