# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- `npm run build` - Compile TypeScript to dist/ directory
- Build output location: `dist/index.js`

## Project Architecture

This is a Content Security Policy (CSP) demonstration project that showcases web security vulnerabilities and protection mechanisms through multiple virtual domains. The project is designed for educational presentations on CSP implementation.

### Target Architecture
The final implementation will feature:
- Express.js backend with EJS templating for server-side rendering
- NGINX reverse proxy with name-based virtual hosting
- Docker containerization for complete demo environment
- Helmet middleware for application-level CSP management

### Virtual Domain Structure
```
vulnerable.example.com     - No CSP protection
basic-csp.example.com      - Basic CSP implementation  
hash-csp.example.com       - Hash-based CSP
nonce-nginx.example.com    - NGINX nonce implementation
nonce-helmet.example.com   - Helmet nonce implementation
malicious.example.com      - Simulated attacker domain
```

### Key Implementation Requirements
- XSS vulnerability demonstrations in controlled environment
- Progressive CSP protection scenarios (none → basic → hash → nonce)
- Cross-origin request blocking demonstrations
- Both legacy-friendly (NGINX sub_filter) and modern (Helmet middleware) CSP approaches
- Server-side nonce generation and injection into EJS templates
- SHA-256 hash calculation for inline scripts

### Current State
The project is in early setup phase with basic TypeScript configuration. Development should follow the detailed requirements in `docs/csp_demo_requirements.md` which outlines 5 demonstration scenarios and specific implementation approaches for each virtual domain.