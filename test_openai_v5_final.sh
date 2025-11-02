#!/bin/bash
# =======================================================
# 📧 OpenAI Health Monitor — Final v5 (Gmail WebApp Ready)
# =======================================================
# Author: Người hướng dẫn × GPT-5 Hybrid Mode
# Date: $(date +"%Y-%m-%d")
# Purpose: Health check OpenAI CLI → log → Gmail alert (via Google Apps Script)

# --- Load ENV ---
if [ -f ~/apexrebate-1/openai.env ]; then
  source ~/apexrebate-1/openai.env
  echo "✅ OpenAI ENV loaded."
else
  echo "❌ Missing openai.env — please create it first."
  exit 1
fi
#!/bin/bash
# ==========================================
# ✅ OPENAI V5 FINAL TEST SCRIPT (ApexRebate)
# Author: Người hướng dẫn
# Date: $(date +%Y-%m-%d)
# ==========================================
#!/bin/bash
# ==========================================
# ✅ OPENAI V5 FINAL-STABLE TEST SCRIPT (ApexRebate)
# Author: Người hướng dẫn
# Date: $(date +%Y-%m-%d)
# ==========================================

# 1️⃣ Load environment
source /Users/macbookprom1/apexrebate-1/.venv/bin/activate 2>/dev/null
source ~/apexrebate-1/openai.env 2>/dev/null

echo "🚀 Starting OpenAI V5 connectivity test..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="$HOME/apexrebate-1/test_openai_v5.log"

# 2️⃣ Run test request
RESPONSE=$(openai api chat.completions.create \
  -m gpt-4o-mini \
  -g user "ping test ApexRebate V5 Final" \
  --max-tokens 10 2>&1)

# 3️⃣ Extract message cleanly (handle both pong / sentence)
CONTENT=$(echo "$RESPONSE" | grep -o '"content": *"[^"]*"' | head -1 | sed 's/"content": *"//;s/"$//')

if [[ "$CONTENT" == *"pong"* || "$CONTENT" == *"Pong"* ]]; then
  STATUS="✅ SUCCESS"
  MESSAGE="OpenAI connected — $CONTENT"
else
  STATUS="❌ FAIL"
  MESSAGE="Unexpected response: $CONTENT"
fi

# 4️⃣ Log result
echo "[$TIMESTAMP] $STATUS | $MESSAGE" | tee -a "$LOG_FILE"

# 5️⃣ Send webhook
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"timestamp\": \"$TIMESTAMP\", \"status\": \"$STATUS\", \"message\": \"$MESSAGE\"}" \
  "https://script.google.com/macros/s/AKfycbwRRZK1JLLfg3Hsl2SxF_5tLoV34cDmnpZR27S5C_Q570-xghqTxMA9G18mlJ6hi7dp/exec" \
  > /dev/null 2>&1

echo "📬 Webhook sent — $STATUS"
echo "📜 Log file: $LOG_FILE"

# 1️⃣ Load virtualenv & OpenAI key
source /Users/macbookprom1/apexrebate-1/.venv/bin/activate
source ~/apexrebate-1/openai.env 2>/dev/null
#!/bin/bash
v# ==========================================
# ✅ OPENAI V5.1 FINAL-STABLE TEST (ApexRebate)
# ==========================================

source /Users/macbookprom1/apexrebate-1/.venv/bin/activate 2>/dev/null
source ~/apexrebate-1/openai.env 2>/dev/null

echo "🚀 Starting OpenAI V5.1 connectivity test..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="$HOME/apexrebate-1/test_openai_v5.log"

# 2️⃣ Corrected request syntax
RESPONSE=$(openai api chat.completions.create \
  -m gpt-4o-mini \
  -q "ping ApexRebate V5 Final" \
  --max-tokens 10 2>&1)

CONTENT=$(echo "$RESPONSE" | grep -o '"content": *"[^"]*"' | head -1 | sed 's/"content": *"//;s/"$//')

if [[ "$CONTENT" == *"pong"* || "$CONTENT" == *"Pong"* ]]; then
  STATUS="✅ SUCCESS"
  MESSAGE="OpenAI connected — $CONTENT"
