#!/bin/bash
# Auth Flow Testing Script
# Tests signup, login, validation, session management

BASE_URL="https://apexrebate.com"
RESULTS_FILE="test-results-auth.log"

echo "🔐 ApexRebate - Auth Flow Testing" > $RESULTS_FILE
echo "===================================" >> $RESULTS_FILE
echo "Date: $(date)" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

# Test function
test_endpoint() {
  local url=$1
  local name=$2
  local expected=$3
  
  echo "Testing: $name ($url)"
  status=$(curl -sL -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$status" = "$expected" ]; then
    echo "✅ PASS: $name - Status $status" | tee -a $RESULTS_FILE
    return 0
  else
    echo "❌ FAIL: $name - Expected $expected, got $status" | tee -a $RESULTS_FILE
    return 1
  fi
}

echo "📝 Testing Auth Pages" >> $RESULTS_FILE
echo "---------------------" >> $RESULTS_FILE

# Check auth pages exist
test_endpoint "$BASE_URL/auth/signin" "Sign In Page" "200"
test_endpoint "$BASE_URL/auth/signup" "Sign Up Page" "200"
test_endpoint "$BASE_URL/auth/signout" "Sign Out Endpoint" "200"

echo "" >> $RESULTS_FILE
echo "🔑 Testing NextAuth Endpoints" >> $RESULTS_FILE
echo "-----------------------------" >> $RESULTS_FILE

# Test NextAuth API endpoints
csrf_test=$(curl -s "$BASE_URL/api/auth/csrf" 2>/dev/null)
if echo "$csrf_test" | grep -q "csrfToken"; then
  echo "✅ PASS: CSRF Token Endpoint" | tee -a $RESULTS_FILE
else
  echo "❌ FAIL: CSRF Token Endpoint - No token returned" | tee -a $RESULTS_FILE
fi

session_test=$(curl -s "$BASE_URL/api/auth/session" 2>/dev/null)
if [ ! -z "$session_test" ]; then
  echo "✅ PASS: Session Endpoint - Returns data" | tee -a $RESULTS_FILE
else
  echo "⚠️  PARTIAL: Session Endpoint - Empty response (expected for non-authenticated)" | tee -a $RESULTS_FILE
fi

providers_test=$(curl -s "$BASE_URL/api/auth/providers" 2>/dev/null)
if echo "$providers_test" | grep -q "credentials\|google\|github"; then
  echo "✅ PASS: Providers Endpoint" | tee -a $RESULTS_FILE
else
  echo "❌ FAIL: Providers Endpoint - No providers found" | tee -a $RESULTS_FILE
fi

echo "" >> $RESULTS_FILE
echo "🔒 Testing Protected Routes" >> $RESULTS_FILE
echo "---------------------------" >> $RESULTS_FILE

# Test if protected routes redirect or return 401
dashboard_status=$(curl -sL -o /dev/null -w "%{http_code}" "$BASE_URL/vi/dashboard")
if [ "$dashboard_status" = "401" ] || [ "$dashboard_status" = "307" ] || [ "$dashboard_status" = "302" ]; then
  echo "✅ PASS: Dashboard Protected - Status $dashboard_status (redirect or unauthorized)" | tee -a $RESULTS_FILE
elif [ "$dashboard_status" = "200" ]; then
  echo "⚠️  WARNING: Dashboard NOT Protected - Returns 200 without auth" | tee -a $RESULTS_FILE
else
  echo "❌ FAIL: Dashboard - Unexpected status $dashboard_status" | tee -a $RESULTS_FILE
fi

profile_status=$(curl -sL -o /dev/null -w "%{http_code}" "$BASE_URL/profile" 2>/dev/null)
if [ "$profile_status" = "401" ] || [ "$profile_status" = "307" ] || [ "$profile_status" = "302" ] || [ "$profile_status" = "404" ]; then
  echo "✅ PASS: Profile Protected or Not Found - Status $profile_status" | tee -a $RESULTS_FILE
elif [ "$profile_status" = "200" ]; then
  echo "⚠️  WARNING: Profile NOT Protected - Returns 200 without auth" | tee -a $RESULTS_FILE
fi

echo "" >> $RESULTS_FILE
echo "📊 Test Summary" >> $RESULTS_FILE
echo "---------------" >> $RESULTS_FILE

pass=$(grep -c "✅ PASS" $RESULTS_FILE)
warning=$(grep -c "⚠️" $RESULTS_FILE)
fail=$(grep -c "❌ FAIL" $RESULTS_FILE)
total=$((pass + warning + fail))

echo "Total: $total | Passed: $pass | Warnings: $warning | Failed: $fail" | tee -a $RESULTS_FILE

if [ $fail -eq 0 ]; then
  echo "✅ Auth flow tests completed!" | tee -a $RESULTS_FILE
  exit 0
else
  echo "⚠️  Some tests failed" | tee -a $RESULTS_FILE
  exit 1
fi
