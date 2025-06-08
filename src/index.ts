import express from 'express';
import path from 'path';
import helmet from 'helmet';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Helper function to determine navigation URL (always assumes NGINX setup)
function getNavigationUrl(req: any): string {
  const protocol = req.protocol;
  return `${protocol}://demo.example.com/`;
}

// Helper function to determine malicious domain URL (always assumes NGINX setup)
function getMaliciousUrl(req: any): string {
  const protocol = req.protocol;
  return `${protocol}://malicious.example.com/`;
}

// Route for vulnerable version (no CSP)
app.get('/vulnerable', (req, res) => {
  res.render('vulnerable', { 
    title: 'Vulnerable Demo - No CSP Protection',
    domain: 'vulnerable.example.com',
    navUrl: getNavigationUrl(req),
    maliciousUrl: getMaliciousUrl(req)
  });
});

// Route for vulnerable code view
app.get('/vulnerable/code', (req, res) => {
  res.render('vulnerable-code', { 
    title: 'Vulnerable Demo - JavaScript Code'
  });
});

// Route for basic CSP version
app.get('/basic-csp', (req, res) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; form-action 'self'; img-src *; object-src 'none';");
  res.render('basic-csp', { 
    title: 'Basic CSP Demo - Script Source Restrictions',
    domain: 'basic-csp.example.com',
    navUrl: getNavigationUrl(req),
    maliciousUrl: getMaliciousUrl(req)
  });
});

// Route for basic-csp code view
app.get('/basic-csp/code', (req, res) => {
  res.render('basic-csp-code', { 
    title: 'Basic CSP Demo - JavaScript Code',
    maliciousUrl: getMaliciousUrl(req)
  });
});

// Route for hash-based CSP
app.get('/hash-csp', (req, res) => {
  const scriptHash = 'sha256-mzPE5fJxmOnzweXjUO6REWBqpqlJjL5uQOCATeQ3TXA=';
  res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' '${scriptHash}'; style-src 'self'; img-src *; object-src 'none';`);
  res.render('hash-csp', { 
    title: 'Hash-based CSP Demo - SHA-256 Script Allowlisting',
    domain: 'hash-csp.example.com',
    scriptHash: scriptHash,
    navUrl: getNavigationUrl(req)
  });
});

// Route for hash-csp code view
app.get('/hash-csp/code', (req, res) => {
  const scriptHash = 'sha256-mzPE5fJxmOnzweXjUO6REWBqpqlJjL5uQOCATeQ3TXA=';
  res.render('hash-csp-code', { 
    title: 'Hash-CSP JavaScript Code',
    scriptHash: scriptHash
  });
});