else
  STATUS="❌ FAIL"
  MESSAGE="Unexpected response: $CONTENT"
fi

echo "[$TIMESTAMP] $STATUS | $MESSAGE" | tee -a "$LOG_FILE"

curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"timestamp\": \"$TIMESTAMP\", \"status\": \"$STATUS\", \"message\": \"$MESSAGE\"}" \
  "https://script.google.com/macros/s/AKfycbwRRZK1JLLfg3Hsl2SxF_5tLoV34cDmnpZR27S5C_Q570-xghqTxMA9G18mlJ6hi7dp/exec" \
  > /dev/null 2>&1

echo "📬 Webhook sent — $STATUS"
echo "📜 Log file: $LOG_FILE"

echo "🚀 Starting OpenAI V5 connectivity test..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="$HOME/apexrebate-1/test_openai_v5.log"

# 2️⃣ Run test request
RESPONSE=$(openai api chat.completions.create \
  -m gpt-4o-mini \
  -g user "ping ApexRebate V5 Final" \
  --max-tokens 10 2>&1)

# 3️⃣ Check response
if echo "$RESPONSE" | grep -q "pong"; then
  STATUS="✅ SUCCESS"
  MESSAGE="OpenAI V5 connection OK — $(echo "$RESPONSE" | grep -o '"content": *"[^"]*"' | head -1)"
else
  STATUS="❌ FAIL"
  MESSAGE="Error — $(echo "$RESPONSE" | head -3 | tr '\n' ' ')"
fi

# 4️⃣ Log result
echo "[$TIMESTAMP] $STATUS | $MESSAGE" | tee -a "$LOG_FILE"

# 5️⃣ Send result to Google Apps Script webhook
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"timestamp\": \"$TIMESTAMP\", \"status\": \"$STATUS\", \"message\": \"$MESSAGE\"}" \
  "https://script.google.com/macros/s/AKfycbwRRZK1JLLfg3Hsl2SxF_5tLoV34cDmnpZR27S5C_Q570-xghqTxMA9G18mlJ6hi7dp/exec" \
  > /dev/null 2>&1

echo "📬 Webhook sent — $STATUS"
echo "📜 Log file: $LOG_FILE"


# --- Config ---
WEBHOOK_URL="https://script.google.com/macros/s/AKfycbwRRZK1JLLfg3Hsl2SxF_5tLoV34cDmnpZR27S5C_Q570-xghqTxMA9G18mlJ6hi7dp/exec"
LOGFILE=~/apexrebate-1/openai_health.log
DATE_NOW=$(date +"%Y-%m-%d %H:%M:%S")
TMP_DIR=/tmp/openai_health
mkdir -p "$TMP_DIR"

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RESET="\033[0m"

echo -e "${CYAN}🚀 OpenAI Health Check — Final v5 (${DATE_NOW})${RESET}"
echo "----------------------------------------------"

# --- Step 1: Check CLI ---
if ! command -v openai >/dev/null 2>&1; then
  echo -e "${RED}❌ openai CLI chưa cài đặt. Run: pip install openai${RESET}"
  exit 1
else
  echo -e "${GREEN}✅ CLI detected: $(openai --version)${RESET}"
fi

# --- Step 2: Ping check ---
ping -c 2 api.openai.com > "$TMP_DIR/ping.log" 2>&1
PING_OK=$?
AVG_PING=$(grep "avg" "$TMP_DIR/ping.log" | awk -F'/' '{print $5}')
[ -z "$AVG_PING" ] && AVG_PING="N/A"

# --- Step 3: List models ---
openai api models.list -o json > "$TMP_DIR/models.json" 2>"$TMP_DIR/models_err.log"
API_OK=$?
MODEL_ID=$(jq -r '.data[0].id // .[0].id // empty' "$TMP_DIR/models.json" 2>/dev/null)
[ -z "$MODEL_ID" ] && MODEL_ID="null"

# --- Step 4: Chat test ---
CHAT_RESP=$(openai api chat.completions.create -m gpt-4o -g user "Health check ApexRebate $(date +%H:%M:%S)" --max-tokens 10 -o json 2>/dev/null)
CHAT_OK=$?
CHAT_MSG=$(echo "$CHAT_RESP" | jq -r '.choices[0].message.content // empty')
[ -z "$CHAT_MSG" ] && CHAT_MSG="(empty)"

# --- Step 5: Evaluate ---
STATUS="OK"
DETAILS=""
[ $PING_OK -ne 0 ] && STATUS="FAIL" && DETAILS+="❌ Ping lỗi\n"
[ $API_OK -ne 0 ] && STATUS="FAIL" && DETAILS+="❌ API lỗi\n"
[ $CHAT_OK -ne 0 ] && STATUS="FAIL" && DETAILS+="❌ Chat lỗi\n"
[ "$CHAT_MSG" = "(empty)" ] && STATUS="FAIL" && DETAILS+="❌ Chat không có phản hồi\n"

# --- Step 6: Log JSON ---
jq -n --arg time "$DATE_NOW" \
      --arg ping "$AVG_PING" \
      --arg model "$MODEL_ID" \
      --arg msg "$CHAT_MSG" \
      --arg status "$STATUS" \
      '{time:$time,ping_ms:$ping,model:$model,msg:$msg,status:$status}' >> "$LOGFILE"

# --- Step 7: Send Gmail Alert via WebApp ---
if [ "$STATUS" != "OK" ]; then
  echo -e "${RED}⚠️  Lỗi phát hiện — gửi cảnh báo Gmail...${RESET}"
  LOG_TAIL=$(tail -n 30 "$LOGFILE" | jq -s '.' 2>/dev/null)

  PAYLOAD=$(jq -n \
    --arg subject "⚠️ OpenAI Health Alert — $DATE_NOW" \
    --arg body "Tình trạng: $STATUS\nPing: $AVG_PING ms\nModel: $MODEL_ID\nPhản hồi: $CHAT_MSG\nChi tiết:\n$DETAILS" \
    --argjson log "$LOG_TAIL" \
    '{subject:$subject,body:$body,log:$log}')

  curl -s -X POST -H "Content-Type: application/json" \
    -d "$PAYLOAD" "$WEBHOOK_URL" >/dev/null 2>&1

  echo -e "${YELLOW}📨 Gmail alert sent via Apps Script.${RESET}"
else
  echo -e "${GREEN}✅ Hệ thống ổn định.${RESET}"
fi

# --- Step 8: Summary ---
echo "----------------------------------------------"
echo -e "📊 Ping: ${AVG_PING} ms | Model: ${MODEL_ID}"
echo -e "💬 Chat: ${CHAT_MSG}"
echo -e "🏁 Status: ${STATUS}"
echo -e "${CYAN}Done.${RESET}"

#!/bin/bash
# ==========================================
# ✅ OPENAI V5.2 FINAL-STABLE TEST (ApexRebate)
# ==========================================

# 1️⃣ Load environment
source /Users/macbookprom1/apexrebate-1/.venv/bin/activate 2>/dev/null
source ~/apexrebate-1/openai.env 2>/dev/null

echo "🚀 Starting OpenAI V5.2 connectivity test..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="$HOME/apexrebate-1/test_openai_v5.log"

# 2️⃣ Run chat completion and parse with jq safely
RESPONSE=$(openai api chat.completions.create \
  -m gpt-4o-mini \
  -q "ping ApexRebate V5 Final" \
  --max-tokens 10 --response-format json 2>/dev/null)

# 3️⃣ Extract message content via jq
CONTENT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null)

