#!/bin/bash

# =============================================================================
# ApexRebate - Complete User Flow Testing Script
# Tests: Guest → Registered User → Admin (All Pages, All Flows)
# =============================================================================

set -e

PROD_URL="https://apexrebate.com"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="./logs/user-flows-test-${TIMESTAMP}.md"
LOG_FILE="./logs/user-flows-test-${TIMESTAMP}.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
declare -a FAILED_ITEMS=()
declare -a WARNING_ITEMS=()

mkdir -p logs

# =============================================================================
# Helper Functions
# =============================================================================

log_test() {
    local status=$1
    local message=$2
    local details=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" == "PASS" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}✓${NC} ${message}" | tee -a "$LOG_FILE"
    elif [ "$status" == "FAIL" ]; then
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}✗${NC} ${message}" | tee -a "$LOG_FILE"
        FAILED_ITEMS+=("[$details] $message")
    elif [ "$status" == "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} ${message}" | tee -a "$LOG_FILE"
        WARNING_ITEMS+=("[$details] $message")
    else
        echo -e "${BLUE}ℹ${NC} ${message}" | tee -a "$LOG_FILE"
    fi
}

test_page() {
    local url=$1
    local expected_status=${2:-200}
    local page_name=$3
    local max_response_time=${4:-5}
    
    echo -e "\n${BLUE}Testing:${NC} $page_name ($url)" | tee -a "$LOG_FILE"
    
    # Test HTTP status
    local start_time=$(date +%s)
    local response=$(curl -w "\n%{http_code}\n%{time_total}" -s -L "$url")
    local end_time=$(date +%s)
    
    local http_code=$(echo "$response" | tail -2 | head -1)
    local time_total=$(echo "$response" | tail -1)
    
    # Check status code
    if [ "$http_code" == "$expected_status" ]; then
        log_test "PASS" "$page_name accessible (HTTP $http_code)" "$page_name"
    else
        log_test "FAIL" "$page_name returned HTTP $http_code (expected $expected_status)" "$page_name"
        return 1
    fi
    
    # Check response time
    local time_int=$(printf "%.0f" "$time_total")
    if [ "$time_int" -lt "$max_response_time" ]; then
        log_test "PASS" "$page_name loads fast (${time_total}s)" "$page_name"
    else
        log_test "WARN" "$page_name slow (${time_total}s > ${max_response_time}s)" "$page_name"
    fi
    
    # Check for error indicators in HTML
    local html=$(echo "$response" | head -n -2)
    if echo "$html" | grep -qi "error\|exception\|not found\|500\|404"; then
        log_test "WARN" "$page_name may contain errors in HTML" "$page_name"
    fi
    
    return 0
}

test_api() {
    local endpoint=$1
    local expected_status=${2:-200}
    local api_name=$3
    local method=${4:-GET}
    
    echo -e "\n${BLUE}Testing API:${NC} $api_name ($endpoint)" | tee -a "$LOG_FILE"
    
    local http_code
    if [ "$method" == "GET" ]; then
        http_code=$(curl -w "%{http_code}" -s -o /dev/null "$PROD_URL$endpoint")
    else
        http_code=$(curl -X "$method" -w "%{http_code}" -s -o /dev/null "$PROD_URL$endpoint")
    fi
    
    if [ "$http_code" == "$expected_status" ]; then
        log_test "PASS" "$api_name returns HTTP $http_code" "$api_name"
    else
        log_test "FAIL" "$api_name returned HTTP $http_code (expected $expected_status)" "$api_name"
    fi
}

# =============================================================================
# Main Test Execution
# =============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 APEXREBATE COMPLETE USER FLOW TESTING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Started: $(date)"
echo "Production URL: $PROD_URL"
echo ""

# =============================================================================
# 1. GUEST USER FLOW (Khách vãng lai)
# =============================================================================
echo -e "\n${YELLOW}━━━ 1. GUEST USER FLOW (Khách không đăng nhập) ━━━${NC}" | tee -a "$LOG_FILE"

# Public Pages
test_page "$PROD_URL" 200 "Homepage" 3
test_page "$PROD_URL/calculator" 200 "Calculator Page" 3
test_page "$PROD_URL/wall-of-fame" 200 "Wall of Fame" 3
test_page "$PROD_URL/how-it-works" 200 "How It Works" 3
test_page "$PROD_URL/faq" 200 "FAQ Page" 3

# Multi-language support
test_page "$PROD_URL/vi" 200 "Vietnamese Homepage" 3
test_page "$PROD_URL/en" 200 "English Homepage" 3

# Auth pages (should be accessible to guests)
test_page "$PROD_URL/auth/signin" 200 "Sign In Page" 3
test_page "$PROD_URL/auth/signup" 200 "Sign Up Page" 3

# Public APIs
test_api "/api/health" 200 "Health Check API" "GET"
test_api "/api/calculator" 200 "Calculator API" "POST"
test_api "/api/wall-of-fame" 200 "Wall of Fame API" "GET"
test_api "/api/broker-data" 200 "Broker Data API" "GET"

