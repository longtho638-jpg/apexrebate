---
name: vercel-optimize
description: "Tự động dọn cache Next.js, cấu hình vercel.json và redeploy lên Vercel."
---

# Vercel Optimize Agent

**Trigger:** `@vercel-optimize run`

## 🎯 Mục tiêu
Tự động tối ưu hóa và khắc phục lỗi Vercel deployment bằng cách:
1. Xóa cache Next.js (.next/cache và .next/trace)
2. Cập nhật vercel.json với excludeFiles để loại trừ cache khỏi build
3. Commit các thay đổi tự động
4. Trigger redeploy lên Vercel

## 🚀 Cách hoạt động
1. Workflow được trigger qua `repository_dispatch` event
2. Checkout repository
3. Xóa .next/cache và .next/trace để dọn dẹp cache cũ
4. Đảm bảo vercel.json tồn tại với cấu hình phù hợp (không ghi đè nếu đã có)
5. Commit và push thay đổi (nếu có)
6. Gọi Vercel API để trigger redeploy

## 💡 Cách sử dụng
Trong comment PR hoặc issue:
```
@vercel-optimize run
```

Hoặc trong Copilot Chat:
```
@vercel-optimize please optimize and redeploy
```

## 🔐 Yêu cầu
**Secret cần thiết lập:**
- `VERCEL_TOKEN`: Token cá nhân từ [vercel.com/account/tokens](https://vercel.com/account/tokens)

Để thêm secret:
1. Vào **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `VERCEL_TOKEN`
4. Value: Token từ Vercel account của bạn

## ⚠️ Lưu ý
- Cần quyền `contents: write` để commit thay đổi
- Workflow sẽ tự động push lên branch hiện tại
- Workflow không ghi đè vercel.json nếu file đã tồn tại (để bảo toàn cấu hình hiện có)
- Xóa cache Next.js giúp giải quyết vấn đề build bị lỗi do cache cũ
- Vercel API sẽ trigger deployment tự động sau khi workflow chạy xong
