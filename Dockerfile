# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy everything into the container
COPY . .

# Install dependencies
RUN npm install

# Build the React app
RUN npm run build

# Install serve to serve the static files
RUN npm install -g serve

# Expose the port Dokploy will access
EXPOSE 3000

# Command to run the app
CMD ["serve", "-s", "build"]
