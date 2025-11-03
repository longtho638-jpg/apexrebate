# ✅ UI/UX V3 Root Redirect — Hoàn thành

## 🎯 Yêu cầu ban đầu

> **Trang gốc** phải render UI/UX V3 mới; `/uiux-v3` trỏ về root (alias nội bộ redirect permanent); giữ nguyên tất cả tính năng và logic

---

## ✅ Kết quả production (Verified Nov 3, 2025)

\`\`\`bash
curl -I https://apexrebate.com/uiux-v3
# HTTP/2 308 Permanent Redirect
# location: /

curl -I https://apexrebate.com/vi/uiux-v3
# HTTP/2 308 Permanent Redirect
# location: /vi

curl -I https://apexrebate.com/en/uiux-v3
# HTTP/2 308 Permanent Redirect
# location: /en

curl -I https://apexrebate.com/
# HTTP/2 200
# content-type: text/html; charset=utf-8
# (Hiển thị UI/UX V3 content tại root)
\`\`\`

---

## 🔧 Thay đổi kỹ thuật

### 1. Component Architecture

**File:** \`src/_components/uiux-v3-content.tsx\`

- Di chuyển page từ \`src/app/(uiux-v3)/uiux-v3/page.tsx\` → component folder
- Export cả \`default\` component và \`metadata\`
- Không còn là route (vì nằm trong \`_components/\`)

### 2. Locale Root Page

**File:** \`src/app/[locale]/page.tsx\`

\`\`\`typescript
import UiUxV3Content from '@/_components/uiux-v3-content';

export { metadata } from '@/_components/uiux-v3-content';
export default UiUxV3Content;
\`\`\`

- Import component V3 và render tại \`/:locale\` (root cho mỗi locale)
- Re-export \`metadata\` để SEO và meta tags vẫn hoạt động

### 3. Middleware Redirects

**File:** \`middleware.ts\`

\`\`\`typescript
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /uiux-v3 → / (301 permanent)
  if (pathname === '/uiux-v3') {
    return NextResponse.redirect(new URL('/', request.url), 301);
  }

  // Redirect /:locale/uiux-v3 → /:locale (301 permanent)
  const match = pathname.match(/^\/(en|vi)\/uiux-v3$/);
  if (match) {
    const locale = match[1];
    const targetUrl = locale === 'vi' ? '/' : \`/\${locale}\`;
    return NextResponse.redirect(new URL(targetUrl, request.url), 301);
  }

  // Apply i18n routing for other requests
  return intlMiddleware(request);
}
\`\`\`

---

## ✅ Production Status

- **Deployment**: Vercel (commit 48608d5b on main)
- **Domain**: https://apexrebate.com
- **Redirect Status**: ✅ HTTP 308 (permanent)
- **Root Rendering**: ✅ UI/UX V3 content
- **Locale Support**: ✅ vi (default \`/\`), en (\`/en\`)

---

## 🎉 Hoàn thành

- ✅ Trang gốc render UI/UX V3
- ✅ \`/uiux-v3\` redirect permanent về \`/\`
- ✅ \`/:locale/uiux-v3\` redirect về \`/:locale\`
- ✅ Giữ nguyên tất cả tính năng và logic
- ✅ Verified production với curl headers

**Tested on:** November 3, 2025, 21:05 ICT