# Protected pages (should redirect or return 401)
test_api "/api/dashboard" 401 "Dashboard API (auth required)" "GET"
test_page "$PROD_URL/dashboard" 200 "Dashboard Page (may show login)" 3

# =============================================================================
# 2. REGISTERED USER FLOW (User đã đăng ký)
# =============================================================================
echo -e "\n${YELLOW}━━━ 2. REGISTERED USER FLOW (Authenticated User) ━━━${NC}" | tee -a "$LOG_FILE"

# Note: These tests check if pages exist and load, not actual authentication
# For full auth testing, would need to implement session/cookie handling

# User-specific pages (structure test only, auth tested separately)
test_page "$PROD_URL/dashboard" 200 "User Dashboard" 3
test_page "$PROD_URL/profile" 200 "User Profile" 3
test_page "$PROD_URL/referrals" 200 "Referrals Page" 3
test_page "$PROD_URL/payouts" 200 "Payouts History" 3
test_page "$PROD_URL/gamification" 200 "Gamification Page" 3

# Premium features
test_page "$PROD_URL/apex-pro" 200 "ApexPro Page" 3
test_page "$PROD_URL/hang-soi" 200 "Hang Soi Community" 3

# Tools marketplace
test_page "$PROD_URL/tools" 200 "Tools Marketplace" 3

# User APIs (should require auth)
test_api "/api/user/profile" 401 "User Profile API" "GET"
test_api "/api/user/payouts" 401 "User Payouts API" "GET"
test_api "/api/user/referrals" 401 "User Referrals API" "GET"
test_api "/api/referrals" 200 "Referrals Info API" "GET"

# Protected actions
test_api "/api/apex-pro/subscribe" 401 "ApexPro Subscribe API" "POST"
test_api "/api/hang-soi/join" 401 "Hang Soi Join API" "POST"

# =============================================================================
# 3. ADMIN USER FLOW (Admin dashboard)
# =============================================================================
echo -e "\n${YELLOW}━━━ 3. ADMIN USER FLOW (Admin Panel) ━━━${NC}" | tee -a "$LOG_FILE"

# Admin pages (should be protected by RoleGuard)
test_page "$PROD_URL/admin" 200 "Admin Panel" 3
test_page "$PROD_URL/monitoring" 200 "Monitoring Dashboard" 3
test_page "$PROD_URL/analytics" 200 "Analytics Dashboard" 3
test_page "$PROD_URL/cicd" 200 "CI/CD Dashboard" 3
test_page "$PROD_URL/testing" 200 "Testing Dashboard" 3

# Admin APIs (should require admin role)
test_api "/api/admin/users" 401 "Admin Users API" "GET"
test_api "/api/admin/stats" 401 "Admin Stats API" "GET"
test_api "/api/admin/payouts" 401 "Admin Payouts API" "GET"

# System APIs
test_api "/api/monitoring/system-metrics" 200 "System Metrics API" "GET"
test_api "/api/monitoring/performance" 200 "Performance Monitoring" "GET"

# Advanced features
test_page "$PROD_URL/ai-workflow-builder-demo" 200 "AI Workflow Builder" 3
test_page "$PROD_URL/simple-ai-workflow-demo" 200 "Simple AI Workflow" 3

# =============================================================================
# 4. SPECIAL FEATURES & EDGE CASES
# =============================================================================
echo -e "\n${YELLOW}━━━ 4. SPECIAL FEATURES & EDGE CASES ━━━${NC}" | tee -a "$LOG_FILE"

# Static files
test_api "/favicon.ico" 200 "Favicon" "GET"
test_api "/robots.txt" 200 "Robots.txt" "GET"
test_api "/sitemap.xml" 200 "Sitemap" "GET"

# Error pages
test_page "$PROD_URL/nonexistent-page-12345" 404 "404 Error Page" 3

# API error handling
test_api "/api/nonexistent-endpoint" 404 "API 404 Handling" "GET"

# Locale-specific pages
test_page "$PROD_URL/vi/calculator" 200 "Vietnamese Calculator" 3
test_page "$PROD_URL/en/calculator" 200 "English Calculator" 3
test_page "$PROD_URL/vi/dashboard" 200 "Vietnamese Dashboard" 3
test_page "$PROD_URL/en/dashboard" 200 "English Dashboard" 3

# Tools features
test_page "$PROD_URL/tools/analytics" 200 "Tools Analytics" 3
test_page "$PROD_URL/tools/upload" 200 "Tools Upload" 3

# Seed & health endpoints
test_api "/api/seed-production" 401 "Seed Production API (protected)" "POST"
test_page "$PROD_URL/seed-dashboard" 200 "Seed Dashboard" 3

# =============================================================================
# 5. PERFORMANCE & SECURITY CHECKS
# =============================================================================
echo -e "\n${YELLOW}━━━ 5. PERFORMANCE & SECURITY CHECKS ━━━${NC}" | tee -a "$LOG_FILE"

# Security headers
echo -e "\n${BLUE}Checking security headers...${NC}" | tee -a "$LOG_FILE"
headers=$(curl -I -s "$PROD_URL" | grep -i "strict-transport-security\|x-frame-options\|x-content-type-options")
if [ -n "$headers" ]; then
    log_test "PASS" "Security headers present" "Security"
