#!/usr/bin/env bash
set -euo pipefail

CONTRACT_FILE="${1:-.codex_contract.json}"
OUTPUT_DIR="${2:-./codex-remix}"
SOURCE_DIR="${3:-./src}"

if ! command -v oai >/dev/null 2>&1; then
  echo "Error: The OpenAI CLI (oai) is required to run this command." >&2
  echo "Install it by following https://github.com/openai/openai-cli" >&2
  exit 1
fi

if [ ! -f "$CONTRACT_FILE" ]; then
  echo "Error: Cannot find contract file '$CONTRACT_FILE'." >&2
  echo "Create it or provide a custom path as the first argument." >&2
  exit 1
fi

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Source directory '$SOURCE_DIR' does not exist." >&2
  echo "Provide the source directory as the third argument if it lives elsewhere." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

oai api completions.create \
  -m gpt-4o \
  -p "$(cat "$CONTRACT_FILE")" \
  -f "$SOURCE_DIR" \
  -o "$OUTPUT_DIR"
