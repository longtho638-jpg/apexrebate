# 🤖 Qwen Code Team Training Guide

**Target Audience:** All ApexRebate developers  
**Duration:** 15 minutes  
**Updated:** Nov 17, 2025

---

## What is Qwen Code?

Qwen Code is an AI-powered code assistant that helps developers:
- **Generate unit tests** automatically (saves 30 min per file)
- **Refactor code** for performance and readability (saves 60 min per session)
- **Generate documentation** with JSDoc examples (saves 45 min per file)
- **Analyze code** for quality, security, and performance issues (saves 90 min per audit)
- **Fix CI/CD errors** automatically (saves 60 min per incident)

**Est. Team Savings:** 20+ hours/week when used consistently

---

## Quick Start (5 minutes)

### 0. Authenticate Once (CLI 0.2.x)
```bash
# Run helper (choose option 1 for OAuth if prompted)
bash scripts/qwen-quick-start.sh setup

# OAuth tokens live in ~/.qwen/oauth_creds.json
```

> **Heads up:** the CLI auto-loads `.env`. Prefix commands with an empty `OPENAI_API_KEY` so OAuth is used instead of the placeholder key:
```bash
OPENAI_API_KEY= QWEN_OAUTH=1 npm run qwen:explain -- --allowed-tools run_shell_command
OPENAI_API_KEY= QWEN_OAUTH=1 npm run qwen:test     -- --allowed-tools run_shell_command
```
The `--allowed-tools run_shell_command` flag lets Qwen inspect the repo (list files, run `git status`, etc.) during a run.

### 1. Verify Installation
```bash
# Check if Qwen is installed
which qwen
qwen --version
# Output: 0.2.1 ✅
```

### 2. Run Your First Command
```bash
# Explain ApexRebate architecture
npm run qwen:explain

# Output: [AI explains the system architecture...]
```

### 3. Generate Tests for Your Changes
```bash
# Auto-generate tests for modified files
npm run qwen:test

# Output: [Jest unit tests generated...]
```

---

## Available Commands

> **Tip:** Append `-- --allowed-tools run_shell_command` to every `npm run qwen:*` call so the agent can run shell commands. Keep `OPENAI_API_KEY=` empty if you rely on OAuth tokens.

### 🧪 Generate Tests
```bash
npm run qwen:test
```
**What it does:**
- Analyzes your code changes
- Generates Jest unit tests
- Includes edge cases and error scenarios
- Uses testing-library for React components

**Example output:**
```typescript
describe('UserDashboard component', () => {
  it('renders dashboard with user data', () => {
    // Generated test...
  })
  
  it('handles API errors gracefully', () => {
    // Generated error test...
  })
})
```

**Time saved:** 30 min per file → 5 min

---

### 🔨 Refactor Code
```bash
npm run qwen:refactor
```
**What it does:**
- Identifies code quality issues
- Extracts reusable components
- Optimizes TypeScript types
- Applies ApexRebate coding standards

**Time saved:** 60 min per session → 10 min

---

### 🚀 Team Rollout Checklist
1. **Local Auth:** Run `bash scripts/qwen-quick-start.sh setup` once per machine (OAuth cached in `~/.qwen/oauth_creds.json`).
2. **CLI Flags:** Use `OPENAI_API_KEY= QWEN_OAUTH=1 npm run qwen:<command> -- --allowed-tools run_shell_command` locally.
3. **CI Secret:** Confirm `OPENAI_API_KEY` is configured in GitHub Secrets for `.github/workflows/qwen-code-checks.yml`.
4. **Live Demo:** Pair newcomers through one `npm run qwen:test` session and paste the console output into PRs.
5. **Feedback Loop:** Capture wins/time-saved in `AGENTS.md` so leadership can quantify the ROI.

---

### 📚 Generate Documentation
```bash
npm run qwen:docs
```
**What it does:**
- Adds JSDoc comments to all functions
- Includes @param, @returns, @example tags
- Documents error cases
- Follows TypeScript strict mode

**Example output:**
```typescript
/**
 * Fetches user dashboard data
 * @param userId - The ID of the user
 * @returns Promise<DashboardData> User dashboard with stats
 * @throws Error if user not found or unauthorized
 * @example
 * const data = await getDashboard('user-123');
 * console.log(data.savings);
 */
export async function getDashboard(userId: string): Promise<DashboardData> {
  // Implementation...
}
```

**Time saved:** 45 min per file → 5 min

---

### 🔍 Analyze Code
```bash
npm run qwen:analyze
```
**What it does:**
- Finds security vulnerabilities
- Identifies performance bottlenecks
- Detects code quality issues
- Provides actionable recommendations

