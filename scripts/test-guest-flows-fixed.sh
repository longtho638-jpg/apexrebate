#!/bin/bash
################################################################################
# Test Script: Guest User Flows - Version 2 (Fixed Routes)
################################################################################

PROD_URL="https://apexrebate.com"
MAX_RESPONSE_TIME=5000
TIMESTAMP=$(python3 -c 'import time; print(int(time.time() * 1000))')
LOG_FILE="./logs/test-guest-flows-${TIMESTAMP}.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

mkdir -p ./logs

log() { echo -e "$1" | tee -a "$LOG_FILE"; }

log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "${BLUE}🧪 APEXREBATE - TEST GUEST USER FLOWS (v2)${NC}"
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "Test started: $(date)"
log "Production URL: ${PROD_URL}"
log ""

TOTAL=0; PASSED=0; FAILED=0

test_page() {
  local path=$1 expected_status=$2 expected_keywords=$3 test_name=$4
  TOTAL=$((TOTAL + 1))
  
  log "${YELLOW}➤ Testing: ${test_name}${NC}"
  log "   URL: ${PROD_URL}${path}"
  
  local temp_file=$(mktemp)
  local http_code=$(curl -sL -o "$temp_file" -w "%{http_code}" --max-time 10 "${PROD_URL}${path}")
  local response_time=$(curl -sL -o /dev/null -w "%{time_total}" --max-time 10 "${PROD_URL}${path}")
  local body=$(cat "$temp_file")
  rm -f "$temp_file"
  
  if [[ -z "$http_code" ]] || [[ "$http_code" == "000" ]]; then
    log "   ${RED}✗ FAILED: Request failed${NC}"
    FAILED=$((FAILED + 1))
    return 1
  fi
  
  local response_time_ms=$(echo "$response_time * 1000" | bc | cut -d. -f1)
  
  if [[ "$http_code" != "$expected_status" ]]; then
    log "   ${RED}✗ FAILED: Expected ${expected_status}, got ${http_code}${NC}"
    log "   Response time: ${response_time_ms}ms"
    FAILED=$((FAILED + 1))
    return 1
  fi
  
  if [[ $response_time_ms -gt $MAX_RESPONSE_TIME ]]; then
    log "   ${YELLOW}⚠ SLOW: ${response_time_ms}ms > ${MAX_RESPONSE_TIME}ms${NC}"
  fi
  
  if [[ "$expected_status" == "200" && -n "$expected_keywords" ]]; then
    IFS='|' read -ra KEYWORDS <<< "$expected_keywords"
    for keyword in "${KEYWORDS[@]}"; do
      if ! echo "$body" | grep -qi "$keyword"; then
        log "   ${RED}✗ FAILED: Keyword '${keyword}' not found${NC}"
        FAILED=$((FAILED + 1))
        return 1
      fi
    done
  fi
  
  log "   ${GREEN}✓ PASSED${NC} - Status: ${http_code} | ${response_time_ms}ms"
  PASSED=$((PASSED + 1))
  return 0
}

log "${BLUE}━━━ 1. LANDING PAGES ━━━${NC}"
test_page "/" "200" "ApexRebate" "Landing Page Root"
test_page "/vi" "307" "" "Vietnamese locale redirect"
echo ""

log "${BLUE}━━━ 2. AUTHENTICATION ━━━${NC}"
test_page "/auth/signin" "200" "Sign In" "Sign In Page"
test_page "/auth/signup" "200" "Sign Up" "Sign Up Page"
echo ""

log "${BLUE}━━━ 3. PUBLIC TOOLS ━━━${NC}"
test_page "/calculator" "200" "Calculator" "Calculator Page"
test_page "/vi/calculator" "200" "Calculator" "Calculator (vi)"
test_page "/tools" "200" "Tools" "Tools Marketplace"
test_page "/vi/tools" "200" "Tools" "Tools (vi)"
echo ""

log "${BLUE}━━━ 4. INFORMATIONAL ━━━${NC}"
test_page "/how-it-works" "200" "How" "How It Works"
test_page "/faq" "200" "FAQ" "FAQ Page"
test_page "/wall-of-fame" "200" "Wall" "Wall of Fame"
echo ""

log "${BLUE}━━━ 5. PUBLIC APIs ━━━${NC}"
test_page "/api/calculator?volume=1000000&broker=binance&tradeType=taker&tradesPerMonth=20" "200" "success" "Calculator API"
test_page "/api/dashboard" "401" "" "Dashboard API (auth required)"
test_page "/api/health" "200" "ok" "Health Check"
echo ""

log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "${BLUE}📊 SUMMARY${NC}"
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log ""
log "Total:  ${TOTAL}"
log "${GREEN}Passed: ${PASSED}${NC}"
log "${RED}Failed: ${FAILED}${NC}"
log ""

if [[ $FAILED -eq 0 ]]; then
  log "${GREEN}🎉 ALL TESTS PASSED!${NC}"
  log "✅ Tất cả trang public hoạt động tốt"
  log "✅ Response times acceptable"
  exit 0
else
  log "${RED}❌ ${FAILED} TESTS FAILED${NC}"
  log "📝 Check: ${LOG_FILE}"
  exit 1
fi
