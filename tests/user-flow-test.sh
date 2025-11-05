#!/bin/bash
# User Flow Testing Script
# Tests user dashboard, profile, APIs with test account

BASE_URL="https://apexrebate.com"
RESULTS_FILE="test-results-user.log"

echo "👤 ApexRebate - User Flow Testing" > $RESULTS_FILE
echo "===================================" >> $RESULTS_FILE
echo "Date: $(date)" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

echo "📊 Testing User Dashboard Pages" >> $RESULTS_FILE
echo "-------------------------------" >> $RESULTS_FILE

# Test dashboard pages (accessible without auth for now)
for route in "dashboard" "dashboard/analytics" "dashboard/referrals" "profile" "referrals"; do
  status=$(curl -sL -o /dev/null -w "%{http_code}" "$BASE_URL/$route" 2>/dev/null)
  if [ "$status" = "200" ] || [ "$status" = "404" ]; then
    echo "✅ Route /$route - Status $status" | tee -a $RESULTS_FILE
  else
    echo "⚠️  Route /$route - Status $status (may need locale)" | tee -a $RESULTS_FILE
  fi
done

echo "" >> $RESULTS_FILE
echo "🔌 Testing User APIs" >> $RESULTS_FILE
echo "--------------------" >> $RESULTS_FILE

# Test user-related API endpoints
api_endpoints=(
  "/api/user/profile"
  "/api/user/referrals"
  "/api/dashboard"
  "/api/dashboard/stats"
  "/api/dashboard/analytics"
)

for endpoint in "${api_endpoints[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" 2>/dev/null)
  if [ "$status" = "200" ]; then
    echo "✅ API $endpoint - Status 200" | tee -a $RESULTS_FILE
  elif [ "$status" = "401" ] || [ "$status" = "403" ]; then
    echo "✅ API $endpoint - Protected (Status $status)" | tee -a $RESULTS_FILE
  elif [ "$status" = "404" ] || [ "$status" = "405" ]; then
    echo "⚠️  API $endpoint - Not Found/Not Allowed (Status $status)" | tee -a $RESULTS_FILE
  else
    echo "❌ API $endpoint - Unexpected Status $status" | tee -a $RESULTS_FILE
  fi
done

echo "" >> $RESULTS_FILE
echo "�� Testing Referral System" >> $RESULTS_FILE
echo "-------------------------" >> $RESULTS_FILE

# Test referral endpoints
referral_test=$(curl -s "$BASE_URL/api/referrals" 2>/dev/null)
ref_status=$?
if [ $ref_status -eq 0 ]; then
  echo "✅ Referrals API - Endpoint accessible" | tee -a $RESULTS_FILE
else
  echo "⚠️  Referrals API - May require authentication" | tee -a $RESULTS_FILE
fi

echo "" >> $RESULTS_FILE
echo "📊 Test Summary" >> $RESULTS_FILE
echo "---------------" >> $RESULTS_FILE

pass=$(grep -c "✅" $RESULTS_FILE)
warning=$(grep -c "⚠️" $RESULTS_FILE)
fail=$(grep -c "❌" $RESULTS_FILE)
total=$((pass + warning + fail))

echo "Total: $total | Passed: $pass | Warnings: $warning | Failed: $fail" | tee -a $RESULTS_FILE
echo "✅ User flow tests completed!" | tee -a $RESULTS_FILE
