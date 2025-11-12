# ClaudeKit Engineer Integration

## 📦 Modules Đã Cài Đặt

### 1. Dependencies
✅ **403 npm packages** installed
- commitlint CLI & config (conventional commits)
- semantic-release (versioning & changelog)
- husky (git hooks)
- commitizen (commit wizard)

### 2. Configurations

#### Claude Code (.claude)
```
factory/claudekit-engineer-claude/
├── agents/           # Agent definitions
├── commands/         # Custom commands
├── hooks/            # Pre/post hooks
├── skills/           # AI skills
├── workflows/        # Development workflows
└── CLAUDE.md         # Development instructions
```

#### Open Code (.opencode)
```
factory/claudekit-engineer-opencode/
├── agent/           # Agent profiles
│   ├── planner.md
│   ├── researcher.md
│   ├── tester.md
│   ├── debugger.md
│   ├── code-reviewer.md
│   ├── docs-manager.md
│   ├── git-manager.md
│   └── project-manager.md
└── command/         # Custom commands
```

#### Workflows
```
factory/workflows/
├── primary-workflow.md
├── development-rules.md
├── orchestration-protocol.md
├── documentation-management.md
└── ...
```

## 🚀 Quick Start

### 1. Claude Code Commands
```bash
# Start interactive Claude Code
claude

# Planning
/plan "implement feature"

# Implementation
/cook "follow plan"

# Testing
/test "validate feature"

# Code review
/review "check quality"

# Documentation
/docs "update docs"

# Project status
/watzup "check progress"
```

### 2. Conventional Commits (commitlint)
```bash
# Commit types
feat:   New feature
fix:    Bug fix
docs:   Documentation only
style:  Code style changes
refactor: Code refactoring
perf:   Performance improvement
test:   Test changes
chore:  Build, deps, etc
ci:     CI/CD changes
```

### 3. Semantic Release
```bash
npm run semantic-release
# Automatically versions and updates CHANGELOG
```

## 📚 Key Files Reference

| File | Purpose |
|------|---------|
| CLAUDE.md | Development instructions |
| AGENTS.md | Agent coordination |
| plans/templates/ | Reusable plan templates |
| .claude/workflows/ | Workflow definitions |
| .opencode/agent/ | Agent specializations |

## 🔧 Integration with ApexRebate

### ApexRebate AGENTS.md
Already has Saigon Edition guidelines. Add claudekit integration:

```markdown
## 🏭 Factory System + ClaudeKit Integration

Use Claude Code with project-specific agents:
- Planner: Technical architecture
- Researcher: Technology analysis  
- Tester: Automated testing
- Debugger: Performance issues
- Code Reviewer: Quality standards
- Docs Manager: Auto-sync docs
```

### Environment Setup
```bash
# .env additions
export CLAUDE_WORKSPACE=/Users/macbookprom1/apexrebate-1
export FACTORY_PATH=$CLAUDE_WORKSPACE/factory
export CLAUDEKIT_ENGINEER=$FACTORY_PATH/claudekit-engineer
```

## ✅ Installation Checklist

- [x] npm packages installed (403 packages)
- [x] .claude configurations copied
- [x] .opencode agent profiles copied  
- [x] Workflows extracted
- [ ] Create .env for Gemini API (optional)
- [ ] Setup GitHub integration (optional)
- [ ] Configure Discord webhooks (optional)

## 📖 Next Steps

1. **Read CLAUDE.md** in factory/claudekit-engineer-claude/
2. **Review workflow templates** in factory/workflows/
3. **Customize agents** in factory/claudekit-engineer-opencode/agent/
4. **Start using Claude Code**: `claude`

## 🔗 Resources

- ClaudeKit Docs: https://docs.claudekit.cc
- Claude Code: https://code.claude.com
- Open Code: https://opencode.ai
- GitHub: https://github.com/claudekit/claudekit-engineer

