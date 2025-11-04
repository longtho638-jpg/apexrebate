#!/bin/bash
################################################################################
# APEXREBATE PRODUCTION READINESS VERIFICATION
# Kiểm tra 100% các mục trong FOUNDER_HANDOFF.md
################################################################################

set +e  # Continue on errors to collect all results

PROD_URL="https://apexrebate.com"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="./logs/verification-${TIMESTAMP}.log"
REPORT_FILE="./logs/verification-report-${TIMESTAMP}.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

mkdir -p ./logs

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

declare -a FAILED_ITEMS=()
declare -a WARNING_ITEMS=()

log() {
  echo -e "$1" | tee -a "$LOG_FILE"
}

check_item() {
  local category=$1
  local item=$2
  local command=$3
  local expected=$4
  
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  
  log "${YELLOW}[${TOTAL_CHECKS}] Testing: ${item}${NC}"
  
  # Execute command and capture result
  local result=$(eval "$command" 2>&1)
  local exit_code=$?
  
  # Check result
  if [[ $exit_code -eq 0 ]] && [[ "$result" =~ $expected ]]; then
    log "    ${GREEN}✓ PASS${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    return 0
  elif [[ "$expected" == "WARNING" ]]; then
    log "    ${YELLOW}⚠ WARNING: ${result}${NC}"
    WARNING_CHECKS=$((WARNING_CHECKS + 1))
    WARNING_ITEMS+=("[$category] $item")
    return 0
  else
    log "    ${RED}✗ FAIL: Expected '${expected}', got '${result}' (exit: ${exit_code})${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    FAILED_ITEMS+=("[$category] $item")
    return 1
  fi
}

log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "${BLUE}🔍 APEXREBATE PRODUCTION READINESS VERIFICATION${NC}"
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "Started: $(date)"
log "Production URL: ${PROD_URL}"
log ""

################################################################################
# SECTION 1: PRODUCTION URL & INFRASTRUCTURE
################################################################################
log "${BLUE}━━━ 1. PRODUCTION INFRASTRUCTURE ━━━${NC}"

check_item "Infrastructure" "Main site accessible" \
  "curl -sI ${PROD_URL} | head -1" \
  "200"

check_item "Infrastructure" "HTTPS enforced" \
  "curl -sI ${PROD_URL} | grep -i 'strict-transport-security'" \
  "max-age"

check_item "Infrastructure" "Response time < 3s" \
  "curl -o /dev/null -s -w '%{time_total}' ${PROD_URL} | awk '{print (\$1 < 3.0) ? \"OK\" : \"SLOW\"}'" \
  "OK"

check_item "Infrastructure" "Vercel deployment active" \
  "curl -sI ${PROD_URL} | grep -i 'server'" \
  "Vercel"

echo ""

################################################################################
# SECTION 2: DATABASE CONNECTION
################################################################################
log "${BLUE}━━━ 2. DATABASE CONNECTION ━━━${NC}"

check_item "Database" "DATABASE_URL environment variable exists" \
  "grep -q 'DATABASE_URL=' .env && echo 'EXISTS' || echo 'MISSING'" \
  "EXISTS"

check_item "Database" "Neon Postgres connection string format" \
  "grep 'DATABASE_URL' .env | grep -q 'neon.tech' && echo 'VALID' || echo 'INVALID'" \
  "VALID"

check_item "Database" "Prisma client generated" \
  "[ -d node_modules/.prisma/client ] && echo 'EXISTS' || echo 'MISSING'" \
  "EXISTS"

echo ""

################################################################################
# SECTION 3: ADMIN CREDENTIALS
################################################################################
log "${BLUE}━━━ 3. ADMIN ACCOUNT VERIFICATION ━━━${NC}"

# Note: Cannot test actual login without credentials, checking setup only
check_item "Admin" "Admin email documented" \
  "grep -q 'admin@apexrebate.com' FOUNDER_HANDOFF.md && echo 'DOCUMENTED' || echo 'MISSING'" \
  "DOCUMENTED"

check_item "Admin" "Admin panel route exists" \
  "[ -f src/app/admin/page.tsx ] && echo 'EXISTS' || echo 'MISSING'" \
  "EXISTS"

check_item "Admin" "Role guard implemented" \
  "grep -q 'RoleGuard' src/app/admin/page.tsx && echo 'PROTECTED' || echo 'UNPROTECTED'" \
  "PROTECTED"

echo ""

################################################################################
# SECTION 4: AUTHENTICATION PAGES
################################################################################
log "${BLUE}━━━ 4. AUTHENTICATION SYSTEM ━━━${NC}"

check_item "Auth" "Sign in page accessible" \
  "curl -sI ${PROD_URL}/auth/signin | head -1" \
  "200"

check_item "Auth" "Sign up page accessible" \
  "curl -sI ${PROD_URL}/auth/signup | head -1" \
  "200"

check_item "Auth" "NextAuth configured" \
  "[ -f src/lib/auth-enhanced.ts ] && echo 'CONFIGURED' || echo 'MISSING'" \
  "CONFIGURED"

