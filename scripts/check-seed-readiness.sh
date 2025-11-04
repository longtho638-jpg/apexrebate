#!/bin/bash
# ===============================================
# �� ApexRebate — KIỂM TRA HIỆN TRẠNG SEED
# Check full-stack system readiness before SEED deploy
# ===============================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
WARN=0
FAIL=0

check_pass() { echo -e "${GREEN}✅ $1${NC}"; ((PASS++)); }
check_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; ((WARN++)); }
check_fail() { echo -e "${RED}❌ $1${NC}"; ((FAIL++)); }
section() { echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${BLUE}$1${NC}"; echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

echo -e "${YELLOW}"
echo "╔══════════════════════════════════════════════════╗"
echo "║   KIỂM TRA HIỆN TRẠNG FULL STACK - SEED PHASE   ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================
# 1️⃣ ENVIRONMENT VARIABLES
# ============================================
section "1️⃣  KIỂM TRA ENVIRONMENT VARIABLES"

REQUIRED_VARS=(DATABASE_URL NEXTAUTH_SECRET NEXT_PUBLIC_APP_URL)
for var in "${REQUIRED_VARS[@]}"; do
  if [ -n "${!var:-}" ]; then
    check_pass "$var configured"
  else
    check_fail "$var MISSING - Required for deployment"
  fi
done

if [ -n "${SEED_SECRET_KEY:-}" ]; then
  check_pass "SEED_SECRET_KEY configured (for production seed API)"
else
  check_warn "SEED_SECRET_KEY not set - Production seeding will fail"
fi

if [ -n "${OPENAI_API_KEY:-}" ] || [ -n "${ANTHROPIC_API_KEY:-}" ]; then
  check_pass "AI API keys configured"
else
  check_warn "No AI API keys - AI features will be disabled"
fi

# ============================================
# 2️⃣ DATABASE CONNECTION & SCHEMA
# ============================================
section "2️⃣  KIỂM TRA DATABASE (Neon Postgres)"

if npx prisma db pull --force >/dev/null 2>&1; then
  check_pass "Database connection OK (Neon reachable)"
else
  check_fail "Cannot connect to database - Check DATABASE_URL"
fi

# ============================================
# 3️⃣ GIT & CODE STATUS
# ============================================
section "3️⃣  KIỂM TRA GIT STATUS"

UNCOMMITTED=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
if [ "$UNCOMMITTED" -eq 0 ]; then
  check_pass "No uncommitted changes - Clean working directory"
else
  check_warn "$UNCOMMITTED uncommitted changes - Consider committing before deploy"
  git status --short | head -5
fi

BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
if [ "$BRANCH" = "main" ]; then
  check_pass "On main branch"
else
  check_warn "On branch '$BRANCH' (not main) - Production deploys from main"
fi

LAST_COMMIT=$(git log --oneline -1 2>/dev/null || echo "unknown")
echo -e "${BLUE}Latest commit:${NC} $LAST_COMMIT"

# ============================================
# 4️⃣ PRODUCTION SITE HEALTH
# ============================================
section "4️⃣  KIỂM TRA PRODUCTION SITE (apexrebate.com)"

SITE_URL=${NEXT_PUBLIC_APP_URL:-"https://apexrebate.com"}

ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/" 2>/dev/null || echo "000")
if [ "$ROOT_CODE" = "200" ] || [ "$ROOT_CODE" = "307" ] || [ "$ROOT_CODE" = "308" ]; then
  check_pass "Root page accessible (HTTP $ROOT_CODE)"
else
  check_fail "Root page failed (HTTP $ROOT_CODE)"
fi

DASH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/vi/dashboard" 2>/dev/null || echo "000")
if [ "$DASH_CODE" = "200" ]; then
  check_pass "Dashboard accessible (HTTP $DASH_CODE)"
  
  DASH_HTML=$(curl -s "$SITE_URL/vi/dashboard" 2>/dev/null || echo "")
  if echo "$DASH_HTML" | grep -q "Application error"; then
    check_fail "Dashboard has 'Application error' - Client-side bug detected"
  else
    check_pass "Dashboard renders without errors"
  fi
  
  BUNDLE=$(echo "$DASH_HTML" | grep -o 'dashboard/page-[a-f0-9]*\.js' | head -1 || echo "")
  if [ -n "$BUNDLE" ]; then
    echo -e "${BLUE}Current bundle:${NC} $BUNDLE"
  fi
else
  check_fail "Dashboard failed (HTTP $DASH_CODE)"
fi

for endpoint in "/api/health" "/api/dashboard"; do
  API_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL$endpoint" 2>/dev/null || echo "000")
  if [ "$API_CODE" = "200" ]; then
    check_pass "API $endpoint OK (HTTP $API_CODE)"
  else
    check_warn "API $endpoint returned HTTP $API_CODE"
  fi
done

# ============================================
# 5️⃣ LOCAL BUILD TEST
# ============================================
section "5️⃣  KIỂM TRA LOCAL BUILD"

if [ -d "node_modules" ]; then
  check_pass "node_modules exists"
else
  check_warn "node_modules missing - Run npm install"
fi

if [ -d "node_modules/.prisma/client" ]; then
  check_pass "Prisma client generated"
else
  check_warn "Prisma client not generated - Run npx prisma generate"
fi

if npm run -s lint 2>&1 | grep -qi "error"; then
  check_warn "ESLint errors found - Review before deploying"
else
  check_pass "ESLint checks pass"
fi

# ============================================
# 6️⃣ DEPLOYMENT TOOLS
# ============================================
section "6️⃣  KIỂM TRA DEPLOYMENT TOOLS"

if command -v vercel >/dev/null 2>&1; then
  check_pass "Vercel CLI installed"
else
  check_warn "Vercel CLI not found - Will use git push for deploy"
fi

GIT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "none")
if [ "$GIT_REMOTE" != "none" ]; then
  check_pass "Git remote configured"
else
  check_fail "No git remote - Cannot auto-deploy"
fi

command -v curl >/dev/null 2>&1 && check_pass "curl available" || check_fail "curl missing (required)"
command -v jq >/dev/null 2>&1 && check_pass "jq available" || check_warn "jq missing (optional)"

# ============================================
# 📊 SUMMARY
# ============================================
section "📊  KẾT QUẢ KIỂM TRA"

TOTAL=$((PASS + WARN + FAIL))
echo -e "${GREEN}✅ PASS: $PASS${NC}"
echo -e "${YELLOW}⚠️  WARN: $WARN${NC}"
echo -e "${RED}❌ FAIL: $FAIL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Total checks: $TOTAL"

echo ""
if [ $FAIL -eq 0 ]; then
  if [ $WARN -eq 0 ]; then
    echo -e "${GREEN}🎉 HỆ THỐNG SẴN SÀNG - Có thể chạy full-seed-deploy.sh${NC}"
    exit 0
  else
    echo -e "${YELLOW}⚠️  HỆ THỐNG CÓ CẢNH BÁO - Review warnings trước khi deploy${NC}"
    echo -e "${YELLOW}Để tiếp tục: ./scripts/full-seed-deploy.sh${NC}"
    exit 0
  fi
else
  echo -e "${RED}🚫 HỆ THỐNG CHƯA SẴN SÀNG - Fix $FAIL errors trước khi deploy${NC}"
  exit 1
fi
