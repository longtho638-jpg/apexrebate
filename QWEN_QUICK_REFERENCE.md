# 🚀 Qwen Code - Quick Reference Card

## Setup (First Time)
```bash
bash scripts/qwen-quick-start.sh setup
# → Select: 1 (Qwen OAuth)
# → Browser opens → Login → Done!
```

## Usage Commands

### Generate Tests
```bash
npm run qwen:test
```

### Refactor Code
```bash
npm run qwen:refactor
```

### Generate Docs
```bash
npm run qwen:docs
```

### Analyze Code
```bash
npm run qwen:analyze
```

### Fix Issues
```bash
npm run qwen:ci:fix
```

### Explain Architecture
```bash
npm run qwen:explain
```

## Interactive CLI

```bash
bash scripts/qwen-quick-start.sh          # Menu mode
bash scripts/qwen-quick-start.sh test     # Test Qwen
bash scripts/qwen-quick-start.sh tests [file]   # Generate tests
bash scripts/qwen-quick-start.sh all      # Run all tasks
```

## Direct Qwen Commands

```bash
qwen "Generate unit tests for src/lib/auth.ts"
qwen "Refactor dashboard component for performance"
qwen "Find security vulnerabilities in API routes"
qwen "Explain ApexRebate architecture"
```

## Authentication

```bash
bash scripts/qwen-quick-start.sh setup    # Setup
qwen --auth oauth                          # Switch to OAuth
qwen config show                           # Check current auth
```

## Verification

```bash
qwen --version                # Check installation
bash scripts/qwen-quick-start.sh test      # Test functionality
npm run qwen:explain          # Test on ApexRebate
```

## GitHub Actions

Automatically runs on pull requests!
- Generates tests
- Suggests refactoring
- Generates docs
- Security analysis
- Fixes issues

View results in PR comments.

## Docs & Resources

- **Setup Guide:** `QWEN_CODE_SETUP.md`
- **Integration Plan:** `QWEN_CODE_INTEGRATION_PLAN.md`
- **Complete Status:** `QWEN_CODE_INTEGRATION_COMPLETE.md`
- **Official Docs:** https://github.com/QwenLM/qwen-code

## Time Savings

- Test generation: 25 min saved
- Code review: 13 min saved
- Documentation: 17 min saved
- **Daily total:** ~55 minutes saved

---

**Qwen Code v0.2.1 - Nov 17, 2025**