# 4️⃣ Determine result
if [[ "$CONTENT" == *"pong"* || "$CONTENT" == *"Pong"* ]]; then
  STATUS="✅ SUCCESS"
  MESSAGE="OpenAI connected — $CONTENT"
else
  STATUS="❌ FAIL"
  MESSAGE="Unexpected response: $CONTENT"
fi

# 5️⃣ Log locally
echo "[$TIMESTAMP] $STATUS | $MESSAGE" | tee -a "$LOG_FILE"

# 6️⃣ Send webhook report
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"timestamp\": \"$TIMESTAMP\", \"status\": \"$STATUS\", \"message\": \"$MESSAGE\"}" \
  "https://script.google.com/macros/s/AKfycbwRRZK1JLLfg3Hsl2SxF_5tLoV34cDmnpZR27S5C_Q570-xghqTxMA9G18mlJ6hi7dp/exec" \
  > /dev/null 2>&1

echo "📬 Webhook sent — $STATUS"
echo "📜 Log file: $LOG_FILE"

#!/bin/bash
# ==========================================
# ✅ OPENAI V5.3 FINAL-STABLE TEST (ApexRebate)
# ==========================================

# 1️⃣ Load environment
source /Users/macbookprom1/apexrebate-1/.venv/bin/activate 2>/dev/null
source ~/apexrebate-1/openai.env 2>/dev/null

