---
name: codex-auto-approve
description: "Tự động approve Pull Request nếu tất cả check pass."
---

# Codex Auto Approve Agent

**Trigger:** `@codex-auto-approve run`

## 🎯 Mục tiêu
Tự động review và approve PR khi `codex-merge-fix` pass lint/build.

## 🚀 Cách hoạt động
1. Kiểm tra trạng thái workflow "Codex Merge Fix Runner".
2. Nếu pass → tạo review comment "✅ Auto-approved by codex-auto-approve".
3. Nếu fail → báo lỗi trong PR.

## 💡 Cách sử dụng
Trong comment PR:
```
@codex-auto-approve run
```

Hoặc trong Copilot Chat:
```
@codex-auto-approve please review this PR
```

## ⚠️ Lưu ý
- Cần quyền `pull-requests: write`.
- Chỉ hoạt động sau khi `codex-merge-fix` pass.
