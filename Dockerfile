# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
# Using 'install' is more robust for this context than 'ci'
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:1.25-alpine

# Copy the built assets from the 'build' stage
COPY --from=build /app/dist /usr/share/nginx/html

# Healthcheck to ensure Nginx is serving content
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Expose port 80 and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]