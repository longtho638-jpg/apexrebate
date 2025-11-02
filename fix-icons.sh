#!/bin/bash
echo "🔧 Bắt đầu vá lucide-react icons..."

sed -i '' 's/\bMemory\b/MemoryStick as Memory/g' src/components/monitoring/performance-optimization.tsx
sed -i '' 's/\bMemory\b/MemoryStick as Memory/g' src/components/monitoring/system-monitoring-dashboard.tsx
sed -i '' 's/\bTelegram\b/Send/g' src/app/referrals/page.tsx

echo "✅ Vá hoàn tất lucide-react icons."
