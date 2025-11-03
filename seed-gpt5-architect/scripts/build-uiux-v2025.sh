#!/bin/bash
# ===========================================
# 🧠 GPT-5 × Codex UI/UX Reconstruction 2025
# ===========================================
set -e
echo "🚀 Khởi tạo kiến trúc UI/UX GPT-5 …"

# 1️⃣ Kiểm tra specs
[ -f specs/uiux_v2025.design.json ] || { echo "❌ Thiếu specs/uiux_v2025.design.json"; exit 1; }

# 2️⃣ Gọi GPT-5 thông qua Codex để sinh component
codex --architect gpt5 --spec specs/uiux_v2025.design.json --output src/app/(uiux-v5)

# 3️⃣ Build & sync Prisma
npx prisma generate && npx prisma migrate deploy

# 4️⃣ Deploy preview
vercel build --prod --force && vercel deploy --prebuilt --prod --force

echo "✅ UI/UX GPT-5 tái thiết hoàn tất!"
