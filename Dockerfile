# Step 1: Build the Vite app using pnpm
FROM node:18 AS builder

# Enable and install pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set the working directory inside the container
WORKDIR /app

# Copy all project files
COPY . .

# Install dependencies using pnpm
RUN pnpm install

# Build the Vite app (uses your existing "build" script)
RUN pnpm run build

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
