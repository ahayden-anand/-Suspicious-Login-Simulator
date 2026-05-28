const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET = 'your_secret_key_here';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for login history and sessions
const loginHistory = {};
const activeSessions = {};

// Helper function to get browser info from User-Agent
function getBrowserInfo(userAgent) {
  if (!userAgent) return 'Unknown Browser';
  
  // Check Edge before Chrome (Edge contains "Chrome" in User-Agent)
  if (userAgent.includes('Edg')) return 'Edge';
  // Check Opera before Chrome (Opera contains "Chrome" in User-Agent)
  if (userAgent.includes('OPR')) return 'Opera';
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  return 'Unknown Browser';
}

// Helper function to get IP address from request
function getClientIP(req) {
  return req.ip || req.connection.remoteAddress || 'Unknown IP';
}

// Helper function to detect suspicious login
function detectSuspiciousLogin(email, userAgent, ip) {
  if (!loginHistory[email]) {
    loginHistory[email] = [];
  }

  const currentBrowser = getBrowserInfo(userAgent);
  const recentLogins = loginHistory[email].slice(-5);

  // Check if login is from a different browser
  if (recentLogins.length > 0) {
    const lastLogin = recentLogins[recentLogins.length - 1];
    if (lastLogin.browser !== currentBrowser) {
      return {
        suspicious: true,
        reason: `New browser detected: ${currentBrowser}. Last login was from ${lastLogin.browser}`
      };
    }
  }

  return { suspicious: false, reason: null };
}

// Sarcastic response generator
function getSarcasticMessage() {
  const messages = [
    '✅ Password accepted reluctantly...',
    '✅ You again? Fine, come in.',
    '✅ Access granted. For now.',
    '✅ Authentication? More like authentication theater.',
    '✅ Password correct. This emotional rollercoaster.',
    '✅ Welcome back. We missed you. No, really.',
    '✅ Access approved. No one can stop you anyway.',
    '✅ Credentials verified. Proceed at your own peril.',
    '✅ Login successful. Please don\'t break anything.',
    '✅ You\'re in. Good luck explaining why you\'re here.'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Funny browser joke generator
function getFunnyBrowserJoke(currentBrowser, previousBrowser) {
  const jokes = {
    'Chrome vs Firefox': '🤔 Hmm… you usually give up and use Firefox.',
    'Firefox vs Chrome': '🤔 Wait, you finally left Firefox? Is everything okay?',
    'Edge vs Chrome': '🤔 Edge? Really? That\'s bold.',
    'Safari vs Chrome': '🤔 Safari? Are you secretly a Mac user?',
    'Chrome (Incognito) vs Chrome': '🤔 Going incognito? What are we hiding? 😏'
  };
  return `⚠️ Suspicious Activity: Different browser detected! ${currentBrowser} instead of ${previousBrowser}`;
}

// Fake security alerts
function getFakeDramaticAlert() {
  const alerts = [
    '🚨 ALERT: Browser fingerprint changed. Is this a hacker? 🚨',
    '🚨 CRITICAL: Location mismatch by 0.5 inches. INTRUDER? 🚨',
    '🚨 WARNING: User logged in from different browser. Deploying security hamster 🐹 🚨',
    '🚨 SUSPICIOUS: Incognito mode detected. What are you planning? 🚨',
    '🚨 DRAMATIC: This login attempt has emotional damage. 🚨'
  ];
  return alerts[Math.floor(Math.random() * alerts.length)];
}

// Fake user database
const users = {
  'user@example.com': 'password123',
  'admin@example.com': 'admin123',
  'test@example.com': 'test123'
};

// STEP 3: Create /login endpoint
app.post('/login', (req, res) => {
  const { email, password, incognito } = req.body;
  const userAgent = req.get('user-agent');
  const ip = getClientIP(req);
  let browser = getBrowserInfo(userAgent);
  
  // Add incognito mode indicator
  if (incognito) {
    browser += ' (Incognito)';
  }

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // STEP 4: Return fake success/failure messages
  const validUser = users[email];
  if (!validUser || validUser !== password) {
    // Log failed attempt
    if (!loginHistory[email]) {
      loginHistory[email] = [];
    }
    loginHistory[email].push({
      timestamp: new Date(),
      browser: browser,
      ip: ip,
      status: 'failed'
    });

    const failMessages = [
      '❌ Password incorrect. Try again, you got this! (Maybe.)',
      '❌ Invalid credentials. Yikes.',
      '❌ Wrong password. Did you forget already?',
      '❌ Access denied. Better luck next time!',
      '❌ Nope. Invalid email or password.'
    ];

    return res.status(401).json({
      success: false,
      message: failMessages[Math.floor(Math.random() * failMessages.length)]
    });
  }

  // STEP 7: Add browser detection
  const suspiciousLoginCheck = detectSuspiciousLogin(email, userAgent, ip);

  // STEP 8: Add suspicious login history
  if (!loginHistory[email]) {
    loginHistory[email] = [];
  }
  
  const dramaticAlert = getFakeDramaticAlert();
  const isSuspicious = suspiciousLoginCheck.suspicious;

  loginHistory[email].push({
    timestamp: new Date(),
    browser: browser,
    ip: ip,
    status: 'success',
    suspicious: isSuspicious,
    dramaticAlert: dramaticAlert
  });

  // STEP 5: Add JWT token
  const token = jwt.sign(
    { email: email, browser: browser, ip: ip },
    SECRET,
    { expiresIn: '1h' }
  );

  // Store active session
  activeSessions[token] = {
    email: email,
    browser: browser,
    ip: ip,
    loginTime: new Date()
  };

  res.json({
    success: true,
    message: getSarcasticMessage(),
    token: token,
    suspicious: isSuspicious,
    suspiciousReason: suspiciousLoginCheck.reason,
    dramaticAlert: dramaticAlert
  });
});

// STEP 6: Protect dashboard route - Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: err.message
    });
  }
}

// Protected dashboard endpoint
app.get('/api/dashboard', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to dashboard',
    user: req.user,
    data: {
      totalLogins: loginHistory[req.user.email]?.length || 0,
      lastLogin: loginHistory[req.user.email]?.[loginHistory[req.user.email].length - 1] || null
    }
  });
});

// Get login history for user
app.get('/api/login-history', verifyToken, (req, res) => {
  const email = req.user.email;
  const history = loginHistory[email] || [];

  res.json({
    success: true,
    email: email,
    history: history
  });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token && activeSessions[token]) {
    delete activeSessions[token];
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Serve dashboard page
app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/public/dashboard.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
     Running on http://localhost:${PORT}    

  `);
});
