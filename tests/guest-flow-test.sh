#!/bin/bash
# Guest Flow Testing Script
# Tests all public pages for accessibility, navigation, and functionality

BASE_URL="https://apexrebate.com"
RESULTS_FILE="test-results-guest.log"

echo "🧪 ApexRebate - Guest Flow Testing" > $RESULTS_FILE
echo "=================================" >> $RESULTS_FILE
echo "Date: $(date)" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test function
test_endpoint() {
  local url=$1
  local name=$2
  local expected_status=$3
  
  echo "Testing: $name ($url)"
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$status" = "$expected_status" ]; then
    echo "✅ PASS: $name - Status $status" | tee -a $RESULTS_FILE
    return 0
  else
    echo "❌ FAIL: $name - Expected $expected_status, got $status" | tee -a $RESULTS_FILE
    return 1
  fi
}

# Test with response check
test_with_content() {
  local url=$1
  local name=$2
  local search_term=$3
  
  echo "Testing content: $name ($url)"
  response=$(curl -s "$url")
  
  if echo "$response" | grep -q "$search_term"; then
    echo "✅ PASS: $name - Found '$search_term'" | tee -a $RESULTS_FILE
    return 0
  else
    echo "❌ FAIL: $name - '$search_term' not found" | tee -a $RESULTS_FILE
    return 1
  fi
}

echo "" >> $RESULTS_FILE
echo "📍 Testing Core Public Pages" >> $RESULTS_FILE
echo "----------------------------" >> $RESULTS_FILE

# Homepage
test_endpoint "$BASE_URL/vi" "Homepage (Vietnamese)" "200"
test_endpoint "$BASE_URL/en" "Homepage (English)" "200"

# Public pages
test_endpoint "$BASE_URL/vi/calculator" "Calculator Page" "200"
test_endpoint "$BASE_URL/vi/wall-of-fame" "Wall of Fame" "200"
test_endpoint "$BASE_URL/vi/faq" "FAQ Page" "200"
test_endpoint "$BASE_URL/vi/how-it-works" "How It Works" "200"

echo "" >> $RESULTS_FILE
echo "🧮 Testing Calculator API" >> $RESULTS_FILE
echo "-------------------------" >> $RESULTS_FILE

# Calculator API tests
calc_test=$(curl -s "$BASE_URL/api/calculator" \
  -H "Content-Type: application/json" \
  -d '{"volume":10000,"broker":"binance","type":"spot"}')

if echo "$calc_test" | grep -q "rebate"; then
  echo "✅ PASS: Calculator API - Returns rebate data" | tee -a $RESULTS_FILE
else
  echo "❌ FAIL: Calculator API - No rebate data" | tee -a $RESULTS_FILE
fi

echo "" >> $RESULTS_FILE
echo "🎨 Testing Tools Marketplace" >> $RESULTS_FILE
echo "---------------------------" >> $RESULTS_FILE

tools_test=$(curl -s "$BASE_URL/api/tools?limit=5")
tool_count=$(echo "$tools_test" | jq '.tools | length' 2>/dev/null || echo "0")

if [ "$tool_count" -gt 0 ]; then
  echo "✅ PASS: Tools API - Found $tool_count tools" | tee -a $RESULTS_FILE
else
  echo "❌ FAIL: Tools API - No tools found" | tee -a $RESULTS_FILE
fi

echo "" >> $RESULTS_FILE
echo "📊 Test Summary" >> $RESULTS_FILE
echo "---------------" >> $RESULTS_FILE

pass_count=$(grep -c "✅ PASS" $RESULTS_FILE)
fail_count=$(grep -c "❌ FAIL" $RESULTS_FILE)
total=$((pass_count + fail_count))

echo "Total Tests: $total" | tee -a $RESULTS_FILE
echo "Passed: $pass_count" | tee -a $RESULTS_FILE
echo "Failed: $fail_count" | tee -a $RESULTS_FILE

if [ $fail_count -eq 0 ]; then
  echo "" | tee -a $RESULTS_FILE
  echo "🎉 All guest flow tests PASSED!" | tee -a $RESULTS_FILE
  exit 0
else
  echo "" | tee -a $RESULTS_FILE
  echo "⚠️  Some tests FAILED. Review $RESULTS_FILE for details." | tee -a $RESULTS_FILE
  exit 1
fi
