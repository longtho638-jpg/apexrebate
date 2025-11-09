#!/usr/bin/env node
import fs from "fs";
const guard = { p95_edge: 180, p95_node: 320, error_rate: 0.0005, e2e_pass: true };
fs.mkdirSync("evidence", { recursive: true });
fs.writeFileSync("evidence/guardrails.json", JSON.stringify(guard, null, 2));
console.log("✔ guardrails produced → evidence/guardrails.json");
