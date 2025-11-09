#!/usr/bin/env node
import { createHash } from "crypto";
import { execSync } from "child_process";
import fs from "fs";
import { importPKCS8, SignJWT } from "jose";

const commit =
  process.env.GITHUB_SHA ||
  execSync("git rev-parse HEAD").toString().trim();

const listTargets = () => {
  const picks = [
    "package.json",
    "next.config.mjs",
    "src/app",
    "src/components",
    "src/lib"
  ];
  const exists = [];
  for (const p of picks) if (fs.existsSync(p)) exists.push(p);
  return exists;
};

const sha256File = (p) => {
  if (fs.statSync(p).isDirectory()) return { path: p, sha256: null, dir: true };
  const data = fs.readFileSync(p);
  const h = createHash("sha256").update(data).digest("hex");
  return { path: p, sha256: h, dir: false };
};

const targets = listTargets();
const manifest = targets.map(sha256File);
fs.mkdirSync("evidence", { recursive: true });
fs.writeFileSync(
  "evidence/manifest.json",
  JSON.stringify({ commit, manifest, created_at: new Date().toISOString() }, null, 2)
);

const pem = process.env.JWKS_PRIVATE || "";
if (!pem) {
  console.error("❌ Missing JWKS_PRIVATE");
  process.exit(1);
}
const key = await importPKCS8(pem, "RS256");
const jwt = await new SignJWT({ commit, manifest })
  .setProtectedHeader({ alg: "RS256", kid: process.env.JWKS_KID })
  .setIssuedAt()
  .setExpirationTime("15m")
  .sign(key);

fs.writeFileSync(
  "evidence/evidence.json",
  JSON.stringify({ commit, jwt }, null, 2)
);
console.log("✔ evidence signed → evidence/evidence.json");
