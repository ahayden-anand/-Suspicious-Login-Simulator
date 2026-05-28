# Suspicious Login Simulator

A fun authentication system that responds with humorous, dramatic reactions to user logins.

## What It Does

This micro-app simulates a web authentication system with personality. Instead of boring login responses, it gives you funny feedback and suspicious login history tracking.

### Login Reactions

When you log in, you might see:
- "You again?"
- "Password accepted reluctantly."
- "This login attempt has emotional damage."
- "Hmm... you usually fail authentication with Firefox." (if you switch browsers)

## Features

- **Login and Logout** - Standard authentication with dramatic flair
- **Protected Dashboard** - A meme dashboard that only logged-in users can access
- **Fake Security Alerts** - Humorous security notifications during login
- **Suspicious Login History** - Tracks your login attempts and compares them

## What did I Learnt 

- JWT (JSON Web Tokens) basics
- How frontend and backend talk to each other
- Authentication flow and how it works
- Cookies and browser storage
- Protected routes and access control
- Error handling in web apps

## How to Use

1. Clone or download this project
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open your browser and go to the login page
5. Try logging in with different credentials and browsers

## Project Files

- `index.html` - Login page
- `dashboard.html` - Protected dashboard page
- `script.js` - Frontend login logic
- `dashboard.js` - Dashboard functionality
- `server.js` - Backend authentication server
- `style.css` - Styling
- `package.json` - Project dependencies

## Tech Stack

- Node.js / Express (backend)
- HTML / CSS / JavaScript (frontend)
- JWT (authentication)
- Local Storage (session management)

---

Built as a learning project to understand web authentication basics.
