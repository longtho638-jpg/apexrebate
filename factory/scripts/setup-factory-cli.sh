#!/bin/bash

# ============================================================================
# Factory System CLI Setup & Enhancement Script
# Purpose: Install missing tools, setup API integration, test deployments
# Usage: bash setup-factory-cli.sh
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🏭 ApexRebate Factory System - CLI Setup${NC}"
echo -e "${BLUE}==========================================${NC}\n"

# ============================================================================
# Phase 1: Diagnostic
# ============================================================================

echo -e "${YELLOW}📊 Phase 1: Checking existing tools...${NC}\n"

check_tool() {
  if command -v $1 &> /dev/null; then
    version=$($1 --version 2>/dev/null | head -1 || echo "installed")
    echo -e "${GREEN}✅ $1${NC} - $version"
    return 0
  else
    echo -e "${RED}❌ $1${NC} - NOT INSTALLED"
    return 1
  fi
}

# Check all tools
NODE_OK=$(check_tool node) || NODE_OK=false
NPM_OK=$(check_tool npm) || NPM_OK=false
PNPM_OK=$(check_tool pnpm) || PNPM_OK=false
PYTHON_OK=$(check_tool python3) || PYTHON_OK=false
GIT_OK=$(check_tool git) || GIT_OK=false
DOCKER_OK=$(check_tool docker) || DOCKER_OK=false

echo ""

# ============================================================================
# Phase 2: Interactive Setup
# ============================================================================

echo -e "${YELLOW}⚙️  Phase 2: Setup Options${NC}\n"

read -p "Install Docker Desktop for macOS? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}Installing Docker Desktop...${NC}"
  brew install --cask docker
  echo -e "${GREEN}✅ Docker Desktop installed${NC}"
fi

read -p "Setup Railway CLI for deployment? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}Installing Railway CLI...${NC}"
  npm install -g @railway/cli
  echo -e "${GREEN}✅ Railway CLI installed${NC}"
fi

read -p "Setup Fly.io CLI for deployment? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}Installing Fly CLI...${NC}"
  brew install flyctl
  echo -e "${GREEN}✅ Fly CLI installed${NC}"
fi

read -p "Setup Vercel CLI for Next.js deployment? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}Installing Vercel CLI...${NC}"
  npm install -g vercel
  echo -e "${GREEN}✅ Vercel CLI installed${NC}"
fi

echo ""

# ============================================================================
# Phase 3: Factory Verification
# ============================================================================

echo -e "${YELLOW}🏭 Phase 3: Factory System Verification${NC}\n"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FACTORY_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATES_DIR="$FACTORY_DIR/templates"

# Verify factory structure
echo -e "${BLUE}Checking factory structure...${NC}"

if [ -f "$SCRIPT_DIR/mkproj.sh" ]; then
  echo -e "${GREEN}✅ mkproj.sh found${NC}"
  chmod +x "$SCRIPT_DIR/mkproj.sh"
else
  echo -e "${RED}❌ mkproj.sh NOT FOUND${NC}"
  exit 1
fi

# Count templates
template_count=$(ls -1d "$TEMPLATES_DIR"/*/ 2>/dev/null | wc -l)
echo -e "${GREEN}✅ Templates found: $template_count${NC}"

for template in $(ls -1d "$TEMPLATES_DIR"/*/ 2>/dev/null); do
  name=$(basename "$template")
  echo -e "   - ${BLUE}$name${NC}"
done

echo ""

# ============================================================================
# Phase 4: Package Manager Setup
# ============================================================================

echo -e "${YELLOW}📦 Phase 4: Package Manager Configuration${NC}\n"

# Setup pnpm (if not already)
if ! command -v pnpm &> /dev/null; then
  echo -e "${BLUE}Installing pnpm globally...${NC}"
  npm install -g pnpm
  echo -e "${GREEN}✅ pnpm installed${NC}"
fi

# Show pnpm config
echo -e "${BLUE}pnpm configuration:${NC}"
pnpm config list 2>/dev/null | grep -E "registry|store-dir" || echo "Using default config"

echo ""

# ============================================================================
# Phase 5: API Integration Setup
# ============================================================================

echo -e "${YELLOW}🔌 Phase 5: API Integration Setup${NC}\n"

read -p "Setup ApexRebate API integration configs? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}Creating API integration templates...${NC}"
  
  # Create .env.api template
  cat > "$FACTORY_DIR/.env.api.template" << 'EOF'
# ApexRebate API Integration Template
# Copy this to your generated project's .env.local

# API Configuration
APEX_API_URL=http://localhost:3000
APEX_API_VERSION=v1
APEX_API_TIMEOUT=30000

# Authentication
APEX_API_KEY=your-api-key-here
APEX_JWT_SECRET=your-jwt-secret-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Features
ENABLE_KYCI=true
ENABLE_PAYOUTS=true
ENABLE_REFERRALS=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoring
SENTRY_DSN=
DATADOG_API_KEY=
PROMETHEUS_PORT=9090

# External Services
STRIPE_API_KEY=
SENDGRID_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Feature Flags
FEATURE_DLQ_REPLAY=true
FEATURE_2EYES_AUTH=true
FEATURE_OPA_POLICY=true
EOF
  
  echo -e "${GREEN}✅ Created .env.api.template${NC}"
  
  # Create API client template
  cat > "$FACTORY_DIR/templates/nextjs-agentic/src/lib/apex-client.ts" << 'EOF'
/**
 * ApexRebate API Client
 * Usage: import { apexClient } from '@/lib/apex-client'
 */

import axios, { AxiosInstance } from 'axios'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

class ApexClient {
  private client: AxiosInstance

