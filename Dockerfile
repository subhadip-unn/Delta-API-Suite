# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN cd apps/frontend && pnpm run build
RUN cd apps/backend && pnpm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/dist ./frontend
COPY --from=builder --chown=nextjs:nodejs /app/apps/backend/dist ./backend

# Copy package files
COPY --from=builder /app/apps/frontend/package*.json ./frontend/
COPY --from=builder /app/apps/backend/package*.json ./backend/

# Install only production dependencies
RUN npm install -g pnpm
RUN cd frontend && pnpm install --prod --frozen-lockfile
RUN cd backend && pnpm install --prod --frozen-lockfile

# Expose ports
EXPOSE 3000 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["sh", "-c", "cd backend && npm start & cd frontend && npm start"]
