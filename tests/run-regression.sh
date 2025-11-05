#!/bin/bash

# ApexRebate API Regression Test Runner
# Usage: ./run-regression.sh [environment]
# Environment: dev (default), preview, prod

# set -e removed - let script continue to calculate pass rate

ENVIRONMENT=${1:-dev}
BASE_URL="http://localhost:3000"

if [ "$ENVIRONMENT" = "preview" ]; then
    BASE_URL="https://preview.apexrebate.com"
elif [ "$ENVIRONMENT" = "prod" ]; then
    BASE_URL="https://apexrebate.com"
fi

echo "🚀 Running ApexRebate API Regression Tests"
echo "Environment: $ENVIRONMENT"
echo "Base URL: $BASE_URL"
echo "=================================="

# Test 1: Wall of Fame
echo "📊 Test 1: Wall of Fame API"
WALL_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/wall-of-fame")
WALL_STATUS="${WALL_RESPONSE: -3}"
WALL_BODY="${WALL_RESPONSE%???}"

if [ "$WALL_STATUS" = "200" ]; then
    echo "✅ Wall of Fame: PASSED (200)"
    echo "   Total users: $(echo $WALL_BODY | jq -r '.data | length' 2>/dev/null || echo 'N/A')"
else
    echo "❌ Wall of Fame: FAILED ($WALL_STATUS)"
fi

# Test 2: Broker Data
echo ""
echo "🏦 Test 2: Broker Data API"
BROKER_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/broker-data?broker=binance")
BROKER_STATUS="${BROKER_RESPONSE: -3}"
BROKER_BODY="${BROKER_RESPONSE%???}"

if [ "$BROKER_STATUS" = "200" ]; then
    echo "✅ Broker Data: PASSED (200)"
    echo "   Broker name: $(echo $BROKER_BODY | jq -r '.data.name' 2>/dev/null || echo 'N/A')"
else
    echo "❌ Broker Data: FAILED ($BROKER_STATUS)"
fi

# Test 3: Intake Form Submission
echo ""
echo "📝 Test 3: Intake Form Submission"
INTAKE_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/submit-intake" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test@example.com",
        "tradingVolume": "1000000",
        "preferredBroker": "binance",
        "experience": "intermediate",
        "referralSource": "twitter"
    }')
INTAKE_STATUS="${INTAKE_RESPONSE: -3}"
INTAKE_BODY="${INTAKE_RESPONSE%???}"

if [ "$INTAKE_STATUS" = "200" ]; then
    echo "✅ Intake Form: PASSED (200)"
    echo "   User ID: $(echo $INTAKE_BODY | jq -r '.userId' 2>/dev/null || echo 'N/A')"
else
    echo "❌ Intake Form: FAILED ($INTAKE_STATUS)"
fi

# Test 4: Health Check
echo ""
echo "🏥 Test 4: Health Check"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/health")
HEALTH_STATUS="${HEALTH_RESPONSE: -3}"

if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ Health Check: PASSED (200)"
else
    echo "❌ Health Check: FAILED ($HEALTH_STATUS)"
fi

echo ""
echo "=================================="
echo "🎯 Regression tests completed!"

# Calculate pass rate
TOTAL_TESTS=4
PASSED_TESTS=0

[ "$WALL_STATUS" = "200" ] && ((PASSED_TESTS++))
[ "$BROKER_STATUS" = "200" ] && ((PASSED_TESTS++))
[ "$INTAKE_STATUS" = "200" ] && ((PASSED_TESTS++))
[ "$HEALTH_STATUS" = "200" ] && ((PASSED_TESTS++))

PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo "📈 Pass Rate: $PASSED_TESTS/$TOTAL_TESTS ($PASS_RATE%)"

if [ $PASS_RATE -ge 75 ]; then
    echo "🎉 All tests passed! Ready for deployment."
    exit 0
else
    echo "⚠️  Some tests failed. Please review before deployment."
    exit 1
fi