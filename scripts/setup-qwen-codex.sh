#!/usr/bin/env bash

# ApexRebate helper: wire Claude Code + Codex UI to the free Qwen backend.
# Usage:
#   bash scripts/setup-qwen-codex.sh --key sk-xxx           # non-interactive
#   QWEN_API_KEY=sk-xxx bash scripts/setup-qwen-codex.sh    # env override

set -euo pipefail

BASE_URL_DEFAULT="https://dashscope.aliyuncs.com/compatible-mode/v1"
MODEL_DEFAULT="qwen3-coder-30b"
CONFIG_ROOT="${HOME}/.config/apex-qwen-codex"
ENV_FILE="${CONFIG_ROOT}/env.sh"
ZSHRC="${HOME}/.zshrc"
CLAUDE_DIR="${HOME}/.claude"
CLAUDE_SETTINGS="${CLAUDE_DIR}/settings.json"
CODEX_DIR="${HOME}/.codex"
CODEX_CONFIG="${CODEX_DIR}/config.js"
CODEX_SNIPPET_TAG="apexrebate-qwen-codex"
RPM_DEFAULT=50
DELAY_MS_DEFAULT=1000

usage() {
  cat <<'EOF'
Thiết lập Claude Code & Codex 5.1 chạy Qwen backend:

  bash scripts/setup-qwen-codex.sh --key sk-xxx

Tuỳ chọn:
  -k, --key <value>        Qwen API key (ưu tiên hơn biến QWEN_API_KEY)
  -b, --base-url <url>     Endpoint OpenAI-compatible (mặc định DashScope CN)
  -m, --model <name>       Model Qwen muốn dùng (mặc định qwen3-coder-30b)
  -f, --force              Ghi đè cấu hình hiện tại (tạo .bak cho bản cũ)
  -h, --help               Hiển thị trợ giúp
EOF
}

force_overwrite=false
api_key="${QWEN_API_KEY:-}"
base_url="$BASE_URL_DEFAULT"
model="$MODEL_DEFAULT"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -k|--key)
      [[ $# -lt 2 ]] && { echo "⚠️  Thiếu giá trị cho --key" >&2; exit 1; }
      api_key="$2"
      shift 2
      ;;
    -b|--base-url)
      [[ $# -lt 2 ]] && { echo "⚠️  Thiếu giá trị cho --base-url" >&2; exit 1; }
      base_url="$2"
      shift 2
      ;;
    -m|--model)
      [[ $# -lt 2 ]] && { echo "⚠️  Thiếu giá trị cho --model" >&2; exit 1; }
      model="$2"
      shift 2
      ;;
    -f|--force)
      force_overwrite=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "❌ Tuỳ chọn không hợp lệ: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$api_key" ]]; then
  if [[ -t 0 ]]; then
    read -r -s -p "Nhập QWEN_API_KEY: " api_key
    echo ""
  fi
fi

if [[ -z "$api_key" ]]; then
  echo "❌ QWEN_API_KEY chưa được cung cấp." >&2
  exit 1
fi

mkdir -p "$CONFIG_ROOT"
cat > "$ENV_FILE" <<EOF
# Tự động tạo bởi setup-qwen-codex.sh vào $(date)
export QWEN_API_KEY="$api_key"
export OPENAI_API_KEY="$api_key"
export OPENAI_BASE_URL="$base_url"
export CLAUDE_MODEL="$model"
export ANTHROPIC_API_KEY="bridge-${api_key:0:12}"
export CODEX_UI="kit-cc-pro"
export BACKEND="qwen"
export OPENAI_COMPAT_PROVIDER="qwen"
EOF
echo "• Đã ghi biến môi trường tại $ENV_FILE"

if [[ ! -f "$ZSHRC" ]]; then
  touch "$ZSHRC"
fi

if ! grep -q "$CODEX_SNIPPET_TAG" "$ZSHRC"; then
  cat >> "$ZSHRC" <<'EOF'

# >>> apexrebate-qwen-codex >>>
if [ -f "$HOME/.config/apex-qwen-codex/env.sh" ]; then
  source "$HOME/.config/apex-qwen-codex/env.sh"
fi
# <<< apexrebate-qwen-codex <<<
EOF
  echo "• Đã thêm block auto-source vào $ZSHRC"
else
  echo "• Block auto-source đã tồn tại trong $ZSHRC"
fi

mkdir -p "$CLAUDE_DIR"
if [[ -f "$CLAUDE_SETTINGS" && $force_overwrite == false ]]; then
  cp "$CLAUDE_SETTINGS" "${CLAUDE_SETTINGS}.bak.$(date +%s)"
fi

cat > "$CLAUDE_SETTINGS" <<EOF
{
  "provider": "openai",
  "apiKey": "$api_key",
  "baseUrl": "$base_url",
  "model": "$model",
  "modelAliases": {
    "claude-3-5-sonnet-20241022": "$model",
    "claude-3-5-sonnet": "$model",
    "claude-3-opus": "$model",
    "claude-3-haiku": "$model"
  },
  "rateLimit": {
    "requestsPerMinute": $RPM_DEFAULT,
    "delayBetweenRequestsMs": $DELAY_MS_DEFAULT
  },
  "vision": {
    "modelSwitch": true,
    "autoDetect": true
  }
}
EOF
echo "• Đã cập nhật $CLAUDE_SETTINGS"

mkdir -p "$CODEX_DIR"
if [[ -f "$CODEX_CONFIG" && $force_overwrite == false ]]; then
  cp "$CODEX_CONFIG" "${CODEX_CONFIG}.bak.$(date +%s)"
fi

cat > "$CODEX_CONFIG" <<EOF
module.exports = {
  provider: 'openai',
  apiKey: process.env.QWEN_API_KEY || '$api_key',
  baseUrl: '$base_url',
  model: '$model',
  cliPath: process.env.CODEX_CLAUDE_CLI || '/usr/local/bin/claude',
  ui: 'kit-cc-5.1',
  theme: 'codex-5.1',
  features: ['planning', 'execution', 'file-operations'],
  modelAliases: {
    'claude-3-5-sonnet-20241022': '$model',
    'claude-3-5-sonnet': '$model',
    'claude-3-5-haiku': '$model',
    'claude-3-opus': '$model',
    'claude-3-haiku': '$model'
  },
  rateLimit: {
    requestsPerMinute: $RPM_DEFAULT,
    delayBetweenRequests: $DELAY_MS_DEFAULT
  },
  vision: {
    modelSwitch: true,
    autoDetect: true
  }
};
EOF
echo "• Đã cập nhật $CODEX_CONFIG"

cat <<'EOF'
✅ Hoàn tất cấu hình Qwen backend

Các bước kế tiếp:
1. Mở terminal mới (để nạp env) hoặc chạy `source ~/.zshrc`.
2. Thử `claude "Ping from ApexRebate"` để xác nhận CLI đang dùng DashScope.
3. Chạy `codex-5.1 --config .codexrc.example` (hoặc .codexrc riêng) để kiểm tra UI kit.cc.
4. Với repo này, có thể dùng:
     - npm run qwen:explain
     - bash scripts/qwen-quick-start.sh setup
EOF
