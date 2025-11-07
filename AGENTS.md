# 🧠 ApexRebate Unified Hybrid MAX Architecture (2025)

> *Saigon Edition powered by Kimi K2 & Copilot Agents*
> Mục tiêu: Hệ thống tự động, ổn định, có khả năng tự phục hồi, sẵn sàng mở rộng toàn cầu.

---

## 🚀 1️⃣ Build / Lint / Test / Deploy Commands

| Command                 | Purpose                     |
| ----------------------- | --------------------------- |
| `npm run build`         | Next.js 16 production build |
| `npm run lint`          | ESLint linting              |
| `npm run test`          | Unit tests (Jest)           |
| `npm run test:watch`    | Watch mode for tests        |
| `npm run test:coverage` | Jest coverage report        |
| `npm run test:e2e`      | Playwright E2E UI tests     |
| `npm run test:e2e:ui`   | Interactive E2E mode        |
| `npm run db:push`       | Prisma schema push          |
| `npm run db:generate`   | Prisma generate             |

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

**Frontend:** Next.js 16 + React 19 + Tailwind CSS
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

## 🌟 Closing Notes

> ApexRebate 2025 – Hybrid MAX v2 is where humans and AI build together.
> “Automation doesn’t replace craft; it amplifies it.” – Saigon Tech Collective 💛

Khi CI/CD pass, hãy tự thưởng một ly bạc xỉu và để Agents lo phần còn lại. ☕️