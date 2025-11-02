---
name: codex-auto-merge
description: "Tự động merge Pull Request sau khi codex-merge-fix pass."
---

# Codex Auto Merge Agent

**Trigger:** `@codex-auto-merge run`

## 🎯 Mục tiêu
Tự động merge các Pull Request đã pass kiểm tra lint/build của `codex-merge-fix`.

## 🚀 Cách hoạt động
1. Xác định PR hiện tại từ ngữ cảnh (`GITHUB_REF`).
2. Kiểm tra kết quả workflow "Codex Merge Fix Runner".
3. Nếu job `codex-merge-fix` kết thúc thành công → tự động merge PR.
4. Nếu có conflict hoặc chưa được approve → tạo comment cảnh báo.

## 💡 Cách sử dụng
Trong phần **comment** của PR:
```
@codex-auto-merge run
```

Hoặc trong Copilot Chat:
```
@codex-auto-merge please merge this PR
```

## ⚠️ Lưu ý
- Cần bật quyền `pull-requests: write` trong workflow.
- Chỉ hoạt động khi tất cả checks đã pass.