echo "🚀 Starting OpenAI V5.3 connectivity test..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="$HOME/apexrebate-1/test_openai_v5.log"

# 2️⃣ Run completion with --input (zsh-safe)
RESPONSE=$(openai api chat.completions.create \
  -m gpt-4o-mini \
  --input "ping ApexRebate V5 Final" \
  --max-tokens 10 --response-format json 2>/dev/null)

# 3️⃣ Extract message safely via jq
CONTENT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content' 2>/dev/null)

# 4️⃣ Determine result
if [[ "$CONTENT" == *"pong"* || "$CONTENT" == *"Pong"* ]]; then
  STATUS="✅ SUCCESS"
  MESSAGE="OpenAI connected — $CONTENT"
else
  STATUS="❌ FAIL"
  MESSAGE="Unexpected response: ${CONTENT:-<empty>}"
fi

# 5️⃣ Log locally
echo "[$TIMESTAMP] $STATUS | $MESSAGE" | tee -a "$LOG_FILE"

# 6️⃣ Send webhook report
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"timestamp\": \"$TIMESTAMP\", \"status\": \"$STATUS\", \"message\": \"$MESSAGE\"}" \
  "https://script.google.com/macros/s/AKfycbwRRZK1JLLfg3Hsl2SxF_5tLoV34cDmnpZR27S5C_Q570-xghqTxMA9G18mlJ6hi7dp/exec" \
  > /dev/null 2>&1

echo "📬 Webhook sent — $STATUS"
echo "📜 Log file: $LOG_FILE"

#!/usr/bin/env bash
# ==========================================
# ✅ OPENAI V5.4 FINAL-STABLE (ZSH-PROOF)
# ==========================================

# Force Bash to handle script (not zsh)
set -euo pipefail

# 1️⃣ Load environment
source /Users/macbookprom1/apexrebate-1/.venv/bin/activate 2>/dev/null || true
source ~/apexrebate-1/openai.env 2>/dev/null || true

echo "🚀 Starting OpenAI V5.4 connectivity test..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="$HOME/apexrebate-1/test_openai_v5.log"

# 2️⃣ Run chat with JSON-safe output
RESPONSE=$(openai api chat.completions.create \
  -m gpt-4o-mini \
  --input "ping ApexRebate V5 Final" \
  --max-tokens 10 \
  --response-format json 2>/dev/null || true)

# 3️⃣ Parse with jq safely
CONTENT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty' 2>/dev/null)

# 4️⃣ Determine result
if echo "$CONTENT" | grep -qi "pong"; then
  STATUS="✅ SUCCESS"
  MESSAGE="OpenAI connected — ${CONTENT}"
else
  STATUS="❌ FAIL"
  MESSAGE="Unexpected response: ${CONTENT:-<empty>}"
fi

# 5️⃣ Log locally
echo "[$TIMESTAMP] $STATUS | $MESSAGE" | tee -a "$LOG_FILE"

# 6️⃣ Send webhook
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"timestamp\": \"$TIMESTAMP\", \"status\": \"$STATUS\", \"message\": \"$MESSAGE\"}" \
  "https://script.google.com/macros/s/AKfycbwRRZK1JLLfg3Hsl2SxF_5tLoV34cDmnpZR27S5C_Q570-xghqTxMA9G18mlJ6hi7dp/exec" \
  >/dev/null 2>&1

echo "📬 Webhook sent — $STATUS"
echo "📜 Log file: $LOG_FILE"

