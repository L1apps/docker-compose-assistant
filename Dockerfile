# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
# Using 'ci' for reproducible builds if a lockfile is present
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:1.25-alpine

# Copy the built assets from the 'build' stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
