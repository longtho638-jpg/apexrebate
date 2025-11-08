# 🧠 ApexRebate Unified Hybrid MAX Architecture (2025)

> *Saigon Edition powered by Kimi K2 & Copilot Agents*
> Mục tiêu: Hệ thống tự động, ổn định, có khả năng tự phục hồi, sẵn sàng mở rộng toàn cầu.

---

## 🚀 1️⃣ Build / Lint / Test / Deploy Commands

| Command                 | Purpose                     |
| ----------------------- | --------------------------- |
| `npm run build`         | Next.js 15 production build |
| `npm run lint`          | ESLint linting              |
| `npm run test`          | Unit tests (Jest)           |
| `npm run test:watch`    | Watch mode for tests        |
| `npm run test:coverage` | Jest coverage report        |
| `npm run test:e2e`      | Playwright E2E UI tests     |
| `npm run test:e2e:ui`   | Interactive E2E mode        |
| `npm run db:push`       | Prisma schema push          |
| `npm run db:generate`   | Prisma generate             |
| `npm run seed:handoff`  | Run tool seed script        |
| `npm run test:seed`     | Test seed algorithms        |
| `npm run db:reset`      | Full reset (careful!)       |

🪄 *Pro Tip:* Agents có thể trigger toàn bộ quy trình này bằng 1 lệnh duy nhất trong CI/CD:

```bash
gh workflow run "ApexRebate Unified CI/CD"
```

---

## 🏗 2️⃣ Hybrid MAX Architecture Overview

**Hybrid MAX v2** kết hợp ưu điểm của Firebase, Vercel, Neon và Copilot Agents để đạt:

* **🔥 Hybrid Cloud:** Firebase Hosting + Vercel Edge + Cloud Functions (multi-region failover)
* **🧠 MAX Layer:** AI Agent Orchestrator – Kimi K2 & Copilot điều phối build/test/deploy
* **⚡ Database:** Neon PostgreSQL (serverless pooled)
* **🛰 Observability:** OpenTelemetry + Sentry trên toàn bộ stack
* **🧩 Security:** NextAuth + Firebase Auth multi-provider + rate-limit middleware
* **🪶 Failover:** auto-reroute đến region ổn định nhất trong vòng < 300 ms

---

## 🧬 3️⃣ Core Codebase & Systems

**Frontend:** Next.js 15.3.5 + React 19 + Tailwind CSS
**Database:** Neon PostgreSQL (serverless pooled)
**Auth:** NextAuth multi-provider
**Realtime:** Socket.IO integration
**Deployment:** Firebase Hosting + Vercel Edge
**Mobile:** React Native app (hỗ trợ push notifications)

**Directory Structure**

```
src/
 ├── app/                 # Next.js app router pages & API routes  
 ├── components/          # Reusable UI components  
 ├── lib/                 # Utilities & config  
 ├── prisma/              # Prisma schema & migrations  
 └── tests/               # Unit + E2E specs  
```

**Agent Integration Bus**

* Lớp trung gian cho Copilot Agents tự gọi lệnh lint → test → deploy
* Cho phép self-healing build khi có lỗi runtime

**Concierge Automation Loop**

* Giám sát luồng E2E và phục hồi nếu build/test thất bại
* Được triển khai bằng Playwright hooks + Prisma rollback

---

## 🔄 4️⃣ CI/CD Unified Flow (Saigon Pipeline)

```
🧹 Lint & Build
🧪 Regression Tests
🚀 Firebase Preview Deploy
🎭 E2E Tests (Playwright)
🌐 Production Deploy
```

Tất cả được orchestrated qua:

* **GitHub Actions:** `ci.yml`
* **Copilot Agents + Kimi K2:** tự phát hiện và sửa lỗi build/test
* **Slack/Discord Webhook:** báo kết quả CI/CD theo thời gian thực

🧩 *Lỗi build/test → Agents auto-trigger Kimi K2 để fix & commit lên main.*

---

## 💬 5️⃣ Communication Guidelines (Saigon Tone)

> Giữ thái độ tích cực, nhẹ nhàng, nhưng rõ ràng về technical status.
> Ví dụ:

```
Ê Kimi ơi, CI build pass 100% rồi nha!  
Deploy main mượt như cà phê sữa đá 😎  
```

**Rules:**

1. Mọi commit liên quan CI/CD → prefix `ci:`
2. Commit fix runtime/test → prefix `fix:`
3. Mỗi PR phải kèm changelogs và link test report

---

## 🧩 6️⃣ Appendix – AI Ops Control

* **Auto Rollback:** Khi Playwright fail > 1 test → revert deploy
* **Resource Optimization:** Khi build > 4 min → trigger cache cleanup
* **Success Log:** Deploy thành công → ghi log vào `/logs/deployments.json` cùng commit SHA & PR ID

---

## 🎨 7️⃣ Catalyst Dashboard Upgrade (November 2025)

**Status**: ✅ Complete and Production Ready

### What is Catalyst?
Premium UI component library by Tailwind Labs, built with React & Tailwind CSS.

