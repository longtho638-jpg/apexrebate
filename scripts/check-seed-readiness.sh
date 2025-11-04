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
    check_pass "$var đã được cấu hình"
  else
    check_fail "$var ĐANG THIẾU - Bắt buộc cho việc triển khai"
  fi
done

if [ -n "${SEED_SECRET_KEY:-}" ]; then
  check_pass "SEED_SECRET_KEY đã được cấu hình (cho API seed sản xuất)"
else
  check_warn "SEED_SECRET_KEY chưa được thiết lập - Việc gieo hạt sản xuất sẽ thất bại"
fi

if [ -n "${OPENAI_API_KEY:-}" ] || [ -n "${ANTHROPIC_API_KEY:-}" ]; then
  check_pass "Các khóa API AI đã được cấu hình"
else
  check_warn "Không có khóa API AI - Các tính năng AI sẽ bị vô hiệu hóa"
fi

# ============================================
# 2️⃣ DATABASE CONNECTION & SCHEMA
# ============================================
section "2️⃣  KIỂM TRA DATABASE (Neon Postgres)"

if npx prisma db pull --force >/dev/null 2>&1; then
  check_pass "Kết nối cơ sở dữ liệu OK (Có thể truy cập Neon)"
else
  check_fail "Không thể kết nối đến cơ sở dữ liệu - Kiểm tra DATABASE_URL"
fi

# ============================================
# 3️⃣ GIT & CODE STATUS
# ============================================
section "3️⃣  KIỂM TRA GIT STATUS"

UNCOMMITTED=$(git status --short 2>/dev/null | wc -l | tr -d ' ')
if [ "$UNCOMMITTED" -eq 0 ]; then
  check_pass "Không có thay đổi chưa được cam kết - Thư mục làm việc sạch"
else
  check_warn "$UNCOMMITTED thay đổi chưa được cam kết - Xem xét việc cam kết trước khi triển khai"
  git status --short | head -5
fi

BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
if [ "$BRANCH" = "main" ]; then
  check_pass "Đang ở nhánh chính"
else
  check_warn "Đang ở nhánh '$BRANCH' (không phải chính) - Triển khai sản xuất từ nhánh chính"
fi

LAST_COMMIT=$(git log --oneline -1 2>/dev/null || echo "unknown")
echo -e "${BLUE}Cam kết mới nhất:${NC} $LAST_COMMIT"

# ============================================
# 4️⃣ PRODUCTION SITE HEALTH
# ============================================
section "4️⃣  KIỂM TRA PRODUCTION SITE (apexrebate.com)"

SITE_URL=${NEXT_PUBLIC_APP_URL:-"https://apexrebate.com"}

ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/" 2>/dev/null || echo "000")
if [ "$ROOT_CODE" = "200" ] || [ "$ROOT_CODE" = "307" ] || [ "$ROOT_CODE" = "308" ]; then
  check_pass "Trang gốc có thể truy cập (HTTP $ROOT_CODE)"
else
  check_fail "Trang gốc thất bại (HTTP $ROOT_CODE)"
fi

DASH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/vi/dashboard" 2>/dev/null || echo "000")
if [ "$DASH_CODE" = "200" ]; then
  check_pass "Bảng điều khiển có thể truy cập (HTTP $DASH_CODE)"
  
  DASH_HTML=$(curl -s "$SITE_URL/vi/dashboard" 2>/dev/null || echo "")
  if echo "$DASH_HTML" | grep -q "Application error"; then
    check_fail "Bảng điều khiển có lỗi 'Application error' - Phát hiện lỗi phía khách hàng"
  else
    check_pass "Bảng điều khiển hiển thị mà không có lỗi"
  fi
  
  BUNDLE=$(echo "$DASH_HTML" | grep -o 'dashboard/page-[a-f0-9]*\.js' | head -1 || echo "")
  if [ -n "$BUNDLE" ]; then
    echo -e "${BLUE}Gói hiện tại:${NC} $BUNDLE"
  fi
else
  check_fail "Bảng điều khiển thất bại (HTTP $DASH_CODE)"
fi

for endpoint in "/api/health" "/api/dashboard"; do
  API_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL$endpoint" 2>/dev/null || echo "000")
  if [ "$API_CODE" = "200" ]; then
    check_pass "API $endpoint OK (HTTP $API_CODE)"
  else
    check_warn "API $endpoint trả về HTTP $API_CODE"
  fi
done

# ============================================
# 5️⃣ LOCAL BUILD TEST
# ============================================
section "5️⃣  KIỂM TRA LOCAL BUILD"

if [ -d "node_modules" ]; then
  check_pass "Thư mục node_modules tồn tại"
else
  check_warn "Thư mục node_modules bị thiếu - Chạy npm install"
fi

if [ -d "node_modules/.prisma/client" ]; then
  check_pass "Khách hàng Prisma đã được tạo"
else
  check_warn "Khách hàng Prisma chưa được tạo - Chạy npx prisma generate"
fi

if npm run -s lint 2>&1 | grep -qi "error"; then
  check_warn "Tìm thấy lỗi ESLint - Xem xét trước khi triển khai"
else
  check_pass "Kiểm tra ESLint đã vượt qua"
fi

# ============================================
# 6️⃣ DEPLOYMENT TOOLS
# ============================================
section "6️⃣  KIỂM TRA DEPLOYMENT TOOLS"

if command -v vercel >/dev/null 2>&1; then
  check_pass "Vercel CLI đã được cài đặt"
else
  check_warn "Vercel CLI không tìm thấy - Sẽ sử dụng git push để triển khai"
fi

GIT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "none")
if [ "$GIT_REMOTE" != "none" ]; then
  check_pass "Git remote đã được cấu hình"
else
  check_fail "Không có git remote - Không thể tự động triển khai"
fi

command -v curl >/dev/null 2>&1 && check_pass "curl có sẵn" || check_fail "curl bị thiếu (bắt buộc)"
command -v jq >/dev/null 2>&1 && check_pass "jq có sẵn" || check_warn "jq bị thiếu (tùy chọn)"

# ============================================
# 📊 SUMMARY
# ============================================
section "📊  KẾT QUẢ KIỂM TRA"

TOTAL=$((PASS + WARN + FAIL))
echo -e "${GREEN}✅ ĐẠT: $PASS${NC}"
echo -e "${YELLOW}⚠️  CẢNH BÁO: $WARN${NC}"
echo -e "${RED}❌ THẤT BẠI: $FAIL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Tổng số kiểm tra: $TOTAL"

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
