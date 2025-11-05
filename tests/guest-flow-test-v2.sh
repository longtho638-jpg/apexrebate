#!/bin/bash
# Guest Flow Testing Script V2
# Tests actual existing pages based on current routing structure

BASE_URL="https://apexrebate.com"
RESULTS_FILE="test-results-guest-v2.log"

echo "🧪 ApexRebate - Guest Flow Testing V2" > $RESULTS_FILE
echo "=====================================" >> $RESULTS_FILE
echo "Date: $(date)" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test function with follow redirects
test_endpoint() {
  local url=$1
  local name=$2
  local should_load=$3
  
  echo "Testing: $name ($url)"
  status=$(curl -sL -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$status" = "200" ] && [ "$should_load" = "yes" ]; then
    echo "✅ PASS: $name - Status $status" | tee -a $RESULTS_FILE
    return 0
  elif [ "$status" != "200" ] && [ "$should_load" = "no" ]; then
    echo "✅ PASS: $name - Correctly returns $status (expected)" | tee -a $RESULTS_FILE
    return 0
  else
    echo "❌ FAIL: $name - Got $status" | tee -a $RESULTS_FILE
    return 1
  fi
}

echo "📍 Testing Core Pages" >> $RESULTS_FILE
echo "--------------------" >> $RESULTS_FILE

# Root and locale roots
test_endpoint "$BASE_URL/" "Root Homepage" "yes"
test_endpoint "$BASE_URL/vi" "Vietnamese Root" "yes"
test_endpoint "$BASE_URL/en" "English Root" "yes"

# Existing pages in [locale]
test_endpoint "$BASE_URL/vi/dashboard" "Dashboard (needs auth)" "no"
test_endpoint "$BASE_URL/vi/tools" "Tools Marketplace" "yes"
test_endpoint "$BASE_URL/vi/apex-pro" "Apex Pro Page" "yes"

# Non-locale pages (should be accessible)
test_endpoint "$BASE_URL/faq" "FAQ (non-locale)" "yes"
test_endpoint "$BASE_URL/how-it-works" "How It Works (non-locale)" "yes"
test_endpoint "$BASE_URL/health" "Health Check Page" "yes"

echo "" >> $RESULTS_FILE
echo "🔌 Testing API Endpoints" >> $RESULTS_FILE
echo "------------------------" >> $RESULTS_FILE

# Health API
health=$(curl -s "$BASE_URL/api/health")
if echo "$health" | grep -q "ok\|healthy\|status"; then
  echo "✅ PASS: Health API" | tee -a $RESULTS_FILE
else
  echo "❌ FAIL: Health API - No valid response" | tee -a $RESULTS_FILE
fi

# Calculator API
calc=$(curl -s "$BASE_URL/api/calculator" -H "Content-Type: application/json" -d '{"volume":10000,"broker":"binance","type":"spot"}')
if echo "$calc" | grep -q "rebate"; then
  echo "✅ PASS: Calculator API" | tee -a $RESULTS_FILE
else
  echo "❌ FAIL: Calculator API - No rebate data" | tee -a $RESULTS_FILE
fi

# Tools API
tools=$(curl -s "$BASE_URL/api/tools?limit=3")
count=$(echo "$tools" | jq -r '.tools | length' 2>/dev/null || echo "0")
if [ "$count" -gt 0 ]; then
  echo "✅ PASS: Tools API ($count tools)" | tee -a $RESULTS_FILE
else
  echo "❌ FAIL: Tools API - No tools" | tee -a $RESULTS_FILE
fi

# Seed status
seed=$(curl -s "$BASE_URL/api/seed-production")
users=$(echo "$seed" | jq -r '.stats.users' 2>/dev/null || echo "0")
if [ "$users" -gt 0 ]; then
  echo "✅ PASS: Seed API (users: $users)" | tee -a $RESULTS_FILE
else
  echo "❌ FAIL: Seed API - No users data" | tee -a $RESULTS_FILE
fi

echo "" >> $RESULTS_FILE
echo "📊 Test Summary" >> $RESULTS_FILE
echo "---------------" >> $RESULTS_FILE

pass=$(grep -c "✅ PASS" $RESULTS_FILE)
fail=$(grep -c "❌ FAIL" $RESULTS_FILE)
total=$((pass + fail))

echo "Total: $total | Passed: $pass | Failed: $fail" | tee -a $RESULTS_FILE

if [ $fail -eq 0 ]; then
  echo "🎉 All tests PASSED!" | tee -a $RESULTS_FILE
  exit 0
else
  echo "⚠️  $fail test(s) failed" | tee -a $RESULTS_FILE
  exit 1
fi