// Route for NGINX nonce - serves static HTML with placeholder for NGINX sub_filter
app.get('/nonce-nginx', (req, res) => {
  // Always serve static HTML with placeholder (assumes NGINX proxy)
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NGINX Nonce Demo - Legacy-Friendly Implementation</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <header>
        <nav>
            <h1>CSP Demo: nonce-nginx.example.com</h1>
            <a href="http://demo.example.com/" class="nav-home">← Back to Scenarios</a>
        </nav>
    </header>
    
    <main>
        <div class="demo-content">
            <div class="csp-status csp-secure">
                🔧 NGINX NONCE CSP PROTECTION - Legacy-friendly implementation
            </div>
            
            <h2>NGINX Nonce Demo Page</h2>
            <p>This page demonstrates a legacy-friendly CSP approach using NGINX sub_filter to inject nonces into static HTML.</p>
            
            <div class="code-example">
# NGINX Configuration:
location /nonce-nginx {
    set $csp_nonce "\${request_id}_\${msec}";
    sub_filter '__CSP_NONCE_XYZ__' $csp_nonce;
    sub_filter_once off;
    add_header Content-Security-Policy "script-src 'self' 'nonce-$csp_nonce'";
    proxy_pass http://backend;
}
            </div>
            
            <div class="demo-form">
                <h3>User Comment Form (Nonce-Protected)</h3>
                <form id="commentForm">
                    <input type="text" id="username" placeholder="Your name" required>
                    <input type="text" id="comment" placeholder="Try XSS: <img src=x onerror=alert('XSS!')>" required>
                    <button type="submit">Post Comment</button>
                </form>
                <div id="comments"></div>
            </div>
            
            <div class="demo-form">
                <h3>Script Execution Tests</h3>
                <button onclick="testInlineScript()">Test Inline Script (WILL FAIL)</button>
                <button id="legitimateBtn">Test Legitimate Nonce Script (WORKS)</button>
                <button id="externalScriptBtn">Test External Script (WILL FAIL)</button>
            </div>
            
            <div class="timer-display" id="timer">Timer: 60</div>
            
            <div class="demo-info">
                <h3>What you should observe:</h3>
                <ul>
                    <li>✅ Scripts with matching nonce execute normally</li>
                    <li>❌ Scripts without nonce are blocked</li>
                    <li>❌ Injected scripts cannot guess the nonce</li>
                    <li>🔍 View page source to see the nonce value in HTML</li>
                </ul>
                
                <h4>Legacy-Friendly Approach:</h4>
                <p>This method allows adding CSP protection to existing applications without modifying application code. NGINX handles nonce generation and injection.</p>
                <p><strong>Security Enhancement:</strong> The placeholder __CSP_NONCE_XYZ__ in the config above shows how you can randomize the placeholder token at build/deployment time for additional security.</p>
                <p><strong>Current nonce (injected by NGINX):</strong> __CSP_NONCE__</p>
                
                <div class="code-view-button">
                    <a href="/nonce-nginx/code" target="_blank" class="demo-button">📝 View Code & NGINX Config</a>
                </div>
            </div>
        </div>
    </main>
    
    <!-- This script has the nonce placeholder that NGINX will replace -->
    <script nonce="__CSP_NONCE__">
        let timerCount = 60;
        const timerElement = document.getElementById('timer');
        
        function updateTimer() {
            timerCount--;
            timerElement.textContent = \`Timer: \${timerCount}\`;
            if (timerCount <= 0) {
                timerCount = 60;
            }
        }
        
        setInterval(updateTimer, 1000);
        
        document.getElementById('commentForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const comment = document.getElementById('comment').value;
            const commentsDiv = document.getElementById('comments');
            
            const commentHTML = \`<div class="comment-item">
                <strong>\${username}:</strong> \${comment}
            </div>\`;
            
            commentsDiv.innerHTML += commentHTML;
            this.reset();
        });
        
        document.getElementById('legitimateBtn').addEventListener('click', function() {
            alert('This nonce-protected script is allowed to execute!');
        });
        
        document.getElementById('externalScriptBtn').addEventListener('click', function() {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
            script.onload = () => alert('External script loaded!');
            script.onerror = () => console.log('External script blocked by CSP');
            document.head.appendChild(script);
        });
        
        // Test function for inline script (this will fail due to CSP)
        function testInlineScript() {
            eval('alert("This inline eval should be blocked!")');
        }
    </script>
</body>
</html>`);
});

// Route for nginx-nonce code view
app.get('/nonce-nginx/code', (req, res) => {
  res.render('nonce-nginx-code', { 
    title: 'NGINX Nonce Demo - Code & Configuration'
  });
});

// Route for Helmet nonce version
app.get('/nonce-helmet', (req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  
  helmet.contentSecurityPolicy({
    useDefaults: false,  // Don't use Helmet's defaults which might include unsafe-inline
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", `'nonce-${nonce}'`],  // Only self and nonce, no unsafe-inline
      styleSrc: ["'self'"],
      imgSrc: ["*"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null  // Disable HTTPS requirement for demo
    }
  })(req, res, () => {
    res.render('nonce-helmet', { 
      title: 'Helmet Nonce Demo - Application-Level CSP Management',
      domain: 'nonce-helmet.example.com',
      nonce: nonce,
      navUrl: getNavigationUrl(req)
    });
  });
});

