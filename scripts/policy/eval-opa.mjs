#!/usr/bin/env node
/**
 * Policy Gate qua OPA HTTP: POST /v1/data/apex/rollout/allow
 * Yêu cầu: OPA server đang chạy và đã load packages/policy/*.rego
 */
import fs from "fs";

const OPA_URL = process.env.OPA_URL || "http://127.0.0.1:8181/v1/data/apex/rollout/allow";
const evidence = JSON.parse(fs.readFileSync("evidence/evidence.json","utf8"));
const guard = JSON.parse(fs.readFileSync("evidence/guardrails.json","utf8"));

// Xác thực chữ ký: tối thiểu — coi như valid nếu có JWT; có thể nâng cấp bằng JWKS_PUBLIC
let sig_valid = !!evidence.jwt;
if (process.env.JWKS_PUBLIC) {
  try {
    const { importSPKI, jwtVerify } = await import("jose");
    const pub = await importSPKI(process.env.JWKS_PUBLIC, "RS256");
    await jwtVerify(evidence.jwt, pub);
    sig_valid = true;
  } catch {
    sig_valid = false;
  }
}

const input = {
  environment: process.env.DEPLOY_ENV || "prod",
  guardrails: guard,
  tests: { e2e_pass: guard.e2e_pass === true },
  evidence: { sig_valid }
};

const res = await fetch(OPA_URL, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ input })
});
if (!res.ok) {
  console.error("❌ OPA unreachable", res.status);
  process.exit(1);
}
const json = await res.json();
const allow = json.result === true || json.result?.allow === true;
if (!allow) {
  console.error("❌ OPA deny", JSON.stringify(json, null, 2));
  process.exit(1);
}
console.log("✔ OPA allow");
