# ✅ Deployment Checklist

## Pre-Deployment
- [ ] Verify `.env.local` has correct secrets
- [ ] Update `FIREBASE_PROJECT_ID` in `.env.local`
- [ ] Ensure Firebase CLI is logged in (`firebase login`)
- [ ] Verify Node.js 18+ installed

## Deployment Steps
- [ ] `cd functions && npm install`
- [ ] `firebase deploy --only functions:sign,functions:verify`
- [ ] Deploy `public/.well-known/jwks.json` to hosting
- [ ] Update Postman environment with function URLs

## Post-Deployment Testing
- [ ] Test `/api/sign` endpoint (returns JWT)
- [ ] Test `/api/verify` endpoint (validates JWT)
- [ ] Test `/api/verify` with HMAC signature
- [ ] Verify JWKS endpoint returns public key
- [ ] Run full Postman collection (3/3 tests pass)

## Security Verification
- [ ] Confirm `.env.local` not in git
- [ ] Verify HMAC secret is hex-encoded 64 chars
- [ ] Check JWT expiry is 15 minutes
- [ ] Test with invalid token (should return 401)
- [ ] Test with invalid HMAC (should return 401)

## Production Readiness
- [ ] Set Firebase environment config (not .env.local)
- [ ] Enable CORS for production domains
- [ ] Setup monitoring/alerting for function errors
- [ ] Document function URLs in team wiki
- [ ] Schedule HMAC secret rotation (quarterly)
