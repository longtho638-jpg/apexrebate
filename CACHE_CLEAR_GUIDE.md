# 🚀 Cache Clearing & Force Rebuild Guide

## Quick Start

```bash
./scripts/clear-sw-cache.sh
```

This script will:
1. ✅ Clear local build cache (`.next`, `.vercel/cache`)
2. ✅ Update Next.js cache headers to `no-store`
3. ✅ Add timestamp to dashboard to force bundle rebuild
4. ✅ Commit & push to trigger Vercel deployment
5. ✅ Wait 120s for deployment
6. ✅ Verify new bundle is live

## What It Does

### 1. Local Cache Cleanup
```bash
rm -rf .next .vercel/cache
```

### 2. Update Cache Headers
Changes `next.config.ts` from:
```typescript
value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
```

To:
```typescript
value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
```

### 3. Force Dashboard Rebuild
Updates timestamp comment in `src/app/[locale]/dashboard/page.tsx`:
```typescript
// Force Vercel rebuild: 1762181234
```

### 4. Auto Deploy
Commits changes and pushes to `main` branch, triggering Vercel auto-deployment.

### 5. Verification
Checks:
- ✅ New bundle hash in production
- ✅ No "Application error" in response
- ✅ Cache-Control headers

## User Instructions After Deploy

Even after script runs, users need to clear browser cache:

### Method 1: Unregister Service Worker (Recommended)
1. Open DevTools (F12 or Cmd+Option+I)
2. Go to **Application** tab
3. Click **Service Workers** (left sidebar)
4. Click **"Unregister"** next to `apexrebate.com`
5. Click **Clear storage** → **Clear site data**
6. Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)

### Method 2: Empty Cache and Hard Reload
1. Open DevTools (F12)
2. **Right-click** the reload button (⟳)
3. Select **"Empty Cache and Hard Reload"**

### Method 3: Incognito Mode (Testing)
- Chrome/Arc: **Cmd+Shift+N**
- Firefox: **Cmd+Shift+P**
- Safari: **Cmd+Shift+N**

If it works in incognito → browser cache/extension is the issue

## Troubleshooting

### Script fails with "no changes to commit"
→ Normal! It will create an empty commit to force rebuild.

### Still seeing error after script runs
1. Wait 2-3 more minutes (CDN propagation)
2. Check bundle hash changed:
   ```bash
   curl -s https://apexrebate.com/vi/dashboard | grep -o 'page-[a-f0-9]*\.js' | head -1
   ```
3. Follow user instructions above

### Want to revert cache headers
Restore from backup:
```bash
mv next.config.ts.bak next.config.ts
git add next.config.ts
git commit -m "revert: restore original cache headers"
git push
```

## Files Modified

- `next.config.ts` - Cache headers
- `src/app/[locale]/dashboard/page.tsx` - Timestamp comment
- `.next/` - Removed (local build cache)
- `.vercel/cache/` - Removed (Vercel cache)

## Safety Features

✅ Backs up `next.config.ts` before modifying  
✅ Only updates cache headers if not already set  
✅ Creates empty commit if no changes (safe)  
✅ Waits for deployment before verification  
✅ Non-destructive (doesn't delete source code)

## When to Use

Use this script when:
- Dashboard shows "Application error" 
- Different browsers show same error
- Hard refresh doesn't fix the issue
- Need to force Vercel to rebuild with new code
- Suspect Service Worker caching old bundle

## Related Files

- `scripts/clear-sw-cache.sh` - This script
- `DEBUG_DASHBOARD_ERROR.md` - Detailed debugging guide
- `test-all-pages.sh` - Test script for all pages
- `DASHBOARD_FIX_SUMMARY.md` - Complete fix history

---

**Last Updated**: 2025-11-03  
**Bundle Hash**: Check with script output  
**Commit**: Run script to see latest commit
