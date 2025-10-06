#!/bin/bash
# Deploy script for Mat Bao Premium Cloud Hosting
# This script runs after git pull on the server

echo "🚀 Starting deployment..."

# Set production environment
export NODE_ENV=production

# Install/update dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Run database migrations (if any)
echo "🔄 Updating database schema..."
npx prisma db push --accept-data-loss

# Build the application
echo "🏗️ Building application..."
npm run build

# Sync blog posts and build search index
echo "📝 Syncing content..."
npm run prebuild

# Restart the application
echo "🔄 Restarting application..."
# The restart will be handled by the hosting panel

echo "✅ Deployment completed successfully!"

# Show some info
echo "📊 Deployment info:"
echo "- Node version: $(node --version)"
echo "- NPM version: $(npm --version)"
echo "- Build time: $(date)"
echo "- Branch: $(git branch --show-current)"
echo "- Last commit: $(git log -1 --pretty=format:'%h - %s (%an)')"