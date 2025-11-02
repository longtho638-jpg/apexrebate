---
name: codex-merge-fix
description: "Kiểm tra PR bị Codex block, chạy lint/build, và hướng dẫn merge preview."
---

# Codex Merge Fix Agent

**Trigger:** `@codex-merge-fix run`

## 🎯 Mục tiêu
Giúp tự động kiểm tra Pull Request có lỗi lint/build hoặc xung đột merge:
- Phát hiện conflict và gợi ý lệnh terminal fix.
- Chạy thử `npm ci && npm run lint && npm run build`.
- Nếu pass → đề xuất merge.

## 🚀 Cách dùng
Trong phần **comment** của PR đang mở, gõ:

```
@codex-merge-fix run
```

Hoặc trong Copilot Chat, thử:
```
@codex-merge-fix please check this PR
```

Agent sẽ hiện hộp thoại xác nhận để chạy kiểm tra.  
Nếu workflow `agent-dispatch.yml` đã có (hoặc được thêm sau), nó sẽ tự động chạy CI cho nhánh hiện tại.
