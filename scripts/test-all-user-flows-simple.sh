#!/bin/bash

# Simple User Flow Testing - Guest/User/Admin
PROD_URL="https://apexrebate.com"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT="./logs/user-flows-${TIMESTAMP}.md"

mkdir -p logs

TOTAL=0
PASS=0
FAIL=0
declare -a FAILED=()

test_url() {
    local url=$1
    local expect=$2
    local name=$3
    
    TOTAL=$((TOTAL + 1))
    echo -n "Testing $name... "
    
    code=$(curl -w "%{http_code}" -s -o /dev/null -L "$url")
    
    if [ "$code" == "$expect" ]; then
        echo "✅ $code"
        PASS=$((PASS + 1))
    else
        echo "❌ $code (expected $expect)"
        FAIL=$((FAIL + 1))
        FAILED+=("$name: got $code, expected $expect")
    fi
}

echo "🧪 ApexRebate User Flow Testing"
echo "================================"
echo ""

echo "━━━ 1. GUEST FLOW (Khách) ━━━"
test_url "$PROD_URL" 200 "Homepage"
test_url "$PROD_URL/vi/calculator" 200 "Calculator (vi)"
test_url "$PROD_URL/en/calculator" 200 "Calculator (en)"
test_url "$PROD_URL/wall-of-fame" 200 "Wall of Fame"
test_url "$PROD_URL/how-it-works" 200 "How It Works"
test_url "$PROD_URL/faq" 200 "FAQ"
test_url "$PROD_URL/auth/signin" 200 "Sign In"
test_url "$PROD_URL/auth/signup" 200 "Sign Up"
test_url "$PROD_URL/api/health" 200 "Health API"
test_url "$PROD_URL/api/calculator" 200 "Calculator API"
test_url "$PROD_URL/api/wall-of-fame" 200 "Wall of Fame API"

echo ""
echo "━━━ 2. USER FLOW (Registered) ━━━"
test_url "$PROD_URL/dashboard" 200 "Dashboard"
test_url "$PROD_URL/vi/dashboard" 200 "Dashboard (vi)"
test_url "$PROD_URL/en/dashboard" 200 "Dashboard (en)"
test_url "$PROD_URL/profile" 200 "Profile"
test_url "$PROD_URL/referrals" 200 "Referrals"
test_url "$PROD_URL/payouts" 200 "Payouts"
test_url "$PROD_URL/gamification" 200 "Gamification"
test_url "$PROD_URL/apex-pro" 200 "ApexPro"
test_url "$PROD_URL/hang-soi" 200 "Hang Soi"
test_url "$PROD_URL/tools" 200 "Tools Marketplace"
test_url "$PROD_URL/tools/analytics" 200 "Tools Analytics"
test_url "$PROD_URL/tools/upload" 200 "Tools Upload"
test_url "$PROD_URL/api/dashboard" 401 "Dashboard API (protected)"
test_url "$PROD_URL/api/user/profile" 401 "User Profile API (protected)"

echo ""
echo "━━━ 3. ADMIN FLOW ━━━"
test_url "$PROD_URL/admin" 200 "Admin Panel"
test_url "$PROD_URL/monitoring" 200 "Monitoring"
test_url "$PROD_URL/analytics" 200 "Analytics"
test_url "$PROD_URL/cicd" 200 "CI/CD"
test_url "$PROD_URL/testing" 200 "Testing"
test_url "$PROD_URL/api/admin/users" 401 "Admin Users API (protected)"
test_url "$PROD_URL/api/admin/stats" 401 "Admin Stats API (protected)"

echo ""
echo "━━━ 4. SPECIAL CASES ━━━"
test_url "$PROD_URL/favicon.ico" 200 "Favicon"
test_url "$PROD_URL/robots.txt" 200 "Robots"
test_url "$PROD_URL/sitemap.xml" 200 "Sitemap"
test_url "$PROD_URL/nonexistent-12345" 404 "404 Page"
test_url "$PROD_URL/api/nonexistent" 404 "404 API"

echo ""
echo "================================"
echo "📊 SUMMARY"
echo "================================"
echo "Total:  $TOTAL"
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo "Rate:   $(awk "BEGIN {printf \"%.1f\", ($PASS/$TOTAL)*100}")%"

if [ $FAIL -eq 0 ]; then
    echo ""
    echo "🎉 ALL USER FLOWS WORKING!"
    exit 0
else
    echo ""
    echo "❌ FAILED TESTS:"
    for item in "${FAILED[@]}"; do
        echo "  - $item"
    done
    exit 1
fi
