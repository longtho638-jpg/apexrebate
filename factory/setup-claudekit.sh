#!/bin/bash

echo "🚀 Setting up ClaudeKit Engineer Integration..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

FACTORY_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
CLAUDEKIT_PATH="$FACTORY_PATH/claudekit-engineer"

# 1. Install dependencies
echo -e "${BLUE}1️⃣ Installing npm dependencies...${NC}"
cd "$CLAUDEKIT_PATH"
npm install --legacy-peer-deps 2>/dev/null || npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# 2. Setup environment
echo -e "${BLUE}2️⃣ Setting up environment...${NC}"
if [ ! -f "$FACTORY_PATH/.env.local" ]; then
  echo "CLAUDE_WORKSPACE=$(dirname "$FACTORY_PATH")" > "$FACTORY_PATH/.env.local"
  echo "FACTORY_PATH=$FACTORY_PATH" >> "$FACTORY_PATH/.env.local"
  echo -e "${GREEN}✅ .env.local created${NC}"
else
  echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

# 3. Copy workflows
echo -e "${BLUE}3️⃣ Copying workflows...${NC}"
if [ ! -d "$FACTORY_PATH/workflows" ]; then
  mkdir -p "$FACTORY_PATH/workflows"
fi
cp -r "$CLAUDEKIT_PATH/.claude/workflows"/* "$FACTORY_PATH/workflows/" 2>/dev/null || true
echo -e "${GREEN}✅ Workflows copied${NC}"

# 4. Initialize git hooks
echo -e "${BLUE}4️⃣ Initializing git hooks...${NC}"
cd "$FACTORY_PATH/.."
husky install "$CLAUDEKIT_PATH/.husky" 2>/dev/null || true
echo -e "${GREEN}✅ Git hooks ready${NC}"

# 5. Test setup
echo -e "${BLUE}5️⃣ Testing setup...${NC}"
if command -v claude &> /dev/null; then
  echo -e "${GREEN}✅ Claude Code detected${NC}"
else
  echo -e "⚠️  Claude Code not found. Install from: https://code.claude.com"
fi

# Summary
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ ClaudeKit Engineer Setup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📝 Quick Start:${NC}"
echo "  cd $FACTORY_PATH"
echo "  claude /plan 'your task here'"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  cat $FACTORY_PATH/CLAUDEKIT_INTEGRATION.md"
echo ""
