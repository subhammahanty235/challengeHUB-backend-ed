# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copy the entire project
COPY . .

# Expose API port
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]
