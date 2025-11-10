# VibeSDK Cloudflare Integration Plan
*Tích hợp VibeSDK vào all PLATFORM (Hạt Giống - Cây - Rừng - Đất)*

## 📋 Giả Định Hiện Tại

> Cần bạn xác nhận các điểm dưới đây:

| Câu hỏi | Giả định tạm | Cần xác nhận |
|--------|-------------|------------|
| **VibeSDK là?** | Library Cloudflare Workers? | ❓ |
| **Hạt giống - Cây - Rừng - Đất là?** | Dev → QA → Staging → Prod? | ❓ |
| **Chức năng chính?** | Real-time metrics/observability? | ❓ |
| **Integrations required?** | Next.js middleware? Edge functions? | ❓ |

---

## 🚀 Tùy Chọn Tích Hợp (3 Approaches)

### **Option 1: VibeSDK as Global Middleware (Recommended)**

```
┌─────────────────────────────────────────┐
│         Request → Cloudflare Edge       │
├─────────────────────────────────────────┤
│    VibeSDK Instrumentation (all routes) │
│  ├─ p95 latency sampling                │
│  ├─ error rate tracking                 │
│  ├─ region detection                    │
│  └─ real-time metrics to edge cache    │
└─────────────────────────────────────────┘
         ↓↓↓
    Next.js + Vercel
         ↓↓↓
┌─────────────────────────────────────────┐
│  Neon PostgreSQL (metrics store)        │
└─────────────────────────────────────────┘
```

**Giải pháp này áp dụng cho tất cả 4 stage:**
- 🌱 **Hạt Giống (Seed)** - Dev local + mocked VibeSDK metrics
- 🌿 **Cây (Tree)** - QA/staging + sampled metrics
- 🌲 **Rừng (Forest)** - Production-like + full instrumentation
- 🏔️ **Đất (Land)** - Multi-region production + regional aggregation

---

### **Option 2: VibeSDK as Targeted Edge Routes**

Chỉ tích hợp cho critical endpoints, không inject globally:

```typescript
// src/lib/vibesdkcc-instrumentation.ts
export const instrumentRoute = (path: string, handler: Function) => {
  return async (req: Request) => {
    const startTime = performance.now();
    
    try {
      const response = await handler(req);
      const duration = performance.now() - startTime;
      
      // Send to VibeSDK Cloudflare
      await fetch('https://vibe.cloudflare.local/metrics', {
        method: 'POST',
        headers: {
          'x-vibe-token': process.env.VIBE_API_TOKEN,
          'x-stage': process.env.DEPLOYMENT_STAGE, // hạt giống|cây|rừng|đất
        },
        body: JSON.stringify({
          path,
          duration_ms: duration,
          status: response.status,
          region: req.cf?.colo || 'unknown'
        })
      });
      
      return response;
    } catch (error) {
      // Error tracking
      throw error;
    }
  };
};
```

**Apply to critical paths only:**
- ✅ `/api/payout/*` (KYC, revenue tracking)
- ✅ `/api/tools/*` (marketplace performance)
- ✅ `/api/dashboard/*` (user experience)

---

### **Option 3: VibeSDK as Scheduled Background Job**

Bulk metrics sync every N minutes (不影响 real-time):

```bash
# scripts/vibesdkcc/sync-metrics.mjs
// Run every 5 minutes via GitHub Actions or Cloud Scheduler
const metrics = await fetchFromOTel();
const aggregated = aggregateByStage(metrics); // hạt giống|cây|rừng|đất

for (const stage of ['seed', 'tree', 'forest', 'land']) {
  await sendToVibeSDK(aggregated[stage], {
    stage,
    timestamp: new Date().toISOString()
  });
}
```

**Non-blocking approach:**
- No impact on request latency
- Better for batch processing
- Ideal for cost optimization

---

## 🔧 Recommended Approach: **Hybrid (1 + 2)**

**Global VibeSDK + Targeted Instrumentation:**

