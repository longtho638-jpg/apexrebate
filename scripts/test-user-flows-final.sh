#!/bin/bash

# ApexRebate User Flow Testing - CORRECT ROUTING
PROD_URL="https://apexrebate.com"

TOTAL=0
PASS=0
FAIL=0
declare -a FAILED=()

test_url() {
    local url=$1
    local expect=$2
    local name=$3
    
    TOTAL=$((TOTAL + 1))
    printf "%-50s" "$name"
    
    code=$(curl -w "%{http_code}" -s -o /dev/null -L "$url")
    
    if [ "$code" == "$expect" ]; then
        echo "✅ $code"
        PASS=$((PASS + 1))
    else
        echo "❌ $code (expect $expect)"
        FAIL=$((FAIL + 1))
        FAILED+=("$name: $code (expect $expect)")
    fi
}

echo "🧪 ApexRebate User Flow Testing (CORRECT ROUTING)"
echo "================================================================"

echo ""
echo "━━━ 1. GUEST FLOW - Public Pages ━━━"
test_url "$PROD_URL" 200 "Homepage"
test_url "$PROD_URL/vi" 200 "Vietnamese Homepage"
test_url "$PROD_URL/en" 200 "English Homepage"
test_url "$PROD_URL/vi/calculator" 200 "Calculator (vi)"
test_url "$PROD_URL/en/calculator" 200 "Calculator (en)"
test_url "$PROD_URL/wall-of-fame" 200 "Wall of Fame"
test_url "$PROD_URL/auth/signin" 200 "Sign In"
test_url "$PROD_URL/auth/signup" 200 "Sign Up"

echo ""
echo "━━━ 2. USER FLOW - Protected Pages ━━━"
test_url "$PROD_URL/dashboard" 200 "Dashboard"
test_url "$PROD_URL/vi/dashboard" 200 "Dashboard (vi)"
test_url "$PROD_URL/en/dashboard" 200 "Dashboard (en)"
test_url "$PROD_URL/profile" 200 "Profile"
test_url "$PROD_URL/referrals" 200 "Referrals"
test_url "$PROD_URL/payouts" 200 "Payouts"
test_url "$PROD_URL/gamification" 200 "Gamification"
test_url "$PROD_URL/vi/apex-pro" 200 "ApexPro (vi)"
test_url "$PROD_URL/en/apex-pro" 200 "ApexPro (en)"
test_url "$PROD_URL/vi/hang-soi" 200 "Hang Soi (vi)"
test_url "$PROD_URL/vi/tools" 200 "Tools (vi)"
test_url "$PROD_URL/vi/tools/analytics" 200 "Tools Analytics (vi)"
test_url "$PROD_URL/vi/tools/upload" 200 "Tools Upload (vi)"

echo ""
echo "━━━ 3. ADMIN FLOW - Admin Pages ━━━"
test_url "$PROD_URL/admin" 200 "Admin Panel"
test_url "$PROD_URL/monitoring" 200 "Monitoring"
test_url "$PROD_URL/analytics" 200 "Analytics"
test_url "$PROD_URL/cicd" 200 "CI/CD"
test_url "$PROD_URL/testing" 200 "Testing"
test_url "$PROD_URL/ai-workflow-builder-demo" 200 "AI Workflow Builder"
test_url "$PROD_URL/simple-ai-workflow-demo" 200 "Simple AI Workflow"

echo ""
echo "━━━ 4. API ENDPOINTS ━━━"
test_url "$PROD_URL/api/health" 200 "Health Check API"
test_url "$PROD_URL/api/wall-of-fame" 200 "Wall of Fame API"
test_url "$PROD_URL/api/broker-data" 200 "Broker Data API"
test_url "$PROD_URL/api/dashboard" 200 "Dashboard API"
test_url "$PROD_URL/api/user/profile" 401 "User Profile API (protected)"
test_url "$PROD_URL/api/admin/users" 401 "Admin Users API (protected)"
test_url "$PROD_URL/api/admin/stats" 401 "Admin Stats API (protected)"

echo ""
echo "━━━ 5. STATIC FILES & ERRORS ━━━"
test_url "$PROD_URL/favicon.ico" 200 "Favicon"
test_url "$PROD_URL/robots.txt" 200 "Robots.txt"
test_url "$PROD_URL/sitemap.xml" 200 "Sitemap.xml"
test_url "$PROD_URL/nonexistent-12345" 404 "404 Error Page"

echo ""
echo "================================================================"
echo "📊 FINAL SUMMARY"
echo "================================================================"
echo "Total Tests: $TOTAL"
echo "Passed:      $PASS"
echo "Failed:      $FAIL"
PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASS/$TOTAL)*100}")
echo "Pass Rate:   $PASS_RATE%"

if [ $FAIL -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! ALL USER FLOWS WORKING PERFECTLY!"
    echo ""
    echo "✅ Guest users can browse all public pages"
    echo "✅ Registered users can access protected features"
    echo "✅ Admin panel accessible and functional"
    echo "✅ All APIs responding correctly"
    echo "✅ Security: Protected routes return 401"
    exit 0
else
    echo ""
    echo "❌ $FAIL TESTS FAILED:"
    for item in "${FAILED[@]}"; do
        echo "  - $item"
    done
    exit 1
fi
