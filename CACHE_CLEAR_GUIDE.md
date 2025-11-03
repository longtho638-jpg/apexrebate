# Hướng Dẫn Clear Cache

## Vấn Đề
Sau khi deploy code mới, đôi khi browser vẫn hiển thị phiên bản cũ do cache.

## Giải Pháp

### 1. Clear Browser Cache (Người Dùng)

**Chrome/Edge (macOS):**
```
Command + Shift + R
```

**Chrome/Edge (Windows/Linux):**
```
Ctrl + Shift + R
```

**Safari:**
```
Command + Option + E (Clear Cache)
sau đó: Command + R (Reload)
```

**Firefox:**
```
Ctrl + Shift + R (Windows/Linux)
Command + Shift + R (macOS)
```

### 2. Force Rebuild (Developer)

```bash
# Empty commit để force rebuild và clear Vercel CDN cache
git commit --allow-empty -m "chore: force rebuild to clear cache"
git push

# Đợi ~120 giây cho deployment hoàn tất
sleep 120

# Test production
./test-all-pages.sh
```

### 3. Test Với Cache Bypass

```bash
# Test một trang cụ thể
curl -H "Cache-Control: no-cache" -s https://apexrebate.com/vi/dashboard | grep "Application error"

# Không có output = Không có lỗi ✅
```

## Cache Headers Đã Config

File: `next.config.ts`

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        },
      ],
    },
  ];
}
```

- `max-age=3600`: Browser cache 1 giờ
- `s-maxage=3600`: CDN cache 1 giờ  
- `stale-while-revalidate=86400`: Serve stale content trong 24h nếu revalidate fails

## Test Script

File: `test-all-pages.sh`

Test tất cả các trang quan trọng:
- `/` (root)
- `/vi` (Vietnamese)
- `/en` (English)
- `/vi/dashboard`
- `/en/dashboard`
- `/vi/tools`
- `/vi/apex-pro`
- `/vi/hang-soi`

```bash
chmod +x test-all-pages.sh
./test-all-pages.sh
```

## Troubleshooting

### Lỗi vẫn còn sau khi hard refresh?

1. Mở DevTools (F12)
2. Chọn tab "Network"
3. Check "Disable cache"
4. Reload lại trang (F5)

### Lỗi chỉ xuất hiện ở production?

1. Check browser console (F12) để xem error message chi tiết
2. So sánh với local build: `npm run build && npm start`
3. Verify code đã được deploy: check git commit hash trên Vercel dashboard

## Verified Working

Last tested: 2025-11-03

All pages returning ✅ OK:
- https://apexrebate.com/
- https://apexrebate.com/vi
- https://apexrebate.com/en
- https://apexrebate.com/vi/dashboard
- https://apexrebate.com/en/dashboard
- https://apexrebate.com/vi/tools
- https://apexrebate.com/vi/apex-pro
- https://apexrebate.com/vi/hang-soi
