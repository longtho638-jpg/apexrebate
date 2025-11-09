# 🔐 ApexRebate JWKS + HMAC Deployment Package

## 📦 Contents
- `.env.local` - All secrets (JWKS private key, HMAC secret)
- `functions/index.js` - Firebase Functions for sign/verify
- `functions/package.json` - Dependencies
- `public/.well-known/jwks.json` - Public key distribution
- `tests/` - Postman collection for auto-testing

## 🚀 Quick Start

### 1️⃣ Install Dependencies
```bash
cd functions
npm install
```

### 2️⃣ Deploy to Firebase
```bash
firebase deploy --only functions:sign,functions:verify
```

### 3️⃣ Test with Postman
- Import `tests/apexrebate-jwks-auto.postman_collection.json`
- Set environment variable `FIREBASE_URL` to your function URL
- Run collection → All 3 tests should pass ✅

## 🔐 Security Notes
- **Never commit `.env.local`** to git
- Rotate HMAC secret regularly
- Use Firebase environment config in production:
  ```bash
  firebase functions:config:set jwks.private="..." jwks.kid="..." broker.hmac="..."
  ```

## 📊 Expected Results
✅ Sign JWT → Returns token with 15min expiry
✅ Verify JWT → Validates signature against JWKS
✅ Verify JWT + HMAC → Double validation (JWT + webhook signature)

## 🛠 VS Code Agent Prompt
```
Agent: Extract apexrebate-jwks.zip, then:
1. cd functions && npm install
2. firebase deploy --only functions:sign,functions:verify
3. Run Postman tests to verify full pipeline
4. Confirm "JWKS + HMAC Verified ✅"
```
