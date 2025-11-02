---
name: codex-merge-fix
description: "Tự động kiểm tra PR, chạy lint, build, và đề xuất merge preview khi pass."
---

# Codex Merge Fix Agent

**Trigger:** `@codex-merge-fix`

## 🎯 Purpose
- Khi PR bị lỗi merge hoặc lint (Codex block),
- Agent này sẽ hướng dẫn xử lý conflict, chạy lint/build local hoặc CI,
- Và nếu pass, đề xuất auto-merge qua comment "✅ Ready to merge".

## 🧩 How it works
1. Xác định PR đang mở (qua `GITHUB_REF`).
2. Chạy `npm ci && npm run lint && npm run build`.
3. Nếu tất cả pass → tạo comment `✅ Lint & build passed on PR #...`.
4. Nếu fail → comment `❌ Check logs`.

## 🔧 To trigger
Trong PR, comment:
```
@codex-merge-fix run
```

Hoặc trong Copilot Chat:
```
@codex-merge-fix please check this PR
```
