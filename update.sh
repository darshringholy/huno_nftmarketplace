#!/bin/bash

# Navigate to the project directory
cd ~/Hunos-Marketplace || exit 1

echo "🔄 Pulling latest code from Git..."
git pull origin main || exit 1

echo "📦 Installing dependencies with Yarn..."
yarn install || exit 1

echo "🛠 Building the Next.js app..."
yarn build || exit 1

echo "🚀 Restarting PM2 process..."
pm2 restart hunosmarket || exit 1

echo "✅ Deployment complete."