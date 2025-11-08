# 🧠 ApexRebate GPT-5 Architect UI/UX 2025

## Cách chạy
```bash
chmod +x scripts/build-uiux-v2025.sh
./scripts/build-uiux-v2025.sh
```

## Pipeline GPT-5 × Codex

1. GPT-5 đọc `specs/uiux_v2025.design.json` → sinh layout.
2. Codex biên dịch ra JSX + Tailwind.
3. Prisma sync Neon DB.
4. Vercel build + deploy.

## Hướng dẫn dán-là-chạy
```bash
# Bước 1: dán toàn bộ cây thư mục này vào Codex workspace
# Bước 2: chạy lệnh
codex run scripts/build-uiux-v2025.sh
# Bước 3: mở preview từ Vercel
```

Cách này giúp **GPT-5 hiểu toàn bộ context kiến trúc**, render lại giao diện theo **UI/UX 2025**, rồi Codex tự build + deploy.

Anh chỉ cần copy nguyên block này vào Codex (hoặc VS Code Codex CLI) là nó tự khởi động pipeline full-stack SEED GPT-5.

→ **Một lệnh duy nhất, không cần unzip gì cả.**
