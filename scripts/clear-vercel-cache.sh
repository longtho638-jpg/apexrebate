#!/bin/bash

# Clear Vercel Cache for ApexRebate Production
# Usage: ./scripts/clear-vercel-cache.sh

set -e

echo "🧹 Clearing Vercel cache..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "⚠️  VERCEL_TOKEN not set. Using .vercelrc credentials..."
fi

echo "📍 Getting project info..."
VERCEL_PROJECT=$(vercel project ls 2>/dev/null | grep -i apexrebate | head -1 | awk '{print $1}')

if [ -z "$VERCEL_PROJECT" ]; then
    echo "❌ Could not find ApexRebate project"
    exit 1
fi

echo "✅ Found project: $VERCEL_PROJECT"

# Pull latest environment
echo "📥 Pulling environment variables..."
vercel env pull

# Redeploy without rebuild to trigger cache clear
echo "🚀 Redeploying (this will clear cache)..."
vercel --prod --skip-build

echo "✅ Cache cleared successfully!"
echo ""
echo "Next steps:"
echo "1. Test signin flow: https://apexrebate.com/vi/admin"
echo "2. Monitor logs for: [middleware] Redirect to signin: callbackUrl=/vi/admin"
echo "3. Verify redirect to /vi/admin after signin"
