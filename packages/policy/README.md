# ApexRebate Policy Bundles (OPA/Rego)

Thư mục này chứa policy tối thiểu:
- `rollout_allow.rego`: gate deploy (p95, error_rate, e2e pass, evidence signature).
- `payouts.rego`: nguyên tắc chi trả và clawback cơ bản.

## Build Bundle

```bash
npm run policy:bundle
```

`build-bundle.mjs` đóng gói về `dist/policy-bundle.json` (định dạng nhẹ để app đọc nhanh).
