# Use Node.js 18 Alpine image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Start the application
CMD [ "node", "index.js" ]