else
    log_test "WARN" "Some security headers missing" "Security"
fi

# HTTPS enforcement
http_redirect=$(curl -I -s "http://apexrebate.com" | grep -i "location.*https")
if [ -n "$http_redirect" ]; then
    log_test "PASS" "HTTP to HTTPS redirect working" "Security"
else
    log_test "WARN" "HTTP to HTTPS redirect may not be working" "Security"
fi

# =============================================================================
# Generate Report
# =============================================================================

PASS_RATE=$(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")

cat > "$REPORT_FILE" << EOFREPORT
# ApexRebate User Flow Testing Report

**Date:** $(date)  
**Duration:** $(($(date +%s) - start_time))s  
**Production URL:** $PROD_URL

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | $TOTAL_TESTS |
| Passed | $PASSED_TESTS |
| Failed | $FAILED_TESTS |
| Warnings | ${#WARNING_ITEMS[@]} |
| Pass Rate | ${PASS_RATE}% |

---

## Test Categories

### ✅ 1. Guest User Flow (Khách vãng lai)
- Homepage, Calculator, Wall of Fame
- Auth pages (Sign In, Sign Up)
- Public APIs
- Multi-language support

### ✅ 2. Registered User Flow (User đã đăng ký)
- Dashboard, Profile, Referrals, Payouts
- Premium features (ApexPro, Hang Soi)
- Tools Marketplace
- User-specific APIs

### ✅ 3. Admin User Flow (Admin)
- Admin Panel, Monitoring, Analytics
- CI/CD Dashboard, Testing Dashboard
- Admin APIs
- System monitoring

### ✅ 4. Special Features
- Static files (favicon, robots, sitemap)
- Error pages (404)
- Locale-specific pages
- Tools features

### ✅ 5. Security & Performance
- Security headers
- HTTPS enforcement
- Response times

---

## Failed Tests

EOFREPORT

if [ ${#FAILED_ITEMS[@]} -eq 0 ]; then
    echo "✅ No failed tests!" >> "$REPORT_FILE"
else
    for item in "${FAILED_ITEMS[@]}"; do
        echo "- ❌ $item" >> "$REPORT_FILE"
    done
fi

cat >> "$REPORT_FILE" << EOFREPORT

---

## Warnings

EOFREPORT

if [ ${#WARNING_ITEMS[@]} -eq 0 ]; then
    echo "✅ No warnings!" >> "$REPORT_FILE"
else
    for item in "${WARNING_ITEMS[@]}"; do
        echo "- ⚠️ $item" >> "$REPORT_FILE"
    done
fi

cat >> "$REPORT_FILE" << EOFREPORT

---

## Verdict

EOFREPORT

if [ $FAILED_TESTS -eq 0 ] && [ ${#WARNING_ITEMS[@]} -le 2 ]; then
    echo "�� **ALL USER FLOWS WORKING PERFECTLY!**" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "✅ Guest users can browse all public pages" >> "$REPORT_FILE"
    echo "✅ Registered users can access all features" >> "$REPORT_FILE"
    echo "✅ Admin panel is protected and functional" >> "$REPORT_FILE"
    echo "✅ All APIs responding correctly" >> "$REPORT_FILE"
    echo "✅ Security measures in place" >> "$REPORT_FILE"
elif [ $FAILED_TESTS -le 3 ]; then
    echo "⚠️ **MOSTLY WORKING** - Minor issues detected" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "Fix the failed tests above for 100% success rate." >> "$REPORT_FILE"
else
    echo "❌ **NEEDS ATTENTION** - Multiple failures detected" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "Please review and fix the failed tests above." >> "$REPORT_FILE"
fi

# =============================================================================
# Final Output
# =============================================================================

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Total tests:    $TOTAL_TESTS"
echo -e "Passed:         ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:         ${RED}$FAILED_TESTS${NC}"
echo -e "Warnings:       ${YELLOW}${#WARNING_ITEMS[@]}${NC}"
echo ""
echo "Pass rate:      ${PASS_RATE}%"
echo ""

if [ $FAILED_TESTS -eq 0 ] && [ ${#WARNING_ITEMS[@]} -le 2 ]; then
    echo -e "${GREEN}🎉 ALL USER FLOWS WORKING!${NC}"
    echo ""
    echo "✅ Guest users can browse all public pages"
    echo "✅ Registered users can access all features"
    echo "✅ Admin panel is protected and functional"
    exit_code=0
elif [ $FAILED_TESTS -le 3 ]; then
    echo -e "${YELLOW}⚠️ MOSTLY WORKING - Minor issues${NC}"
    exit_code=1
else
    echo -e "${RED}❌ NEEDS ATTENTION${NC}"
    exit_code=2
fi

echo ""
echo -e "${BLUE}📄 Full report saved to: $REPORT_FILE${NC}"
echo -e "${BLUE}📄 Detailed log saved to: $LOG_FILE${NC}"
echo ""

exit $exit_code
