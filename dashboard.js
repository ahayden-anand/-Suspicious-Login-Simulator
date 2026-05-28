// Protected dashboard - requires JWT token

const token = localStorage.getItem('token');

// Redirect to login if no token
if (!token) {
    window.location.href = '/';
}

const logoutBtn = document.getElementById('logoutBtn');
const welcomeMessage = document.getElementById('welcomeMessage');
const totalLoginsEl = document.getElementById('totalLogins');
const lastLoginTimeEl = document.getElementById('lastLoginTime');
const lastBrowserEl = document.getElementById('lastBrowser');
const historyContainer = document.getElementById('historyContainer');
const suspiciousContainer = document.getElementById('suspiciousContainer');
const dramaContainer = document.getElementById('dramaContainer');
const errorMessageDiv = document.getElementById('errorMessage');

// Sarcastic welcome messages
const welcomeMessages = [
    '🎭 Welcome back, you magnificent person!',
    '🎭 Look who decided to show up again...',
    '🎭 Well, well, well... if it isn\'t you!',
    '🎭 We\'ve been expecting you. Reluctantly.',
    '🎭 Another day, another login. How thrilling.',
    '🎭 You\'ve successfully hacked... yourself? Great job.',
    '🎭 Access granted. Try not to break anything this time.',
    '🎭 Welcome to the Dramatic Security Simulator!'
];

// Logout functionality
logoutBtn.addEventListener('click', async () => {
    try {
        await fetch('/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (err) {
        console.error('Logout error:', err);
    }

    localStorage.removeItem('token');
    window.location.href = '/';
});

// Fetch dashboard data
async function loadDashboard() {
    try {
        const response = await fetch('/api/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Unauthorized access');
        }

        const data = await response.json();

        // Display welcome message with sarcasm
        const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        welcomeMessage.textContent = `${randomWelcome} ${data.user.email}!`;

        // Display stats
        totalLoginsEl.textContent = data.data.totalLogins || 0;

        if (data.data.lastLogin) {
            const lastLogin = data.data.lastLogin;
            const lastLoginDate = new Date(lastLogin.timestamp);
            lastLoginTimeEl.textContent = lastLoginDate.toLocaleString();
            lastBrowserEl.textContent = lastLogin.browser;
        }

    } catch (error) {
        errorMessageDiv.textContent = 'Error loading dashboard: ' + error.message;
        errorMessageDiv.classList.add('error-message');
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
    }
}

// Fetch login history
async function loadLoginHistory() {
    try {
        const response = await fetch('/api/login-history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.history.length === 0) {
            historyContainer.innerHTML = '<p class="no-data">No login history yet</p>';
            return;
        }

        // Display login history in reverse order (newest first)
        historyContainer.innerHTML = data.history
            .reverse()
            .map((entry, index) => {
                const date = new Date(entry.timestamp);
                const isSuspicious = entry.suspicious;
                
                return `
                    <div class="login-entry ${isSuspicious ? 'suspicious' : ''}">
                        <p><strong>Login #${index + 1}</strong> ${isSuspicious ? '<span class="suspicious-badge">SUSPICIOUS</span>' : ''}</p>
                        <p><strong>Browser:</strong> ${entry.browser}</p>
                        <p><strong>IP Address:</strong> ${entry.ip}</p>
                        <p><strong>Status:</strong> ${entry.status === 'success' ? '✅ Success' : '❌ Failed'}</p>
                        <p class="timestamp">${date.toLocaleString()}</p>
                    </div>
                `;
            })
            .join('');

    } catch (error) {
        historyContainer.innerHTML = '<p class="error">Error loading history: ' + error.message + '</p>';
    }
}

// Check for dramatic alerts
async function loadDramaticAlerts() {
    try {
        const response = await fetch('/api/login-history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        // Get all logins with dramatic alerts
        const alertLogins = data.history.filter(entry => entry.dramaticAlert);

        if (alertLogins.length === 0) {
            dramaContainer.innerHTML = '<p class="no-data">📭 No dramatic alerts. Boring...</p>';
            return;
        }

        // Display dramatic alerts (newest first)
        dramaContainer.innerHTML = alertLogins
            .reverse()
            .map((entry) => {
                const date = new Date(entry.timestamp);
                return `
                    <div class="login-entry dramatic">
                        <p><strong>${entry.dramaticAlert}</strong></p>
                        <p>🕐 ${date.toLocaleString()}</p>
                    </div>
                `;
            })
            .join('');

    } catch (error) {
        dramaContainer.innerHTML = '<p class="error">Error loading drama: ' + error.message + '</p>';
    }
}

// Check for suspicious activity
async function checkSuspiciousActivity() {
    try {
        const response = await fetch('/api/login-history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        const suspiciousLogins = data.history.filter(entry => entry.suspicious);

        if (suspiciousLogins.length === 0) {
            suspiciousContainer.innerHTML = '<p class="no-data">✅ No suspicious activity detected</p>';
            return;
        }

        // Display suspicious logins
        suspiciousContainer.innerHTML = suspiciousLogins
            .map((entry) => {
                const date = new Date(entry.timestamp);
                return `
                    <div class="login-entry suspicious">
                        <p><strong>⚠️ Suspicious Login Detected</strong></p>
                        <p><strong>Browser:</strong> ${entry.browser}</p>
                        <p><strong>IP Address:</strong> ${entry.ip}</p>
                        <p class="timestamp">${date.toLocaleString()}</p>
                    </div>
                `;
            })
            .join('');

    } catch (error) {
        suspiciousContainer.innerHTML = '<p class="error">Error checking activity: ' + error.message + '</p>';
    }
}

// Initialize dashboard
async function initializeDashboard() {
    await Promise.all([
        loadDashboard(),
        loadDramaticAlerts(),
        loadLoginHistory(),
        checkSuspiciousActivity()
    ]);
}

// Load dashboard on page load
initializeDashboard();
