# Qwen Code Setup Guide - ApexRebate

> Integrate AI-powered code generation with Qwen Code into ApexRebate workflow

---

## ✅ Quick Setup (5 minutes)

### Step 1: Install Qwen Code
```bash
npm install -g @qwen-code/qwen-code@latest

# Verify
qwen --version
```

### Step 2: Run Quick Start Script
```bash
cd /Users/macbookprom1/apexrebate-1

# Interactive mode
bash scripts/qwen-quick-start.sh

# Or direct setup
bash scripts/qwen-quick-start.sh setup
```

### Step 3: Authenticate with Qwen
Follow the script prompts to authenticate:
- **Recommended:** Qwen OAuth (2,000 free requests/day)
- **Alternative:** API Key (OpenAI compatible)

### Step 4: Test Installation
```bash
bash scripts/qwen-quick-start.sh test

# Or manually
qwen "Explain ApexRebate's architecture"
```

---

## 🎯 Usage Examples

### Generate Unit Tests
```bash
# Entire codebase
npm run qwen:test

# Specific file
bash scripts/qwen-quick-start.sh tests src/lib/auth.ts
```

**Output:** Generated test files in `tests/unit/`

### Refactor Code
```bash
# Modified files
npm run qwen:refactor

# Specific file
bash scripts/qwen-quick-start.sh refactor src/app/dashboard
```

### Generate Documentation
```bash
npm run qwen:docs

# Specific file
bash scripts/qwen-quick-start.sh docs src/lib/auth.ts
```

### Analyze for Issues
```bash
npm run qwen:analyze
```

**Output:** Security vulnerabilities, performance issues, code quality recommendations

### Fix CI Failures
```bash
npm run qwen:ci:fix
```

**Output:** Auto-fixed tests, linting errors, and code issues

### Explain Architecture
```bash
npm run qwen:explain
```

---

## 🔐 Authentication Options

### Option 1: Qwen OAuth (Recommended ⭐)
```bash
bash scripts/qwen-quick-start.sh setup

# Select: 1 (Qwen OAuth)
# Browser opens → Login to qwen.ai → Authorize
# Automatic credential management
```

**Benefits:**
- ✅ 2,000 free requests/day
- ✅ No API key management
- ✅ Automatic token refresh
- ✅ Recommended for individuals

### Option 2: API Key (OpenAI compatible)
```bash
bash scripts/qwen-quick-start.sh setup

# Select: 2 (API Key)
# Provide API endpoint + key
```

