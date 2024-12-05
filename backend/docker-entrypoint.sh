#!/bin/sh

# Regenerate Prisma Client and run migrations
npx prisma generate
npx prisma migrate deploy

# Start the application
npm start