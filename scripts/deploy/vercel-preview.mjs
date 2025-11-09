#!/usr/bin/env node
import { $ } from "zx";
$.verbose = false;

if (!process.env.VERCEL_TOKEN) {
  console.error("❌ Missing VERCEL_TOKEN");
  process.exit(1);
}

await $`VERCEL_TOKEN=${process.env.VERCEL_TOKEN} vercel pull --yes --environment=preview`;
const out = await $`VERCEL_TOKEN=${process.env.VERCEL_TOKEN} vercel deploy --prebuilt`;
const url = String(out.stdout).trim().split("\n").pop();
console.log("✔ Preview URL:", url);
await $`node scripts/rollout/save-url.mjs ${url} preview`;
