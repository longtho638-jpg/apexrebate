#!/usr/bin/env node
import fs from "fs";
const url = process.argv[2];
if (!url) {
  console.error("❌ Missing URL");
  process.exit(1);
}
fs.writeFileSync(".vercel-url", url);
console.log("✔ Saved", url, "→ .vercel-url");