```
Layer 1 (Edge - Fast):
├─ VibeSDK wrapper in middleware.ts
├─ Sample 10% of requests (cost control)
└─ Aggregate metrics to edge cache

Layer 2 (Application - Detailed):
├─ Manual instrumentation for critical routes
├─ Full error tracking + stack traces
└─ Send to Neon + VibeSDK in parallel

Layer 3 (Scheduled - Cheap):
├─ Nightly batch sync to VibeSDK
├─ Historical trend analysis
└─ OPA policy evaluation input
```

---

## 📁 Directory Structure

```
src/
├── lib/
│   ├── vibesdkcc/
│   │   ├── index.ts                    # Main client init
│   │   ├── instrumentation.ts          # Middleware hooks
│   │   ├── stages.ts                   # Enum: Seed|Tree|Forest|Land
│   │   ├── sampler.ts                  # 10% sampling logic
│   │   └── errors.ts                   # Error boundary
│   │
│   ├── infrastructure/
│   │   └── cdn-manager.ts              # ← Already has Cloudflare integration
│   │
│   └── geo-detection.ts                # ← Cloudflare cf-ipcountry (can reuse)

scripts/
├── vibesdkcc/
│   ├── sync-metrics.mjs                # Scheduled batch sync
│   ├── validate-tokens.mjs             # Verify API keys
│   └── test-instrumentation.mjs        # Local testing

.env.local:
  VIBE_API_TOKEN=xxx
  VIBE_ENDPOINT=https://api.vibesdkcc.local
  DEPLOYMENT_STAGE=seed|tree|forest|land

.github/workflows/
├── vibesdkcc-sync.yml                  # Scheduled job (every 5 min)
└── agentic.yml                         # ← Integrate VibeSDK into policy gate (A8)
```

---

## 🔗 Integration Points

### **1. Middleware Level**
```typescript
// middleware.ts
import { vibesdkccMiddleware } from '@/lib/vibesdkcc/instrumentation';

export async function middleware(request: NextRequest) {
  // VibeSDK observability
  const start = performance.now();
  const response = await vibesdkccMiddleware(request);
  response.headers.set('x-vibe-duration', String(performance.now() - start));
  
  return response;
}
```

### **2. API Routes**
```typescript
// src/app/api/payout/quote/route.ts
import { instrumentRoute } from '@/lib/vibesdkcc/instrumentation';

export const POST = instrumentRoute('/api/payout/quote', async (req) => {
  // Automatically traced to VibeSDK
  const quote = await calculateQuote(req.json());
  return Response.json(quote);
});
```

### **3. Agentic CI/CD (A8: Guardrails)**
```bash
# scripts/rollout/guardrails-playwright.mjs
// Fetch VibeSDK metrics alongside Playwright testing
const vibeMetrics = await fetch('https://api.vibesdkcc.local/metrics', {
  headers: { 'x-stage': 'tree' } // QA stage before promoting to Forest
});

const evidence = {
  p95_latency: vibeMetrics.p95_ms,
  error_rate: vibeMetrics.error_rate,
  source: 'vibesdkcc',
  timestamp: new Date().toISOString()
};

// Save to evidence/guardrails.json for policy gate
```

---

## 🎯 Stage Mapping (Hạt Giống - Cây - Rừng - Đất)

| Stage | Environment | VibeSDK Mode | Sampling | SLO Thresholds |
|-------|-------------|------------|----------|--------|
| 🌱 Hạt Giống (Seed) | Local dev | Mock/Optional | 1% | Relaxed (p95 ≤ 2000ms) |
| 🌿 Cây (Tree) | QA/staging | Sampled | 10% | Standard (p95 ≤ 500ms) |
| 🌲 Rừng (Forest) | Production-like | Full | 100% | Strict (p95 ≤ 250ms) |
| 🏔️ Đất (Land) | Multi-region prod | Aggregated | 100% | Critical (p95 ≤ 150ms) |

---

## 🔐 Environment Variables

