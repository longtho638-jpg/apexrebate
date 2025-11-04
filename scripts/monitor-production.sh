#!/bin/bash
# ApexRebate Production Monitoring Script

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SITE_URL="${NEXT_PUBLIC_APP_URL:-https://apexrebate.com}"
LOG_FILE="${LOG_FILE:-./logs/monitor.log}"
ALERT_WEBHOOK="${ALERT_WEBHOOK:-}"
CHECK_INTERVAL="${CHECK_INTERVAL:-300}"
MAX_RESPONSE_TIME="${MAX_RESPONSE_TIME:-3000}"

mkdir -p "$(dirname "$LOG_FILE")"

log() {
  local msg="[$(date +'%Y-%m-%d %H:%M:%S')] $*"
  echo -e "${BLUE}${msg}${NC}"
  echo "$msg" >> "$LOG_FILE"
}

success() {
  local msg="✅ $*"
  echo -e "${GREEN}${msg}${NC}"
  echo "[OK] $*" >> "$LOG_FILE"
}

warn() {
  local msg="⚠️  $*"
  echo -e "${YELLOW}${msg}${NC}"
  echo "[WARN] $*" >> "$LOG_FILE"
}

error() {
  local msg="❌ $*"
  echo -e "${RED}${msg}${NC}"
  echo "[ERROR] $*" >> "$LOG_FILE"
}

send_alert() {
  local severity="$1"
  local message="$2"
  
  if [ -n "$ALERT_WEBHOOK" ]; then
    local color="16711680"
    [ "$severity" = "warning" ] && color="16776960"
    [ "$severity" = "info" ] && color="65280"
    
    curl -s -X POST "$ALERT_WEBHOOK" \
      -H "Content-Type: application/json" \
      -d "{
        \"embeds\": [{
          \"title\": \"🚨 ApexRebate Alert\",
          \"description\": \"$message\",
          \"color\": $color,
          \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
        }]
      }" > /dev/null
  fi
}

check_endpoint() {
  local url="$1"
  local name="$2"
  
  local start_time=$(python3 -c "import time; print(int(time.time() * 1000))")
  local http_code=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "$url" 2>&1 || echo "000")
  local end_time=$(python3 -c "import time; print(int(time.time() * 1000))")
  local response_time=$((end_time - start_time))
  
  echo "$http_code|$response_time"
}

monitor_once() {
  log "🔍 Starting health check..."
  
  local failed=0
  local warnings=0
  
  # Check main site
  log "Checking main site: $SITE_URL"
  result=$(check_endpoint "$SITE_URL" "Main Site")
  http_code=$(echo "$result" | cut -d'|' -f1)
  response_time=$(echo "$result" | cut -d'|' -f2)
  
  if [ "$http_code" = "200" ] || [ "$http_code" = "307" ] || [ "$http_code" = "308" ]; then
    if [ "$response_time" -gt "$MAX_RESPONSE_TIME" ]; then
      warn "Main site slow: ${response_time}ms (> ${MAX_RESPONSE_TIME}ms)"
      ((warnings++))
    else
      success "Main site: HTTP $http_code, ${response_time}ms"
    fi
  else
    error "Main site down: HTTP $http_code"
    send_alert "error" "🔴 Main site is down! HTTP $http_code"
    ((failed++))
  fi
  
  # Check /vi redirect
  log "Checking /vi redirect"
  result=$(check_endpoint "$SITE_URL/vi" "Vi Redirect")
  http_code=$(echo "$result" | cut -d'|' -f1)
  
  if [ "$http_code" = "200" ]; then
    success "/vi redirect: HTTP $http_code"
  else
    warn "/vi redirect unexpected: HTTP $http_code"
    ((warnings++))
  fi
  
  # Check dashboard
  log "Checking dashboard page"
  result=$(check_endpoint "$SITE_URL/vi/dashboard" "Dashboard")
  http_code=$(echo "$result" | cut -d'|' -f1)
  response_time=$(echo "$result" | cut -d'|' -f2)
  
  if [ "$http_code" = "200" ]; then
    if [ "$response_time" -gt "$MAX_RESPONSE_TIME" ]; then
      warn "Dashboard slow: ${response_time}ms"
      ((warnings++))
    else
      success "Dashboard: HTTP $http_code, ${response_time}ms"
    fi
  else
    error "Dashboard error: HTTP $http_code"
    send_alert "error" "🔴 Dashboard is down! HTTP $http_code"
    ((failed++))
  fi
  
  # Check seed status API
  log "Checking seed status API"
  seed_response=$(curl -s "$SITE_URL/api/seed-production" 2>&1 || echo '{"error":"failed"}')
  
  if echo "$seed_response" | grep -q '"seeded":true'; then
    user_count=$(echo "$seed_response" | grep -o '"users":[0-9]*' | grep -o '[0-9]*')
    tool_count=$(echo "$seed_response" | grep -o '"tools":[0-9]*' | grep -o '[0-9]*')
    success "Seed API: $user_count users, $tool_count tools"
  else
    warn "Seed API unexpected response"
    ((warnings++))
  fi
  
  # Summary
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if [ "$failed" -eq 0 ] && [ "$warnings" -eq 0 ]; then
    success "All checks passed ✓"
  elif [ "$failed" -eq 0 ]; then
    warn "Passed with $warnings warning(s)"
  else
    error "$failed check(s) failed, $warnings warning(s)"
    send_alert "error" "🔴 $failed critical issues detected!"
  fi
}

case "${1:-once}" in
  loop)
    log "🔁 Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)"
    while true; do
      monitor_once
      log "⏳ Sleeping ${CHECK_INTERVAL}s..."
      sleep "$CHECK_INTERVAL"
    done
    ;;
  once)
    monitor_once
    ;;
  *)
    echo "Usage: $0 [once|loop]"
    echo ""
    echo "Environment variables:"
    echo "  NEXT_PUBLIC_APP_URL    - Site URL (default: https://apexrebate.com)"
    echo "  CHECK_INTERVAL         - Loop interval in seconds (default: 300)"
    echo "  MAX_RESPONSE_TIME      - Alert threshold in ms (default: 3000)"
    echo "  ALERT_WEBHOOK          - Discord/Slack webhook for alerts"
    echo "  LOG_FILE               - Log file path (default: ./logs/monitor.log)"
    exit 1
    ;;
esac
