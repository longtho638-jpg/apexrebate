#!/usr/bin/env node
import fs from "fs";

const evidencePath = process.argv[2] || "evidence/evidence.json";
const ev = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
const gate = JSON.parse(fs.readFileSync("scripts/policy/gate.json", "utf8"));
const guard = JSON.parse(fs.readFileSync("evidence/guardrails.json", "utf8"));

const allow =
  guard.p95_edge <= gate.p95_edge &&
  guard.p95_node <= gate.p95_node &&
  guard.error_rate <= gate.error_rate &&
  guard.e2e_pass === true &&
  !!ev.jwt;

if (!allow) {
  console.error("❌ Policy check failed", { guard, gate });
  process.exit(1);
}
console.log("✔ Policy allow");
