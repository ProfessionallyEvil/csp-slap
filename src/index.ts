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

// Route for basic CSP version
app.get('/basic-csp', (req, res) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src *; object-src 'none';");
  res.render('basic-csp', { 
    title: 'Basic CSP Demo - Script Source Restrictions',
    domain: 'basic-csp.example.com'
  });
});

// Route for hash-based CSP
app.get('/hash-csp', (req, res) => {
  const scriptHash = 'sha256-oappnMPLrwVWbpACXGM3XKGVstKB/DjIwcU8W13GncQ=';
  res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' '${scriptHash}'; style-src 'self'; img-src *; object-src 'none';`);
  res.render('hash-csp', { 
    title: 'Hash-based CSP Demo - SHA-256 Script Allowlisting',
    domain: 'hash-csp.example.com',
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

// Route for Helmet nonce version
app.get('/nonce-helmet', (req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", `'nonce-${nonce}'`],
      styleSrc: ["'self'"],
      imgSrc: ["*"],
      objectSrc: ["'none'"]
    }
  })(req, res, () => {
    res.render('nonce-helmet', { 
      title: 'Helmet Nonce Demo - Application-Level CSP Management',
      domain: 'nonce-helmet.example.com',
      nonce: nonce
    });
  });
});

// Malicious domain simulation
app.get('/malicious', (req, res) => {
  res.render('malicious', { 
    title: 'Simulated Malicious Domain',
    domain: 'malicious.example.com'
  });
});

app.post('/malicious/steal-data', (req, res) => {
  console.log('Malicious endpoint received data:', req.body);
  res.json({ message: 'Data received by malicious domain!', data: req.body });
});

// Main navigation page
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'CSP Demonstration Project',
    scenarios: [
      { name: 'Vulnerable (No CSP)', path: '/vulnerable', description: 'Shows XSS vulnerabilities without protection' },
      { name: 'Basic CSP', path: '/basic-csp', description: 'Basic Content Security Policy implementation' },
      { name: 'Hash-based CSP', path: '/hash-csp', description: 'SHA-256 hash allowlisting for inline scripts' },
      { name: 'NGINX Nonce', path: '/nonce-nginx', description: 'Legacy-friendly nonce via NGINX sub_filter' },
      { name: 'Helmet Nonce', path: '/nonce-helmet', description: 'Application-level nonce with Helmet middleware' },
      { name: 'Malicious Domain', path: '/malicious', description: 'Simulated attacker-controlled domain' }
    ]
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
