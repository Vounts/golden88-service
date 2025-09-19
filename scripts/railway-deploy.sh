#!/bin/bash

# Railway Deployment Helper Script
# This script helps prepare and deploy your app to Railway

set -e

echo "🚀 Railway Deployment Helper"
echo "=============================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    railway login
fi

echo "✅ Railway CLI is ready"

# Build the project
echo "📦 Building project..."
yarn build

echo "✅ Build completed"

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Go to railway.app to monitor your deployment"
echo "2. Add a PostgreSQL service if you haven't already"
echo "3. Configure your environment variables"
echo "4. Run the database migration: railway run yarn railway:migrate"
echo "5. Test your API endpoints"
echo ""
echo "📖 See RAILWAY_DEPLOYMENT.md for detailed instructions"
