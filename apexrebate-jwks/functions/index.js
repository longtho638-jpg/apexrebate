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