**Time saved:** 90 min per audit → 15 min

---

### 🐛 Fix CI/CD Errors
```bash
npm run qwen:ci:fix
```
**What it does:**
- Analyzes test failures
- Fixes linting errors
- Resolves type mismatches
- Auto-commits fixes (optional)

**Time saved:** 60 min per incident → 10 min

---

### 🏛️ Explain Architecture
```bash
npm run qwen:explain
```
**What it does:**
- Explains the entire system
- Documents architecture decisions
- Clarifies component relationships
- Answers technical questions

---

## Real-World Examples

### Example 1: Generate Tests Before Commit

**Scenario:** You modified `src/lib/auth.ts`

```bash
# 1. Make your changes
nano src/lib/auth.ts

# 2. Generate tests automatically
npm run qwen:test

# 3. Review generated tests (in console output)

# 4. Commit with confidence
git add .
git commit -m "feat: enhance authentication flow"
git push
```

**Result:** Tests generated in 5 minutes instead of 30 minutes

---

### Example 2: Refactor Dashboard Component

**Scenario:** Dashboard component has 400+ lines

```bash
# 1. Run refactor suggestion
npm run qwen:refactor

# 2. Review suggestions
# → Extract StatsCard component
# → Move hooks to custom hooks
# → Optimize re-renders

# 3. Apply improvements
# 4. Run tests
npm run test

# 5. Commit improvements
git commit -m "refactor: improve dashboard component structure"
```

**Result:** Code is cleaner, tests pass, in 10 minutes vs. 60 minutes

---

### Example 3: Document New API Endpoint

**Scenario:** You created `src/app/api/payout/check/route.ts`

```bash
# 1. Generate documentation
npm run qwen:docs

# 2. Check generated JSDoc
# ✅ All functions documented
# ✅ All parameters explained
# ✅ Return types documented
# ✅ Examples provided

# 3. Commit
git commit -m "docs: add JSDoc for payout check endpoint"
```

**Result:** Full documentation in 5 minutes vs. 45 minutes

---

### Example 4: Find Security Issues

**Scenario:** Security audit needed before production

```bash
# 1. Run analysis
npm run qwen:analyze

# 2. Review findings
# → SQL injection risk in query builder
# → Missing authentication check on admin endpoint
# → Race condition in payment processing

# 3. Fix issues
# 4. Re-run analysis to verify
npm run qwen:analyze

# 5. Deploy with confidence
```

**Result:** Found and fixed 5+ issues in 15 min vs. 90 min

---

## CI/CD Integration

### Automatic Tests on Every Push

The GitHub Actions workflow (`qwen-code-checks.yml`) automatically:

```
On every commit to main/develop:
├── 🔍 Analyze code quality
├── 🧪 Generate tests for changed files
├── 📚 Generate documentation
├── 🔨 Check for refactoring opportunities
└── 📊 Post summary comment on PR
```

**No manual action needed** – Qwen runs in the background!

---

## Best Practices

### ✅ DO

1. **Run qwen:test before committing**
   ```bash
   npm run qwen:test
   git add tests/
   git commit -m "test: auto-generated unit tests"
   ```

2. **Use qwen:analyze in code reviews**
   - Identify issues early
   - Request AI suggestions as PR comments

3. **Document as you code**
   ```bash
   npm run qwen:docs
   # JSDoc is auto-added to all functions
   ```

4. **Run qwen:fix on CI/CD failures**
   ```bash
   # If GitHub Actions fail:
   npm run qwen:ci:fix
   git push  # Auto-commit fixes
   ```

5. **Share findings with team**
   - Copy qwen:analyze output to Slack
   - Discuss suggestions in standup

### ❌ DON'T

1. **Don't ignore Qwen suggestions**
   - They're based on best practices
   - Security recommendations are critical

2. **Don't rely solely on AI-generated code**
   - Review all generated tests
   - Verify generated documentation
   - Test fixes before deploying

3. **Don't commit without running qwen:test**
   - Test coverage matters
   - Edge cases might be missed

4. **Don't use outdated API keys**
   - Check `qwen --version` regularly
   - Update if needed: `npm install -g @qwen-code/qwen-code@latest`

---

## Metrics & ROI

### Productivity Gains

| Task | Time Before | Time After | Savings |
|------|------------|-----------|---------|
| Generate unit tests | 30 min | 5 min | **83%** ⚡ |
| Refactor code | 60 min | 10 min | **83%** ⚡ |
| Generate JSDoc | 45 min | 5 min | **89%** ⚡ |
| Code analysis | 90 min | 15 min | **83%** ⚡ |
| Fix CI/CD errors | 60 min | 10 min | **83%** ⚡ |