### Dashboard Redesign
```bash
File: src/app/[locale]/dashboard/dashboard-client-vi.tsx
Components: 6 new custom Catalyst-styled components
```

### New Component Library
```
src/components/catalyst/
├── heading.tsx      # <Heading /> & <Subheading />
├── text.tsx         # <Text />, <Strong />, <Code />
├── fieldset.tsx     # <Fieldset />, <Legend />, <Label />
├── input.tsx        # <Input /> with focus states
├── tabs.tsx         # <Tabs />, <TabsList />, <TabsTrigger />, <TabsContent />
└── badge.tsx        # <Badge /> styled component
```

### Key Features
- ✅ 4 Stat Cards (Total Savings, Monthly, Volume, Rank)
- ✅ 4 Tab Sections (Overview, Analytics, Referrals, Achievements)
- ✅ Responsive Grid Layout (1 col mobile → 4 col desktop)
- ✅ Copy-to-Clipboard with visual feedback
- ✅ Achievement Progress Tracking
- ✅ Broker Distribution Charts
- ✅ Rank Progression Indicators

### Live URLs
- **Production**: https://apexrebate-1-flgjd69vx-minh-longs-projects-f5c82c9b.vercel.app/vi/dashboard
- **Test Credentials**: 
  - Email: `demo@apexrebate.com`
  - Password: `demo123`

### Documentation
- **Full Upgrade Guide**: `CATALYST_DASHBOARD_UPGRADE.md`
- **Quick Start**: `CATALYST_QUICK_START.md`

### Build Verification
```bash
npm run build     # ✓ Compiled successfully
npm run dev       # ✓ Dashboard loads in ~2s
npm run test:e2e  # ✓ All E2E tests pass
```

---

---

## 🛠 8️⃣ SEED Public Flow Implementation (November 2025)

**Status**: ✅ Deployed to Production (Nov 8, 2025)

### What Changed?
Made Tools Marketplace publicly browsable while maintaining upload/analytics security.

### Implementation Details
```bash
Files Modified:
├── middleware.ts                       # Updated protected routes
└── src/app/[locale]/tools/page.tsx     # Guest UX with signup CTA
```

### Routes Security Matrix

**PUBLIC (No Auth Required):**
- ✅ `/tools` - Browse marketplace
- ✅ `/tools/[id]` - View tool details
- ✅ Deep linking works for social sharing
- ✅ SEO-friendly (crawlable by search engines)

**PROTECTED (Auth Required):**
- 🔒 `/tools/upload` - Upload new tools
- 🔒 `/tools/analytics` - View analytics (admin only)
- 🔒 `/dashboard` - User dashboard
- 🔒 `/admin/*` - Admin panel

### Code Changes

**middleware.ts:**
```typescript
// Before: /tools was fully protected
const protectedRoutes = ['/dashboard', '/profile', '/referrals', '/admin'];

// After: Only upload & analytics protected
const protectedRoutes = ['/dashboard', '/profile', '/referrals', '/admin', 
                         '/tools/upload', '/tools/analytics'];
```

**tools/page.tsx:**
```typescript
// Guest users see signup CTA
{session ? (
  <Button>Đăng Công Cụ</Button>
) : (
  <Button variant="outline">Đăng Công Cụ (Đăng ký)</Button>
)}
```

### User Journey Impact

**Before:** ❌ Broken Flow
```
Home → Sign Up (forced) → Dashboard → Tools (hidden until auth)
```

**After:** ✅ Complete Flow
```
Home → Browse Tools → View Details → Sign Up → Upload Tools
```

### Expected Metrics
- 📊 Traffic: ↑ More /tools visits (SEO + social sharing)
- 👥 Signups: ↑ Users evaluate before signup
- 📱 Engagement: ↑ Shareable tool links
- 💰 Revenue: ↑ More uploads → More sales
- ⏱️ Conversion: ↑ Browse → Signup → Upload funnel

### Production URLs
- **Latest Deploy**: https://apexrebate-1-alq7hkck8-minh-longs-projects-f5c82c9b.vercel.app
- **Tools Marketplace**: `/tools` (public)
- **Tool Upload**: `/tools/upload` (protected)

### Build Verification
```bash
npm run build     # ✓ 79 routes compiled in 4.0s
npm run lint      # ✓ 0 warnings
npm run test      # ✓ 7/7 tests passed
vercel --prod     # ✓ Deployed successfully
```

### Security Verification
- ✅ Public routes accessible without auth
- ✅ Protected routes require authentication
- ✅ Upload/analytics endpoints secured
- ✅ Admin routes restricted to ADMIN role
- ✅ Backward compatible (no breaking changes)

### Rollback Plan
```bash
# If issues occur (< 5 min rollback)
git revert <commit-hash>
git push origin main
# CI/CD auto-deploys previous version
```

---

## 🌟 Closing Notes

> ApexRebate 2025 – Hybrid MAX v2 is where humans and AI build together.
> "Automation doesn't replace craft; it amplifies it." – Saigon Tech Collective 💛

Khi CI/CD pass, hãy tự thưởng một ly bạc xỉu và để Agents lo phần còn lại. ☕️