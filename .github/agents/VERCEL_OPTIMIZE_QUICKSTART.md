# Quick Start: Vercel Optimize Agent

## 🚀 Cách dùng nhanh / Quick Usage

```bash
@vercel-optimize run
```

## 📋 Checklist thiết lập / Setup Checklist

- [ ] Tạo Vercel token tại https://vercel.com/account/tokens
- [ ] Thêm secret `VERCEL_TOKEN` vào GitHub repository
- [ ] Test workflow bằng comment `@vercel-optimize run`

## 🔧 Khi nào dùng? / When to use?

✅ Vercel build fail không rõ lý do
✅ Cache Next.js bị corrupt
✅ Cần force redeploy sau khi fix config
✅ Deployment stuck hoặc timeout

## 📝 Chi tiết đầy đủ / Full Documentation

→ [VERCEL_OPTIMIZE_AGENT.md](../docs/VERCEL_OPTIMIZE_AGENT.md)
→ [GitHub Agent Guide](GITHUB_AGENT_GUIDE.md)

## 💡 Script trigger thủ công / Manual Trigger Script

```bash
# Set token
export GH_TOKEN="your_github_token"

# Run
./scripts/trigger-vercel-optimize.sh main
```
