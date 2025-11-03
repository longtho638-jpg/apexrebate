# Vercel Optimize Agent - Hướng Dẫn Sử Dụng

Agent này tự động dọn cache Next.js và trigger redeploy lên Vercel để khắc phục lỗi build.

## 🎯 Giải quyết vấn đề gì?

Khi Vercel build bị lỗi do:
- Cache Next.js cũ gây conflict
- Cache quá lớn (> 250 MB) vượt quá giới hạn serverless function
- Pattern functions không đúng trong vercel.json
- Build cache bị corrupted

Agent này sẽ:
1. ✅ Xóa `.next/cache` và `.next/trace`
2. ✅ Tạo `.vercelignore` để loại trừ cache khỏi deployment
3. ✅ Đảm bảo `vercel.json` có cấu hình đúng
4. ✅ Commit thay đổi tự động
5. ✅ Trigger redeploy lên Vercel

## 🚀 Cách sử dụng

### Phương pháp 1: Comment trong GitHub (Copilot)
```
@vercel-optimize run
```

### Phương pháp 2: Script trigger thủ công

```bash
# Set GitHub token
export GH_TOKEN="ghp_your_token_here"

# Trigger trên branch hiện tại
./scripts/trigger-vercel-optimize.sh

# Trigger trên branch cụ thể
./scripts/trigger-vercel-optimize.sh my-branch

# Trigger với PR number (để comment kết quả)
./scripts/trigger-vercel-optimize.sh my-branch 123
```

### Phương pháp 3: GitHub API trực tiếp

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/longtho638-jpg/apexrebate/dispatches \
  -d '{"event_type":"run-agent","client_payload":{"agent":"vercel-optimize","branch":"main"}}'
```

## 🔐 Thiết lập ban đầu

### 1. Tạo Vercel Token

1. Truy cập https://vercel.com/account/tokens
2. Click **Create Token**
3. Đặt tên: `GitHub Actions - apexrebate`
4. Scope: `Full Account`
5. Copy token (chỉ hiển thị 1 lần)

### 2. Thêm Secret vào GitHub

1. Vào repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `VERCEL_TOKEN`
4. Value: Token vừa copy từ Vercel
5. Click **Add secret**

### 3. Tạo GitHub Token (cho script)

1. Vào https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Đặt tên: `Trigger Workflows`
4. Chọn scope: `repo` (Full control)
5. Click **Generate token**
6. Copy token và lưu vào environment:

```bash
# Linux/Mac - thêm vào ~/.bashrc hoặc ~/.zshrc
export GH_TOKEN="ghp_your_token_here"

# Windows - dùng PowerShell
$env:GH_TOKEN = "ghp_your_token_here"
```

## 📋 Workflow chi tiết

Khi agent chạy:

1. **Checkout code** - Lấy code mới nhất từ branch
2. **Clean cache** - Xóa `.next/cache` và `.next/trace`
3. **Check vercel.json** - Tạo mới nếu chưa có, giữ nguyên nếu đã có
4. **Commit changes** - Commit với message `fix(vercel): auto-cleanup cache and exclude from build`
5. **Push to GitHub** - Push lên branch hiện tại
6. **Trigger Vercel** - Gọi API Vercel để redeploy

## 🔍 Kiểm tra kết quả

1. **Workflow runs**: https://github.com/longtho638-jpg/apexrebate/actions/workflows/agent-vercel-optimize.yml
2. **Vercel deployments**: https://vercel.com/longtho638-jpg/apexrebate/deployments

## ⚠️ Lưu ý

- Workflow cần quyền `contents: write` để commit
- Nếu `vercel.json` đã tồn tại, workflow **KHÔNG** ghi đè
- Cache được xóa mỗi lần chạy workflow
- Vercel sẽ tự động rebuild sau khi nhận trigger
- Token Vercel cần scope **Full Account** để trigger deployment

## 🐛 Troubleshooting

### Lỗi: "Resource not accessible by integration"
→ Kiểm tra GitHub token có scope `repo` đầy đủ

### Lỗi: "Invalid Vercel token"
→ Kiểm tra secret `VERCEL_TOKEN` đã được thêm chính xác

### Workflow không chạy
→ Kiểm tra workflow file syntax tại Actions tab

### Vercel không rebuild
→ Kiểm tra Vercel token có quyền trigger deployment

## 📚 Tài liệu liên quan

- [GitHub Actions - repository_dispatch](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#repository_dispatch)
- [Vercel API - Deployments](https://vercel.com/docs/rest-api/endpoints/deployments)
- [Next.js Build Cache](https://nextjs.org/docs/pages/building-your-application/deploying#caching)

## 💡 Tips

- Chạy agent này khi Vercel build fail không rõ nguyên nhân
- Có thể kết hợp với `@codex-fullchain` để chạy full CI/CD
- Dùng script để test nhanh không cần qua GitHub UI
- Xem logs chi tiết tại GitHub Actions để debug
