#!/bin/bash
set -e

echo "🚀 Deploying ApexRebate to Firebase (100% Google)"
echo "=================================================="
echo ""

# 1. Build Next.js app
echo "📦 Building Next.js app..."
npm run build

# 2. Deploy to Firebase Hosting + Functions
echo "🚀 Deploying to Firebase..."
firebase deploy

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Your app is live at:"
echo "   https://apexrebate.web.app"
echo "   https://apexrebate.firebaseapp.com"
echo ""
echo "🔧 Functions:"
echo "   https://scheduledcronjobs-fyesnthnra-uc.a.run.app"
echo "   https://triggercronjobs-fyesnthnra-uc.a.run.app"
echo ""
echo "🧪 Test cron:"
echo "   curl -X POST https://triggercronjobs-fyesnthnra-uc.a.run.app \\"
echo "     -H 'Authorization: Bearer your-secret-key-123'"
