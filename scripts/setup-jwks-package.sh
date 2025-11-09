#!/bin/bash
# 🔐 JWKS + HMAC Deployment Package Generator
# Creates complete deployment package for Firebase Functions + Vercel

set -e

echo "🔐 Creating JWKS + HMAC Deployment Package..."

# Create directory structure
mkdir -p apexrebate-jwks/functions apexrebate-jwks/public/.well-known apexrebate-jwks/tests

# 1️⃣ Create .env.local with secrets
cat > apexrebate-jwks/.env.local <<'EOF'
# 🔐 JWKS Secrets (Ed25519)
JWKS_PRIVATE="-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIJoRqLpO2wb7rEXk+Hg+vJmxPIvYbt7iRzL4ZX8cMtst
-----END PRIVATE KEY-----"
JWKS_KID="c5e8a1d913b27a1b"

# 🔐 HMAC Secret for Webhook Validation
BROKER_HMAC="bcb30b0a8f0d2c9f9f1e3cbf9a7650ef4a91a1a46ffdc2a40e3c23c3e01e5f9b"

# 🌍 Firebase Config
FIREBASE_PROJECT_ID="apexrebate-1"
FIREBASE_REGION="asia-southeast1"

# 🌐 Vercel Config
VERCEL_PROJECT_ID="prj_xxx"
VERCEL_ORG_ID="team_xxx"
EOF

# 2️⃣ Create functions/index.js
cat > apexrebate-jwks/functions/index.js <<'EOF'
import functions from "firebase-functions";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// 🔐 Configuration from environment
const JWKS_URL = `https://${process.env.FIREBASE_PROJECT_ID}.web.app/.well-known/jwks.json`;
const JWKS_PRIVATE = process.env.JWKS_PRIVATE;
const JWKS_KID = process.env.JWKS_KID;
const BROKER_HMAC = process.env.BROKER_HMAC;

/**
 * Fetch JWKS public key from /.well-known/jwks.json
 */
async function getJWKS() {
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error("JWKS fetch failed");
  const { keys } = await res.json();
  const jwk = keys[0];
  
  // Convert Ed25519 public key (x coordinate) to PEM
  const pubKey = Buffer.from(jwk.x, "base64");
  const pem = "-----BEGIN PUBLIC KEY-----\n" +
              pubKey.toString("base64") +
              "\n-----END PUBLIC KEY-----";
  
  return { pem, kid: jwk.kid };
}

/**
 * Verify HMAC signature for webhook validation
 */
function verifyHMAC(body, signature) {
  const computed = crypto.createHmac("sha256", BROKER_HMAC)
                         .update(body)
                         .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(computed, "hex"),
    Buffer.from(signature, "hex")
  );
}

/**
 * 🔐 /api/sign - Sign JWT with private key
 */
export const sign = functions.region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      const claims = req.body?.claims || { sub: "demo", role: "test" };
      const token = jwt.sign(claims, JWKS_PRIVATE, {
        algorithm: "EdDSA",
        keyid: JWKS_KID,
        expiresIn: "15m",
      });
      
      res.json({ 
        ok: true, 
        token,
        expires: "15m",
        kid: JWKS_KID 
      });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

/**
 * ✅ /api/verify - Verify JWT + optional HMAC
 */
export const verify = functions.region("asia-southeast1")
  .https.onRequest(async (req, res) => {
    try {
      // Extract token from query or Authorization header
      const token = req.query.token || 
                   req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        return res.status(400).json({ error: "Missing token" });
      }
      
      // Fetch public key from JWKS
      const { pem } = await getJWKS();
      
      // Verify JWT signature
      const payload = jwt.verify(token, pem, { algorithms: ["EdDSA"] });
      
      // Optional: Verify HMAC if signature present
      const sig = req.headers["x-broker-signature"];
      let hmacValid = false;
      
      if (sig) {
        const raw = JSON.stringify(req.body || {});
        hmacValid = verifyHMAC(raw, sig);
        if (!hmacValid) throw new Error("HMAC signature invalid");
      }
      
      res.json({ 
        ok: true, 
        jwt: payload, 
        hmac: hmacValid,
        verified_at: new Date().toISOString()
      });
    } catch (err) {
      res.status(401).json({ ok: false, error: err.message });
    }
  });
EOF

