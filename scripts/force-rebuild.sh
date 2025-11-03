#!/bin/bash

# ===================================================
# 🚀 ApexRebate Force Rebuild Script (UI/UX v3 Root Fix)
# ===================================================

set -e

echo ""
echo "🔧 Forcing full rebuild of ApexRebate on Vercel..."
echo "=================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No color

# Step 1: Confirm git status
echo -e "${YELLOW}📋 Checking repository status...${NC}"
git fetch origin main --quiet || true
git status || true

# Step 2: Create empty commit to force Vercel rebuild
echo -e "${YELLOW}🧱 Creating empty commit for rebuild...${NC}"
git commit --allow-empty -m "chore(ci): force rebuild UI/UX v3 root redirect fix"
git push origin main

# Step 3: Optional local build validation
echo -e "${YELLOW}🧩 Running local build validation (no cache)...${NC}"
vercel build --no-clipboard --force || {
  echo -e "${RED}❌ Local build failed — check next.config.ts or page.tsx.${NC}"
  exit 1
}

# Step 4: Deploy to production
echo -e "${YELLOW}🚀 Deploying to Vercel (prod, no cache)...${NC}"
vercel deploy --prebuilt --prod --force

# Step 5: Verify redirects
SITE_URL="https://apexrebate.com"

echo -e "${YELLOW}🧭 Verifying redirects...${NC}"

check_redirect() {
  local url=$1
  local expected=$2
  local location
  location=$(curl -s -I "$url" | grep -i "location:" || true)
  echo "🔗 $url → ${location:-[no redirect]}"
  if [[ "$location" == *"$expected"* ]]; then
    echo -e "${GREEN}✅ OK (points to $expected)${NC}"
  else
    echo -e "${RED}⚠️ Unexpected redirect target${NC}"
  fi
  echo ""
}

check_redirect "$SITE_URL/uiux-v3" "/"
check_redirect "$SITE_URL/vi/uiux-v3" "/vi"
check_redirect "$SITE_URL/en/uiux-v3" "/en"

echo -e "${GREEN}🎉 Force rebuild & deploy complete!${NC}"
