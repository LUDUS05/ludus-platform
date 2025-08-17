FROM node:18-alpine

WORKDIR /app

# Debug: List what's available in the build context
RUN ls -la

# Copy package files first
COPY apps/api/package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY apps/api/src ./src
COPY apps/api/tsconfig.json ./

# Build the application
RUN npm run build

# Expose port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]
