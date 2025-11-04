# 🧠 GitHub Copilot Agent Guide
> Zen-tier 3-stage Manual Chain CI/CD — bilingual documentation 🇻🇳 / 🇺🇸

---

## 🇻🇳 Hướng dẫn sử dụng (Vietnamese)

### 🔗 Chuỗi tác nhân (Agents)
| Giai đoạn | Agent | Nhiệm vụ | Lệnh kích hoạt |
|:--|:--|:--|:--|
| 🧩 Stage 1 | codex-merge-fix | Kiểm lint/build, phát hiện conflict | `@codex-merge-fix run` |
| ✅ Stage 2 | codex-auto-approve | Tự động approve nếu pass check | `@codex-auto-approve run` |
| 🚀 Stage 3 | codex-auto-merge | Merge PR đã được approve & pass | `@codex-auto-merge run` |
| 🔧 Utility | vercel-optimize | Dọn cache Next.js & redeploy Vercel | `@vercel-optimize run` |

### ⚙️ Quy trình thực thi thủ công
1. Gõ `@codex-merge-fix run` → bot chạy lint/build.  
2. Nếu pass, gõ `@codex-auto-approve run` → bot approve PR.  
3. Sau đó `@codex-auto-merge run` → merge và xoá branch.  
4. Xem log ở tab **Actions → All workflows**.

### 🧰 Xử lý sự cố
| Tình huống | Giải pháp |
|-------------|------------|
| ❌ PR bị conflict | Sử dụng `gh pr checkout` và merge thủ công, sau đó rerun agent. |
| 🕐 Lỗi timeout workflow | Rerun job trong tab Actions. |
| 🔒 PR không được merge | Kiểm tra quyền branch protection hoặc chưa có approval. |
| ⚠️ Lint/build fail | Sửa lỗi local, commit và push, sau đó rerun `@codex-merge-fix run`. |
| 🚫 Agent không phản hồi | Kiểm tra Settings → Copilot → Chat features → Enable Agents. |
| 🏗️ Vercel build fail | Chạy `@vercel-optimize run` để dọn cache và trigger redeploy. |

### 🔒 Quyền & Bảo mật
- `codex-merge-fix`: `contents: read`  
- `codex-auto-approve`: `pull-requests: write, contents: read`  
- `codex-auto-merge`: `contents: write, pull-requests: write`  
→ Tuân thủ nguyên tắc *least privilege*.

### 🔄 Rollback trong trường hợp khẩn cấp
1. Vào tab **Actions** → tìm workflow đã chạy.
2. Click **Re-run failed jobs** hoặc **Re-run all jobs**.
3. Nếu cần revert merge, dùng: `git revert <commit-hash>` và tạo PR mới.

### 🚀 Nâng cấp lên Auto-Chain (tùy chọn)
Để agents tự động chain thay vì manual trigger, thêm vào cuối mỗi workflow:
```yaml
- name: Trigger next agent
  if: success()
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    gh api repos/${{ github.repository }}/dispatches \
      -f event_type=run-agent \
      -f client_payload='{"agent":"<next-agent-name>","pull_number":"${{ github.event.client_payload.pull_number }}"}'
```

---

## 🇺🇸 Developer Guide (English)

### 🔗 Agent Chain Overview
| Stage | Agent | Purpose | Trigger |
|:--|:--|:--|:--|
| 🧩 1 | codex-merge-fix | Validate PR build and detect conflicts | `@codex-merge-fix run` |
| ✅ 2 | codex-auto-approve | Auto-approve PR if validation passed | `@codex-auto-approve run` |
| 🚀 3 | codex-auto-merge | Merge PR and delete branch after approval | `@codex-auto-merge run` |
| 🔧 Utility | vercel-optimize | Clean Next.js cache & redeploy to Vercel | `@vercel-optimize run` |

### ⚙️ Manual Execution Flow
1. Type `@codex-merge-fix run` → agent runs lint/build validation.  
2. If passed, type `@codex-auto-approve run` → agent approves PR.  
3. Then `@codex-auto-merge run` → merge and delete branch.  
4. View logs in **Actions → All workflows** tab.

