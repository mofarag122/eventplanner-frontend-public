FROM node:lts-alpine3.23 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Fix permissions for OpenShift
RUN chown -R 1001:0 \
    /usr/share/nginx/html \
    /var/cache/nginx \
    /var/run \
    /etc/nginx

# Switch to non-root user
USER 1001

LABEL name="evoplan-app" \
    description="plan and manage events and invitations" \
    version="dev"

EXPOSE 8080

ENTRYPOINT ["nginx", "-g", "daemon off;"]
