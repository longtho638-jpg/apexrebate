#!/bin/bash

# Codex Remix Helper Script
# Usage: ./scripts/codex-remix-helper.sh [--local | --ci | --preview]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default mode
MODE="local"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --local)
      MODE="local"
      shift
      ;;
    --ci)
      MODE="ci"
      shift
      ;;
    --preview)
      MODE="preview"
      shift
      ;;
    --help)
      echo "Usage: $0 [--local | --ci | --preview]"
      echo ""
      echo "Modes:"
      echo "  --local    Run Codex remix locally (requires OpenAI API key)"
      echo "  --ci       Simulate CI workflow locally"
      echo "  --preview  Deploy to Firebase preview after remix"
      echo ""
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Check if contract exists
if [ ! -f "$PROJECT_ROOT/.codex_contract.json" ]; then
  echo -e "${RED}Error: .codex_contract.json not found in project root${NC}"
  exit 1
fi

echo -e "${BLUE}🚀 Starting Codex Remix in $MODE mode${NC}"

case $MODE in
  local)
    # Check for OpenAI API key
    if [ -z "$OPENAI_API_KEY" ]; then
      echo -e "${RED}Error: OPENAI_API_KEY environment variable not set${NC}"
      echo -e "${YELLOW}Please set it with: export OPENAI_API_KEY=your_key_here${NC}"
      exit 1
    fi

    # Install OpenAI CLI if not present
    if ! command -v oai &> /dev/null; then
      echo -e "${YELLOW}Installing OpenAI CLI...${NC}"
      npm install -g openai@4
    fi

    # Create output directory
    mkdir -p "$PROJECT_ROOT/codex-remix"

    # Run Codex remix
    echo -e "${GREEN}Running Codex remix...${NC}"
    oai api completions.create -m gpt-4o \
      -p "$(cat "$PROJECT_ROOT/.codex_contract.json")" \
      -f "$PROJECT_ROOT/src" \
      -o "$PROJECT_ROOT/codex-remix"

    echo -e "${GREEN}✅ Codex remix completed! Output in codex-remix/ directory${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Review the changes in codex-remix/"
    echo "  2. Run: ./scripts/codex-remix-helper.sh --preview"
    ;;

  ci)
    echo -e "${YELLOW}Simulating CI workflow locally...${NC}"

    # Check if git is clean
    if [ -n "$(git status --porcelain)" ]; then
      echo -e "${RED}Error: Working directory is not clean. Please commit or stash changes.${NC}"
      exit 1
    fi

    # Create and checkout remix branch
    git checkout -b codex-remix-local

    # Run local remix
    "$0" --local

    # Add and commit changes
    git add codex-remix/
    git commit -m "Codex Remix UI update (local simulation)"

    echo -e "${GREEN}✅ CI simulation completed!${NC}"
    echo -e "${YELLOW}Branch codex-remix-local created with remix changes.${NC}"
    echo "  To return to main: git checkout main && git branch -D codex-remix-local"
    ;;

  preview)
    echo -e "${YELLOW}Deploying to Firebase preview...${NC}"

    # Check if remix directory exists
    if [ ! -d "$PROJECT_ROOT/codex-remix" ]; then
      echo -e "${RED}Error: codex-remix/ directory not found. Run --local first.${NC}"
      exit 1
    fi

    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
      echo -e "${RED}Error: Firebase CLI not installed. Install with: npm install -g firebase-tools${NC}"
      exit 1
    fi

    # Deploy to preview channel
    echo -e "${GREEN}Deploying to Firebase preview channel...${NC}"
    firebase hosting:channel:deploy codex-remix --expires 7d

    echo -e "${GREEN}✅ Preview deployed!${NC}"
    echo "Check Firebase console for the preview URL."
    ;;
esac

echo -e "${BLUE}🎉 Codex Remix Helper completed successfully!${NC}"
