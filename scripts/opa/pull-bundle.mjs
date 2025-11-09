#!/usr/bin/env node
/**
 * Kéo bundle active từ API → render ra các file .rego trong packages/policy/_runtime
 * để OPA sidecar load cùng với policy cứng.
 */
import fs from "fs";
import path from "path";

const BASE = process.env.BUNDLE_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
const URL = process.env.BUNDLE_URL || `${BASE}/api/policy/bundle/active`;
const DIR = "packages/policy/_runtime";

const res = await fetch(URL).catch(() => null);
if (!res || !res.ok) {
  console.error("❌ pull-bundle: cannot fetch", URL);
  process.exit(1);
}
const json = await res.json();
const entries = json?.entries || {};
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR, { recursive: true });
for (const [name, content] of Object.entries(entries)) {
  const file = path.join(DIR, String(name));
  fs.writeFileSync(file, String(content));
  console.log("∙ wrote", file);
}
console.log("✔ runtime bundle rendered:", Object.keys(entries).length, "files");
