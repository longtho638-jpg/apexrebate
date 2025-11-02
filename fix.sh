#!/bin/bash
echo "🔧 Bắt đầu vá lỗi ApexRebate (lucide-react, auth, ZAI)..."

# --- Lucide icon fixes ---
echo "🧩 Vá lucide-react icons (Memory → MemoryStick, Telegram → Send)..."
grep -rl "Memory" src/components/monitoring | xargs sed -i '' 's/\bMemory\b/MemoryStick/g'
grep -rl "Telegram" src/app/referrals | xargs sed -i '' 's/\bTelegram\b/Send/g'

# --- Auth import fixes ---
echo "🔐 Vá lỗi auth import..."
find src/app/api/tools -type f -name "*.ts" -exec sed -i '' 's/import { auth }/import { authOptions }/' {} \;

# --- ZAI import fixes ---
echo "⚙️ Vá lỗi ZAI import..."
sed -i '' 's/import { ZAI } from '\''z-ai-web-dev-sdk'\''/import ZAI from '\''z-ai-web-dev-sdk'\''/' src/lib/marketing-automation.ts

echo "✅ Vá hoàn tất."
