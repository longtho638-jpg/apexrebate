# Qwen Code Setup Instructions (Step-by-Step)

**Status:** Qwen CLI v0.2.1 installed, needs API authentication  
**Estimated Time:** 5-10 minutes  

---

## Step 1: Get API Credentials

### Option A: Qwen OAuth (Recommended - Free 2,000 requests/day)

```bash
# Run setup script
bash scripts/qwen-quick-start.sh setup

# Select option 1 when prompted
# Browser will open → Click "Authorize"
# You'll get: 2,000 free API calls per day
```

### Option B: OpenAI API Key (Pay-as-you-go)

1. **Get API Key:**
   - Go to: https://platform.openai.com/account/api-keys
   - Click "Create new secret key"
   - Copy the key (looks like: `sk-proj-XXXXXXXXXXXX`)

2. **Run setup:**
   ```bash
   bash scripts/qwen-quick-start.sh setup
   # Select option 2
   # Paste your API key when prompted
   ```

3. **Verify:**
   ```bash
   npm run qwen:explain
   # Should output architecture explanation
   ```

---

## Step 2: Verify Installation

```bash
# Test 1: Check version
qwen --version
# Expected: 0.2.1 ✅

# Test 2: Explain architecture
npm run qwen:explain
# Expected: AI explains ApexRebate architecture

# Test 3: Try another command
npm run qwen:analyze
# Expected: Code analysis results
```

---

## Step 3: Test with Current File

The current active file is: `tests/unit/api/dashboard.test.ts`

### Generate Tests
```bash
npm run qwen:test
# Output:
# > Generating comprehensive unit tests...
# > Using Jest + testing-library
# > Including edge cases and error scenarios...
```

### Analyze Code Quality
```bash
npm run qwen:analyze
# Output:
# > Analyzing src/ for issues...
# > Found: [security issues, performance bottlenecks, code quality issues]
```

---

## Step 4: Set Up for Team

### Add GitHub Secret (for CI/CD)

```bash
# If using OpenAI API Key:
gh secret set OPENAI_API_KEY --body "sk-proj-YOUR-KEY-HERE"

# If using Qwen OAuth:
# Skip this step - OAuth is already configured locally
```

### Share Configuration

```bash
# Add to team docs
git add QWEN_CODE_SETUP_GUIDE.md QWEN_TEAM_TRAINING.md
git commit -m "docs: add Qwen Code setup and training guides"
git push

# The GitHub Actions workflow will auto-run on next push:
# .github/workflows/qwen-code-checks.yml
```

---

## Step 5: First Run Examples

### Generate Tests for Dashboard
```bash
# Current file: tests/unit/api/dashboard.test.ts
npm run qwen:test
# Will generate additional tests for:
# - API endpoints
# - Error handling
# - Edge cases
```

### Analyze Entire Codebase
```bash
npm run qwen:analyze
# Will check src/ for:
# - Security vulnerabilities
# - Performance issues
# - Code quality problems
```

### Generate Documentation
```bash
npm run qwen:docs
# Will add JSDoc to all files in:
# - src/
# - API routes
# - Components
# - Utils
```

---

## Step 6: Monitor GitHub Actions

Once pushed, check: https://github.com/longtho638-jpg/apexrebate/actions

You'll see:
- ✅ Qwen Code Analysis (runs on every commit)
- ✅ Test Generation (runs on every commit)
- ✅ Documentation (runs on every commit)
- ✅ Code Refactoring (runs on PRs)

---

## Troubleshooting

### "API key not configured"
```bash
bash scripts/qwen-quick-start.sh setup
# Choose 1 (OAuth) or 2 (API Key)
```

### "qwen command not found"
```bash
npm install -g @qwen-code/qwen-code@latest
# Check: qwen --version
```

### "401 Incorrect API key"
```bash
# Delete cached auth
rm -rf ~/.qwen/config

# Re-run setup
bash scripts/qwen-quick-start.sh setup
```

### "Rate limit hit"
- Wait 24 hours (for Qwen OAuth)
- Or upgrade OpenAI API plan

