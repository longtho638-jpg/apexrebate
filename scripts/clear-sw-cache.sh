#!/bin/bash
# ============================================
# 🚀 ApexRebate Cache Buster (Safe Version)
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🧹 Clearing cache and forcing rebuild...${NC}"
echo "=========================================="

# 1️⃣ Remove local build cache
echo -e "${YELLOW}📦 Removing local .next cache...${NC}"
rm -rf .next .vercel/cache 2>/dev/null || true
echo -e "${GREEN}✓ Local cache cleared${NC}"

# 2️⃣ Update next.config.ts headers (preserve existing config)
echo -e "${YELLOW}⚙️  Updating cache headers in next.config.ts...${NC}"
if ! grep -q "no-store, no-cache" next.config.ts; then
  # Backup original
  cp next.config.ts next.config.ts.bak
  
  # Update Cache-Control header value
  sed -i.tmp "s/value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'/value: 'no-store, no-cache, must-revalidate, proxy-revalidate'/" next.config.ts
  rm -f next.config.ts.tmp
  
  echo -e "${GREEN}✓ Cache headers updated to no-store${NC}"
else
  echo -e "${GREEN}✓ Cache headers already set to no-store${NC}"
fi

# 3️⃣ Add cache-busting comment to dashboard page
echo -e "${YELLOW}📝 Adding cache-bust timestamp to dashboard...${NC}"
TIMESTAMP=$(date +%s)
sed -i.tmp "s|// Force Vercel rebuild:.*|// Force Vercel rebuild: ${TIMESTAMP}|" src/app/\[locale\]/dashboard/page.tsx
rm -f src/app/\[locale\]/dashboard/page.tsx.tmp
echo -e "${GREEN}✓ Dashboard page timestamped: ${TIMESTAMP}${NC}"

# 4️⃣ Commit and push changes
echo -e "${YELLOW}📤 Committing changes...${NC}"
git add next.config.ts src/app/\[locale\]/dashboard/page.tsx
if git diff --staged --quiet; then
  echo -e "${YELLOW}⚠️  No changes to commit, creating empty commit...${NC}"
  git commit --allow-empty -m "chore: force cache-bust + rebuild - timestamp ${TIMESTAMP}"
else
  git commit -m "chore: force cache-bust + rebuild - timestamp ${TIMESTAMP}"
fi

echo -e "${YELLOW}🚀 Pushing to GitHub (triggers Vercel auto-deploy)...${NC}"
git push origin main

# 5️⃣ Wait for deployment
echo -e "${YELLOW}⏳ Waiting 120s for Vercel deployment...${NC}"
for i in {1..120}; do
  echo -ne "\r   Progress: ${i}/120s"
  sleep 1
done
echo ""

# 6️⃣ Verify new deployment
echo -e "${YELLOW}🔍 Verifying production deployment...${NC}"
echo ""
echo "Checking bundle hash:"
BUNDLE_HASH=$(curl -s https://apexrebate.com/vi/dashboard | grep -o 'page-[a-f0-9]*\.js' | head -1)
echo -e "  Current: ${GREEN}${BUNDLE_HASH}${NC}"

echo ""
echo "Checking for errors:"
ERROR_COUNT=$(curl -s https://apexrebate.com/vi/dashboard | grep -c "Application error" || echo "0")
if [ "$ERROR_COUNT" -eq "0" ]; then
  echo -e "  ${GREEN}✓ NO ERRORS FOUND${NC}"
else
  echo -e "  ${RED}✗ ERROR STILL EXISTS (count: ${ERROR_COUNT})${NC}"
fi

echo ""
echo "Checking cache headers:"
curl -I https://apexrebate.com/vi/dashboard 2>&1 | grep -i cache-control || echo "  (no cache-control header)"

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Cache-bust deployment complete!${NC}"
echo ""
echo "📋 Next steps for users:"
echo "  1. Open DevTools (F12)"
echo "  2. Application tab → Service Workers"
echo "  3. Click 'Unregister' for apexrebate.com"
echo "  4. Right-click reload → 'Empty Cache and Hard Reload'"
echo "  5. Or test in Incognito mode (Cmd+Shift+N)"
echo ""
echo "Bundle hash: ${BUNDLE_HASH}"
echo "Timestamp: ${TIMESTAMP}"
