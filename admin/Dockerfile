# Stage 1: Build the Vite app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the static files (this will read the local .env to bake in VITE_API_URL)
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy standard Nginx config for React Router fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
