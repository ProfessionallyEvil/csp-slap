# Content Security Policy Demonstration Project Requirements

## Project Overview

This project aims to create a comprehensive demonstration of Content Security Policy (CSP) capabilities through a React-based web application. The demonstration will showcase the evolution from vulnerable applications to secure implementations using various CSP techniques, particularly focusing on advanced features like nonces and hashes.

## Target Audience

Technical professionals attending a presentation on web security, specifically Content Security Policy implementation and best practices.

## Core Objectives

1. Demonstrate real-world XSS vulnerabilities in a controlled environment
2. Show the protective capabilities of basic CSP implementation
3. Illustrate advanced CSP features including nonces and hashes
4. Provide multiple implementation approaches for different technology stacks

## Application Requirements

### Base Application Structure

**Technology Stack:**
- Express.js backend with EJS templating for server-side rendering
- Simple JavaScript components for interactive functionality
- NGINX reverse proxy configuration with name-based virtual hosting
- Helmet middleware for application-level CSP management
- Docker containerization for complete demo environment
- Basic HTML/CSS styling

**Core Functionality:**
- Simple web forms with user input fields
- Interactive JavaScript functionality (countdown timer or simple calculator)
- Server-side template rendering with EJS for nonce/hash injection
- Areas where inline scripts can be injected for XSS demonstration
- Cross-origin form submission endpoints
- Clear, readable code examples suitable for presentation

### Containerized Demo Environment

**Container Architecture:**
- Single Docker container hosting multiple virtual domains
- NGINX name-based virtual host configuration
- All domains under *.example.com namespace
- Local hosts file configuration for demo machine

**Virtual Domain Structure:**
```
vulnerable.example.com     - No CSP protection (Scenario 1)
basic-csp.example.com      - Basic CSP implementation (Scenario 2)
hash-csp.example.com       - Hash-based CSP (Scenario 3)
nonce-nginx.example.com    - NGINX nonce implementation (Scenario 4)
nonce-helmet.example.com   - Helmet nonce implementation (Scenario 5)
malicious.example.com      - Simulated attacker-controlled domain
```

**Container Benefits:**
- Self-contained demonstration environment
- Easy deployment and sharing via GitHub
- Consistent cross-platform behavior
- Simplified setup for presentation environments
- Complete isolation from host system

## Demonstration Scenarios

### Scenario 1: Vulnerable Application (vulnerable.example.com)

**Purpose:** Show how XSS attacks work in unprotected applications

**Features to Demonstrate:**
- Cross-site scripting vulnerability (simple alert popup injection)
- Form submission to different origins (malicious.example.com)
- Inline script execution without restrictions
- Direct demonstration of security risks

**Expected Behavior:**
- Injected scripts execute successfully
- Alert boxes appear when malicious code is injected
- Cross-origin requests to malicious.example.com succeed
- No browser protection mechanisms active

### Scenario 2: Basic CSP Protection (basic-csp.example.com)

**Purpose:** Show fundamental CSP protection capabilities

**CSP Configuration:**
- Prevent inline script execution
- Restrict script sources to same-origin
- Block cross-origin form submissions to malicious.example.com
- Basic directive implementation

**Expected Behavior:**
- Inline script injections blocked by browser
- Console warnings/errors visible in developer tools
- Legitimate functionality preserved
- Cross-origin requests blocked with CSP violations

### Scenario 3: Advanced CSP with Hashes (hash-csp.example.com)

**Purpose:** Demonstrate hash-based script allowlisting

**Implementation Details:**
- Calculate SHA-256 hashes for legitimate inline scripts
- Include hashes in CSP header
- Show countdown timer or interactive element working with hash
- Demonstrate that non-hashed scripts are blocked

**Key Learning Points:**
- Hash calculation process
- Pre-deployment hash generation workflow
- Selective inline script execution
- Best practices for hash management

**Expected Behavior:**
- Hashed inline scripts execute normally
- Non-hashed injected scripts blocked
- Application functionality maintained
- Clear security boundary demonstration

### Scenario 4: Legacy-Friendly NGINX Nonce Implementation (nonce-nginx.example.com)

**Purpose:** Show pragmatic CSP implementation for legacy applications

**Real-World Context:**
- Legacy application that can't easily be modified for server-side templating
- Need to add CSP protection without major application changes
- Demonstrates "good enough" security improvements vs. perfect solutions
- Shows how to raise the security bar significantly with minimal application impact

**Technical Implementation:**
- Static HTML with hardcoded nonce placeholder: `<script nonce="__CSP_NONCE__">`
- NGINX configuration uses `sub_filter` to replace placeholder with generated value
- NGINX generates nonce using available modules (even if not cryptographically perfect)
- CSP header injection with matching nonce value

**NGINX Configuration Example:**
```nginx
location / {
    # Generate a simple nonce (could be improved but still effective)
    set $csp_nonce $request_id$msec;
    
    # Replace placeholder in HTML content
    sub_filter '__CSP_NONCE__' $csp_nonce;
    sub_filter_once off;
    
    # Set CSP header with nonce
    add_header Content-Security-Policy "script-src 'self' 'nonce-$csp_nonce'";
    
    proxy_pass http://backend;
}
```

