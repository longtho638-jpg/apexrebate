#!/usr/bin/env node
/**
 * Sinh file OTel summary mock để test dashboard SLO.
 * Thực tế bạn nên export JSON từ collector → chuyển về định dạng tương tự.
 */
import fs from "fs";
const targets = JSON.parse(fs.readFileSync("scripts/rollout/targets.json","utf8"));
const paths = targets.paths || ["/","/api/health"];
const rand = (a,b)=> Math.round(a + Math.random()*(b-a));
const data = paths.map(p => ({
  route: p,
  count: rand(300, 2000),
  errors: rand(0, 5),
  p95_ms: rand(120, 420),
  p99_ms: rand(200, 800)
}));
fs.mkdirSync("evidence/otel",{recursive:true});
fs.writeFileSync("evidence/otel/summary.json", JSON.stringify({ ts: Date.now(), data }, null, 2));
console.log("✔ wrote evidence/otel/summary.json");
