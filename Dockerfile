# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /src

# Copy project files
COPY . .

# Install dependencies
RUN npm install

# Build the app
RUN npm run build

# Install serve
RUN npm install -g serve

# Start the app
CMD ["serve", "-s", "build"]

# Expose default port (3000 or 8080)
EXPOSE 3000
