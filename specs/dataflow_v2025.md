# 🧠 Dataflow Architecture — TREE Layer 2025 (GPT-5 Full-Stack)

## 1. Auth Flow
- `/api/auth/[...nextauth]` — NextAuth (Google, Email)
- Session token stored via JWT, secret = `NEXTAUTH_SECRET`
- `User` model in Prisma linked with Neon Postgres

## 2. Dashboard Flow
- `/api/dashboard`  
  → Aggregates `rebates` + `volumes`  
  → Returns totals for each user
- Firestore mirrors metrics → collection `metrics_daily`

## 3. Hang Sói Community Feed
- `/api/hang-soi`
  → Reads from Firestore `hang_soi_feed`
  → Returns last 20 posts (timestamp desc)
- Frontend polls every 30s (SWR interval)

## 4. Payout System
- `/api/payouts`
  → Prisma `payouts` model  
  → Signs each record with Ed25519 (`EVIDENCE_PRIVATE_KEY`)
  → Returns JSON array of latest 20 payouts

## 5. Metrics
- `/api/metrics`
  - Accepts POST body `{ event, value, ts }`
  - Writes to Firestore
  - Used by SWR realtime UI and Lighthouse check

## 6. Evidence Verification
- `lib/evidence.ts`
  - `signEvidence(data)` signs object
  - Future: add `/api/verify` for signature verification

## 7. Deployment Guards
- `vercel.json` → headers no-cache for JS bundles
- `.env.production`
  - `DATABASE_URL`
  - `FIREBASE_SERVICE_ACCOUNT`
  - `EVIDENCE_PRIVATE_KEY`
  - `NEXTAUTH_SECRET`
  - `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

## 8. Test & Verification
- After deploy:
  - `curl https://apexrebate.com/api/dashboard`
  - `curl https://apexrebate.com/api/payouts`
  - Verify fields `manifest` exists & valid
  - Run Lighthouse performance audit via script

---
✅ Output expectations:
- Average API latency < 150 ms (Edge runtime)
- Lighthouse Perf ≥ 90
- All SWR fetches stable under 500 ms TTL
