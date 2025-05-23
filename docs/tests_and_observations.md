# Vulnerable Demo Page

- All tests passing

# Basic CSP Page

- Everything seems to work but there's an inline style-src that's failing.  We should replace that with a style file on the same origin so that the style-src 'self' directive passes. 

# Hash-based CSP Demo Page

- User Comment Form is failing and there is a CSP violation in the console.
- All three buttons have no apparent affect and no CSP violations in the logs.
- The timer is not running
- The view code page is working as expected
Additional console exceptions are:
```
hash-csp:70  Refused to apply inline style because it violates the following Content Security Policy directive: "style-src 'self'". Either the 'unsafe-inline' keyword, a hash ('sha256-tH1/xuvfx0h566qxjL3yokHZEuOC+RPl2vwA4waf+74='), or a nonce ('nonce-...') is required to enable inline execution. Note that hashes do not apply to event handlers, style attributes and javascript: navigations unless the 'unsafe-hashes' keyword is present.

hash-csp:78  Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self' 'sha256-xgRwbYEf7XlbDnBnHqdOa2rPmpEpFka96kbm7p58Sig='". Either the 'unsafe-inline' keyword, a hash ('sha256-mzPE5fJxmOnzweXjUO6REWBqpqlJjL5uQOCATeQ3TXA='), or a nonce ('nonce-...') is required to enable inline execution.
```

# NGINX Nonce
- This seems to work and provides a good simulation of NGINX on there but I am wondering if this might be more compelling if we actually have an NGINX configuration but that would be more complex to set up.
- Instead of adding NGINX itself, let's add another View Code button like we did in some of the other scenarios, which pops open a page on another tab.  Inside of that we can include some of our example code and then also add a sample NGINX configuration.  Below is a snippent of one that I have used in production before.  We can probably just trim it down to the sections that are relevant to CSP.
```nginx configuration
server {
        server_name   localhost;
        listen        0.0.0.0:3000;

        set $csp_nonce "";

        location      / {
            root      /app;
            try_files $uri $uri/ /index.html =404;

            set $csp_nonce $request_id;
            sub_filter_once off;
            sub_filter '__CSP_NONCE__' $csp_nonce;

            add_header X-Frame-Options "SAMEORIGIN" always;
            add_header X-Content-Type-Options "nosniff" always;
            add_header X-XSS-Protection "1; mode=block" always;
            add_header Referrer-Policy "strict-origin-when-cross-origin" always;
            add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

            add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
            add_header Pragma "no-cache" always;

            add_header Content-Security-Policy "script-src 'nonce-$csp_nonce' 'strict-dynamic' https: 'unsafe-inline' 'unsafe-eval'; object-src 'none'; base-uri 'self';" always;

            if_modified_since off;
            expires off;
            etag off;

        }
    }
```

# Helmet Nonce
- This appears to be failing miserably because it is trying to reach out to /css/styles.css via https.  Does helmet not work on http?

# Malicious Domain
- No issues