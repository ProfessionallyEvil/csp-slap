# Multi-stage build for CSP Demo with NGINX
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY views/ ./views/
COPY public/ ./public/

# Build the application
RUN npm run build

# Production stage with NGINX and Node.js
FROM nginx:alpine AS production

# Install Node.js in the NGINX container
RUN apk add --no-cache nodejs npm

# Create app directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/views ./views/
COPY --from=builder /app/public ./public/
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy NGINX configuration
COPY nginx-container.conf /etc/nginx/nginx.conf

# Create a startup script to run both NGINX and Node.js
RUN echo '#!/bin/sh' > /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start Node.js backend in background' >> /start.sh && \
    echo 'cd /app' >> /start.sh && \
    echo 'node dist/index.js &' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Start NGINX in foreground' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh

RUN chmod +x /start.sh

# Expose port 80 (NGINX frontend)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start both services
CMD ["/start.sh"]