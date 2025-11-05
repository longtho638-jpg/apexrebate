#!/bin/bash
# Admin Flow Testing Script
# Tests admin permissions, system stats, management functions

BASE_URL="https://apexrebate.com"
RESULTS_FILE="test-results-admin.log"

echo "👑 ApexRebate - Admin Flow Testing" > $RESULTS_FILE
echo "====================================" >> $RESULTS_FILE
echo "Date: $(date)" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

echo "🔐 Testing Admin Pages" >> $RESULTS_FILE
echo "---------------------" >> $RESULTS_FILE

# Test admin pages
admin_routes=(
  "/admin"
  "/admin/users"
  "/admin/payouts"
  "/admin/system"
  "/admin/analytics"
)

for route in "${admin_routes[@]}"; do
  status=$(curl -sL -o /dev/null -w "%{http_code}" "$BASE_URL$route" 2>/dev/null)
  if [ "$status" = "200" ]; then
    echo "⚠️  Admin $route - Status 200 (should be protected)" | tee -a $RESULTS_FILE
  elif [ "$status" = "401" ] || [ "$status" = "403" ]; then
    echo "✅ Admin $route - Protected (Status $status)" | tee -a $RESULTS_FILE
  elif [ "$status" = "404" ]; then
    echo "⚠️  Admin $route - Not Found (Status 404)" | tee -a $RESULTS_FILE
  else
    echo "⚠️  Admin $route - Status $status" | tee -a $RESULTS_FILE
  fi
done

echo "" >> $RESULTS_FILE
echo "🔌 Testing Admin APIs" >> $RESULTS_FILE
echo "--------------------" >> $RESULTS_FILE

# Test admin API endpoints
admin_apis=(
  "/api/admin/users"
  "/api/admin/payouts"
  "/api/admin/stats"
  "/api/admin/system"
)

for endpoint in "${admin_apis[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" 2>/dev/null)
  if [ "$status" = "200" ]; then
    echo "⚠️  API $endpoint - Status 200 (should require admin role)" | tee -a $RESULTS_FILE
  elif [ "$status" = "401" ] || [ "$status" = "403" ]; then
    echo "✅ API $endpoint - Protected (Status $status)" | tee -a $RESULTS_FILE
  elif [ "$status" = "404" ] || [ "$status" = "405" ]; then
    echo "⚠️  API $endpoint - Not Found (Status $status)" | tee -a $RESULTS_FILE
  else
    echo "⚠️  API $endpoint - Status $status" | tee -a $RESULTS_FILE
  fi
done

echo "" >> $RESULTS_FILE
echo "📊 Test Summary" >> $RESULTS_FILE
echo "---------------" >> $RESULTS_FILE

pass=$(grep -c "✅" $RESULTS_FILE)
warning=$(grep -c "⚠️" $RESULTS_FILE)
fail=$(grep -c "❌" $RESULTS_FILE)
total=$((pass + warning + fail))

echo "Total: $total | Passed: $pass | Warnings: $warning | Failed: $fail" | tee -a $RESULTS_FILE
echo "✅ Admin flow tests completed!" | tee -a $RESULTS_FILE
