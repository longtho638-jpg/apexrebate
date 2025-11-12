#!/bin/bash
# ============================================================================
# Relay Factory - Project Generator (mkproj.sh)
# Usage: ./mkproj.sh <project-name> <template-name>
# Example: ./mkproj.sh acme-web nextjs-agentic
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory (where this script lives)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FACTORY_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATES_DIR="$FACTORY_DIR/templates"
PARENT_DIR="$(dirname "$FACTORY_DIR")"

# Validate arguments
if [ $# -lt 2 ]; then
  echo -e "${RED}❌ Usage: ./mkproj.sh <project-name> <template-name>${NC}"
  echo ""
  echo -e "${BLUE}Available templates:${NC}"
  if [ -d "$TEMPLATES_DIR" ]; then
    ls -1d "$TEMPLATES_DIR"/*/ 2>/dev/null | xargs -n1 basename || echo "  (no templates found)"
  fi
  exit 1
fi

PROJECT_NAME="$1"
TEMPLATE_NAME="$2"
TEMPLATE_PATH="$TEMPLATES_DIR/$TEMPLATE_NAME"
OUTPUT_PATH="$PARENT_DIR/$PROJECT_NAME"

# Validate template exists
if [ ! -d "$TEMPLATE_PATH" ]; then
  echo -e "${RED}❌ Template '$TEMPLATE_NAME' not found at $TEMPLATE_PATH${NC}"
  echo ""
  echo -e "${BLUE}Available templates:${NC}"
  ls -1d "$TEMPLATES_DIR"/*/ 2>/dev/null | xargs -n1 basename || echo "  (no templates found)"
  exit 1
fi

# Check if output directory already exists
if [ -d "$OUTPUT_PATH" ]; then
  echo -e "${RED}❌ Directory '$OUTPUT_PATH' already exists${NC}"
  exit 1
fi

# Copy template to output directory
echo -e "${BLUE}📦 Cloning template '$TEMPLATE_NAME'...${NC}"
cp -r "$TEMPLATE_PATH" "$OUTPUT_PATH"

# Replace placeholders in copied files
echo -e "${BLUE}🔧 Configuring project...${NC}"

# Replace {{PROJECT_NAME}} with actual project name
find "$OUTPUT_PATH" -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.md" \) \
  -exec sed -i.bak "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" {} + 2>/dev/null || true

# Clean up .bak files
find "$OUTPUT_PATH" -name "*.bak" -delete 2>/dev/null || true

# Rename _gitignore to .gitignore if it exists
if [ -f "$OUTPUT_PATH/_gitignore" ]; then
  mv "$OUTPUT_PATH/_gitignore" "$OUTPUT_PATH/.gitignore"
fi

# Initialize git repo (optional)
if command -v git &> /dev/null; then
  cd "$OUTPUT_PATH"
  git init -q
  git config user.email "factory@apexrebate.local" 2>/dev/null || true
  git config user.name "Relay Factory" 2>/dev/null || true
  git add . 2>/dev/null || true
  git commit -q -m "chore: bootstrap '$PROJECT_NAME' from '$TEMPLATE_NAME' template" 2>/dev/null || true
fi

# Success message
echo ""
echo -e "${GREEN}✅ Project created successfully!${NC}"
echo ""
echo -e "${BLUE}📂 Project location:${NC} $OUTPUT_PATH"
echo ""
echo -e "${YELLOW}🚀 Next steps:${NC}"
echo "  cd $OUTPUT_PATH"
echo "  code ."
echo ""
echo -e "${YELLOW}📝 Then run:${NC}"
case "$TEMPLATE_NAME" in
  fastapi-agentic)
    echo "  python -m venv .venv"
    echo "  source .venv/bin/activate  # Windows: .\.venv\Scripts\Activate.ps1"
    echo "  pip install -r requirements.txt"
    echo "  uvicorn app.main:app --reload --port 3000"
    ;;
  web3-foundry-agentic)
    echo "  foundryup"
    echo "  forge build"
    echo "  forge test -vv"
    ;;
  cloudflare-worker-agentic)
    echo "  pnpm i"
    echo "  wrangler dev"
    ;;
  *)
    echo "  pnpm i"
    echo "  pnpm dev"
    ;;
esac
echo ""
