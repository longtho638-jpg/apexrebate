#!/usr/bin/env bash
set -euo pipefail
# Start OPA HTTP server with policy files in packages/policy/*.rego
# Requires OPA binary available in PATH.
PORT="${OPA_PORT:-8181}"
DIR="$(cd "$(dirname "$0")/../.."; pwd)"
cd "$DIR"
exec opa run --server --addr "0.0.0.0:${PORT}" packages/policy/*.rego
