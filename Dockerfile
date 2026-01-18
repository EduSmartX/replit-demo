# Build stage
FROM node:24-alpine AS builder

WORKDIR /app


# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:24-alpine AS production

WORKDIR /app

# Install serve to run the production build
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

# Start the application
CMD ["serve", "-s", "dist", "-l", "5000"]

# Development stage
FROM node:24-alpine AS development

WORKDIR /app

# Install git for husky hooks
RUN apk add --no-cache git

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (includes dev dependencies for linting)
# Increase timeout and use retries for better reliability
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm install || npm install || npm install

# Copy configuration files needed for vite
COPY vite.config.ts tsconfig.json postcss.config.js ./
COPY vite-plugin-meta-images.ts ./

# Expose port
EXPOSE 5000

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