  constructor(baseURL = process.env.NEXT_PUBLIC_APEX_API_URL || 'http://localhost:3000') {
    this.client = axios.create({
      baseURL: `${baseURL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add auth token if available
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('apex_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  async get<T = any>(endpoint: string, options = {}): Promise<ApiResponse<T>> {
    try {
      const { data } = await this.client.get<ApiResponse<T>>(endpoint, options)
      return data
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  async post<T = any>(endpoint: string, payload: any, options = {}): Promise<ApiResponse<T>> {
    try {
      const { data } = await this.client.post<ApiResponse<T>>(endpoint, payload, options)
      return data
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  async put<T = any>(endpoint: string, payload: any, options = {}): Promise<ApiResponse<T>> {
    try {
      const { data } = await this.client.put<ApiResponse<T>>(endpoint, payload, options)
      return data
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  async delete<T = any>(endpoint: string, options = {}): Promise<ApiResponse<T>> {
    try {
      const { data } = await this.client.delete<ApiResponse<T>>(endpoint, options)
      return data
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
}

export const apexClient = new ApexClient()
EOF

  echo -e "${GREEN}✅ Created API client template${NC}"
  
  # Create API integration guide
  cat > "$FACTORY_DIR/API_INTEGRATION_GUIDE.md" << 'EOF'
# API Integration Guide

## Quick Setup

1. Copy `.env.api.template` to your project:
```bash
cp ../factory/.env.api.template .env.local
```

2. Update `.env.local` with your ApexRebate credentials:
```bash
APEX_API_URL=http://localhost:3000
APEX_API_KEY=your-key-here
```

3. Use the API client in your code:
```typescript
import { apexClient } from '@/lib/apex-client'

const users = await apexClient.get('/users')
const user = await apexClient.post('/users', { name: 'John' })
```

## Available Endpoints

### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Tools
- `GET /tools` - List tools
- `GET /tools/:id` - Get tool details
- `POST /tools` - Upload tool (auth required)
- `PUT /tools/:id` - Update tool (auth required)
- `DELETE /tools/:id` - Delete tool (auth required)

### Payouts
- `GET /payouts` - List payouts
- `POST /payouts` - Request payout (auth required)
- `GET /payouts/:id` - Get payout details

### Admin
- `GET /admin/dlq` - DLQ list (2-eyes auth)
- `POST /admin/dlq/replay` - Replay DLQ item (2-eyes auth)
- `GET /admin/slo` - SLO dashboard

## Authentication

### JWT Token
```typescript
// In NextAuth callback
const token = await apexClient.post('/auth/token', { email, password })
localStorage.setItem('apex_token', token.data.accessToken)
```

### 2-Eyes Auth (Admin Operations)
```bash
curl -X POST http://localhost:3000/api/admin/dlq/replay \
  -H "x-two-eyes: YOUR_TOKEN" \
  -H "x-idempotency-key: $(uuidgen)" \
  -H "content-type: application/json" \
  -d '{"id":"event-id"}'
```

## Error Handling

```typescript
const response = await apexClient.get('/users')
if (!response.success) {
  console.error('API Error:', response.error)
} else {
  console.log('Success:', response.data)
}
```

## Rate Limiting

- Default: 100 requests/minute per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Support

See main ApexRebate documentation for detailed API specs.
EOF

  echo -e "${GREEN}✅ Created API_INTEGRATION_GUIDE.md${NC}"
fi

echo ""

# ============================================================================
# Phase 6: Test Generation
# ============================================================================

echo -e "${YELLOW}🧪 Phase 6: Factory Generation Test${NC}\n"

read -p "Test factory with sample project generation? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  test_name="factory-test-$(date +%s)"
  echo -e "${BLUE}Generating test project: $test_name${NC}"
  
  cd "$SCRIPT_DIR"
  ./mkproj.sh "$test_name" nextjs-agentic
  
  echo -e "${GREEN}✅ Test project created at: $FACTORY_DIR/../$test_name${NC}"
  
  read -p "Install dependencies and start dev server? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$FACTORY_DIR/../$test_name"
    pnpm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo -e "${BLUE}Starting dev server (Ctrl+C to stop)...${NC}"
    pnpm dev || true
  fi
fi

echo ""

# ============================================================================
# Phase 7: Summary
# ============================================================================

echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}✅ Factory System Setup Complete!${NC}"
echo -e "${BLUE}==========================================${NC}\n"

echo -e "${YELLOW}📊 Summary:${NC}"
echo -e "  ${GREEN}✅${NC} Node.js: $(node --version)"
echo -e "  ${GREEN}✅${NC} npm: $(npm --version)"
echo -e "  ${GREEN}✅${NC} pnpm: $(pnpm --version)"
echo -e "  ${GREEN}✅${NC} Git: $(git --version | cut -d' ' -f3)"
if command -v docker &> /dev/null; then
  echo -e "  ${GREEN}✅${NC} Docker: $(docker --version | cut -d' ' -f3)"
else
  echo -e "  ${YELLOW}⚠️${NC}  Docker: NOT INSTALLED (optional)"
fi

echo ""
echo -e "${YELLOW}🚀 Quick Start:${NC}"
echo -e "  1. cd factory/scripts"
echo -e "  2. ./mkproj.sh my-app nextjs-agentic"
echo -e "  3. cd ../my-app"
echo -e "  4. pnpm i && pnpm dev"
echo -e "  5. Open http://localhost:3000"

echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo -e "  - Quick start: factory/START_HERE.md"
echo -e "  - Full guide: factory/README.md"
echo -e "  - Deployment: factory/FACTORY_DEPLOYMENT.md"
echo -e "  - API integration: factory/API_INTEGRATION_GUIDE.md"

echo ""
echo -e "${GREEN}Happy building! 🎉${NC}\n"