# 3️⃣ Create functions/package.json
cat > apexrebate-jwks/functions/package.json <<'EOF'
{
  "name": "jwks-verify-functions",
  "version": "1.0.0",
  "description": "Firebase Functions for JWKS signing and verification",
  "type": "module",
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-functions": "^4.5.0",
    "jsonwebtoken": "^9.0.2",
    "node-fetch": "^3.3.2"
  }
}
EOF

# 4️⃣ Create public/.well-known/jwks.json
cat > apexrebate-jwks/public/.well-known/jwks.json <<'EOF'
{
  "keys": [
    {
      "kty": "OKP",
      "crv": "Ed25519",
      "kid": "c5e8a1d913b27a1b",
      "use": "sig",
      "alg": "EdDSA",
      "x": "IQJwQwJlsOrzsmJxXrG1tJ2IjeUqXLytDE_1xVjPpEAo"
    }
  ]
}
EOF

# 5️⃣ Create Postman collection
cat > apexrebate-jwks/tests/apexrebate-jwks-auto.postman_collection.json <<'EOF'
{
  "info": {
    "name": "ApexRebate JWKS + HMAC Auto Test",
    "description": "Automated test suite for JWT signing and verification",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1️⃣ Sign JWT",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Sign returns token', function() {",
              "  const res = pm.response.json();",
              "  pm.expect(res.ok).to.be.true;",
              "  pm.expect(res.token).to.exist;",
              "  pm.environment.set('jwt_token', res.token);",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": {
          "mode": "raw",
          "raw": "{\"claims\":{\"sub\":\"user123\",\"role\":\"admin\"}}"
        },
        "url": "{{FIREBASE_URL}}/sign"
      }
    },
    {
      "name": "2️⃣ Verify JWT",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Verify returns payload', function() {",
              "  const res = pm.response.json();",
              "  pm.expect(res.ok).to.be.true;",
              "  pm.expect(res.jwt.sub).to.equal('user123');",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [
          { "key": "Authorization", "value": "Bearer {{jwt_token}}" }
        ],
        "url": "{{FIREBASE_URL}}/verify"
      }
    },
    {
      "name": "3️⃣ Verify JWT + HMAC",
      "event": [
        {
          "listen": "prerequest",
          "script": {
            "exec": [
              "const body = JSON.stringify({test: 'hmac'});",
              "const signature = CryptoJS.HmacSHA256(body, pm.environment.get('BROKER_HMAC')).toString();",
              "pm.environment.set('hmac_signature', signature);"
            ]
          }
        },
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('HMAC validation passes', function() {",
              "  const res = pm.response.json();",
              "  pm.expect(res.ok).to.be.true;",
              "  pm.expect(res.hmac).to.be.true;",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "header": [
          { "key": "Authorization", "value": "Bearer {{jwt_token}}" },
          { "key": "x-broker-signature", "value": "{{hmac_signature}}" },
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"test\":\"hmac\"}"
        },
        "url": "{{FIREBASE_URL}}/verify"
      }
    }
  ]
}
EOF

# 6️⃣ Create README
cat > apexrebate-jwks/README.md <<'EOF'
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
EOF

# 7️⃣ Create deployment checklist
cat > apexrebate-jwks/DEPLOYMENT_CHECKLIST.md <<'EOF'
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
EOF

# 8️⃣ Create ZIP file
echo "📦 Creating ZIP package..."
zip -r apexrebate-jwks.zip apexrebate-jwks -x "*.DS_Store" "*/node_modules/*"

# 9️⃣ Create extraction script for agents
cat > apexrebate-jwks/AGENT_SETUP.sh <<'EOF'
#!/bin/bash
# 🤖 VS Code Agent Setup Script
# Run this after extracting ZIP

echo "🤖 Setting up JWKS + HMAC pipeline..."

cd functions
echo "📦 Installing dependencies..."
npm install

echo "🔥 Deploying to Firebase..."
firebase deploy --only functions:sign,functions:verify

echo "✅ Deployment complete!"
echo "🧪 Next: Import tests/apexrebate-jwks-auto.postman_collection.json"
echo "    and run collection to verify full pipeline."
EOF

chmod +x apexrebate-jwks/AGENT_SETUP.sh

echo "✅ Package created: apexrebate-jwks.zip"
echo "📂 Total size: $(du -sh apexrebate-jwks.zip | cut -f1)"
echo ""
echo "🎯 Next steps:"
echo "1. Share apexrebate-jwks.zip with team"
echo "2. Extract and run: bash AGENT_SETUP.sh"
echo "3. Test with Postman collection"
