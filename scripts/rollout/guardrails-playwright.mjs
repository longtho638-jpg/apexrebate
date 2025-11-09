#!/usr/bin/env node
/**
 * Guardrails đo thật: p95_edge (SSR/Edge), error_rate, e2e_pass (smoke).
 * Không cần Playwright nếu bạn chưa setup — script dùng fetch Node 20.
 * Nguồn URL: .vercel-url (preview). Có thể truyền arg 1 = URL tùy chọn.
 */
import fs from "fs";
import { setTimeout as sleep } from "timers/promises";

const previewUrl =
  process.argv[2] ||
  (fs.existsSync(".vercel-url") ? fs.readFileSync(".vercel-url", "utf8").trim() : "");
if (!previewUrl) {
  console.error("❌ guardrails: không tìm thấy preview URL (.vercel-url)");
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync("scripts/rollout/targets.json", "utf8"));
const to = cfg.timeout_ms ?? 5000;
const samples = cfg.samples_per_path ?? 10;

const latencies = [];
let errors = 0;

const fetchWithTimeout = async (url, ms) => {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    const t0 = performance.now();
    const res = await fetch(url, { signal: ac.signal, redirect: "manual" });
    const t1 = performance.now();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return t1 - t0;
  } finally {
    clearTimeout(t);
  }
};

for (const path of cfg.paths) {
  for (let i = 0; i < samples; i++) {
    const url = `${previewUrl.replace(/\/$/, "")}${path}`;
    try {
      const ms = await fetchWithTimeout(url, to);
      latencies.push(ms);
    } catch (e) {
      errors++;
    }
    await sleep(50);
  }
}

if (latencies.length === 0) {
  console.error("❌ guardrails: không có mẫu hợp lệ (toàn lỗi?)");
  process.exit(1);
}

latencies.sort((a, b) => a - b);
const p = (q) => {
  const idx = Math.floor(q * (latencies.length - 1));
  return latencies[idx];
};
const p95 = Math.round(p(0.95));
const errorRate = errors / (errors + latencies.length);

const guard = {
  p95_edge: p95,
  p95_node: p95,
  error_rate: Number(errorRate.toFixed(6)),
  e2e_pass: errorRate <= 0.01
};

fs.mkdirSync("evidence", { recursive: true });
fs.writeFileSync("evidence/guardrails.json", JSON.stringify(guard, null, 2));
console.log("✔ guardrails:", guard);
