#!/bin/bash
# =======================================================
# 🌐 OpenAI CLI Health & Quota Checker (v2 - macOS fixed)
# =======================================================

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RESET="\033[0m"

echo -e "${CYAN}🚀 Kiểm tra môi trường OpenAI CLI...${RESET}"
echo "------------------------------------"

# 1️⃣ Nạp openai.env nếu chưa có key
if [ -z "$OPENAI_API_KEY" ]; then
  if [ -f ~/apexrebate-1/openai.env ]; then
    source ~/apexrebate-1/openai.env
    echo -e "${YELLOW}⚠️  Đã tự động nạp openai.env${RESET}"
  else
    echo -e "${RED}❌ OPENAI_API_KEY chưa được nạp và không tìm thấy openai.env${RESET}"
    exit 1
  fi
fi

# 2️⃣ Kiểm tra CLI
if ! command -v openai &> /dev/null; then
  echo -e "${RED}❌ CLI chưa cài. Cài bằng: pip install openai${RESET}"
  exit 1
else
  version=$(openai --version)
  echo -e "${GREEN}✅ CLI có sẵn: ${version}${RESET}"
fi

# 3️⃣ Kiểm tra models
echo "------------------------------------"
echo -e "${CYAN}🔍 Đang kiểm tra kết nối API...${RESET}"
start=$(date +%s)
openai api models.list > /tmp/openai_models.json 2>/tmp/openai_error.log
exitcode=$?
end=$(date +%s)
latency=$((end - start))

if [ $exitcode -eq 0 ]; then
  model=$(jq -r '.data[0].id' /tmp/openai_models.json 2>/dev/null)
  if [ -n "$model" ]; then
    echo -e "${GREEN}✅ API hoạt động. Model đầu tiên: ${model}${RESET}"
  else
    echo -e "${YELLOW}⚠️  Không trích xuất được model (CLI v2 có thể đổi format).${RESET}"
  fi
  echo -e "⚡ Latency: ${YELLOW}${latency}s${RESET}"
else
  echo -e "${RED}❌ Lỗi khi gọi API (code $exitcode)${RESET}"
  cat /tmp/openai_error.log
  exit 1
fi

# 4️⃣ Kiểm tra usage/quota
echo "------------------------------------"
echo -e "${CYAN}💰 Kiểm tra quota/usage...${RESET}"
openai api usage.retrieve &>/tmp/usage_output.log
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Truy xuất usage thành công.${RESET}"
else
  echo -e "${YELLOW}⚠️ Không thể truy xuất quota (CLI có thể chưa hỗ trợ).${RESET}"
fi

# 5️⃣ Test chat nhỏ
echo "------------------------------------"
echo -e "${CYAN}💬 Test phản hồi gpt-4o...${RESET}"
start=$(date +%s)
resp=$(openai api chat.completions.create -m gpt-4o -g user "Xin chào ApexRebate" --max-tokens 10 2>/dev/null | jq -r '.choices[0].message.content')
end=$(date +%s)
latency=$((end - start))

if [ -n "$resp" ]; then
  echo -e "${GREEN}✅ Phản hồi: ${resp}${RESET}"
  echo -e "⚡ Latency: ${YELLOW}${latency}s${RESET}"
else
  echo -e "${RED}❌ API chat trả về rỗng hoặc có lỗi.${RESET}"
fi

echo "------------------------------------"
echo -e "${GREEN}🎯 Hoàn tất kiểm tra môi trường OpenAI.${RESET}"
#!/bin/bash
# =======================================================
# 🌐 OpenAI CLI Health & Quota Checker (v2)
# Author: GPT-5 Architect OS
# =======================================================

# Màu terminal
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RESET="\033[0m"

echo -e "${CYAN}🚀 Kiểm tra môi trường OpenAI CLI...${RESET}"
echo "------------------------------------"

# 1️⃣ Nạp biến môi trường nếu chưa có
if [ -z "$OPENAI_API_KEY" ]; then
  if [ -f ~/apexrebate-1/openai.env ]; then
    source ~/apexrebate-1/openai.env
    echo -e "${YELLOW}⚠️  Đã tự động nạp openai.env${RESET}"
  else
    echo -e "${RED}❌ OPENAI_API_KEY chưa được nạp và không tìm thấy openai.env${RESET}"
    exit 1
  fi
fi

# 2️⃣ Kiểm tra CLI
if ! command -v openai &> /dev/null; then
  echo -e "${RED}❌ CLI chưa cài. Cài bằng: pip install openai${RESET}"
  exit 1
else
  version=$(openai --version)
  echo -e "${GREEN}✅ CLI có sẵn: ${version}${RESET}"
fi

# 3️⃣ Kiểm tra key có hợp lệ không
echo "------------------------------------"
start=$(date +%s%3N)
openai api models.list --limit 1 &> /tmp/openai_test.json
exitcode=$?
end=$(date +%s%3N)
latency=$((end - start))

if [ $exitcode -eq 0 ]; then
  model=$(jq -r '.data[0].id' /tmp/openai_test.json 2>/dev/null)
  echo -e "${GREEN}✅ API hoạt động. Model đầu tiên: ${model}${RESET}"
  echo -e "⚡ Latency: ${YELLOW}${latency}ms${RESET}"
else
  echo -e "${RED}❌ Lỗi khi gọi API (code $exitcode)${RESET}"
  cat /tmp/openai_test.json
  exit 1
fi

# 4️⃣ Kiểm tra usage/quota
echo "------------------------------------"
echo -e "${CYAN}💰 Kiểm tra quota/usage...${RESET}"

usage=$(openai api usage.retrieve 2>/tmp/usage_error.log)
if [ $? -eq 0 ]; then
  total=$(echo "$usage" | jq '.data | length')
  echo -e "${GREEN}✅ Truy xuất usage thành công (${total} bản ghi).${RESET}"
else
  echo -e "${YELLOW}⚠️ Không thể truy xuất quota (không phải lỗi nghiêm trọng).${RESET}"
fi

# 5️⃣ Test chat nhỏ
echo "------------------------------------"
echo -e "${CYAN}💬 Test phản hồi gpt-4o...${RESET}"
start=$(date +%s%3N)
resp=$(openai api chat.completions.create -m gpt-4o -g user "Xin chào ApexRebate" --max-tokens 10 2>/dev/null | jq -r '.choices[0].message.content')
end=$(date +%s%3N)
latency=$((end - start))

if [ -n "$resp" ]; then
  echo -e "${GREEN}✅ Phản hồi: ${resp}${RESET}"
  echo -e "⚡ Latency: ${YELLOW}${latency}ms${RESET}"
else
  echo -e "${RED}❌ API chat trả về rỗng hoặc có lỗi.${RESET}"
fi

echo "------------------------------------"
echo -e "${GREEN}🎯 Hoàn tất kiểm tra môi trường OpenAI.${RESET}"
