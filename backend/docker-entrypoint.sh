#!/bin/sh

# Wait for a moment to ensure database is ready
sleep 5

# Regenerate Prisma Client and run migrations
npx prisma generate
npx prisma migrate deploy

# Start the application
npm start