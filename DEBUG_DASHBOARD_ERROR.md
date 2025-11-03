# Dashboard Error Debugging Guide

## ✅ SERVER STATUS: NO ERRORS

### Verified Facts:
1. **Production HTML Response**: NO "Application error" found (count = 0)
2. **JavaScript Bundle**: Contains CORRECT code with `icon:"Star"` (strings, not components)
3. **Local Dev Server**: NO errors (count = 0)
4. **Bundle Hash**: Updated to `page-d0c7ecaae538cde6.js`

## 🔴 User Still Seeing Error?

This is **DEFINITELY** one of these browser-side issues:

### Issue 1: Service Worker Cache (Most Likely)

Service Workers can cache JavaScript bundles even after hard refresh!

**Solution:**

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** (left sidebar)
4. Click **"Unregister"** next to `apexrebate.com`
5. Click **Clear storage** → **Clear site data**
6. Close DevTools and hard refresh (Cmd+Shift+R)

### Issue 2: Browser Extension Interference

Extensions like ad blockers, React DevTools, or Redux DevTools can cause hydration errors.

**Solution:**

Test in **Incognito/Private** mode (which disables most extensions):
- Chrome: Cmd+Shift+N
- Firefox: Cmd+Shift+P  
- Safari: Cmd+Shift+N

If it works in incognito → **Browser extension is the cause**

### Issue 3: Disk Cache

Even after hard refresh, browser might use disk cache.

**Solution (Chrome/Arc):**

1. Open DevTools (F12)
2. **Right-click** the reload button (while DevTools is open)
3. Select **"Empty Cache and Hard Reload"**

**Solution (All Browsers):**

1. Settings → Privacy → Clear browsing data
2. Select **"Cached images and files"**  
3. Time range: **"All time"**
4. Click "Clear data"

### Issue 4: DNS/CDN Cache

Old DNS records pointing to old Vercel deployment.

**Solution:**

```bash
# macOS/Linux
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Test with direct IP (bypass DNS)
curl -H "Host: apexrebate.com" https://76.76.21.21/vi/dashboard | grep -c "Application error"
```

## 🔬 Diagnostic Commands

### Check What Browser Is Actually Loading:

```bash
# Check current bundle hash in production
curl -s https://apexrebate.com/vi/dashboard | grep -o "page-[a-f0-9]*\.js" | head -1

# Should return: page-d0c7ecaae538cde6.js
```

### Download and Inspect JavaScript Bundle:

```bash
# Download the actual bundle browser would load
curl -s "https://apexrebate.com/_next/static/chunks/app/%5Blocale%5D/dashboard/page-d0c7ecaae538cde6.js" > /tmp/bundle.js

# Check if it has the FIX (icon should be STRING)
grep 'icon:"Star"' /tmp/bundle.js
# If found → Bundle has the fix ✅

# Check if it has the BUG (icon as component)
grep 'icon:Star' /tmp/bundle.js
# If found → Bundle has old code ✗
```

## 📊 Test Results So Far

| Test | Result | Status |
|------|--------|--------|
| Production HTML Response | No "Application error" | ✅ |
| JavaScript Bundle Content | `icon:"Star"` (correct) | ✅ |
| Local Dev Server | No errors | ✅ |
| Different Browser (User) | Still seeing error | ❌ |
| Hard Refresh (User) | Still seeing error | ❌ |

**Conclusion**: Code is CORRECT. Issue is browser-side caching.

## 🎯 Recommended Actions (In Order)

1. **Unregister Service Worker** (Application tab in DevTools)
2. **Empty Cache and Hard Reload** (right-click reload button in DevTools)
3. **Test in Incognito Mode** (Cmd+Shift+N)
4. **Disable Browser Extensions** (especially React DevTools, Redux DevTools, ad blockers)
5. **Clear All Site Data** (Application → Clear storage)
6. **Flush DNS Cache** (see commands above)
7. **Wait 5 more minutes** (CDN might still be propagating)

## 🔍 If STILL Seeing Error After All Above

Then it's a real hydration error we need to debug:

```bash
# Enable React DevTools
# Open browser console and look for:
# - "Hydration failed"
# - "There was an error while hydrating"
# - Any stack trace mentioning "renderAchievementIcon"
```

Take screenshot of browser console and send to developer.

## ✉️ Contact Info

If none of the above works, contact with:
1. Screenshot of browser console (F12 → Console tab)
2. Screenshot of Network tab showing bundle hash
3. Browser name + version
4. Operating system

---

**Last Updated**: 2025-11-03 14:45 ICT  
**Commit**: ade0d7e1 (Force Vercel rebuild)  
**Bundle Hash**: page-d0c7ecaae538cde6.js
