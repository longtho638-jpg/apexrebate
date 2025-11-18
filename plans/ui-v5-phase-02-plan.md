# UI V5 Phase 02: NavBar i18n Integration

**Execution Order: EXECUTE AFTER Phase 01**

---

## Overview

Integrate internationalization (i18n) into NavBar component:
- Support 4 locales: **en, vi, th, id**
- Translate navigation labels
- Translate auth buttons (Sign In, Sign Up)
- Support dynamic locale switching
- Maintain all existing functionality

---

## Current State

### NavBar.tsx (Current)

```typescript
const navLinks = [
  { href: `${v5BasePath}/home`, label: "Trang chủ" },
  { href: `${v5BasePath}/calculator`, label: "Máy tính" },
  { href: `${localePath}/wall-of-fame`, label: "Danh vọng" },
  { href: `${localePath}/hang-soi`, label: "Hang Sói" },
  { href: `${localePath}/tools`, label: "Tools Market" },
  { href: `${localePath}/faq`, label: "FAQ" },
  { href: `${localePath}/how-it-works`, label: "How It Works" },
];
```

**Issues Found:**
1. ❌ Labels hardcoded in Vietnamese (Thai, Indonesian users see Vietnamese)
2. ❌ No `useTranslations` hook from `next-intl`
3. ❌ Buttons "Sign In", "Sign Up", "Dashboard" are in English
4. ❌ Cannot switch locale dynamically
5. ❌ Doesn't respect user's locale preference

---

## i18n Integration Requirements

### Messages to Translate

**Navigation Links:**
```
home: "Trang chủ" (vi) / "Home" (en) / "หน้าแรก" (th) / "Rumah" (id)
calculator: "Máy tính" (vi) / "Calculator" (en) / "เครื่องคิดเลข" (th) / "Kalkulator" (id)
wall-of-fame: "Danh vọng" (vi) / "Wall of Fame" (en) / "ผนังชื่อเสียง" (th) / "Dinding Ketenaran" (id)
hang-soi: "Hang Sói" (vi) / "Community" (en) / "ชุมชน" (th) / "Komunitas" (id)
tools: "Tools Market" (vi) / "Tools Market" (en) / "ตลาดเครื่องมือ" (th) / "Pasar Alat" (id)
faq: "FAQ" (vi) / "FAQ" (en) / "คำถามที่พบบ่อย" (th) / "FAQ" (id)
how-it-works: "How It Works" (vi) / "How It Works" (en) / "วิธีการทำงาน" (th) / "Cara Kerjanya" (id)
```

**Auth Links:**
```
signin: "Đăng Nhập" (vi) / "Sign In" (en) / "เข้าสู่ระบบ" (th) / "Masuk" (id)
signup: "Đăng Ký" (vi) / "Sign Up" (en) / "ลงทะเบียน" (th) / "Daftar" (id)
dashboard: "Bảng Điều Khiển" (vi) / "Dashboard" (en) / "แดชบอร์ด" (th) / "Dashboard" (id)
```

---

## Implementation Steps

### Step 1: Update NavBar.tsx

Add `useTranslations` hook and use translation keys:

