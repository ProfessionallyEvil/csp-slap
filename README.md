# CSP SLAP
## Content Security Policy Security Lab Attack Platform

An interactive security laboratory demonstrating Content Security Policy implementation, showing the evolution from vulnerable applications to secure implementations using various CSP techniques.

**Developed by [Professionally Evil](https://professionallyevil.com)** - A cybersecurity consulting firm specializing in penetration testing, security assessments, and security training.

🔗 **Repository:** https://github.com/ProfessionallyEvil/csp-slap

## Overview

This project demonstrates 6 different CSP scenarios:

1. **Vulnerable (No CSP)** - Shows how XSS attacks work without protection
2. **Basic CSP** - Basic Content Security Policy implementation  
3. **Hash-based CSP** - SHA-256 hash allowlisting for inline scripts
4. **NGINX Nonce** - Legacy-friendly approach using real NGINX sub_filter implementation ✨
5. **Helmet Nonce** - Application-level nonce generation with Helmet middleware
6. **Malicious Domain** - Simulated attacker-controlled domain (not really a scenario, but supports the others)

## Quick Start

Choose one of two deployment methods:

### Option A: With NGINX (Recommended - Full Demo)

This provides the complete CSP demonstration including real NGINX nonce implementation.

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Build the Application

```bash
npm run build
```

#### 3. Start the Backend Server

```bash
npm start
```

The backend will start on **http://localhost:3001**

#### 4. Configure and Start NGINX

**Option 4a: Using Pre-built Docker Image (Easiest)**

```bash
# Pull and run the latest pre-built image
docker run -p 80:80 ghcr.io/professionallyevil/csp-slap:latest
```

**Option 4b: Build Your Own Docker Image**

```bash
# Build and run the complete demo with NGINX
docker build -t csp-demo .
docker run -p 80:80 csp-demo
```

Access the demo at **http://localhost/** or **http://demo.example.com/** (after adding to hosts file)

**Option 4c: Using Your Existing NGINX**

**For Windows NGINX Integration:**

1. **Locate your main NGINX configuration file** (typically `C:\nginx\conf\nginx.conf` or `C:\Users\{YourUsername}\nginx\nginx-1.26.1\conf\nginx.conf`)

2. **Add the include directive** within your existing `http {}` block:

```nginx
http {
    # ... your existing configuration ...
    
    # Include CSP demo configuration  
    include "C:/path/to/your/csp-demos/csp-nginx.conf";
    
    # ... rest of your existing configuration ...
}
```

3. **Test and reload NGINX:**

```powershell
# Test the configuration
.\nginx.exe -t

# Reload NGINX (if already running)
.\nginx.exe -s reload

# Or restart NGINX
.\nginx.exe -s stop
.\nginx.exe
```

**For Linux/Unix NGINX Integration:**

```bash
# Add to your main nginx.conf within the http {} block
include /path/to/your/csp-demos/csp-nginx.conf;

# Or include as a separate config file
sudo cp csp-nginx.conf /etc/nginx/sites-available/csp-demo
sudo ln -s /etc/nginx/sites-available/csp-demo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Option B: Standalone Backend (Not Recommended)

The backend can run standalone for development purposes, but requires NGINX for full functionality:

```bash
npm install
npm run build
npm start
```

**⚠️ Important:** This mode is not recommended as the demo is designed for NGINX integration. Navigation and cross-origin forms will not work correctly without NGINX proxy.

### 4. Configure Local Domains (Optional but Recommended)

To fully demonstrate the different CSP scenarios as separate domains, add these entries to your hosts file:

#### Windows
Edit `C:\Windows\System32\drivers\etc\hosts` (run as Administrator):

```
127.0.0.1 demo.example.com
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
127.0.0.1 demo.example.com
127.0.0.1 vulnerable.example.com
127.0.0.1 basic-csp.example.com  
127.0.0.1 hash-csp.example.com
127.0.0.1 nonce-nginx.example.com
127.0.0.1 nonce-helmet.example.com
127.0.0.1 malicious.example.com
```

## Demo URLs

### With NGINX (Full Demo - Port 80):
Using localhost (fallback):
- **Navigation:** http://localhost/ (shows main navigation page)

Using custom domains (after hosts file setup - **Recommended**):
- **🏠 Main Navigation:** http://demo.example.com/ ✨ (Start here!)
- **Vulnerable:** http://vulnerable.example.com/
- **Basic CSP:** http://basic-csp.example.com/
- **Hash CSP:** http://hash-csp.example.com/
- **NGINX Nonce:** http://nonce-nginx.example.com/ ✨ (Real NGINX implementation)
- **Helmet Nonce:** http://nonce-helmet.example.com/
- **Malicious Domain:** http://malicious.example.com/

### Standalone Backend (Not Recommended - Port 3001):
- **Navigation:** http://localhost:3001/ ⚠️ (Navigation links will not work)
- **Individual Routes:** Available but navigation/forms will be broken

## Code View Pages

Each main demo scenario includes a "📝 View JavaScript Code" button that opens detailed code explanations in a new tab:

- **Vulnerable Code:** http://vulnerable.example.com/code
- **Basic CSP Code:** http://basic-csp.example.com/code  
- **Hash CSP Code:** http://hash-csp.example.com/code
- **NGINX Nonce Code:** http://nonce-nginx.example.com/code
- **Helmet Nonce Code:** http://nonce-helmet.example.com/code

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

## NGINX Integration

### How It Works

The CSP demo now includes **real NGINX nonce implementation** alongside the existing simulated version:

- **Backend Server (Port 3001):** Express.js application serving content
- **NGINX Proxy (Port 80):** Handles CSP headers and nonce injection
- **Name-based Virtual Hosting:** Different CSP policies per domain
- **Sub_filter Module:** Live nonce replacement in HTML content

### Key Features of NGINX Configuration

1. **Real Nonce Generation:** Uses `$request_id` and `$msec` for unique nonces
2. **Sub_filter Replacement:** Replaces `__CSP_NONCE__` placeholders with actual nonces (placeholder can be randomized for additional security)
3. **Domain-specific CSP:** Different policies for each virtual domain
4. **Rate Limiting:** Protects against abuse
5. **Security Headers:** Comprehensive security header management

### Files Included

- `csp-nginx.conf` - Configuration for integration with existing NGINX setups
- `nginx-container.conf` - Self-contained configuration for Docker deployment
- `Dockerfile` - Complete containerized demo environment

### Integration Options

#### Option 1: Include in Existing NGINX (Windows)

Edit your main NGINX configuration file:

```nginx
# Add to your main nginx.conf
http {
    # ... your existing config ...
    
    # Include CSP demo configuration  
    include "C:/path/to/your/csp-demos/csp-nginx.conf";
    
    # ... rest of your config ...
}
```

#### Option 2: Include in Existing NGINX (Linux/Unix)

```nginx
# Add to your main nginx.conf
http {
    # ... your existing config ...
    
    # Include CSP demo configuration
    include /path/to/your/csp-demos/csp-nginx.conf;
}
```

#### Option 3: Separate Site Configuration (Linux/Unix)

```bash
# Copy configuration to sites-available
sudo cp csp-nginx.conf /etc/nginx/sites-available/csp-demo

# Enable the site
sudo ln -s /etc/nginx/sites-available/csp-demo /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

#### Option 4: Docker Deployment

**Using Pre-built Image (Recommended):**
```bash
# Complete self-contained deployment
docker run -p 80:80 ghcr.io/professionallyevil/csp-slap:latest
```

**Building from Source:**
```bash
docker build -t csp-demo .
docker run -p 80:80 csp-demo
```

## Technology Stack

- **Backend:** Express.js with EJS templating
- **Reverse Proxy:** NGINX with sub_filter module
- **CSP Implementation:** NGINX headers + Helmet middleware
- **Hash Calculation:** SHA-256 for script allowlisting
- **Nonce Generation:** NGINX `$request_id` + Crypto-secure (Helmet)
- **Containerization:** Docker with multi-stage builds

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

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**.

- ✅ **Free to use** for educational and non-commercial purposes
- ✅ **Free to modify** and extend with your own CSP scenarios  
- ✅ **Free to share** with attribution
- ❌ **No commercial use** without permission

See the [LICENSE](LICENSE) file for full details.