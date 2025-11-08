# 🚀 SEED Public Flow Implementation Plan

**Status:** Ready to Implement  
**Date:** Nov 8, 2025

---

## ✅ Quick Summary

**Problem:** `/tools` marketplace page requires auth but should be publicly browsable (READ-only)

**Solution:** Make tools listing public while keeping upload/analytics protected

**Impact:** 
- Users can browse tools before signing up → Better conversion
- Tool deep-links shareable → Better SEO & marketing
- Closed-loop user journey ✅

**Effort:** ~2-3 hours  
**Risk:** LOW (read-only change, auth still checked)

---

## 🎯 Implementation Steps

### Step 1: Update middleware.ts (5 min)

**File:** `middleware.ts`

**Change:** Remove `/tools` from protected routes list

**Current:**
```typescript
const protectedRoutes = ['/dashboard', '/profile', '/referrals', '/admin'];
```

**New:**
```typescript
const protectedRoutes = ['/dashboard', '/profile', '/referrals', '/admin', '/tools/upload', '/tools/analytics'];
```

**Why:** 
- Keep `/dashboard`, `/profile`, `/referrals`, `/admin` protected (user data)
- Add `/tools/upload` protected (only tool sellers)
- Add `/tools/analytics` protected (only tool owners)
- Remove `/tools` from protected → Allow public browsing
- Remove `/tools/[id]` from protected → Allow public tool details

---

### Step 2: Update `/tools/page.tsx` (15 min)

**File:** `src/app/[locale]/tools/page.tsx`

**Changes:**

#### 2a. Remove session requirement from header buttons
```typescript
// CURRENT:
{session && (
  <Link href={`/${locale}/tools/upload`}>
    <Button>Upload</Button>
  </Link>
)}

// NEW: Show button for auth users, direct unauthenticated to signup
{session ? (
  <Link href={`/${locale}/tools/upload`}>
    <Button>Upload Tool</Button>
  </Link>
) : (
  <Link href={`/${locale}/auth/signup?redirect=/tools/upload`}>
    <Button variant="outline">Upload Tool (Sign up first)</Button>
  </Link>
)}
```

#### 2b. Keep analytics button admin-only
```typescript
// This stays as-is (no change needed)
{session?.user?.role === 'ADMIN' && (
  <Link href={`/${locale}/tools/analytics`}>
    <Button>Analytics</Button>
  </Link>
)}
```

#### 2c. Make it work without auth
The current page already works without auth (it just shows all public tools). No breaking changes needed.

---

### Step 3: Update `/tools/[id]/page.tsx` (15 min)

**File:** `src/app/[locale]/tools/[id]/page.tsx`

**Changes:** (Assuming it exists, need to check)

```typescript
'use client';

import { useSession } from 'next-auth/react';

export default function ToolDetailPage({ params }: { params: { id: string; locale: string } }) {
  const { data: session } = useSession();
  const [tool, setTool] = useState(null);

  // Fetch tool (works for public OR auth users)
  useEffect(() => {
    fetch(`/api/tools/${params.id}`).then(r => r.json()).then(setTool);
  }, [params.id]);

  if (!tool) return <Loading />;

  // Get owner id for edit checks
  const isOwner = session?.user?.id === tool.users?.id;
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <>
      <ToolHeader tool={tool} />
      <ToolDetails tool={tool} />
      <ToolReviews tool={tool} />

      {/* Show edit button ONLY if user owns this tool */}
      {isOwner && (
        <div className="flex gap-2">
          <Link href={`/${locale}/tools/${tool.id}/edit`}>
            <Button>Edit</Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      )}

      {/* Show signup CTA if not authenticated */}
      {!session && (
        <SignupBanner message="Sign up to upload your own tools!" />
      )}
    </>
  );
}
```

---

### Step 4: Create SignupBanner Component (10 min)

**File:** `src/components/marketplace/guest-signup-banner.tsx`

```typescript
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function GuestSignupBanner() {
  const locale = useLocale();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center my-8">
      <h3 className="text-lg font-semibold mb-2">
        Muốn chia sẻ công cụ của bạn?
      </h3>
      <p className="text-gray-600 mb-4">
        Đăng ký ngay để có quyền truy cập vào bộ công cụ đầy đủ của chúng tôi
      </p>
      <Link href={`/${locale}/auth/signup`}>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Đăng ký miễn phí
        </Button>
      </Link>
    </div>
  );
}
```

---

### Step 5: Verify API Endpoints (5 min)

**Files to Check:** 
- `/api/tools` ✅
- `/api/tools/[id]` ✅
- `/api/tools/categories` ✅

**Required:** All should work WITHOUT Authorization header

```bash
# Test: Can public user access tools?
curl https://apexrebate.com/api/tools

# Test: Can public user see specific tool?
curl https://apexrebate.com/api/tools/tool-123
```

---

## 📋 Testing Checklist

### Manual Testing (Guest User)

- [ ] Navigate to `/tools` without login → Loads ✅
- [ ] Search/filter tools → Works ✅
- [ ] Click tool detail → Loads ✅
- [ ] Click "Upload Tool" button → Goes to signup page ✅
- [ ] Copy tool link → Shareable ✅

