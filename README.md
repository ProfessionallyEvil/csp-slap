# Content Security Policy (CSP) Demonstration Project

A comprehensive demonstration of Content Security Policy implementation showing the evolution from vulnerable applications to secure implementations using various CSP techniques.

## Overview

This project demonstrates 5 different CSP scenarios:

1. **Vulnerable (No CSP)** - Shows how XSS attacks work without protection
2. **Basic CSP** - Basic Content Security Policy implementation  
3. **Hash-based CSP** - SHA-256 hash allowlisting for inline scripts
4. **NGINX Nonce** - Legacy-friendly approach using NGINX sub_filter simulation
5. **Helmet Nonce** - Application-level nonce generation with Helmet middleware
6. **Malicious Domain** - Simulated attacker-controlled domain

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Application

```bash
npm run build
```

### 3. Start the Server

```bash
npm start
```

Or for development (auto-rebuild):

```bash
npm run dev
```

The server will start on **http://localhost:3000**

### 4. Configure Local Domains (Optional but Recommended)

To fully demonstrate the different CSP scenarios as separate domains, add these entries to your hosts file:

#### Windows
Edit `C:\Windows\System32\drivers\etc\hosts` (run as Administrator):

```
127.0.0.1 vulnerable.example.com
127.0.0.1 basic-csp.example.com  
127.0.0.1 hash-csp.example.com
127.0.0.1 nonce-nginx.example.com
127.0.0.1 nonce-helmet.example.com
127.0.0.1 malicious.example.com
```

#### Linux/Mac
Edit `/etc/hosts` (requires sudo):

```bash
sudo nano /etc/hosts
```

Add these lines:

```
127.0.0.1 vulnerable.example.com
127.0.0.1 basic-csp.example.com  
127.0.0.1 hash-csp.example.com
127.0.0.1 nonce-nginx.example.com
127.0.0.1 nonce-helmet.example.com
127.0.0.1 malicious.example.com
```

## Demo URLs

### Using localhost (works immediately):
- **Navigation:** http://localhost:3000/
- **Vulnerable:** http://localhost:3000/vulnerable
- **Basic CSP:** http://localhost:3000/basic-csp  
- **Hash CSP:** http://localhost:3000/hash-csp
- **NGINX Nonce:** http://localhost:3000/nonce-nginx
- **Helmet Nonce:** http://localhost:3000/nonce-helmet
- **Malicious Domain:** http://localhost:3000/malicious

### Using custom domains (after hosts file setup):
- **Navigation:** http://vulnerable.example.com:3000/
- **Vulnerable:** http://vulnerable.example.com:3000/vulnerable
- **Basic CSP:** http://basic-csp.example.com:3000/basic-csp
- **Hash CSP:** http://hash-csp.example.com:3000/hash-csp
- **NGINX Nonce:** http://nonce-nginx.example.com:3000/nonce-nginx
- **Helmet Nonce:** http://nonce-helmet.example.com:3000/nonce-helmet
- **Malicious Domain:** http://malicious.example.com:3000/malicious

## Code View Pages

Each main demo scenario includes a "📝 View JavaScript Code" button that opens detailed code explanations in a new tab:

- **Vulnerable Code:** http://localhost:3000/vulnerable/code
- **Basic CSP Code:** http://localhost:3000/basic-csp/code  
- **Hash CSP Code:** http://localhost:3000/hash-csp/code

## Demo Instructions

### 1. Vulnerable Demo
- Try the XSS payload: `<img src=x onerror=alert('XSS!')>`
- Observe that all scripts execute without restriction
- Cross-origin requests succeed

### 2. Basic CSP Demo  
- Try the same XSS payload - it will be injected but scripts won't execute
- Check browser console for CSP violation reports
- External script loading is blocked

### 3. Hash-based CSP Demo
- Timer works because the inline script has a matching SHA-256 hash
- Try XSS payload - blocked because no matching hash
- "Test Inline Script" button demonstrates dynamic script blocking

### 4. Nonce Demos (NGINX & Helmet)
- Scripts with matching nonce execute normally
- Scripts without nonce are blocked
- Each page load generates a new nonce value

### 5. Malicious Domain
- Simulates attacker-controlled endpoints
- Shows what CSP protects against

## Technology Stack

- **Backend:** Express.js with EJS templating
- **CSP Implementation:** Custom headers + Helmet middleware
- **Hash Calculation:** SHA-256 for script allowlisting
- **Nonce Generation:** Timestamp-based (NGINX sim) + Crypto-secure (Helmet)

## Security Notes

⚠️ **This is a demonstration project only**
- Contains intentional vulnerabilities for educational purposes
- Do not use vulnerable code patterns in production
- All XSS examples are contained within the demo environment

## Troubleshooting

### CSP Violations Not Showing
- Open browser Developer Tools (F12)
- Check the Console tab for CSP violation reports
- Some browsers may need CSP reporting enabled

### Hosts File Not Working
- Ensure you're running as Administrator (Windows) or using sudo (Linux/Mac)
- Clear browser DNS cache: Chrome → Settings → Privacy → Clear browsing data
- Try incognito/private browsing mode

### Port 3000 Already in Use
```bash
# Find process using port 3000
netstat -tulpn | grep 3000

# Kill the process (replace PID with actual process ID)
kill -9 PID
```

## Project Structure

```
csp-demos/
├── src/
│   └── index.ts          # Express server with CSP configurations
├── views/
│   ├── *.ejs            # Demo page templates
│   └── *-code.ejs       # Code explanation pages
├── public/
│   ├── css/styles.css   # Styling
│   └── js/              # External JavaScript files
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Contributing

This project is designed for CSP education and demonstration. Feel free to extend with additional CSP scenarios or improve existing demonstrations.