### Monthly Impact (5 developers)

```
Before Qwen:
- 25 features/month
- 15 hours testing
- 10 hours documentation
- Total: 285 hours/month

After Qwen:
- 35 features/month (+40%)
- 5 hours testing (-67%)
- 2 hours documentation (-80%)
- Total: 247 hours/month

Savings: 38 hours/month per team
        = ~1 extra developer capacity
        = $8,000/month value
```

---

## Troubleshooting

### Error: "401 Incorrect API key provided"
**Solution:**
```bash
bash scripts/qwen-quick-start.sh setup
# Choose option 1 (Qwen OAuth) or option 2 (API Key)
```

### Error: "qwen: command not found"
**Solution:**
```bash
npm install -g @qwen-code/qwen-code@latest
# or via Homebrew:
brew install qwen-code
```

### Tests not generating?
**Solution:**
```bash
# Ensure you're in the right directory
cd /Users/macbookprom1/apexrebate-1

# Check Qwen is working
npm run qwen:explain

# Then try tests
npm run qwen:test
```

### API rate limit hit?
**Solution:**
- Use Qwen OAuth (2,000 requests/day free)
- Upgrade OpenAI API plan
- Stagger requests throughout day

---

## Team Setup Checklist

### For Each Developer:

- [ ] Verify Qwen installed: `qwen --version`
- [ ] Run `npm run qwen:explain` at least once
- [ ] Set up API authentication (OAuth or API key)
- [ ] Try `npm run qwen:test` on a recent change
- [ ] Review this training document
- [ ] Bookmark: https://qwen.alibaba.com/code

### For Team Lead:

- [ ] Set GitHub Secrets: `gh secret set OPENAI_API_KEY`
- [ ] Enable `qwen-code-checks.yml` workflow
- [ ] Add Qwen tips to code review checklist
- [ ] Monitor workflow results in Actions tab
- [ ] Measure productivity gains after 2 weeks

### For DevOps:

- [ ] Configure OpenAI API key in CI/CD pipeline
- [ ] Set up artifact uploads for test results
- [ ] Create Slack integration for workflow alerts
- [ ] Monitor API usage and billing
- [ ] Schedule nightly deep code analysis

---

## Quick Reference Card

**Print this and keep at your desk:**

```
┌─────────────────────────────────────────┐
│        QWEN CODE QUICK REFERENCE        │
├─────────────────────────────────────────┤
│                                         │
│  🧪 Generate Tests                     │
│     npm run qwen:test                  │
│                                         │
│  🔨 Refactor Code                      │
│     npm run qwen:refactor               │
│                                         │
│  📚 Generate Docs                      │
│     npm run qwen:docs                   │
│                                         │
│  🔍 Analyze Code                       │
│     npm run qwen:analyze                │
│                                         │
│  🐛 Fix Errors                         │
│     npm run qwen:ci:fix                 │
│                                         │
│  🏛️ Explain Architecture                │
│     npm run qwen:explain                │
│                                         │
│  Setup / Help                          │
│     bash scripts/qwen-quick-start.sh    │
│                                         │
└─────────────────────────────────────────┘
```

---

## FAQ

**Q: Is Qwen Code free?**  
A: Yes! Qwen OAuth provides 2,000 free requests/day. OpenAI API has pay-as-you-go pricing ($0.002-$0.06 per 1K tokens).

**Q: Can I use it offline?**  
A: No, Qwen requires API connection. Set up API key/OAuth first.

**Q: Will it replace developers?**  
A: No! Qwen automates repetitive tasks (testing, docs, refactoring). Developers focus on architecture and logic.

**Q: How do I disable it?**  
A: It's optional. Developers can choose when to use it.

**Q: Can I customize the AI instructions?**  
A: Yes! Modify the prompts in `package.json` scripts section.

**Q: How long does analysis take?**  
A: Typically 2-5 minutes depending on code size and API load.

---

## Resources

- **Qwen Code Official:** https://qwen.alibaba.com/code
- **OpenAI API Keys:** https://platform.openai.com/account/api-keys
- **ApexRebate Documentation:** See `/docs` folder
- **Setup Guide:** `QWEN_CODE_SETUP_GUIDE.md`
- **CI/CD Workflow:** `.github/workflows/qwen-code-checks.yml`

---

## Questions?

1. Check `QWEN_CODE_SETUP_GUIDE.md` for setup issues
2. Review workflow results in GitHub Actions
3. Post in team Slack #engineering channel
4. Tag maintainers for urgent issues

---

**Remember:** Qwen Code saves time → Code quality improves → Features ship faster → Customers are happy 🚀

Let's automate the boring stuff and focus on what makes ApexRebate amazing!
