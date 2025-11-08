#!/bin/bash
# ===========================================
# 🧠 GPT-5 × Codex UI/UX Reconstruction 2025
# ===========================================
set -e
echo "🚀 Khởi tạo kiến trúc UI/UX GPT-5 …"

# 1️⃣ Kiểm tra specs
if [ -f specs/uiux_v2025.design.json ]; then
  echo "✅ Tìm thấy specs/uiux_v2025.design.json"
else
  echo "⚠️  Không tìm thấy specs - bỏ qua codegen"
fi

# 2️⃣ Component generation (sẽ được thực hiện thủ công hoặc qua Copilot)
echo "ℹ️  Codex CLI không có sẵn - bỏ qua auto-generation"
echo "💡 Sử dụng GitHub Copilot hoặc tạo components thủ công từ specs"

# 3️⃣ Chuyển về project root và build
cd ..
echo "📦 Đang build Next.js..."
npm run build

# 4️⃣ Sync Prisma
echo "🗄️  Đang sync Prisma..."
npx prisma generate

# 5️⃣ Deploy
echo "🚀 Sẵn sàng deploy - chạy 'vercel --prod' hoặc push lên GitHub"
echo "✅ Seed architecture đã sẵn sàng!"
