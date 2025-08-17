FROM node:18-alpine

WORKDIR /app

# Copy the entire API directory
COPY apps/api/ ./

# Install dependencies
RUN npm install --only=production

# Build the application
RUN npm run build

# Expose port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]
