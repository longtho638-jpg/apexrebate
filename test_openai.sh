#!/bin/bash
# ==========================================
# 🧠 OpenAI Environment Health Checker
# ==========================================

echo "🚀 Kiểm tra môi trường OpenAI CLI..."
echo "------------------------------------"

# 1️⃣ Kiểm tra biến môi trường
if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ OPENAI_API_KEY chưa được nạp (source openai.env trước)."
  exit 1
else
  echo "✅ Key đã nạp: $(echo $OPENAI_API_KEY | head -c 12)..."
fi

# 2️⃣ Kiểm tra CLI
if ! command -v openai &> /dev/null; then
  echo "❌ CLI chưa cài. Cài bằng: pip install openai"
  exit 1
else
  echo "✅ CLI có sẵn: $(openai --version)"
fi

# 3️⃣ Test gọi API models.list
echo "------------------------------------"
echo "🔍 Đang kiểm tra kết nối API..."
start=$(date +%s%3N)
openai api models.list --limit 1 &> /tmp/openai_test.json
exitcode=$?
end=$(date +%s%3N)
latency=$((end - start))

if [ $exitcode -eq 0 ]; then
  model=$(jq -r '.data[0].id' /tmp/openai_test.json 2>/dev/null)
  echo "✅ API hoạt động tốt. Mẫu đầu tiên: $model"
  echo "⚡ Latency: ${latency}ms"
else
  echo "❌ Lỗi khi gọi API (code $exitcode)"
  cat /tmp/openai_test.json
  exit 1
fi

# 4️⃣ Test small completion
echo "------------------------------------"
echo "💬 Test tạo response ngắn..."
resp=$(openai api chat.completions.create -m gpt-4o -g user "Nói 'Xin chào ApexRebate'" --max-tokens 10 2>/dev/null | jq -r '.choices[0].message.content')
if [ -n "$resp" ]; then
  echo "✅ Phản hồi: $resp"
else
  echo "⚠️ API trả về rỗng hoặc có lỗi."
fi

echo "------------------------------------"
echo "🎯 Hoàn tất kiểm tra môi trường."