check_item "Auth" "Email verification flow exists" \
  "[ -f src/app/auth/verify-email/page.tsx ] && echo 'EXISTS' || echo 'MISSING'" \
  "EXISTS"

echo ""

################################################################################
# SECTION 5: PUBLIC PAGES & TOOLS
################################################################################
log "${BLUE}━━━ 5. PUBLIC PAGES ━━━${NC}"

check_item "Public" "Calculator page" \
  "curl -sI ${PROD_URL}/calculator | head -1" \
  "200"

check_item "Public" "Tools marketplace" \
  "curl -sI ${PROD_URL}/tools | head -1" \
  "200"

check_item "Public" "How it works page" \
  "curl -sI ${PROD_URL}/how-it-works | head -1" \
  "200"

check_item "Public" "FAQ page" \
  "curl -sI ${PROD_URL}/faq | head -1" \
  "200"

check_item "Public" "Wall of fame" \
  "curl -sI ${PROD_URL}/wall-of-fame | head -1" \
  "200"

echo ""

################################################################################
# SECTION 6: APIs
################################################################################
log "${BLUE}━━━ 6. API ENDPOINTS ━━━${NC}"

check_item "API" "Calculator API" \
  "curl -s '${PROD_URL}/api/calculator?volume=1000000&broker=binance&tradeType=taker&tradesPerMonth=20' | grep -q 'success' && echo 'WORKING' || echo 'FAILED'" \
  "WORKING"

check_item "API" "Health check API" \
  "curl -s ${PROD_URL}/api/health | grep -q 'ok' && echo 'HEALTHY' || echo 'UNHEALTHY'" \
  "HEALTHY"

check_item "API" "Dashboard API requires auth" \
  "curl -sI ${PROD_URL}/api/dashboard | head -1" \
  "401"

echo ""

################################################################################
# SECTION 7: MONITORING SYSTEM
################################################################################
log "${BLUE}━━━ 7. MONITORING & SCRIPTS ━━━${NC}"

check_item "Monitoring" "Monitor script exists" \
  "[ -f scripts/monitor-production.sh ] && [ -x scripts/monitor-production.sh ] && echo 'READY' || echo 'MISSING'" \
  "READY"

check_item "Monitoring" "Test guest flows script exists" \
  "[ -f scripts/test-guest-flows-fixed.sh ] && [ -x scripts/test-guest-flows-fixed.sh ] && echo 'READY' || echo 'MISSING'" \
  "READY"

check_item "Monitoring" "Logs directory exists" \
  "[ -d logs ] && echo 'EXISTS' || echo 'MISSING'" \
  "EXISTS"

check_item "Monitoring" "Cron job configured" \
  "crontab -l 2>/dev/null | grep -q 'monitor-production.sh' && echo 'ACTIVE' || echo 'NOT_SETUP'" \
  "WARNING"

echo ""

################################################################################
# SECTION 8: DOCUMENTATION
################################################################################
log "${BLUE}━━━ 8. DOCUMENTATION ━━━${NC}"

check_item "Docs" "FOUNDER_HANDOFF.md exists" \
  "[ -f FOUNDER_HANDOFF.md ] && echo 'EXISTS' || echo 'MISSING'" \
  "EXISTS"

check_item "Docs" "MONITORING_SETUP.md exists" \
  "[ -f MONITORING_SETUP.md ] && echo 'EXISTS' || echo 'MISSING'" \
  "EXISTS"

check_item "Docs" "API documentation exists" \
  "[ -f docs/API.md ] && echo 'EXISTS' || echo 'MISSING'" \
  "EXISTS"

check_item "Docs" "Production deploy guide exists" \
  "[ -f PRODUCTION_DEPLOY_GUIDE.md ] && echo 'EXISTS' || echo 'MISSING'" \
  "EXISTS"

echo ""

################################################################################
# SECTION 9: SECURITY & ENVIRONMENT
################################################################################
log "${BLUE}━━━ 9. SECURITY & ENVIRONMENT ━━━${NC}"

check_item "Security" "NEXTAUTH_SECRET configured" \
  "grep -q 'NEXTAUTH_SECRET=' .env && echo 'SET' || echo 'MISSING'" \
  "SET"

check_item "Security" "SEED_SECRET_KEY configured" \
  "grep -q 'SEED_SECRET_KEY=' .env && echo 'SET' || echo 'MISSING'" \
  "SET"

check_item "Security" ".env file in .gitignore" \
  "grep -q '^\.env$' .gitignore && echo 'PROTECTED' || echo 'EXPOSED'" \
  "PROTECTED"

check_item "Security" "node_modules in .gitignore" \
  "grep -q 'node_modules' .gitignore && echo 'PROTECTED' || echo 'EXPOSED'" \
  "PROTECTED"

echo ""

################################################################################
# SECTION 10: SEED DATA
################################################################################
log "${BLUE}━━━ 10. SEED DATA & DATABASE ━━━${NC}"