**Key Teaching Points:**
- **Pragmatic security**: Not perfect, but significantly better than no CSP
- **Legacy compatibility**: No application code changes required
- **Incremental improvement**: Can be enhanced later with proper random generation
- **Risk reduction**: Makes XSS attacks much more difficult even with simpler nonce generation
- **Implementation ease**: Can be deployed without development team involvement

**Expected Behavior:**
- Static HTML loads with nonce-protected scripts
- Injected scripts without matching nonce are blocked
- Application functionality preserved
- Clear demonstration that "some protection > no protection"

**Presentation Talking Points:**
- "Perfect is the enemy of good" - this approach provides substantial protection
- Can be implemented by infrastructure teams without touching application code
- Provides immediate security benefits while planning for more robust solutions
- Shows how to get CSP deployed quickly in organizations with legacy constraints

### Scenario 5: Application-Level Nonce with Helmet (nonce-helmet.example.com)

**Purpose:** Demonstrate proper application-integrated nonce management

**Real-World Context:**
- Modern application development approach
- Full control over nonce generation and security
- Demonstrates best-practice implementation
- Shows the "ideal" solution for comparison with legacy approach

**Technical Implementation:**
- Express.js with Helmet middleware generating cryptographically secure nonces
- Helmet's CSP configuration with proper nonce generation
- EJS template receives nonce from middleware
- Full application-level CSP management

**Code Components:**
```javascript
// Helmet configuration with secure nonce generation
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`]
  }
}));
```

**Key Teaching Points:**
- **Cryptographically secure**: Proper random nonce generation
- **Application integration**: Full control over CSP policy management
- **Development workflow**: How to integrate CSP into modern development practices
- **Scalability**: Suitable for complex applications with multiple CSP requirements

**Expected Behavior:**
- Application-controlled secure nonce generation and management
- Clean integration with existing Express middleware stack
- Flexible, programmatic CSP policy management
- Demonstrates the security upgrade path from legacy solutions

**Comparison with Legacy Approach:**
- More secure nonce generation vs. simple timestamp-based values
- Application-level control vs. infrastructure-only implementation
- Better integration with application logging and monitoring
- Easier to extend with additional CSP directives and complexity

### Malicious Domain Simulation (malicious.example.com)

**Purpose:** Simulate attacker-controlled resources

**Functionality:**
- Simple endpoint to receive cross-origin form submissions
- JavaScript resources that could be maliciously injected
- Demonstration of blocked vs. allowed cross-origin interactions
- Clear visual indication of "malicious" vs. legitimate domains

## Technical Specifications

### Development Environment
- Node.js runtime environment
- React development tools
- NGINX for reverse proxy demonstrations
- Browser developer tools for inspection

### Security Considerations
- All demonstrations contained in controlled environment
- Clear labeling of vulnerable vs. secure implementations
- No real user data or sensitive information
- Proper cleanup of demonstration artifacts

### Documentation Requirements
- Step-by-step implementation guides
- Configuration file examples
- Code snippets for each scenario
- Troubleshooting common implementation issues

## Implementation Phases

### Phase 1: Base Application Development
- Create React application with vulnerable endpoints
- Implement basic functionality (forms, scripts, interactive elements)
- Establish XSS injection points for demonstration

### Phase 2: CSP Policy Development
- Define basic CSP policies
- Calculate hashes for legitimate scripts
- Document policy progression from basic to advanced

### Phase 3: Server Configuration
- Set up NGINX reverse proxy with CSP injection
- Configure dynamic nonce generation
- Implement Helmet-based CSP management

### Phase 4: Integration and Testing
- Verify all demonstration scenarios
- Test cross-browser compatibility
- Validate security policy effectiveness

### Phase 5: Documentation and Presentation Materials
- Create deployment guides
- Prepare presentation slides coordination
- Document lessons learned and best practices

## Success Criteria

1. **Vulnerability Demonstration:** Clear, obvious XSS execution in unprotected scenario
2. **Basic Protection:** Successful blocking of inline scripts with basic CSP
3. **Hash Implementation:** Selective script execution based on SHA-256 hashes
4. **Nonce Rotation:** Dynamic nonce generation and validation in both NGINX and Helmet implementations
5. **Educational Value:** Clear progression showing security improvement at each stage
6. **Production Readiness:** Realistic implementation approaches suitable for real-world deployment

## Deliverables

- Complete React application source code
- Docker container configuration with multi-domain setup
- NGINX virtual host configurations with CSP directives
- Node.js/Helmet implementation examples
- Docker Compose or Dockerfile for easy deployment
- Local hosts file configuration template
- Comprehensive documentation
- Presentation-ready demonstration scripts
- GitHub repository with complete demo environment
- Troubleshooting and implementation guides