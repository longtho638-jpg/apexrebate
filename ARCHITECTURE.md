# ARCHITECTURE

## 1. Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & shadcn/ui
- **Database**: Neon (PostgreSQL via Prisma)
- **Auth**: NextAuth.js
- **State Management**:
  - Client State: Zustand
  - Server State & Caching: TanStack Query (React Query)
- **CI/CD**: GitHub Actions with Agentic Pipeline (OPA, Guardrails)
- **Testing**: Jest (Unit), Playwright (E2E)

## 2. Folder Structure (Source of Truth)

```
/src
  /app              # Next.js App Router: Pages & API Routes
  /components       # Reusable UI components (Dumb & Smart)
  /hooks            # Custom hooks (prefix `use`)
  /lib              # Core libraries (db, auth, config, utils)
  /services         # Business logic, external API calls
  /types            # Shared TypeScript types & interfaces
/prisma             # Prisma schema and migrations
/tests
  /architecture     # Architecture compliance tests
  /e2e              # Playwright end-to-end tests
  # Unit tests are co-located with source files (*.test.ts)
```

## 3. Architectural Principles
- **Database Access**: Mọi tương tác với database PHẢI thông qua Prisma client (`/src/lib/db.ts`). Components và client-side code tuyệt đối không được gọi DB trực tiếp.
- **API Layer**: Các API routes (`/src/app/api/...`) là cổng giao tiếp duy nhất giữa client và server-side logic.
- **Configuration**: Không hardcode config. Mọi cấu hình (API keys, secrets) phải được quản lý qua biến môi trường (`process.env.*`).
- **Error Handling**: Sử dụng Error Boundaries cho React components và try-catch/global handlers cho API routes. Log lỗi tập trung.
- **Naming Conventions**:
  - Hooks: Luôn có prefix `use` (e.g., `useUserData`).
  - Components: PascalCase (e.g., `UserProfileCard`).
  - API files: `route.ts`.
- **Typing**: Tuyệt đối không dùng `any` trừ khi có `// TODO:` giải thích lý do chính đáng và kế hoạch thay thế.

## 4. "AI-Free Zones" (Vùng Cấm AI)

Các file/folder sau đây là nền tảng kiến trúc, được khóa và chỉ được chỉnh sửa thủ công bởi kiến trúc sư. AI chỉ được phép IMPORT và sử dụng, không được chỉnh sửa.

- `/prisma/schema.prisma`
- `/src/lib/db.ts`
- `/src/lib/auth.ts` (nếu có)
- `/src/types/**`
- `ARCHITECTURE.md` (this file)

## 5. Non-Functional Requirements (NFRs)
- **Performance**: TTFB < 400ms cho các trang chính. LCP < 2.5s.
- **Security**: Tuân thủ nguyên tắc của NextAuth. Không lưu token/session nhạy cảm ở client-side storage. Mọi API nhạy cảm phải được bảo vệ.
- **Observability**: Mọi API route phải có logging chuẩn JSON để dễ dàng truy vấn.
- **Scalability**: Sử dụng serverless (Vercel, Neon) để có khả năng mở rộng tự động.