```typescript
"use client";

import Link from "next/link";
import Container from "@/uiux-v5/atoms/Container";
import Button from "@/uiux-v5/atoms/Button";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const SUPPORTED_LOCALES = ["en", "vi", "th", "id"];

type NavBarProps = {
  locale?: string;
};

export default function NavBar({ locale }: NavBarProps) {
  const t = useTranslations("navbar");
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";

  const { localePath, v5BasePath } = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const detectedLocale = SUPPORTED_LOCALES.includes(segments[0])
      ? segments[0]
      : locale || "en";
    const resolvedLocale = locale || detectedLocale;
    const baseLocalePath = `/${resolvedLocale}`;
    const baseV5Path = `${baseLocalePath}/v5`;

    return {
      localePath: baseLocalePath,
      v5BasePath: baseV5Path,
    };
  }, [locale, pathname]);

  const navLinks = [
    { href: `${v5BasePath}/home`, labelKey: "home" },
    { href: `${v5BasePath}/calculator`, labelKey: "calculator" },
    { href: `${localePath}/wall-of-fame`, labelKey: "wallOfFame" },
    { href: `${localePath}/hang-soi`, labelKey: "hangSoi" },
    { href: `${localePath}/tools`, labelKey: "toolsMarket" },
    { href: `${localePath}/faq`, labelKey: "faq" },
    { href: `${localePath}/how-it-works`, labelKey: "howItWorks" },
  ];

  const authLinks = {
    signin: `${localePath}/auth/signin`,
    signup: `${localePath}/auth/signup`,
    dashboard: `${localePath}/dashboard`,
  };

  return (
    <nav className="w-full bg-midnight/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <Container className="flex items-center justify-between h-20">
        {/* Logo */}
        <Link href={`${v5BasePath}/home`} className="text-offWhite text-xl font-semibold">
          ApexRebate
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, labelKey }) => (
            <NavLink 
              key={href} 
              href={href} 
              label={t(labelKey)} 
            />
          ))}

          <div className="flex items-center gap-3">
            <Link href={authLinks.signin}>
              <Button variant="ghost" size="sm" className="text-offWhite">
                {t("signin")}
              </Button>
            </Link>
            <Link href={authLinks.signup}>
              <Button variant="primary" size="sm">
                {t("signup")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-offWhite text-2xl"
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
      </Container>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-midnight px-6 pb-6 space-y-4">
          {navLinks.map(({ href, labelKey }) => (
            <NavLink 
              key={href} 
              href={href} 
              label={t(labelKey)} 
            />
          ))}
          <Link href={authLinks.signin} className="block">
            <Button variant="ghost" className="w-full text-offWhite">
              {t("signin")}
            </Button>
          </Link>
          <Link href={authLinks.signup} className="block">
            <Button variant="primary" className="w-full">
              {t("signup")}
            </Button>
          </Link>
          <Link href={authLinks.dashboard} className="block">
            <Button variant="outline" className="w-full">
              {t("dashboard")}
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-offWhite/80 hover:text-teal transition-colors text-sm font-medium"
    >
      {label}
    </Link>
  );
}
```

**Key Changes:**
1. ✅ Added `import { useTranslations } from "next-intl";`
2. ✅ Added `const t = useTranslations("navbar");`
3. ✅ Changed `label` to `labelKey` for translation keys
4. ✅ Updated all labels to use `t(key)` function
5. ✅ Updated buttons to use translated text

---

### Step 2: Create i18n Messages

Create translation files in `src/messages/` directory (or update existing):

**File: `src/messages/en.json`**
```json
{
  "navbar": {
    "home": "Home",
    "calculator": "Calculator",
    "wallOfFame": "Wall of Fame",
    "hangSoi": "Community",
    "toolsMarket": "Tools Market",
    "faq": "FAQ",
    "howItWorks": "How It Works",
    "signin": "Sign In",
    "signup": "Sign Up",
    "dashboard": "Dashboard"
  }
}
```

**File: `src/messages/vi.json`**
```json
{
  "navbar": {
    "home": "Trang chủ",
    "calculator": "Máy tính",
    "wallOfFame": "Danh vọng",
    "hangSoi": "Hang Sói",
    "toolsMarket": "Thị trường công cụ",
    "faq": "Câu hỏi thường gặp",
    "howItWorks": "Cách thức hoạt động",
    "signin": "Đăng nhập",
    "signup": "Đăng ký",
    "dashboard": "Bảng điều khiển"
  }
}
```

**File: `src/messages/th.json`**
```json
{
  "navbar": {
    "home": "หน้าแรก",
    "calculator": "เครื่องคิดเลข",
    "wallOfFame": "ผนังชื่อเสียง",
    "hangSoi": "ชุมชน",
    "toolsMarket": "ตลาดเครื่องมือ",
    "faq": "คำถามที่พบบ่อย",
    "howItWorks": "วิธีการทำงาน",
    "signin": "เข้าสู่ระบบ",
    "signup": "ลงทะเบียน",
    "dashboard": "แดชบอร์ด"
  }
}
```

