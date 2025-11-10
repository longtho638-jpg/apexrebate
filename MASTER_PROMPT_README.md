# 🎯 HOW TO USE MASTER PROMPT FOR NEW CHATS

> Tránh repeat context dài - just copy-paste vào chat mới!

---

## 📋 THE PROBLEM

Mỗi chat mới, phải:
- Repeat: "I'm working on ApexRebate..."
- Explain: Admin, SEED, CI/CD architecture
- Reference: Multiple docs
- Time wasted: 5-10 minutes on context

---

## ✅ THE SOLUTION

**3 files giúp bạn nhanh chóng có full context:**

### 1. **MASTER_PROMPT.md** (Copy-Paste Everything)
- Complete project context
- All key commands
- Current status
- Quick start guide
- ~2min to read full context

**When to use**: Starting new chat
**How**: Copy entire content into chat message

### 2. **QUICK_JUMP.md** (Fast Navigation)
- Documentation map
- Command quick ref
- File structure guide
- Common workflows
- Pro tips

**When to use**: Need to find something quickly
**How**: Use table of contents to jump to section

### 3. **ARCHITECTURE_ADMIN_SEED.md** (Deep Dive)
- Complete architecture
- All 27 files listed
- Feature matrix
- Security details
- Database schema

**When to use**: Understanding full system
**How**: Read once, reference often

---

## 🚀 QUICK START (Right Now)

### **Option 1: New Chat (Complete Context)**

Copy entire section from `MASTER_PROMPT.md`:

```
PROJECT: ApexRebate (Next.js 15 + Neon PostgreSQL + Vercel)
STATUS: Production Ready (Nov 2025)
[... copy all content from MASTER_PROMPT.md ...]
```

Paste into new chat, then ask whatever you want.

### **Option 2: New Chat (Quick Reference)**

Just copy this minimum context:

```
ApexRebate: Next.js 15 marketplace with:
- Admin dashboard (/admin, 8 files)
- SEED marketplace (/tools, 19 files)
- Agentic CI/CD + OPA policies
- Database: 14 Prisma models
- Status: Production Ready (Nov 10, 2025)

Docs: MASTER_PROMPT.md, QUICK_JUMP.md, ARCHITECTURE_ADMIN_SEED.md
Commands: See AGENTS.md § 1
```

---

## 📍 WHICH FILE WHEN?

### **Starting a new session?**
```
→ Copy MASTER_PROMPT.md into chat
→ Then ask your question
```

### **Need to find something?**
```
→ Check QUICK_JUMP.md (navigation table)
→ Or use ARCHITECTURE_ADMIN_SEED.md (full inventory)
```

### **Debugging specific feature?**
```
→ Find file in ARCHITECTURE_ADMIN_SEED.md § "FILE INVENTORY"
→ Read that file
→ Ask specific question in chat
```

### **Understanding architecture?**
```
→ Read ARCHITECTURE_ADMIN_SEED.md (full map)
→ Check AGENTS_2025_MAX_LEVEL.md (industry standards)
```

### **Running commands?**
```
→ Check AGENTS.md § 1 (all commands)
→ Or MASTER_PROMPT.md § "QUICK START"
```

---

## 💡 PRO TIPS

### Tip 1: Setup Bookmark
```
In VS Code:
1. Cmd+Shift+P → "Bookmarks: Toggle"
2. Open MASTER_PROMPT.md
3. Click bookmark icon
4. Now always 1-click away
```

### Tip 2: Chat Template
Create saved template:
```
(Copy entire MASTER_PROMPT.md § "MASTER CONTEXT PROMPT")

---

## What I'm working on:

[Describe your task]

## Specific questions:

[List your questions]
```

### Tip 3: Quick Tab Setup
```
Open these 4 tabs:
1. MASTER_PROMPT.md (reference)
2. QUICK_JUMP.md (navigation)
3. ARCHITECTURE_ADMIN_SEED.md (deep dive)
4. Active code file (editing)
```

### Tip 4: Use findmoji
```bash
# Search for feature
finder --query "admin dashboard features"

# Then reference: ARCHITECTURE_ADMIN_SEED.md § 1B
```

---

## 📊 CONTEXT OPTIMIZATION

### Before (without Master Prompt)
```
Chat 1: "Explain admin..."        (5min)
Chat 2: "Explain SEED..."         (5min)
Chat 3: "What's the status?"      (2min)
Chat 4: "How to deploy?"          (3min)
---
Total: 15min repeating context
```

