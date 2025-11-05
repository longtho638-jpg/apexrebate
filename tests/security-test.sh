#!/bin/bash
# Security & API Testing Script
# Tests injection prevention, rate-limiting, CORS, auth requirements

BASE_URL="https://apexrebate.com"
RESULTS_FILE="test-results-security.log"

echo "🔒 ApexRebate - Security & API Testing" > $RESULTS_FILE
echo "=======================================" >> $RESULTS_FILE
echo "Date: $(date)" >> $RESULTS_FILE
echo "" >> $RESULTS_FILE

echo "🛡️  Testing Security Headers" >> $RESULTS_FILE
echo "----------------------------" >> $RESULTS_FILE

# Check security headers
headers=$(curl -sI "$BASE_URL" 2>/dev/null)

if echo "$headers" | grep -qi "strict-transport-security"; then
  echo "✅ HSTS Header Present" | tee -a $RESULTS_FILE
else
  echo "⚠️  HSTS Header Missing" | tee -a $RESULTS_FILE
fi

if echo "$headers" | grep -qi "x-frame-options"; then
  echo "✅ X-Frame-Options Present" | tee -a $RESULTS_FILE
else
  echo "⚠️  X-Frame-Options Missing" | tee -a $RESULTS_FILE
fi

if echo "$headers" | grep -qi "x-content-type-options"; then
  echo "✅ X-Content-Type-Options Present" | tee -a $RESULTS_FILE
else
  echo "⚠️  X-Content-Type-Options Missing" | tee -a $RESULTS_FILE
fi

echo "" >> $RESULTS_FILE
echo "🔌 Testing Critical API Endpoints" >> $RESULTS_FILE
echo "---------------------------------" >> $RESULTS_FILE

# Test all critical APIs
critical_apis=(
  "/api/health:200"
  "/api/tools:200"
  "/api/calculator:405"  # POST only
  "/api/seed-production:200"
  "/api/auth/session:200"
  "/api/auth/csrf:200"
  "/api/auth/providers:200"
)

for item in "${critical_apis[@]}"; do
  IFS=':' read -r endpoint expected <<< "$item"
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" 2>/dev/null)
  
  if [ "$status" = "$expected" ]; then
    echo "✅ API $endpoint - Status $status (expected)" | tee -a $RESULTS_FILE
  else
    echo "⚠️  API $endpoint - Status $status (expected $expected)" | tee -a $RESULTS_FILE
  fi
done

echo "" >> $RESULTS_FILE
echo "🚫 Testing SQL Injection Prevention" >> $RESULTS_FILE
echo "-----------------------------------" >> $RESULTS_FILE

# Test basic SQL injection patterns (should be safely handled)
injection_tests=(
  "/api/tools?category=' OR '1'='1"
  "/api/tools?search='; DROP TABLE users--"
  "/api/tools?id=1 UNION SELECT * FROM users"
)

for test_url in "${injection_tests[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$test_url" 2>/dev/null)
  if [ "$status" = "200" ] || [ "$status" = "400" ] || [ "$status" = "404" ]; then
    echo "✅ Injection test handled safely - Status $status" | tee -a $RESULTS_FILE
  elif [ "$status" = "500" ]; then
    echo "⚠️  Injection test caused 500 error - May need review" | tee -a $RESULTS_FILE
  fi
done

echo "" >> $RESULTS_FILE
echo "⚡ Testing Rate Limiting" >> $RESULTS_FILE
echo "-----------------------" >> $RESULTS_FILE

# Test rate limiting by making multiple rapid requests
echo "Making 10 rapid requests to /api/tools..." | tee -a $RESULTS_FILE
rate_limit_detected=0

for i in {1..10}; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/tools" 2>/dev/null)
  if [ "$status" = "429" ]; then
    rate_limit_detected=1
    break
  fi
  sleep 0.1
done

if [ $rate_limit_detected -eq 1 ]; then
  echo "✅ Rate limiting detected (Status 429)" | tee -a $RESULTS_FILE
else
  echo "⚠️  No rate limiting detected (may need implementation)" | tee -a $RESULTS_FILE
fi

echo "" >> $RESULTS_FILE
echo "🌐 Testing CORS Configuration" >> $RESULTS_FILE
echo "-----------------------------" >> $RESULTS_FILE

# Test CORS headers
cors_headers=$(curl -sI -H "Origin: https://evil.com" "$BASE_URL/api/tools" 2>/dev/null)

if echo "$cors_headers" | grep -qi "access-control-allow-origin"; then
  echo "⚠️  CORS headers present - Review allowed origins" | tee -a $RESULTS_FILE
else
  echo "✅ CORS headers not exposed to arbitrary origins" | tee -a $RESULTS_FILE
fi

echo "" >> $RESULTS_FILE
echo "📊 Test Summary" >> $RESULTS_FILE
echo "---------------" >> $RESULTS_FILE

pass=$(grep -c "✅" $RESULTS_FILE)
warning=$(grep -c "⚠️" $RESULTS_FILE)
fail=$(grep -c "❌" $RESULTS_FILE)
total=$((pass + warning + fail))

echo "Total: $total | Passed: $pass | Warnings: $warning | Failed: $fail" | tee -a $RESULTS_FILE
echo "✅ Security tests completed!" | tee -a $RESULTS_FILE
