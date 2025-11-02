#!/bin/bash
# =======================================================
# 📧 OpenAI Health Monitor (v5 — Gmail WebApp Edition)
# =======================================================

# --- ENV ---
source ~/apexrebate-1/openai.env 2>/dev/null

# --- CONFIG ---
WEBHOOK_URL="https://script.google.com/macros/s/AKfycbymyHjaIp_Aiqgp9DJMsRMyACH_xZxkUAln1d-_7BCCbbDtVoOoyyiofppwdd6NSb8h/exec"
LOGFILE=~/apexrebate-1/openai_health.log
DATE_NOW=$(date +"%Y-%m-%d %H:%M:%S")

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RESET="\033[0m"

echo -e "${CYAN}🚀 OpenAI Health Check (v5 Gmail WebApp) — $DATE_NOW${RESET}"

# --- Step 1: Ping ---
ping -c 2 api.openai.com >/tmp/ping.log 2>&1
ping_ok=$?
avg_ping=$(grep "avg" /tmp/ping.log | awk -F'/' '{print $5}')

# --- Step 2: Models ---
openai api models.list -o json >/tmp/models.json 2>/tmp/api_err.log
api_ok=$?
model=$(jq -r '.data[0].id // .[0].id' /tmp/models.json 2>/dev/null)

# --- Step 3: Chat ---
resp=$(openai api chat.completions.create -m gpt-4o -g user "Health check ApexRebate" --max-tokens 10 -o json 2>/dev/null)
chat_ok=$?
msg=$(echo "$resp" | jq -r '.choices[0].message.content // empty')

# --- Step 4: Evaluate ---
STATUS="OK"
DETAILS=""
[ $ping_ok -ne 0 ] && STATUS="FAIL" && DETAILS+="❌ Ping lỗi\n"
[ $api_ok -ne 0 ] && STATUS="FAIL" && DETAILS+="❌ API lỗi\n"
[ $chat_ok -ne 0 ] && STATUS="FAIL" && DETAILS+="❌ Chat lỗi\n"
[ -z "$msg" ] && STATUS="FAIL" && DETAILS+="❌ Không có phản hồi\n"
[ -z "$avg_ping" ] && avg_ping="N/A"

# --- Step 5: Log JSON ---
jq -n --arg time "$DATE_NOW" \
      --arg ping "$avg_ping" \
      --arg model "$model" \
      --arg msg "$msg" \
      --arg status "$STATUS" \
      '{time:$time,ping_ms:$ping,model:$model,msg:$msg,status:$status}' >> "$LOGFILE"

# --- Step 6: Gửi webhook tới Gmail WebApp ---
if [ "$STATUS" != "OK" ]; then
  echo -e "${RED}⚠️  Phát hiện lỗi, gửi cảnh báo Gmail...${RESET}"
  log_tail=$(tail -n 30 "$LOGFILE" | jq -s '.' 2>/dev/null)

  curl -s -X POST -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg subject "⚠️ OpenAI Health Alert — $DATE_NOW" \
      --arg body "Tình trạng: $STATUS\nPing: $avg_ping ms\nModel: $model\nPhản hồi: $msg\nChi tiết:\n$DETAILS" \
      --arg log "$log_tail" \
      '{subject:$subject,body:$body,log:$log}')" \
    "$WEBHOOK_URL" >/dev/null 2>&1

  echo -e "${YELLOW}📨 Gmail alert sent via Apps Script.${RESET}"
else
  echo -e "${GREEN}✅ Hệ thống ổn định.${RESET}"
fi

