import express from 'express';
import path from 'path';
import helmet from 'helmet';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Route for vulnerable version (no CSP)
app.get('/vulnerable', (req, res) => {
  res.render('vulnerable', { 
    title: 'Vulnerable Demo - No CSP Protection',
    domain: 'vulnerable.example.com'
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
    domain: 'basic-csp.example.com'
  });
});

// Route for basic-csp code view
app.get('/basic-csp/code', (req, res) => {
  res.render('basic-csp-code', { 
    title: 'Basic CSP Demo - JavaScript Code'
  });
});

// Route for hash-based CSP
app.get('/hash-csp', (req, res) => {
  const scriptHash = 'sha256-mzPE5fJxmOnzweXjUO6REWBqpqlJjL5uQOCATeQ3TXA=';
  res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' '${scriptHash}'; style-src 'self'; img-src *; object-src 'none';`);
  res.render('hash-csp', { 
    title: 'Hash-based CSP Demo - SHA-256 Script Allowlisting',
    domain: 'hash-csp.example.com',
    scriptHash: scriptHash
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

// Route for NGINX nonce simulation (static placeholder approach)
app.get('/nonce-nginx', (req, res) => {
  // Simulate what NGINX would do - generate a simple nonce
  const simpleNonce = Date.now().toString() + Math.random().toString(36).substring(2);
  res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${simpleNonce}'; style-src 'self'; img-src *; object-src 'none';`);
  res.render('nonce-nginx', { 
    title: 'NGINX Nonce Demo - Legacy-Friendly Implementation',
    domain: 'nonce-nginx.example.com',
    nonce: simpleNonce
  });
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
      nonce: nonce
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
    domain: 'malicious.example.com'
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
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol;
  
  // Determine if we're using custom domains or localhost
  const isCustomDomain = host.includes('.example.com');
  
  let scenarios;
  if (isCustomDomain) {
    // Use absolute URLs with custom domains
    scenarios = [
      { name: 'Vulnerable (No CSP)', path: `${protocol}://vulnerable.example.com:3000/vulnerable`, description: 'Shows XSS vulnerabilities without protection' },
      { name: 'Basic CSP', path: `${protocol}://basic-csp.example.com:3000/basic-csp`, description: 'Basic Content Security Policy implementation' },
      { name: 'Hash-based CSP', path: `${protocol}://hash-csp.example.com:3000/hash-csp`, description: 'SHA-256 hash allowlisting for inline scripts' },
      { name: 'NGINX Nonce', path: `${protocol}://nonce-nginx.example.com:3000/nonce-nginx`, description: 'Legacy-friendly nonce via NGINX sub_filter' },
      { name: 'Helmet Nonce', path: `${protocol}://nonce-helmet.example.com:3000/nonce-helmet`, description: 'Application-level nonce with Helmet middleware' },
      { name: 'Malicious Domain', path: `${protocol}://malicious.example.com:3000/malicious`, description: 'Simulated attacker-controlled domain' }
    ];
  } else {
    // Use relative URLs for localhost
    scenarios = [
      { name: 'Vulnerable (No CSP)', path: '/vulnerable', description: 'Shows XSS vulnerabilities without protection' },
      { name: 'Basic CSP', path: '/basic-csp', description: 'Basic Content Security Policy implementation' },
      { name: 'Hash-based CSP', path: '/hash-csp', description: 'SHA-256 hash allowlisting for inline scripts' },
      { name: 'NGINX Nonce', path: '/nonce-nginx', description: 'Legacy-friendly nonce via NGINX sub_filter' },
      { name: 'Helmet Nonce', path: '/nonce-helmet', description: 'Application-level nonce with Helmet middleware' },
      { name: 'Malicious Domain', path: '/malicious', description: 'Simulated attacker-controlled domain' }
    ];
  }
  
  res.render('index', { 
    title: 'CSP Demonstration Project',
    scenarios: scenarios
  });
});

app.listen(PORT, () => {
  console.log(`CSP Demo server running on http://localhost:${PORT}`);
  console.log('Available demo scenarios:');
  console.log('- http://localhost:3000/ (Navigation)');
  console.log('- http://localhost:3000/vulnerable');
  console.log('- http://localhost:3000/basic-csp');
  console.log('- http://localhost:3000/hash-csp');
  console.log('- http://localhost:3000/nonce-nginx');
  console.log('- http://localhost:3000/nonce-helmet');
  console.log('- http://localhost:3000/malicious');
});
