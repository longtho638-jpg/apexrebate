# Qwen Code Integration Plan for ApexRebate

## 📋 Overview

Qwen Code là AI-powered CLI tool được optimize cho Qwen3-Coder models. Chúng ta sẽ integrate nó vào ApexRebate để:

- 🤖 Auto-generate & refactor code
- 🧪 Tạo unit tests + E2E tests
- 📝 Tự động document code
- 🔍 Analyze large codebases
- 🚀 Automate CI/CD workflows

---

## 🎯 Integration Strategy (3 Levels)

### Level 1: CLI Integration (Week 1)
Sử dụng Qwen Code CLI trực tiếp từ Terminal/Scripts

```bash
# Install Qwen Code globally
npm install -g @qwen-code/qwen-code

# Hoặc từ source (nếu cần custom patches)
git clone https://github.com/QwenLM/qwen-code
cd qwen-code
npm install
npm install -g .
```

**Use Cases:**
- Generate unit tests: `qwen "Create unit tests for src/lib/auth.ts"`
- Refactor code: `qwen "Refactor dashboard component for performance"`
- Document: `qwen "Write comprehensive JSDoc for all functions"`

---

### Level 2: npm Script Integration (Week 2)
Tạo npm scripts để automate Qwen Code tasks

**File: `package.json`**
```json
{
  "scripts": {
    "qwen:tests": "qwen 'Generate unit tests for all modified files'",
    "qwen:refactor": "qwen 'Refactor code for performance and readability'",
    "qwen:docs": "qwen 'Generate JSDoc for all functions'",
    "qwen:analyze": "qwen 'Analyze codebase for security vulnerabilities'",
    "qwen:ci:fix": "qwen 'Fix failing tests and linting errors'"
  }
}
```

**Usage:**
```bash
npm run qwen:tests      # Generate tests
npm run qwen:refactor   # Auto-refactor code
npm run qwen:docs       # Generate documentation
npm run qwen:analyze    # Security analysis
npm run qwen:ci:fix     # Auto-fix CI failures
```

---

### Level 3: GitHub Actions Integration (Week 3)
Tự động gọi Qwen Code trong CI/CD pipeline

**File: `.github/workflows/qwen-automation.yml`**
```yaml
name: Qwen Code Automation

on:
  pull_request:
    types: [opened, synchronize]
  workflow_dispatch:

jobs:
  qwen-analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Qwen Code
        run: npm install -g @qwen-code/qwen-code
      
      - name: Generate Tests (Qwen)
        run: |
          qwen "Generate unit tests for modified files"
        env:
          QWEN_API_KEY: ${{ secrets.QWEN_API_KEY }}
      
      - name: Refactor Code (Qwen)
        run: |
          qwen "Refactor code for better performance"
        env:
          QWEN_API_KEY: ${{ secrets.QWEN_API_KEY }}
      
      - name: Fix Linting (Qwen)
        run: |
          npm run lint:fix
          qwen "Fix any remaining lint issues"
        env:
          QWEN_API_KEY: ${{ secrets.QWEN_API_KEY }}
      
      - name: Commit changes
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'ci: auto-generate tests & refactor code (Qwen)'
          branch: ${{ github.head_ref }}
```

---

## 🔧 Setup Instructions

### Step 1: Install Qwen Code Globally
```bash
npm install -g @qwen-code/qwen-code
```

### Step 2: Authenticate Qwen
```bash
qwen --version
qwen  # This will start auth flow

# You'll be prompted to authenticate with Qwen OAuth or API key
# Choose one:
# - Qwen OAuth (Recommended, 2,000 free requests/day)
# - OpenAI compatible API
# - ModelScope (China)
# - OpenRouter
```

### Step 3: Test Qwen Code Works
```bash
qwen "Explain the architecture of this Next.js project"

# You should see AI response in the terminal
```

### Step 4: Add to ApexRebate
```bash
cd /Users/macbookprom1/apexrebate-1

# Add npm scripts to package.json (see Level 2 above)
# Update .github/workflows (see Level 3 above)

# Verify installation
qwen --version
```

---

## 📊 Proposed Use Cases for ApexRebate

### 1. Auto-Generate Unit Tests
```bash
qwen "Generate comprehensive unit tests for src/lib/auth.ts
- Test all authentication flows
- Include edge cases
- Use Jest + testing-library"
```

