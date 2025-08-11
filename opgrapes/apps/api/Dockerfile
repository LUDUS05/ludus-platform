# syntax=docker/dockerfile:1

# Build stage: install deps and build TypeScript
FROM node:20-alpine AS deps
WORKDIR /app
# Copy monorepo manifests first for better layer caching
COPY package.json package-lock.json* ./
# Install all dependencies (including dev deps for build)
RUN npm ci --only=production=false

# Build stage: compile TypeScript
FROM node:20-alpine AS build
WORKDIR /app
# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY apps/api ./apps/api
# Build the application
RUN npm --workspace apps/api run build

# Runtime stage: production-ready image
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Install only production dependencies
COPY apps/api/package.json ./package.json
RUN npm install --omit=dev --ignore-scripts

# Copy built application
COPY --from=build /app/apps/api/dist ./dist

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["node", "dist/index.js"]