```bash
# .env.local (all stages)
VIBE_API_TOKEN=sk_test_xxxx              # VibeSDK token
VIBE_ENDPOINT=https://api.vibesdkcc.local
VIBE_ENABLED=true
VIBE_SAMPLE_RATE=0.1                     # 10% for Cây|Rừng
VIBE_BATCH_SIZE=100                      # Batch sync settings

# Stage-specific
DEPLOYMENT_STAGE=tree                    # hạt giống|cây|rừng|đất

# Optional: Custom VibeSDK config
VIBE_REGION_OVERRIDE=us-east-1
VIBE_METRICS_RETENTION=30d
```

---

## 🧪 Testing VibeSDK Integration

### **Local (Hạt Giống - Seed)**
```bash
# 1. Run with mocked VibeSDK
VIBE_ENABLED=false npm run dev

# 2. Or with real token (QA)
DEPLOYMENT_STAGE=tree VIBE_ENABLED=true npm run dev

# 3. Test instrumentation
npm run test:vibesdkcc
```

### **Staging (Cây - Tree)**
```bash
# Deploy to QA preview
DEPLOYMENT_STAGE=tree npm run build
npm run test:e2e

# Verify VibeSDK metrics
curl https://api.vibesdkcc.local/metrics?stage=tree
```

### **Production (Rừng - Forest + Đất - Land)**
```bash
# Full instrumentation
DEPLOYMENT_STAGE=forest VIBE_SAMPLE_RATE=1.0 npm run build
gh workflow run agentic.yml

# Monitor dashboard
https://your-dashboard.vibesdkcc.local/stage/forest
```

---

## 📊 Expected Metrics Flow

```
Request Flow:
┌─────────────────────────────────────────┐
│  1. VibeSDK samples request             │
│     (10% in Tree, 100% in Forest)       │
├─────────────────────────────────────────┤
│  2. Middleware captures:                │
│     • p95/p99 latency                   │
│     • error rate                        │
│     • region (cf-ipcountry)             │
│     • status code                       │
├─────────────────────────────────────────┤
│  3. Stored in:                          │
│     • Cloudflare KV (edge cache)        │
│     • Neon PostgreSQL (long-term)       │
│     • VibeSDK Dashboard                 │
├─────────────────────────────────────────┤
│  4. Consumed by:                        │
│     • Agentic CI/CD (A8 guardrails)     │
│     • SLO Dashboard (/admin/slo)        │
│     • OPA Policy evaluation             │
│     • Rollout gating (deploy/no-deploy) │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist

### **Phase 1: Setup (This Week)**
- [ ] Clarify VibeSDK spec + API
- [ ] Create `src/lib/vibesdkcc/` module
- [ ] Implement stage enum (Seed|Tree|Forest|Land)
- [ ] Add `.env.local` variables
- [ ] Test mock instrumentation locally

### **Phase 2: Integration (Next Week)**
- [ ] Add to middleware.ts
- [ ] Instrument critical API routes
- [ ] Add to Agentic CI/CD (A8 guardrails)
- [ ] Staging deployment + metric validation
- [ ] E2E test coverage

### **Phase 3: Production (Week 3)**
- [ ] Multi-region configuration
- [ ] SLO Dashboard integration
- [ ] Alerting rules
- [ ] Rollout to Forest + Land regions
- [ ] Monitor & optimize

---

## 🚨 Questions for Clarification

**Before proceeding, please confirm:**

1. **VibeSDK Scope**
   - Is it a monitoring library, custom SDK, or Cloudflare native feature?
   - API endpoint & authentication method?

2. **Stage Definitions**
   - Are Seed/Tree/Forest/Land environment stages or geographic regions?
   - Corresponding Vercel/Firebase deployments?

3. **Metrics Priority**
   - What metrics matter most? (latency, errors, throughput, cost?)
   - Real-time vs batch acceptable?

4. **SLO Thresholds**
   - Different per stage?
   - Who sets and updates them?

5. **Integration Timeline**
   - MVP (MVP-only critical paths)?
   - Full rollout schedule?

---

## 📞 Next Steps

1. **Confirm assumptions** above
2. **Provide VibeSDK documentation** (API spec, examples)
3. **Define stage mapping** (dev/qa/prod URLs)
4. **Start Phase 1** implementation

---

*Ready to proceed once you clarify the 5 questions above!*
