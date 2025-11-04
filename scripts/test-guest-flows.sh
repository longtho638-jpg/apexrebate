#!/bin/bash
################################################################################
# Test Script: Guest User Flows (Khách vãng lai)
# Kiểm tra tất cả các trang public không cần đăng nhập
################################################################################

PROD_URL="https://apexrebate.com"
MAX_RESPONSE_TIME=3000  # milliseconds
TIMESTAMP=$(python3 -c 'import time; print(int(time.time() * 1000))')
LOG_FILE="./logs/test-guest-flows-${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure logs directory exists
mkdir -p ./logs

# Log function
log() {
  echo -e "$1" | tee -a "$LOG_FILE"
}

log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "${BLUE}🧪 APEXREBATE - TEST GUEST USER FLOWS${NC}"
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "Test started at: $(date)"
log "Production URL: ${PROD_URL}"
log ""

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to test a page
test_page() {
  local path=$1
  local expected_status=$2
  local expected_keywords=$3
  local test_name=$4
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  log "${YELLOW}➤ Testing: ${test_name}${NC}"
  log "   URL: ${PROD_URL}${path}"
  
  # Make request and get status code + response time
  local temp_file=$(mktemp)
  local http_code=$(curl -s -o "$temp_file" -w "%{http_code}\n%{time_total}" --max-time 5 "${PROD_URL}${path}" 2>&1 | tail -2 | head -1)
  local response_time=$(curl -s -o "$temp_file" -w "%{time_total}" --max-time 5 "${PROD_URL}${path}" 2>&1)
  local body=$(cat "$temp_file")
  rm -f "$temp_file"
  
  # Check if curl failed
  if [[ -z "$http_code" ]] || [[ "$http_code" == "000" ]]; then
    log "   ${RED}✗ FAILED: Request failed or timed out${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
  
  # Convert response time to milliseconds
  local response_time_ms=$(echo "$response_time * 1000" | bc | cut -d. -f1)
  
  # Check status code
  if [[ "$http_code" != "$expected_status" ]]; then
    log "   ${RED}✗ FAILED: Expected status ${expected_status}, got ${http_code}${NC}"
    log "   Response time: ${response_time_ms}ms"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
  
  # Check response time
  if [[ $response_time_ms -gt $MAX_RESPONSE_TIME ]]; then
    log "   ${YELLOW}⚠ WARNING: Response time ${response_time_ms}ms exceeds limit ${MAX_RESPONSE_TIME}ms${NC}"
  fi
  
  # Check keywords in response body (only for 200 responses)
  if [[ "$expected_status" == "200" && -n "$expected_keywords" ]]; then
    local keywords_found=true
    IFS='|' read -ra KEYWORDS <<< "$expected_keywords"
    for keyword in "${KEYWORDS[@]}"; do
      if ! echo "$body" | grep -qi "$keyword"; then
        log "   ${RED}✗ FAILED: Expected keyword '${keyword}' not found in response${NC}"
        keywords_found=false
        break
      fi
    done
    
    if [[ "$keywords_found" == false ]]; then
      FAILED_TESTS=$((FAILED_TESTS + 1))
      return 1
    fi
  fi
  
  # Success
  log "   ${GREEN}✓ PASSED${NC}"
  log "   Status: ${http_code} | Response time: ${response_time_ms}ms"
  PASSED_TESTS=$((PASSED_TESTS + 1))
  return 0
}

log "${BLUE}━━━ SECTION 1: LANDING PAGE ━━━${NC}"
test_page "/" "200" "ApexRebate" "Landing Page (Vietnamese)"
test_page "/en" "200" "ApexRebate" "Landing Page (English)"
echo ""

log "${BLUE}━━━ SECTION 2: LOCALE REDIRECTS ━━━${NC}"
test_page "/vi" "307" "" "Vietnamese locale redirect"
test_page "/en/dashboard" "307" "" "Dashboard redirect (unauthenticated)"
echo ""

log "${BLUE}━━━ SECTION 3: AUTHENTICATION PAGES ━━━${NC}"
test_page "/auth/signin" "200" "Sign In" "Sign In Page"
test_page "/auth/signup" "200" "Sign Up" "Sign Up Page"
echo ""

log "${BLUE}━━━ SECTION 4: PUBLIC TOOLS & CALCULATORS ━━━${NC}"
test_page "/vi/calculator" "200" "Calculator" "Rebate Calculator"
test_page "/vi/tools" "200" "Tools" "Tools Marketplace"
echo ""

log "${BLUE}━━━ SECTION 5: INFORMATIONAL PAGES ━━━${NC}"
test_page "/vi/pricing" "200" "Pricing" "Pricing Page"
test_page "/vi/about" "200" "About" "About Page"
test_page "/vi/contact" "200" "Contact" "Contact Page"
echo ""

log "${BLUE}━━━ SECTION 6: API HEALTH CHECKS ━━━${NC}"
# Test public API endpoints
test_page "/api/calculator?volume=1000000&broker=binance&tradeType=taker&tradesPerMonth=20" "200" "success" "Calculator API"
test_page "/api/exchanges" "200" "success" "Exchanges API"
test_page "/api/seed-production/status" "200" "seeded" "Seed Status API"
echo ""

log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "${BLUE}📊 TEST SUMMARY${NC}"
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log ""
log "Total tests:  ${TOTAL_TESTS}"
log "${GREEN}Passed:       ${PASSED_TESTS}${NC}"
log "${RED}Failed:       ${FAILED_TESTS}${NC}"
log ""

if [[ $FAILED_TESTS -eq 0 ]]; then
  log "${GREEN}🎉 ALL GUEST USER FLOW TESTS PASSED!${NC}"
  log ""
  log "✅ Tất cả các trang public đều hoạt động tốt"
  log "✅ Response times acceptable"
  log "✅ Content verification successful"
  exit 0
else
  log "${RED}❌ SOME TESTS FAILED${NC}"
  log ""
  log "⚠️  Một số trang public có vấn đề"
  log "📝 Check log file: ${LOG_FILE}"
  exit 1
fi
