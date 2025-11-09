#!/usr/bin/env bash
set -euo pipefail
# Start OPA HTTP server with policy files in packages/policy/*.rego
# Requires OPA binary available in PATH.
PORT="${OPA_PORT:-8181}"
DIR="$(cd "$(dirname "$0")/../.."; pwd)"
cd "$DIR"

# Detect OPA binary location (Homebrew on macOS or system-wide)
if command -v opa &> /dev/null; then
  OPA_BIN="opa"
elif [ -f "/opt/homebrew/bin/opa" ]; then
  OPA_BIN="/opt/homebrew/bin/opa"
elif [ -f "/usr/local/bin/opa" ]; then
  OPA_BIN="/usr/local/bin/opa"
else
  echo "❌ OPA not found. Install via: brew install opa (macOS) or see https://www.openpolicyagent.org/docs/latest/#running-opa"
  exit 1
fi

echo "✔ Using OPA: $OPA_BIN"

# Kéo bundle runtime (nếu có)
echo "📦 Pulling runtime bundle..."
node scripts/opa/pull-bundle.mjs || echo "⚠️  No runtime bundle available (continuing with static policies)"

echo "✔ Loading policies from packages/policy/*.rego + _runtime/*.rego"
echo "✔ Server starting on http://0.0.0.0:${PORT}"

# Load cả file rego tĩnh và runtime (nếu có)
exec "$OPA_BIN" run --server --addr "0.0.0.0:${PORT}" packages/policy/*.rego packages/policy/_runtime/*.rego 2>/dev/null || \
  exec "$OPA_BIN" run --server --addr "0.0.0.0:${PORT}" packages/policy/*.rego
