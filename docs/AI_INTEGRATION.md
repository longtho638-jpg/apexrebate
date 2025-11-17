# AI Integration – Qwen backend cho Claude Code & Codex 5.1

> Mục tiêu: bật chế độ agentic tự động (Claude Code ⇆ Codex UI) nhưng dùng Qwen miễn phí. Sau khi chạy script bên dưới, bạn chỉ cần cung cấp API key là có thể dùng `claude`, `codex-5.1` và toàn bộ `npm run qwen:*`.

---

## 1. Lấy QWEN_API_KEY (free tier 2.000 req/ngày)

| Cách | Bước |
|------|------|
| **QwenChat CLI (khuyên dùng)** | 1) Chạy `qwen` ➝ đăng nhập<br>2) Key sẽ được cache tại `~/.qwen/credentials.json` |
| **Alibaba DashScope** | 1) Truy cập https://dashscope.console.aliyun.com/apiKey<br>2) Tạo API key mới<br>3) Ghi chú: `export QWEN_API_KEY="sk-..."` |

---

## 2. Kích hoạt chế độ agentic

```bash
cd /Users/macbookprom1/apexrebate-1
QWEN_API_KEY="sk-..." bash scripts/setup-qwen-codex.sh
# Hoặc: bash scripts/setup-qwen-codex.sh --key sk-...
```

Script sẽ tự động:

- Tạo `~/.config/apex-qwen-codex/env.sh` và nối vào `~/.zshrc`
- Ghi `~/.claude/settings.json` (`provider=openai`, `model=qwen3-coder-30b`, alias claude → qwen)
- Ghi `~/.codex/config.js` (Codex 5.1 UI → claude CLI → Qwen)
- Đặt rate-limit 50 req/phút, delay 1s để không vượt quota free

Sau khi chạy xong, mở terminal mới hoặc `source ~/.zshrc`.

---

## 3. Codex UI & repo config

- Dùng file mẫu `.codexrc.example` trong repo ➝ copy thành `.codexrc` nếu muốn chạy `codex-5.1 --config .codexrc`.
- Các biến ENV tự động export: `QWEN_API_KEY`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `CLAUDE_MODEL`, `CODEX_UI`.
- Bạn chỉ cần cập nhật giá trị API key; các file còn lại đã sẵn sàng.

```bash
codex-5.1 --config .codexrc.example        # UI kit.cc với backend Qwen
claude "Viết hàm Python đọc file 1GB"      # Claude Code → DashScope
```

---

## 4. Test nóng sau khi bật

1. `claude "Ping từ ApexRebate"` ➝ phản hồi phải tới từ Qwen.
2. Mở Codex 5.1 UI (kit.cc), gửi prompt, check network tab phải gọi `dashscope.aliyuncs.com`.
3. `for i in {1..10}; do claude "echo test"; done` ➝ đảm bảo không bị rate limit.
4. Tại repo:
   - `npm run qwen:explain`
   - `npm run qwen:test`
   - `bash scripts/qwen-quick-start.sh test`

---

## 5. Tùy chỉnh nâng cao

- `bash scripts/setup-qwen-codex.sh --model qwen2.5-coder-32b` để đổi model mặc định.
- `--base-url https://dashscope-intl.aliyuncs.com/compatible-mode/v1` nếu dùng region quốc tế.
- Dùng `--force` khi muốn ghi đè cấu hình cũ (script sẽ tự backup `.bak`).

---

## 6. Checklist bàn giao

- [x] `.codexrc` đã được ignore ➝ không sợ lộ key
- [x] Script executable `scripts/setup-qwen-codex.sh`
- [x] `.codexrc.example` làm template cho kit.cc
- [x] Tài liệu hướng dẫn tại `docs/AI_INTEGRATION.md`

👉 Việc còn lại của bạn: **cung cấp API key** và chạy script (hoặc export trước rồi chạy). Tất cả công cụ Qwen/Claude/Codex trong repo sẽ hoạt động ngay.