### 🧰 Troubleshooting
| Issue | Solution |
|-------|----------|
| ❌ PR has conflicts | Use `gh pr checkout` and merge manually, then rerun agent. |
| 🕐 Workflow timeout | Rerun job in Actions tab. |
| 🔒 PR not merging | Check branch protection rules or missing approval. |
| ⚠️ Lint/build failure | Fix errors locally, commit and push, then rerun `@codex-merge-fix run`. |
| 🚫 Agent not responding | Check Settings → Copilot → Chat features → Enable Agents. |
| 🏗️ Vercel build failure | Run `@vercel-optimize run` to clean cache and trigger redeploy. |

### 🔒 Permissions & Security
- `codex-merge-fix`: `contents: read`  
- `codex-auto-approve`: `pull-requests: write, contents: read`  
- `codex-auto-merge`: `contents: write, pull-requests: write`  
→ Follows *least privilege* principle.

### 🔄 Emergency Rollback Procedure
1. Go to **Actions** tab → find the workflow run.
2. Click **Re-run failed jobs** or **Re-run all jobs**.
3. To revert a merge, use: `git revert <commit-hash>` and create a new PR.

### 🚀 Upgrade to Auto-Chain (optional)
To enable automatic chaining instead of manual triggers, add to the end of each workflow:
```yaml
- name: Trigger next agent
  if: success()
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    gh api repos/${{ github.repository }}/dispatches \
      -f event_type=run-agent \
      -f client_payload='{"agent":"<next-agent-name>","pull_number":"${{ github.event.client_payload.pull_number }}"}'
```

---

## 📂 File Structure
```
.github/
├── agents/
│   ├── codex-merge-fix.md          # Stage 1: Validation
│   ├── codex-auto-approve.md       # Stage 2: Approval
│   ├── codex-auto-merge.md         # Stage 3: Merge
│   └── GITHUB_AGENT_GUIDE.md       # This guide
└── workflows/
    ├── agent-dispatch.yml          # Validation workflow
    ├── agent-auto-approve.yml      # Approval workflow
    └── agent-auto-merge.yml        # Merge workflow
```

## 🧪 Testing the Pipeline

### Initial Setup
1. Enable GitHub Copilot Agents:
   - Go to **Settings → Copilot → Chat features**
   - Enable **"Enable Agents"**

2. Open any Pull Request

3. Test each stage sequentially:
```bash
@codex-merge-fix run       # Stage 1
@codex-auto-approve run    # Stage 2
@codex-auto-merge run      # Stage 3
```

### Validation Checklist
- [ ] Lint passed without errors
- [ ] Build completed successfully
- [ ] No merge conflicts detected
- [ ] PR approved by agent
- [ ] Branch merged and deleted
- [ ] All logs visible in Actions tab

## 📊 Workflow States

| State | Icon | Description |
|-------|------|-------------|
| Queued | 🟡 | Workflow waiting to start |
| Running | 🔵 | Workflow currently executing |
| Success | ✅ | Workflow completed successfully |
| Failed | ❌ | Workflow encountered an error |
| Cancelled | ⚪ | Workflow was manually cancelled |

## 🔧 Customization Examples

### Add Custom Validation Steps
Edit `.github/workflows/agent-dispatch.yml`:
```yaml
- run: npm run test || echo "::error::Tests failed"
- run: npm run type-check || echo "::error::Type check failed"
```

### Branch Protection Rules
Recommended settings for protected branches:
- Require pull request reviews before merging
- Require status checks to pass (Codex Merge Fix Runner)
- Require branches to be up to date before merging
- Include administrators (can be bypassed by agent with --admin flag)

### Environment Variables
Agents support these environment variables:
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- `GH_TOKEN`: Used by GitHub CLI commands
- Custom variables can be added in workflow files

## 📞 Support & Contributing

For issues or questions:
1. Check this guide first
2. Review workflow logs in Actions tab
3. Check agent definition files for specific behavior
4. Create an issue in the repository if problem persists

To contribute improvements:
1. Fork the repository
2. Create a feature branch
3. Test changes with the agent pipeline
4. Submit a Pull Request

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-02  
**Architecture:** Manual Chain (3-stage)  
**Upgrade Path:** Auto-chain capable with 2-line YAML modification
