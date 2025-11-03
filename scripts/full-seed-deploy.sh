#!/bin/bash
set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
SITE_URL=${NEXT_PUBLIC_APP_URL:-"https://apexrebate.com"}
WAIT_AFTER_DEPLOY_SEC=${WAIT_AFTER_DEPLOY_SEC:-90}
FORCE_REBUILD=${FORCE_REBUILD:-true}
USE_VERCEL_CLI=${USE_VERCEL_CLI:-auto}
NOTIFY_WEBHOOK=${NOTIFY_WEBHOOK:-""}
log(){ echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"; } ok(){ echo -e "${GREEN}✓${NC} $*"; } warn(){ echo -e "${YELLOW}⚠${NC} $*"; } fail(){ echo -e "${RED}✗${NC} $*"; exit 1; }
req(){ command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"; }
http_code(){ curl -s -o /dev/null -w "%{http_code}" "$1"; }
header(){ curl -sI "$1"; }
log "Preflight: required commands"; req curl; command -v jq >/dev/null 2>&1 || warn "jq not found"; command -v openssl >/dev/null 2>&1 || warn "openssl not found"; if command -v psql >/dev/null 2>&1; then ok "psql detected"; else warn "psql not found; skip Neon direct check"; fi
if [ "${USE_VERCEL_CLI}" = "true" ] || { [ "${USE_VERCEL_CLI}" = "auto" ] && command -v vercel >/dev/null 2>&1; }; then VERCEL_READY=true; ok "Vercel CLI available"; else VERCEL_READY=false; warn "No Vercel CLI; will git-push"; fi
log "Preflight: env vars"; : "${DATABASE_URL:?DATABASE_URL required}"; : "${NEXTAUTH_SECRET:?NEXTAUTH_SECRET required}"; : "${SEED_SECRET_KEY:?SEED_SECRET_KEY required}"; : "${NEXT_PUBLIC_APP_URL:?NEXT_PUBLIC_APP_URL required}"; export NODE_ENV=production; ok "ENV OK"
log "PHA 1 — Infra checks"; if command -v psql >/dev/null 2>&1; then if PGPASSWORD="" psql "$DATABASE_URL" -c "\\dt" -q -A -F $'\t' >/dev/null 2>&1; then ok "Neon reachable"; else warn "psql failed; continue"; fi; fi
log "Prisma generate + migrate deploy"; npx prisma generate >/dev/null && ok "prisma generate"; npx prisma migrate deploy && ok "prisma migrate deploy"
log "PHA 2 — Deploy"; if [ "$FORCE_REBUILD" = "true" ] && [ -x ./scripts/force-rebuild.sh ]; then bash ./scripts/force-rebuild.sh || true; fi; if [ "$VERCEL_READY" = true ]; then vercel deploy --yes --prod --force || fail "vercel deploy failed"; ok "Vercel deploy triggered"; else git add -A >/dev/null 2>&1 || true; git commit --allow-empty -m "chore: full-seed-deploy $(date -u +%FT%TZ)" >/dev/null || true; git push || fail "git push failed"; ok "git push done"; fi
log "Waiting ${WAIT_AFTER_DEPLOY_SEC}s for propagation"; for i in $(seq 1 ${WAIT_AFTER_DEPLOY_SEC}); do echo -ne "\r   Waiting: ${i}/${WAIT_AFTER_DEPLOY_SEC}s"; sleep 1; done; echo
log "Site health"; CODE=$(http_code "${SITE_URL}/vi"); if [ "$CODE" = "200" ] || [ "$CODE" = "307" ] || [ "$CODE" = "308" ]; then ok "Site up (HTTP $CODE)"; else fail "Site not ready (HTTP $CODE)"; fi
log "Seed production"; RES=$(curl -s -w "\n%{http_code}" -X POST "${SITE_URL}/api/seed-production" -H "Authorization: Bearer ${SEED_SECRET_KEY}" -H "Content-Type: application/json"); RC=$(echo "$RES" | tail -n1); BODY=$(echo "$RES" | head -n-1); if [ "$RC" = "200" ]; then ok "Seed success"; elif [ "$RC" = "400" ] && echo "$BODY" | grep -qi "already seeded"; then warn "Already seeded"; else echo "$BODY"; fail "Seed failed (HTTP $RC)"; fi
log "PHA 3 — Verify UI/UX & APIs"; dash_html=$(curl -s "${SITE_URL}/vi/dashboard"); echo "$dash_html" | grep -q "Application error" && fail "Client-side error on dashboard" || ok "Dashboard OK"; bundle=$(echo "$dash_html" | grep -o 'dashboard/page-[a-f0-9]*\.js' | head -1 || true); [ -n "$bundle" ] && ok "Bundle: $bundle" || warn "No bundle detected"; for url in "/vi" "/en" "/vi/tools"; do code=$(http_code "${SITE_URL}$url"); [ "$code" = "200" ] && ok "200 $url" || fail "$url → HTTP $code"; done; R1=$(header "${SITE_URL}/uiux-v3" | grep -i "^location:" | awk '{print $2}' | tr -d '\r'); [ -n "$R1" ] && ok "Redirect /uiux-v3 → $R1" || warn "Missing /uiux-v3 redirect"; for api in "/api/health" "/api/dashboard"; do code=$(http_code "${SITE_URL}$api"); [ "$code" = "200" ] && ok "200 $api" || warn "$api → HTTP $code"; done; dash=$(curl -s "${SITE_URL}/api/dashboard"); echo "$dash" | jq -e '.success == true and .data.userData != null' >/dev/null 2>&1 && ok "API shape OK" || warn "API shape unexpected"
log "Summary"; echo "{\"site\":\"${SITE_URL}\",\"bundle\":\"${bundle:-unknown}\",\"timestamp\":\"$(date -u +%FT%TZ)\"}" | (jq . 2>/dev/null || cat); if [ -n "$NOTIFY_WEBHOOK" ]; then curl -s -X POST "$NOTIFY_WEBHOOK" -H "Content-Type: application/json" -d "{\"site\":\"${SITE_URL}\",\"bundle\":\"${bundle:-unknown}\",\"timestamp\":\"$(date -u +%FT%TZ)\"}" >/dev/null || true; fi; ok "Full SEED deploy complete"