---

## What Gets Generated

### 1. Unit Tests
```typescript
// Generated in console, copy to tests/
describe('getDashboard', () => {
  it('returns user dashboard data', async () => {
    // Generated test...
  })
  
  it('handles API errors', async () => {
    // Generated error test...
  })
})
```

### 2. JSDoc Documentation
```typescript
/**
 * Fetches user dashboard statistics
 * @param userId - User identifier
 * @returns Dashboard data with stats
 * @throws Error if unauthorized
 * @example
 * const data = await getDashboard('user-123');
 */
export async function getDashboard(userId: string) {
  // Implementation...
}
```

### 3. Code Analysis
```
Security Issues Found:
- Missing input validation in /api/payout/check
- SQL injection risk in /api/admin/users

Performance Bottlenecks:
- N+1 query in dashboard loading
- Unoptimized image serving

Code Quality:
- 2 unused imports in components/
- 3 eslint warnings needing fixes
```

### 4. Refactoring Suggestions
```
Suggested Improvements:
- Extract StatsCard as separate component
- Move dashboard logic to custom hook
- Optimize re-renders with useMemo
- Simplify complex conditional logic
```

---

## Quick Commands Reference

```bash
# Setup & Testing
bash scripts/qwen-quick-start.sh setup   # Configure API
npm run qwen:explain                     # Explain architecture

# Generate (Most useful)
npm run qwen:test                        # Generate unit tests
npm run qwen:docs                        # Generate JSDoc
npm run qwen:refactor                    # Suggest refactoring
npm run qwen:analyze                     # Find issues
npm run qwen:ci:fix                      # Auto-fix errors

# Local workflow
git commit -m "feat: add new feature"
npm run qwen:test                        # Generate tests
npm run test                             # Run all tests
npm run lint                             # Check linting
git push                                 # Push to GitHub
# GitHub Actions will auto-run qwen checks
```

---

## Expected Workflow

### For Developers
```
1. Make code changes
2. Run: npm run qwen:test
3. Review generated tests
4. Run: npm run test (to verify)
5. Commit and push
6. GitHub Actions automatically runs Qwen checks
7. PR gets summary comment with findings
```

### For Team Leads
```
1. Monitor GitHub Actions workflow results
2. Review code quality metrics in PR comments
3. Ask developers to run qwen:analyze on their branches
4. Merge confident code that has Qwen approval
```

### For DevOps
```
1. Set OPENAI_API_KEY in GitHub Secrets
2. Monitor workflow runs in Actions tab
3. Check API usage billing in OpenAI dashboard
4. Alert team if approaching rate limits
```

---

## Time Commitment

- **Initial Setup:** 5 min (authenticate API)
- **Per Feature:** +5 min (generate tests instead of 30 min)
- **Per PR Review:** +2 min (read Qwen summary instead of 15 min analysis)
- **Monthly:** Saves ~20+ hours per developer

---

## Success Metrics (2-week checkpoint)

Track these after 2 weeks:

- ✅ All new features have generated tests
- ✅ All files have JSDoc comments
- ✅ Code analysis identifies 10+ fixable issues
- ✅ GitHub Actions workflow runs on every commit
- ✅ PR review time reduced by 30%
- ✅ Test coverage increased to 80%+

---

## Next Steps

1. ✅ Run: `bash scripts/qwen-quick-start.sh setup`
2. ✅ Verify: `npm run qwen:explain`
3. ✅ Test: `npm run qwen:test`
4. ✅ Push: `git push origin main`
5. ✅ Monitor: Check GitHub Actions results
6. ✅ Share: Send `QWEN_TEAM_TRAINING.md` to team

---

## Support

| Issue | Solution |
|-------|----------|
| Setup problem | See QWEN_CODE_SETUP_GUIDE.md |
| Team training | See QWEN_TEAM_TRAINING.md |
| Command reference | Run: `bash scripts/qwen-quick-start.sh help` |
| API issues | See Troubleshooting section above |

---

**You're all set! Start with:** `npm run qwen:explain`
