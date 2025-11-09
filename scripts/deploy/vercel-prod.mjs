#!/usr/bin/env node
import { $ } from "zx";
import fs from "fs";
$.verbose = false;

if (!process.env.VERCEL_TOKEN) {
  console.error("❌ Missing VERCEL_TOKEN");
  process.exit(1);
}
if (!fs.existsSync(".vercel-url")) {
  console.error("❌ No preview URL found. Run preview first.");
  process.exit(1);
}
await $`VERCEL_TOKEN=${process.env.VERCEL_TOKEN} vercel --prod --prebuilt`;
console.log("✔ Promoted to production");