// Route for helmet-nonce code view
app.get('/nonce-helmet/code', (req, res) => {
  res.render('nonce-helmet-code', { 
    title: 'Helmet Nonce Demo - JavaScript Code'
  });
});

// Malicious domain simulation
app.get('/malicious', (req, res) => {
  res.render('malicious', { 
    title: 'Simulated Malicious Domain',
    domain: 'malicious.example.com',
    navUrl: getNavigationUrl(req)
  });
});

// Store stolen data for display
const stolenData: Array<{timestamp: string, data: any, source: string}> = [];

app.post('/malicious/steal-data', (req, res) => {
  const timestamp = new Date().toLocaleString();
  const source = req.body.source || req.get('origin') || req.get('referer') || 'Unknown';
  
  stolenData.push({
    timestamp,
    data: req.body,
    source
  });
  
  console.log('Malicious endpoint received data:', req.body);
  
  // Check if this is a form submission (has target="_blank") or AJAX
  const isFormSubmission = req.get('content-type')?.includes('application/x-www-form-urlencoded');
  
  if (isFormSubmission) {
    // Redirect to malicious page with success message for form submissions
    res.redirect('/malicious?data=captured');
  } else {
    // Return JSON for AJAX requests
    res.json({ message: 'Data received by malicious domain!', data: req.body });
  }
});

// Route to get stolen data for display
app.get('/malicious/stolen-data', (req, res) => {
  res.json(stolenData);
});

// Main navigation page
app.get('/', (req, res) => {
  const protocol = req.protocol;
  
  // Always use absolute URLs with custom domains (assumes NGINX setup)
  const scenarios = [
    { name: 'Vulnerable (No CSP)', path: `${protocol}://vulnerable.example.com/`, description: 'Shows XSS vulnerabilities without protection' },
    { name: 'Basic CSP', path: `${protocol}://basic-csp.example.com/`, description: 'Basic Content Security Policy implementation' },
    { name: 'Hash-based CSP', path: `${protocol}://hash-csp.example.com/`, description: 'SHA-256 hash allowlisting for inline scripts' },
    { name: 'NGINX Nonce', path: `${protocol}://nonce-nginx.example.com/`, description: 'Legacy-friendly nonce via NGINX sub_filter' },
    { name: 'Helmet Nonce', path: `${protocol}://nonce-helmet.example.com/`, description: 'Application-level nonce with Helmet middleware' },
    { name: 'Malicious Domain', path: `${protocol}://malicious.example.com/`, description: 'Simulated attacker-controlled domain' }
  ];
  
  res.render('index', { 
    title: 'CSP SLAP - Content Security Policy Security Lab Attack Platform',
    scenarios: scenarios
  });
});

app.listen(PORT, () => {
  console.log(`🥊 CSP SLAP backend server running on http://localhost:${PORT}`);
  console.log('Content Security Policy Security Lab Attack Platform');
  console.log('');
  console.log('🔧 NGINX Integration Required:');
  console.log('- This backend requires NGINX proxy configuration');
  console.log('- See csp-nginx.conf for local NGINX integration');
  console.log('- Or use: docker run -p 80:80 csp-demo');
  console.log('');
  console.log('🎯 Access the demo at:');
  console.log('- http://demo.example.com/ (Main Navigation)');
  console.log('- http://vulnerable.example.com/');
  console.log('- http://basic-csp.example.com/');
  console.log('- http://hash-csp.example.com/');
  console.log('- http://nonce-nginx.example.com/ (Real NGINX nonce)');
  console.log('- http://nonce-helmet.example.com/');
  console.log('- http://malicious.example.com/');
  console.log('');
  console.log('⚠️  Requires hosts file entries - see README.md');
});