**File: `src/messages/id.json`**
```json
{
  "navbar": {
    "home": "Rumah",
    "calculator": "Kalkulator",
    "wallOfFame": "Dinding Ketenaran",
    "hangSoi": "Komunitas",
    "toolsMarket": "Pasar Alat",
    "faq": "FAQ",
    "howItWorks": "Cara Kerjanya",
    "signin": "Masuk",
    "signup": "Daftar",
    "dashboard": "Dashboard"
  }
}
```

---

### Step 3: Verify next-intl Configuration

Check `next-intl.config.ts`:

```typescript
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./src/messages/${locale}.json`)).default
}));
```

**Verify:**
- ✅ next-intl is installed: `npm list next-intl`
- ✅ Configuration points to correct message files
- ✅ All 4 locales (en, vi, th, id) have message files

---

### Step 4: Update Page Templates

Ensure templates pass `locale` prop to NavBar:

**File: `src/uiux-v5/templates/HomepageTemplate.tsx`**
```typescript
import NavBar from "@/uiux-v5/molecules/NavBar";

type HomepageTemplateProps = {
  locale?: string;
};

export default function HomepageTemplate({ locale }: HomepageTemplateProps) {
  return (
    <>
      <NavBar locale={locale} />
      {/* Rest of template */}
    </>
  );
}
```

**File: `src/uiux-v5/templates/DashboardTemplate.tsx`**
```typescript
import NavBar from "@/uiux-v5/molecules/NavBar";

type DashboardTemplateProps = {
  locale?: string;
  stats?: any;
  charts?: any;
};

export default function DashboardTemplate({ locale, stats, charts }: DashboardTemplateProps) {
  return (
    <>
      <NavBar locale={locale} />
      {/* Rest of template */}
    </>
  );
}
```

**Similar updates for:**
- ✅ CalculatorTemplate.tsx
- ✅ SettingsTemplate.tsx

---

## Success Criteria

After implementing Phase 02:
- ✅ NavBar uses `useTranslations` hook
- ✅ Navigation labels change with locale
- ✅ Auth buttons translate correctly
- ✅ Works in all 4 locales: en, vi, th, id
- ✅ Mobile menu translates correctly
- ✅ No TypeScript errors
- ✅ `npm run build` passes
- ✅ Routes work: `/en/v5/home`, `/vi/v5/home`, `/th/v5/home`, `/id/v5/home`

---

## Test Commands

```bash
# Check build
npm run build

# Start dev
npm run dev &

# Test each locale
curl -s http://localhost:3000/en/v5/home | grep -i "Sign In" | head -1
curl -s http://localhost:3000/vi/v5/home | grep -i "Đăng" | head -1
curl -s http://localhost:3000/th/v5/home | head -1
curl -s http://localhost:3000/id/v5/home | head -1

# Kill server
pkill -f "next dev"
```

---

## Troubleshooting

### Issue 1: `useTranslations is not exported from 'next-intl'`
**Fix:** Install next-intl: `npm install next-intl`

### Issue 2: Message file not found
**Fix:** Ensure `src/messages/{locale}.json` exists
**Path:** Should be `/Users/macbookprom1/apexrebate-1/src/messages/en.json`

### Issue 3: Labels still in Vietnamese after update
**Fix:** Restart dev server: `pkill -f "next dev" && npm run dev`

### Issue 4: Type errors for `t` function
**Fix:** Ensure `next-intl` types are installed: `npm install @types/next-intl`

---

## Files to Modify

1. `src/uiux-v5/molecules/NavBar.tsx` - ~120 lines (add useTranslations)
2. `src/messages/en.json` - Create if missing
3. `src/messages/vi.json` - Create if missing
4. `src/messages/th.json` - Create if missing
5. `src/messages/id.json` - Create if missing
6. `src/uiux-v5/templates/HomepageTemplate.tsx` - Ensure locale prop passed
7. `src/uiux-v5/templates/DashboardTemplate.tsx` - Ensure locale prop passed
8. `src/uiux-v5/templates/CalculatorTemplate.tsx` - Ensure locale prop passed
9. `src/uiux-v5/templates/SettingsTemplate.tsx` - Ensure locale prop passed

---

## After Phase 02 Complete

✅ NavBar fully localized (en, vi, th, id)
✅ All navigation labels translated
✅ Auth buttons in correct language
✅ Build passes with 0 errors

**Next:** Phase 3 - Verification & Commit
