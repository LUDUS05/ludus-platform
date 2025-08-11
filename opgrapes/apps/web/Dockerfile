# syntax=docker/dockerfile:1

# Dependencies stage: install all deps for better caching
FROM node:20-alpine AS deps
WORKDIR /app
# Copy monorepo manifests first for better layer caching
COPY package.json package-lock.json* ./
# Install all dependencies (including dev deps for build)
RUN npm ci --only=production=false

# Build stage: compile Next.js application
FROM node:20-alpine AS build
WORKDIR /app
# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY apps/web ./apps/web
# Build the application
RUN npm --workspace apps/web run build

# Runtime stage: production-ready Next.js standalone
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy Next.js standalone output
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["node", "apps/web/server.js"]
