# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install yarn
RUN npm install -g yarn

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN yarn prisma generate

# Build the application
RUN yarn build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install yarn
RUN npm install -g yarn

# Copy build artifacts and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run database migrations and start the server
CMD ["sh", "-c", "yarn prisma migrate deploy && yarn start:prod"]