#!/usr/bin/env node
import { $ } from "zx";
$.verbose = false;
try {
  await $`git revert --no-edit HEAD`;
  await $`git push origin HEAD:main`;
  console.log("✔ Rollback triggered via git revert");
} catch (e) {
  console.error("❌ Rollback failed:", e?.stderr || e?.message);
  process.exit(1);
}
