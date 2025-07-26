# Multi-stage Dockerfile for LUDUS Platform

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Stage 2: Setup backend
FROM node:18-alpine AS backend
WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY server/ ./

# Copy built frontend
COPY --from=frontend-build /app/client/build ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S ludus -u 1001

# Change ownership
RUN chown -R ludus:nodejs /app
USER ludus

EXPOSE 5000

CMD ["npm", "start"]