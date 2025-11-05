#!/bin/bash
# 🔒 ApexRebate Security Fix - Environment Variables Setup
set -e

echo "═══════════════════════════════════════════════════"
echo "   �� ApexRebate Security Environment Setup"
echo "═══════════════════════════════════════════════════"

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI: $(firebase --version)"
echo ""
echo "📋 Project: $(firebase use)"
echo ""

# DATABASE_URL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Setting DATABASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Get from: https://console.neon.tech"
echo ""
firebase functions:secrets:set DATABASE_URL

# NEXTAUTH_SECRET
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Generating NEXTAUTH_SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
openssl rand -base64 32 | firebase functions:secrets:set NEXTAUTH_SECRET
echo "✅ Done!"

# NEXTAUTH_URL
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Setting NEXTAUTH_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
firebase functions:config:set nextauth.url="https://apexrebate.com"

echo ""
echo "✅ Setup complete! Now run:"
echo "   npm run build && firebase deploy --only functions"
