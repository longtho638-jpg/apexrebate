---
name: codex-fullchain
description: "Kích hoạt pipeline tự động: validate → approve → merge → deploy."
---

# Codex FullChain Agent

**Trigger:** `@codex fullchain`

## 🎯 Mục tiêu
Chạy toàn bộ chuỗi CI/CD của dự án theo thứ tự:
1. `@codex-merge-fix run` → kiểm lint/build
2. `@codex-auto-approve run` → tự approve PR
3. `@codex-auto-merge run` → merge PR vào `main`
4. `@codex-deploy run` → build & deploy Firebase/Cloud Run

## 🧠 Cách hoạt động
- Agent này sẽ trigger lần lượt các workflow liên quan qua `gh workflow run`.
- Khi một giai đoạn fail, nó dừng lại và ghi log lỗi trong PR comment.
- Khi tất cả pass → comment ✅ Deployment completed successfully.

## 💡 Cách dùng
Trong PR comment:

```bash
@codex fullchain
```

Hoặc trong Copilot Chat:

```bash
@codex fullchain run pipeline
```

## ⚠️ Lưu ý
- Chỉ hoạt động khi tất cả các agent khác (`merge-fix`, `auto-approve`, `auto-merge`, `deploy`) đã có file định nghĩa.
- Yêu cầu quyền `actions: write` và `pull-requests: write`.