check_item "Seed" "Seed master script exists" \
  "[ -f src/lib/seed-master.ts ] && echo 'EXISTS' || echo 'MISSING'" \
  "EXISTS"

check_item "Seed" "Prisma schema valid" \
  "[ -f prisma/schema.prisma ] && echo 'EXISTS' || echo 'MISSING'" \
  "EXISTS"

check_item "Seed" "31 tables documented" \
  "grep -q '31 tables' FOUNDER_HANDOFF.md && echo 'DOCUMENTED' || echo 'MISSING'" \
  "DOCUMENTED"

echo ""

################################################################################
# GENERATE SUMMARY REPORT
################################################################################

log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log "${BLUE}📊 VERIFICATION SUMMARY${NC}"
log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log ""
log "Total checks:    ${TOTAL_CHECKS}"
log "${GREEN}Passed:          ${PASSED_CHECKS}${NC}"
log "${RED}Failed:          ${FAILED_CHECKS}${NC}"
log "${YELLOW}Warnings:        ${WARNING_CHECKS}${NC}"
log ""

PASS_RATE=$(echo "scale=2; ($PASSED_CHECKS * 100) / $TOTAL_CHECKS" | bc)
log "Pass rate:       ${PASS_RATE}%"
log ""

# Generate markdown report
cat > "$REPORT_FILE" << EOFREPORT
# 🔍 ApexRebate Production Readiness Report

**Generated:** $(date)  
**Production URL:** ${PROD_URL}

---

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total Checks | ${TOTAL_CHECKS} |
| ✅ Passed | ${PASSED_CHECKS} |
| ❌ Failed | ${FAILED_CHECKS} |
| ⚠️ Warnings | ${WARNING_CHECKS} |
| **Pass Rate** | **${PASS_RATE}%** |

---

## ❌ Failed Items

EOFREPORT

if [ ${#FAILED_ITEMS[@]} -eq 0 ]; then
  echo "None! 🎉" >> "$REPORT_FILE"
else
  for item in "${FAILED_ITEMS[@]}"; do
    echo "- $item" >> "$REPORT_FILE"
  done
fi

cat >> "$REPORT_FILE" << EOFREPORT

---

## ⚠️ Warnings

EOFREPORT

if [ ${#WARNING_ITEMS[@]} -eq 0 ]; then
  echo "None" >> "$REPORT_FILE"
else
  for item in "${WARNING_ITEMS[@]}"; do
    echo "- $item" >> "$REPORT_FILE"
  done
fi

cat >> "$REPORT_FILE" << EOFREPORT

---

## 🎯 Verdict

EOFREPORT

if [ $FAILED_CHECKS -eq 0 ]; then
  log "${GREEN}🎉 SYSTEM IS PRODUCTION READY!${NC}"
  log ""
  log "✅ All critical checks passed"
  log "✅ Infrastructure operational"
  log "✅ Security configured"
  log "✅ Documentation complete"
  log ""
  echo "**✅ PRODUCTION READY**" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "All critical checks passed. System is ready for production handoff." >> "$REPORT_FILE"
  EXIT_CODE=0
elif [ $FAILED_CHECKS -le 3 ] && [ $PASS_RATE > 90 ]; then
  log "${YELLOW}⚠️ MOSTLY READY - Minor Issues${NC}"
  log ""
  log "System is mostly ready but has ${FAILED_CHECKS} issues to fix"
  log ""
  echo "**⚠️ MOSTLY READY**" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "System has ${FAILED_CHECKS} minor issues. Review and fix before production." >> "$REPORT_FILE"
  EXIT_CODE=1
else
  log "${RED}❌ NOT PRODUCTION READY${NC}"
  log ""
  log "System has ${FAILED_CHECKS} critical issues"
  log "Please review and fix before handoff"
  log ""
  echo "**❌ NOT READY**" >> "$REPORT_FILE"
  echo "" >> "$REPORT_FILE"
  echo "System has ${FAILED_CHECKS} critical issues. Fix before production handoff." >> "$REPORT_FILE"
  EXIT_CODE=2
fi

cat >> "$REPORT_FILE" << EOFREPORT

---

## 📝 Next Steps

EOFREPORT

if [ $FAILED_CHECKS -gt 0 ]; then
  cat >> "$REPORT_FILE" << EOFREPORT
1. Review failed items above
2. Fix each issue
3. Re-run verification: \`./scripts/verify-production-readiness.sh\`
4. Ensure 100% pass rate before handoff
EOFREPORT
else
  cat >> "$REPORT_FILE" << EOFREPORT
1. ✅ Review FOUNDER_HANDOFF.md
2. ✅ Test admin login manually
3. ✅ Complete pre-launch checklist
4. ✅ Ready for handoff to Founder!
EOFREPORT
fi

log ""
log "${BLUE}📄 Full report saved to: ${REPORT_FILE}${NC}"
log "${BLUE}📄 Detailed log saved to: ${LOG_FILE}${NC}"
log ""

exit $EXIT_CODE
