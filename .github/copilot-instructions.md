# GitHub Copilot Agent Instructions

## Language Preference
- **Always respond in Vietnamese (Tiếng Việt)** for all communications
- Use Vietnamese for:
  - Explanations and summaries
  - Code comments when appropriate
  - Commit messages (optional, but descriptions should be in Vietnamese)
  - Documentation
  - Error explanations

## Code Style
- Follow guidelines in AGENTS.md
- Use `echo -n` when piping ENV variables to avoid newline bugs
- Verify ENV changes immediately after applying

## Response Format
- Be concise and action-oriented
- Use emojis for better readability (✅ ❌ 🔍 ⚠️ 🚀)
- Provide runnable command examples in code blocks

## Project Context
- Next.js 16 + TypeScript + Prisma + Neon Postgres
- Vercel deployment with production URL: https://apexrebate.com
- Monitoring via scripts/monitor-production.sh
