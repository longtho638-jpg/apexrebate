#!/usr/bin/env node
/**
 * Pack Rego → JSON bundle nhẹ (để app đọc và forward tới OPA sidecar nếu có).
 * Ở mức tối thiểu, ta chỉ gom file nội dung txt.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../../packages/policy");
const files = ["rollout_allow.rego", "payouts.rego"].map((f) =>
  path.join(root, f)
);

const bundle = { version: 1, entries: {} };

for (const f of files) {
  if (fs.existsSync(f)) {
    bundle.entries[path.basename(f)] = fs.readFileSync(f, "utf8");
  }
}
fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/policy-bundle.json", JSON.stringify(bundle, null, 2));
console.log("✔ policy bundle → dist/policy-bundle.json");