**Supported providers:**
- OpenRouter (https://openrouter.ai)
- ModelScope (China region)
- Custom LLM endpoints

### Option 3: Check Current Auth
```bash
qwen --version  # Shows current auth status

# Switch auth method
qwen --auth oauth
qwen --auth api-key
```

---

## 📋 npm Scripts Reference

Add these to your workflow:

| Command | Purpose | Example |
|---------|---------|---------|
| `npm run qwen:test` | Generate tests | After code changes |
| `npm run qwen:refactor` | Refactor code | Code review prep |
| `npm run qwen:docs` | Generate docs | Before release |
| `npm run qwen:analyze` | Security check | Before deploy |
| `npm run qwen:ci:fix` | Auto-fix issues | Fix test failures |
| `npm run qwen:explain` | Understand codebase | Onboarding |

---

## 🚀 CLI Script Usage

Quick start script at `scripts/qwen-quick-start.sh`:

```bash
# Interactive menu
bash scripts/qwen-quick-start.sh

# Direct commands
bash scripts/qwen-quick-start.sh [command] [file]

# Examples
bash scripts/qwen-quick-start.sh setup              # Setup & auth
bash scripts/qwen-quick-start.sh test               # Test Qwen
bash scripts/qwen-quick-start.sh tests auth.ts      # Generate tests
bash scripts/qwen-quick-start.sh refactor dashboard # Refactor
bash scripts/qwen-quick-start.sh docs               # Generate docs
bash scripts/qwen-quick-start.sh analyze            # Analyze code
bash scripts/qwen-quick-start.sh fix                # Fix issues
bash scripts/qwen-quick-start.sh explain            # Explain arch
bash scripts/qwen-quick-start.sh all                # Run all tasks
```

---

## 🤖 GitHub Actions Automation

Qwen Code runs automatically on pull requests!

**File:** `.github/workflows/qwen-automation.yml`

### Trigger
- Pull request opened or updated
- When source files change (`src/**`, `tests/**`)
- Manual workflow dispatch

### Tasks Executed
1. 🧪 Generate unit tests
2. 🔄 Suggest refactoring
3. 📝 Generate documentation
4. 🛡️ Security analysis
5. 🔧 Fix linting errors

### Configuration
Add to GitHub Secrets:
```bash
gh secret set QWEN_API_KEY --body "your-api-key"  # Optional
```

### View Results
- PR comments show Qwen analysis
- Suggestions appear in conversation
- Auto-commit changes if enabled

---

## 🎯 Recommended Workflow

### Daily Development
```bash
# 1. Make code changes
git checkout -b feature/new-feature

# 2. Generate tests
npm run qwen:test

# 3. Refactor if needed
npm run qwen:refactor

# 4. Push PR
git push origin feature/new-feature

# 5. GitHub Actions runs Qwen analysis (automatic)
# 6. Review suggestions in PR comments
```

### Before Deployment
```bash
# 1. Run full analysis
npm run qwen:analyze

# 2. Generate documentation
npm run qwen:docs

# 3. Fix any issues
npm run qwen:ci:fix

# 4. Verify tests pass
npm test

# 5. Deploy
npm run build && vercel --prod
```

### Code Review
```bash
# Use Qwen to enhance review
qwen "Review src/lib/auth.ts and suggest improvements for security and performance"

qwen "Check for potential bugs or edge cases in src/app/api/payout/route.ts"

qwen "Suggest refactoring for better code maintainability in src/components/"
```

---

## 🔧 Troubleshooting

### Issue: "Qwen not found"
```bash
# Reinstall globally
npm install -g @qwen-code/qwen-code@latest

# Verify PATH
which qwen

# Test
qwen --version
```

### Issue: Authentication fails
```bash
# Check current auth
qwen --version

# Reset and re-authenticate
rm -rf ~/.qwen  # Clear cached credentials
bash scripts/qwen-quick-start.sh setup
```

### Issue: API rate limit exceeded
```bash
# Wait for limit reset (usually 1 hour)
# Or switch to higher tier provider (OpenRouter, ModelScope)

# Check current provider
qwen config show
```

### Issue: Qwen hangs/times out
```bash
# Try with timeout
timeout 30 qwen "Short task"

# Or increase verbosity
DEBUG=* qwen "your task"
```

### Issue: Commands not found
```bash
# Make script executable
chmod +x scripts/qwen-quick-start.sh

# Run with bash explicitly
bash scripts/qwen-quick-start.sh setup
```

---

## 💾 Configuration Files

### Qwen Config
```bash
# View config
qwen config show

# Set API key
qwen config set api_key YOUR_KEY

# Set API endpoint
qwen config set api_endpoint https://api.openrouter.ai/api/v1
```

### ApexRebate Integration
```
scripts/qwen-quick-start.sh    # Quick start CLI
package.json                   # npm scripts (qwen:*)
.github/workflows/qwen-automation.yml  # CI/CD automation
```

---

## 📊 Expected Benefits

### For Developers
- ✅ 25+ minutes saved per day (test generation)
- ✅ Auto-generated documentation
- ✅ Code review suggestions
- ✅ Security analysis

### For Team
- ✅ Consistent code quality
- ✅ Faster PR reviews
- ✅ Better test coverage
- ✅ Security vulnerabilities caught early

### For Project
- ✅ 90+ minutes saved per sprint
- ✅ Reduced technical debt
- ✅ Better code maintainability
- ✅ Improved deployment confidence

---

## 📚 Resources

- **GitHub:** https://github.com/QwenLM/qwen-code
- **Qwen Models:** https://github.com/QwenLM/Qwen3-Coder
- **Free Tiers:** https://qwenlm.github.io/qwen-code-docs/
- **Docs:** https://qwenlm.github.io/qwen-code-docs/

---

## 🎓 Learning Path

### Beginner (Day 1)
- [x] Install Qwen Code
- [x] Authenticate (Qwen OAuth)
- [x] Run `bash scripts/qwen-quick-start.sh test`
- [ ] Generate tests for one file: `npm run qwen:test`

### Intermediate (Week 1)
- [ ] Generate tests for dashboard component
- [ ] Refactor one complex module
- [ ] Generate documentation for auth.ts
- [ ] Run security analysis on API routes

### Advanced (Week 2+)
- [ ] Integrate Qwen into CI/CD pipeline
- [ ] Custom prompts for specific tasks
- [ ] GitHub Actions automation
- [ ] Team workflow optimization

---

## ✉️ Support & Issues

**Have questions?**
```bash
# View help
bash scripts/qwen-quick-start.sh help

# Check version
qwen --version

# Test functionality
qwen "Explain ApexRebate's authentication flow"
```

**Report issues:**
- GitHub: https://github.com/QwenLM/qwen-code/issues
- Qwen Discord: (if available)
- ApexRebate team: Slack/Email

---

## ⏭️ Next Steps

1. ✅ **Install:** `npm install -g @qwen-code/qwen-code@latest`
2. ✅ **Authenticate:** `bash scripts/qwen-quick-start.sh setup`
3. ✅ **Test:** `bash scripts/qwen-quick-start.sh test`
4. ⬜ **Integrate:** Add to daily workflow
5. ⬜ **Optimize:** Configure for your specific needs

---

**Last Updated:** Nov 17, 2025  
**Status:** ✅ Ready for integration  
**Owner:** Minh Long / ApexRebate Team