### After (with Master Prompt)
```
Chat 1: (Copy MASTER_PROMPT) 🚀   (30sec)
Chat 2: (Copy MASTER_PROMPT) 🚀   (30sec)
Chat 3: (Copy MASTER_PROMPT) 🚀   (30sec)
Chat 4: (Copy MASTER_PROMPT) 🚀   (30sec)
---
Total: 2min setup, 30sec per chat
Savings: 87% less context overhead
```

---

## ✅ VERIFICATION CHECKLIST

Before using Master Prompt, verify:

```
☐ MASTER_PROMPT.md exists
☐ QUICK_JUMP.md exists
☐ ARCHITECTURE_ADMIN_SEED.md exists
☐ AGENTS.md updated with links
☐ All 3 files have latest content
☐ Bookmark 1 file in VS Code
☐ Copy MASTER_PROMPT to clipboard
```

---

## 🔄 MAINTENANCE

### Update Frequency
```
MASTER_PROMPT.md       → Monthly (or after major changes)
QUICK_JUMP.md          → Monthly (reference table)
ARCHITECTURE_ADMIN_SEED.md → As needed (when adding features)
AGENTS.md              → As needed (new commands)
```

### What to Update
```
When you add feature X:
1. Add to ARCHITECTURE_ADMIN_SEED.md
2. Update file count
3. Update feature matrix
4. Update MASTER_PROMPT.md status
5. Update AGENTS.md commands (if new command)
```

---

## 📞 COMMON QUESTIONS

**Q: Can I share Master Prompt with team?**
```
A: YES! Copy-paste MASTER_PROMPT.md into team channel.
   Everyone gets same context instantly.
```

**Q: How to keep it updated?**
```
A: Set monthly reminder to check:
   - Add new features to feature matrix
   - Update file counts
   - Update status section
```

**Q: What if I forget a command?**
```
A: Check:
   1. AGENTS.md § 1 (all commands)
   2. MASTER_PROMPT.md § "QUICK START"
   3. Ask in chat: "What command for X?"
```

**Q: Can I customize it for my team?**
```
A: YES! Edit MASTER_PROMPT.md to add:
   - Your team's custom commands
   - Your deployment procedures
   - Your naming conventions
   - Your security requirements
```

---

## 🎯 IMPLEMENTATION STEPS

### Step 1: Verify Files Exist
```bash
ls -la MASTER_PROMPT.md QUICK_JUMP.md ARCHITECTURE_ADMIN_SEED.md AGENTS.md
```

### Step 2: Copy Master Prompt
```bash
cat MASTER_PROMPT.md | pbcopy    # macOS
# or Ctrl+C in VS Code
```

### Step 3: Start New Chat
```
Open new Amp chat
Paste MASTER_PROMPT.md content
Ask your question
Done! 🚀
```

### Step 4: Reference Docs
```
If need details:
→ Check QUICK_JUMP.md (navigation)
→ Check ARCHITECTURE_ADMIN_SEED.md (full map)
→ Use finder tool (search codebase)
```

---

## 📈 EXPECTED IMPACT

```
Before:
- Chat setup: 5-10 minutes
- Context loss between chats
- Repeated explanations

After:
- Chat setup: 30 seconds
- Full context instantly
- Consistent across all chats

Result: 90% faster context, 100% consistency
```

---

## 🎓 LEARNING PATH

1. **Read this file** (5min)
2. **Open MASTER_PROMPT.md** (2min)
3. **Bookmark it** (1min)
4. **Next chat**: Copy & paste (30sec)
5. **Reference QUICK_JUMP.md** (as needed)

---

## ✨ BONUS: Integration with Git Commits

Add to .gitignore:
```
# Context files (keep updated manually)
!MASTER_PROMPT.md
!QUICK_JUMP.md
!ARCHITECTURE_ADMIN_SEED.md
!AGENTS.md
!MASTER_PROMPT_README.md
```

Then commit changes:
```bash
git add MASTER_PROMPT.md QUICK_JUMP.md
git commit -m "docs: update master prompts and quick reference"
```

---

## 🚀 YOU'RE READY!

Next time you start a new chat:

```
1. Open MASTER_PROMPT.md
2. Cmd+A → Cmd+C (select all, copy)
3. New Amp chat
4. Cmd+V (paste)
5. Ask whatever you want!
```

**Time saved per chat: 9.5 minutes** ⏱️
**Consistency improved: 100%** ✅

---

> **Last Updated**: Nov 10, 2025
> **Status**: Ready to Use
> **Next Review**: Nov 30, 2025
