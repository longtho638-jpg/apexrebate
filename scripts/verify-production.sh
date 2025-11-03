#!/bin/bash

# ApexRebate - Quick Verification Script
# Run after deployment to verify all features are working

echo "🚀 ApexRebate - Production Verification"
echo "========================================"
echo ""

SITE_URL="${1:-https://apexrebate.com}"

echo "🌐 Testing site: $SITE_URL"
echo ""

# Core Routes
echo "📍 Core Routes:"
curl -sI "$SITE_URL/vi" | head -1
curl -sI "$SITE_URL/vi/uiux-v3" | head -1
curl -sI "$SITE_URL/vi/dashboard" | head -1
echo ""

# Tools
echo "🛠️  Tools Marketplace:"
curl -sI "$SITE_URL/vi/tools" | head -1
curl -s "$SITE_URL/api/tools" | jq -r 'if type == "array" then "✅ \(length) tools found" else "❌ No tools" end' 2>/dev/null || echo "⚠️  API check skipped (jq not installed)"
echo ""

# Gamification
echo "🎮 Gamification:"
curl -sI "$SITE_URL/vi/gamification" | head -1
curl -s "$SITE_URL/api/gamification/achievements" | jq -r 'if type == "array" then "✅ \(length) achievements found" else "❌ No achievements" end' 2>/dev/null || echo "⚠️  API check skipped"
echo ""

# Exchange
echo "🏦 Exchanges:"
curl -s "$SITE_URL/api/exchanges" | jq -r 'if type == "array" then "✅ \(length) exchanges found" else "❌ No exchanges" end' 2>/dev/null || echo "⚠️  API check skipped"
echo ""

# Referrals
echo "👥 Referrals:"
curl -sI "$SITE_URL/vi/referrals" | head -1
echo ""

# Analytics
echo "📊 Analytics:"
curl -sI "$SITE_URL/vi/analytics" | head -1
curl -sI "$SITE_URL/analytics" | head -1
echo ""

# Monitoring
echo "🔍 Monitoring:"
curl -sI "$SITE_URL/monitoring" | head -1
echo ""

# CI/CD
echo "⚙️  CI/CD:"
curl -sI "$SITE_URL/cicd" | head -1
echo ""

# Check seed status
echo "🌱 Seed Status:"
curl -s "$SITE_URL/api/seed-production" | jq '.' 2>/dev/null || echo "⚠️  Seed status check skipped (jq not installed)"
echo ""

echo "✅ Verification complete!"
echo ""
echo "📋 Manual checks:"
echo "  1. Visit $SITE_URL/vi in browser"
echo "  2. Test login/signup"
echo "  3. Check dashboard widgets"
echo "  4. Browse tools marketplace"
echo "  5. View gamification badges"
echo ""
