FROM node:18-alpine

WORKDIR /app

# Install required packages
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

EXPOSE 3000

# Wait for database and start app
CMD /bin/sh -c "npm run prisma:migrate:deploy && npm start"