#!/usr/bin/env bash
# ==========================================
# ✅ OPENAI V5.5 FINAL-STABLE (JSON-native)
# ==========================================

set -euo pipefail

# 1️⃣ Load env
source /Users/macbookprom1/apexrebate-1/.venv/bin/activate 2>/dev/null || true
source ~/apexrebate-1/openai.env 2>/dev/null || true

echo "🚀 Starting OpenAI V5.5 connectivity test..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="$HOME/apexrebate-1/test_openai_v5.log"

# 2️⃣ JSON payload (CLI v2.6+ yêu cầu format này)
PAYLOAD=$(cat <<EOF
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "ping ApexRebate connectivity test"}
  ],
  "max_tokens": 10
}
EOF
)

# 3️⃣ Call API
RESPONSE=$(echo "$PAYLOAD" | openai api chat.completions.create --response-format json 2>/dev/null || true)

# 4️⃣ Parse safely
CONTENT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty' 2>/dev/null)

# 5️⃣ Check
if echo "$CONTENT" | grep -qi "pong"; then
  STATUS="✅ SUCCESS"
  MESSAGE="OpenAI connected — ${CONTENT}"
else
  STATUS="❌ FAIL"
  MESSAGE="Unexpected response: ${CONTENT:-<empty>}"
fi

# 6️⃣ Log locally
echo "[$TIMESTAMP] $STATUS | $MESSAGE" | tee -a "$LOG_FILE"

# 7️⃣ Send webhook
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"timestamp\": \"$TIMESTAMP\", \"status\": \"$STATUS\", \"message\": \"$MESSAGE\"}" \
  "https://script.google.com/macros/s/AKfycbwRRZK1JLLfg3Hsl2SxF_5tLoV34cDmnpZR27S5C_Q570-xghqTxMA9G18mlJ6hi7dp/exec" \
  >/dev/null 2>&1

echo "📬 Webhook sent — $STATUS"
echo "📜 Log file: $LOG_FILE"

#!/usr/bin/env bash
# ==========================================
# ✅ OPENAI V5.5 FINAL-STABLE (JSON-native)
# ==========================================

set -euo pipefail

# 1️⃣ Load Python venv + env vars
source /Users/macbookprom1/apexrebate-1/.venv/bin/activate 2>/dev/null || true
source ~/apexrebate-1/openai.env 2>/dev/null || true

echo "🚀 Starting OpenAI V5.5 connectivity test..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="$HOME/apexrebate-1/test_openai_v5.log"

# 2️⃣ Build JSON payload (CLI >=2.6 yêu cầu dạng này)
PAYLOAD=$(cat <<EOF
{
  "model": "gpt-4o-mini",
  "messages": [
    {"role": "user", "content": "ping ApexRebate connectivity test"}
  ],
  "max_tokens": 10
}
EOF
)

# 3️⃣ Gọi OpenAI API
RESPONSE=$(echo "$PAYLOAD" | openai api chat.completions.create --response-format json 2>/dev/null || true)

# 4️⃣ Parse phản hồi
CONTENT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty' 2>/dev/null)

# 5️⃣ Kiểm tra kết quả
if echo "$CONTENT" | grep -qi "pong"; then
  STATUS="✅ SUCCESS"
  MESSAGE="OpenAI connected — ${CONTENT}"
else
  STATUS="❌ FAIL"
  MESSAGE="Unexpected response: ${CONTENT:-<empty>}"
fi

# 6️⃣ Ghi log
echo "[$TIMESTAMP] $STATUS | $MESSAGE" | tee -a "$LOG_FILE"

# 7️⃣ Gửi webhook báo cáo
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"timestamp\": \"$TIMESTAMP\", \"status\": \"$STATUS\", \"message\": \"$MESSAGE\"}" \
  "https://script.google.com/macros/s/AKfycbwRRZK1JLLfg3Hsl2SxF_5tLoV34cDmnpZR27S5C_Q570-xghqTxMA9G18mlJ6hi7dp/exec" \
  >/dev/null 2>&1

echo "📬 Webhook sent — $STATUS"
echo "📜 Log file: $LOG_FILE"

