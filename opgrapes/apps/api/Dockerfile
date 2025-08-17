FROM node:18-alpine

WORKDIR /app

# Copy package files from the API directory
COPY apps/api/package*.json ./

# Install dependencies (use npm install instead of npm ci to avoid lockfile issues)
RUN npm install --only=production

# Copy source code
COPY apps/api/ ./

# Build the application
RUN npm run build

# Expose port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]
