---
name: codex-auto-merge
description: "Tự động merge Pull Request sau khi auto-approve."
---

# Codex Auto Merge Agent

**Trigger:** `@codex-auto-merge run`

## 🎯 Mục tiêu
Tự động merge các PR đã được auto-approve & pass check.

## 🚀 Cách hoạt động
1. Kiểm tra review status.
2. Nếu đã có approval & pass checks → merge và xóa branch.
3. Nếu chưa đủ điều kiện → comment thông báo.

## 💡 Cách sử dụng
Trong PR comment:
```
@codex-auto-merge run
```

Hoặc trong Copilot Chat:
```
@codex-auto-merge please merge this PR
```

## ⚠️ Lưu ý
- Cần quyền `pull-requests: write` và `contents: write`.
- Không merge PR có conflict hoặc chưa được approve.
