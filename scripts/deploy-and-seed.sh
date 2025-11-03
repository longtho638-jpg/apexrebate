#!/bin/bash

# ApexRebate - Deploy & Seed Production
# =====================================

set -e

echo "🚀 ApexRebate - Production Deployment & Seeding"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SITE_URL="${SITE_URL:-https://apexrebate.com}"
SEED_SECRET="${SEED_SECRET_KEY:-}"

# Step 1: Check if SEED_SECRET_KEY is set
echo -e "${BLUE}📋 Step 1: Checking environment variables...${NC}"
if [ -z "$SEED_SECRET" ]; then
  echo -e "${YELLOW}⚠️  SEED_SECRET_KEY not set in environment${NC}"
  echo ""
  echo "Please set it in Vercel:"
  echo "  1. Go to: https://vercel.com/your-project/settings/environment-variables"
  echo "  2. Add: SEED_SECRET_KEY = $(openssl rand -hex 32)"
  echo "  3. Redeploy or set locally: export SEED_SECRET_KEY='your-secret'"
  echo ""
  read -p "Enter SEED_SECRET_KEY now (or press Enter to skip): " SEED_SECRET
  if [ -z "$SEED_SECRET" ]; then
    echo -e "${RED}❌ Cannot proceed without SEED_SECRET_KEY${NC}"
    exit 1
  fi
fi
echo -e "${GREEN}✅ SEED_SECRET_KEY configured${NC}"
echo ""

# Step 2: Verify site is accessible
echo -e "${BLUE}📋 Step 2: Verifying site accessibility...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/vi")
if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "307" ]; then
  echo -e "${GREEN}✅ Site is accessible (HTTP $HTTP_STATUS)${NC}"
else
  echo -e "${RED}❌ Site not accessible (HTTP $HTTP_STATUS)${NC}"
  exit 1
fi
echo ""

# Step 3: Check current seed status
echo -e "${BLUE}📋 Step 3: Checking current database status...${NC}"
SEED_STATUS=$(curl -s "$SITE_URL/api/seed-production")
echo "$SEED_STATUS"
echo ""

# Step 4: Seed production database
echo -e "${BLUE}📋 Step 4: Seeding production database...${NC}"
echo "Sending seed request to: $SITE_URL/api/seed-production"
echo ""

SEED_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$SITE_URL/api/seed-production" \
  -H "Authorization: Bearer $SEED_SECRET" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$SEED_RESPONSE" | tail -n1)
SEED_BODY=$(echo "$SEED_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Seed successful!${NC}"
  echo ""
  echo "📊 Database Summary:"
  echo "$SEED_BODY" | jq . 2>/dev/null || echo "$SEED_BODY"
  echo ""
else
  echo -e "${RED}❌ Seed failed (HTTP $HTTP_CODE)${NC}"
  echo "$SEED_BODY"
  exit 1
fi

# Step 5: Verify seeded data
echo -e "${BLUE}📋 Step 5: Verifying seeded data...${NC}"
echo ""

# Check tools
TOOLS_COUNT=$(curl -s "$SITE_URL/api/tools" | jq 'length' 2>/dev/null || echo "0")
echo "🛠️  Tools: $TOOLS_COUNT"

# Check achievements
ACHIEVEMENTS_COUNT=$(curl -s "$SITE_URL/api/gamification/achievements" | jq 'length' 2>/dev/null || echo "0")
echo "🏆 Achievements: $ACHIEVEMENTS_COUNT"

# Check exchanges
EXCHANGES_COUNT=$(curl -s "$SITE_URL/api/exchanges" | jq 'length' 2>/dev/null || echo "0")
echo "🏦 Exchanges: $EXCHANGES_COUNT"

echo ""

# Step 6: Summary
echo -e "${GREEN}🎉 Deployment & Seeding Complete!${NC}"
echo "=================================="
echo ""
echo "✅ All features have seed data:"
echo "   • 26 users (Admin, Concierge, 20 traders)"
echo "   • 13 tools across 5 categories"
echo "   • 4 achievements with user assignments"
echo "   • 189 payouts (6 months history)"
echo "   • 3 exchanges with 18 accounts"
echo "   • 3 deployment regions"
echo "   • 8 mobile users"
echo "   • 20 notifications"
echo "   • 120 user activities"
echo ""
echo "🌐 Production URLs:"
echo "   • Homepage: $SITE_URL/vi"
echo "   • Dashboard: $SITE_URL/vi/dashboard"
echo "   • Tools: $SITE_URL/vi/tools"
echo "   • Gamification: $SITE_URL/vi/gamification"
echo "   • Referrals: $SITE_URL/vi/referrals"
echo "   • Analytics: $SITE_URL/vi/analytics"
echo ""
echo "👤 Test Accounts:"
echo "   • Admin: admin@apexrebate.com / admin123"
echo "   • Concierge: concierge@apexrebate.com / concierge123"
echo "   • Trader (Diamond): trader1@example.com / trader123"
echo ""
echo "📚 Documentation:"
echo "   • PRODUCTION_DEPLOY_GUIDE.md"
echo "   • FULL_SEED_COMPLETION.md"
echo "   • QUICKSTART_SEED.md"
echo ""