**Output:** `src/lib/__tests__/auth.test.ts`

### 2. Refactor Dashboard Component
```bash
qwen "Refactor src/app/dashboard/dashboard-client.tsx
- Extract reusable components
- Optimize re-renders (useMemo, useCallback)
- Improve TypeScript types
- Follow ApexRebate coding standards"
```

**Output:** Refactored component + TypeScript improvements

### 3. Generate API Documentation
```bash
qwen "Document all API routes in src/app/api/
- Add JSDoc to all route handlers
- Include request/response examples
- Document error cases
- Add @param and @returns annotations"
```

**Output:** Fully documented API endpoints

### 4. Security Analysis
```bash
qwen "Analyze src/ for security vulnerabilities
- Check authentication/authorization
- Review database queries
- Check for SQL injection risks
- Review API endpoint security"
```

**Output:** Security report + recommendations

### 5. CI/CD Auto-Fix (Post-Deploy)
```bash
qwen "Fix failing tests in tests/unit
- Analyze test failures
- Fix broken assertions
- Update mocks if needed
- Run tests again to verify"
```

**Output:** Fixed tests + verified passing

---

## 🚀 Quick Start (Copy-Paste)

### Terminal Session
```bash
# 1. Activate virtual environment
source /Users/macbookprom1/apexrebate-1/.venv/bin/activate

# 2. Install Qwen Code
npm install -g @qwen-code/qwen-code

# 3. Authenticate
qwen

# 4. Test it
qwen "What is the main architecture of ApexRebate?"

# 5. Generate tests for a file
qwen "Generate unit tests for src/lib/auth.ts"
```

---

## 🔐 Authentication Options

### Option 1: Qwen OAuth (Recommended ✅)
```bash
qwen --auth oauth

# Opens browser for Qwen account login
# Get 2,000 free requests/day
# No API key needed
```

### Option 2: API Key (OpenAI compatible)
```bash
qwen --auth api-key

# Provide API endpoint + API key
# Supports: OpenRouter, ModelScope, custom LLM
```

### Option 3: For GitHub Actions
Add secret:
```bash
gh secret set QWEN_API_KEY --body "your-api-key"
```

---

## 📈 Expected Benefits for ApexRebate

| Task | Before Qwen | After Qwen | Time Saved |
|------|------------|-----------|-----------|
| Generate tests | Manual, 30 min | Auto, 5 min | 25 min |
| Code review | Manual, 15 min | Auto-check, 2 min | 13 min |
| Documentation | Manual, 20 min | Auto-generate, 3 min | 17 min |
| Refactoring | Manual, 45 min | AI-assisted, 10 min | 35 min |
| **Per Sprint** | **~110 min** | **~20 min** | **~90 min saved** |

---

## 🎯 Action Items

### Week 1 (Immediate)
- [ ] Install Qwen Code globally
- [ ] Authenticate with Qwen OAuth
- [ ] Test Qwen on ApexRebate codebase
- [ ] Run: `qwen "Analyze ApexRebate architecture"`

### Week 2 (This Week)
- [ ] Add npm scripts for test generation
- [ ] Add npm scripts for refactoring
- [ ] Implement code documentation automation
- [ ] Test on 2-3 API routes

### Week 3 (Next Week)
- [ ] Setup GitHub Actions workflow
- [ ] Auto-generate tests in CI/CD
- [ ] Auto-fix linting errors
- [ ] Deploy to production with Qwen automation

---

## 📚 Documentation

- **Qwen Code Docs:** https://github.com/QwenLM/qwen-code
- **Qwen Models:** https://github.com/QwenLM/Qwen3-Coder
- **Free API Tiers:** https://qwenlm.github.io/qwen-code-docs/

---

## ✅ Implementation Checklist

- [ ] Install Qwen Code globally
- [ ] Complete Qwen OAuth setup
- [ ] Test on sample ApexRebate files
- [ ] Add npm scripts to package.json
- [ ] Create .github/workflows/qwen-automation.yml
- [ ] Add QWEN_API_KEY to GitHub Secrets
- [ ] Run first test generation
- [ ] Document usage in team wiki

---

**Status:** Ready to implement  
**Owner:** Minh Long  
**Target Completion:** Nov 24, 2025
