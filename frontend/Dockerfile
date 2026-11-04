# ========================================================
# Stage 1: Build the React application
# ========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for build-time provenance injection
ARG VITE_API_URL="http://localhost:8000"
ARG VITE_BASE_PATH="/"
ARG VITE_APP_VERSION="1.0.0"
ARG VITE_COMMIT_SHA="docker"
ARG VITE_BUILD_TIME="unknown"

ENV VITE_API_URL=${VITE_API_URL} \
    VITE_BASE_PATH=${VITE_BASE_PATH} \
    VITE_APP_VERSION=${VITE_APP_VERSION} \
    VITE_COMMIT_SHA=${VITE_COMMIT_SHA} \
    VITE_BUILD_TIME=${VITE_BUILD_TIME}

# Install dependencies with frozen lockfile
COPY package.json ./
RUN npm install

# Build static bundle
COPY . .
RUN npm run build

# ========================================================
# Stage 2: Serve static files with unprivileged NGINX
# ========================================================
FROM nginx:alpine AS runner

# Remove default nginx configurations
RUN rm -rf /etc/nginx/conf.d /usr/share/nginx/html/*

# Copy custom non-root friendly nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build output from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Grant nginx user permissions to html and cache directories
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    touch /tmp/nginx.pid && \
    chown -R nginx:nginx /tmp/nginx.pid /var/cache/nginx

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
