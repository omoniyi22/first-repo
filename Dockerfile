# Step 1: Build the Vite app using npm
FROM node:18 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better Docker caching)
COPY package*.json ./

# Install dependencies using npm
RUN npm install

# Copy the rest of the project files
COPY . .

# Build the Vite app (uses your existing "build" script)
RUN npm run build

# Step 2: Serve the built app using NGINX
FROM nginx:stable-alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite build output to NGINX's public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for web traffic
EXPOSE 80

# Start the NGINX server
CMD ["nginx", "-g", "daemon off;"]