### Manual Testing (Authenticated User)

- [ ] Navigate to `/tools` → Loads ✅
- [ ] Click "Upload Tool" → Goes to `/tools/upload` ✅
- [ ] Tool detail shows edit button → Shows ✅

### Automated E2E Testing

```bash
# Guest user flow
npm run test:e2e -- tests/e2e/guest-tools-browse.spec.ts

# Auth user flow
npm run test:e2e -- tests/e2e/user-tools-upload.spec.ts
```

---

## 📝 Files to Modify

| File | Change | Lines | Priority |
|------|--------|-------|----------|
| `middleware.ts` | Update protected routes | 51-62 | P0 |
| `src/app/[locale]/tools/page.tsx` | Update button logic | ~200-220 | P0 |
| `src/app/[locale]/tools/[id]/page.tsx` | Add edit button checks | TBD | P0 |
| `src/components/marketplace/guest-signup-banner.tsx` | NEW component | NEW | P1 |
| `tests/e2e/guest-tools-browse.spec.ts` | NEW test | NEW | P1 |

---

## 🔄 Full User Journey After Implementation

```
┌────────────────────────────────────────┐
│ NEW VISITOR                             │
├────────────────────────────────────────┤
│ 1. Lands on Home (/)                   │
│ 2. Clicks "Explore Tools"              │
│ 3. Browses /tools → WORKS ✅           │
│ 4. Views /tools/[id] → WORKS ✅        │
│ 5. Decides "This is great!"            │
│ 6. Clicks "Upload Tool"                │
│ 7. Redirected to /auth/signup          │
│ 8. Creates account                     │
│ 9. Returns to /tools/upload            │
│ 10. Uploads tool ✅                    │
└────────────────────────────────────────┘
```

---

## ⏱️ Timeline

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Update middleware.ts | 5 min | Ready |
| 2 | Update tools/page.tsx | 15 min | Ready |
| 3 | Update tools/[id]/page.tsx | 15 min | Ready |
| 4 | Create guest banner component | 10 min | Ready |
| 5 | Manual testing (guest flow) | 10 min | Ready |
| 6 | E2E testing | 15 min | Ready |
| 7 | Deploy to staging | 5 min | Ready |
| **Total** | | **~75 min** | |

---

## 🚀 Deployment Steps

### Before Deploy
1. Run `npm run lint` → Fix any errors
2. Run `npm run build` → Build succeeds
3. Run `npm run test:e2e` → All pass
4. Code review ready

### Staging Deployment
```bash
# 1. Create feature branch
git checkout -b feat/seed-public-flow

# 2. Make changes (see Implementation Steps above)

# 3. Test locally
npm run dev
# Manual test /tools (should work without login)

# 4. Commit
git add .
git commit -m "feat: make tools marketplace publicly browsable"

# 5. Push to staging
git push origin feat/seed-public-flow
# Create PR, get review

# 6. Deploy to staging
npm run build
npm run test:e2e
# ... deploy commands
```

### Production Deployment
```bash
# After staging approval:
git checkout main
git merge feat/seed-public-flow
git push origin main
# ... CI/CD auto-deploys
```

---

## 🔐 Security Notes

✅ **What's Protected:**
- `/tools/upload` - Auth + seller verification
- `/tools/analytics` - Auth + admin only
- `/dashboard`, `/profile`, `/referrals` - Auth required
- `/admin/*` - Auth + admin role

✅ **What's Public:**
- `/tools` - Browse tools (read-only)
- `/tools/[id]` - View tool details (read-only)
- `/api/tools` - List tools (no auth header needed)
- `/api/tools/[id]` - Get tool details (no auth header needed)

⚠️ **API Safety:**
- Seller can't see analytics of other sellers → Still protected by `/tools/analytics` route
- User can't edit/delete other tools → Backend validation required
- Upload endpoint still requires auth → Still protected

---

## 📊 Success Metrics

After deployment, measure:

1. **Traffic:** Increase in /tools visits from new visitors
2. **Conversion:** Track signup rate from tools page
3. **SEO:** Tool pages getting indexed (Google Search Console)
4. **User Flow:** Heatmap shows guest → signup flow
5. **Performance:** No slowdowns from public access

---

## ⚠️ Rollback Plan

If issues arise:

```bash
# Revert to previous version
git revert <commit-hash>
git push origin main

# Or manually revert middleware.ts
# Change back to:
const protectedRoutes = ['/dashboard', '/profile', '/referrals', '/admin'];
```

---

## 📞 Questions?

- **Q:** Will public users see seller data?  
  **A:** Yes, but that's intentional (marketplace visibility)

- **Q:** Can guests buy tools?  
  **A:** No - checkout is in `/dashboard` (protected)

- **Q:** What about tool recommendations?  
  **A:** Recommendations can show without auth (improve UX)

- **Q:** Any DB changes needed?  
  **A:** NO - no schema changes, just routing changes

---

## ✅ Ready to Implement?

This plan is **COMPLETE and READY**.

Next step: Execute Implementation Steps 1-5 above.

Estimated time: **~1.5-2 hours** including testing & review.

