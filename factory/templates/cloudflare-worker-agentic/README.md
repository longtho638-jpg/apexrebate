# {{PROJECT_NAME}}

Cloudflare Worker Agentic project bootstrapped from **Relay Factory**.

## Quick Start

```bash
# Install dependencies
pnpm i

# Set up environment variables
cp .env.example .env.local
# Edit and add your Cloudflare credentials

# Start development
pnpm dev
```

Open [http://localhost:8787](http://localhost:8787) — Your edge function is live!

## Features

- ⚡ **Cloudflare Workers** - Edge computing at global scale
- 🤖 **Kimi K2 Agent** integration for intelligent automation
- 💾 **Workers KV** - Global key-value store
- 📅 **Cron Triggers** - Scheduled tasks
- 🔐 **Type-safe** TypeScript support
- 🚀 **Zero cold starts** - Instant execution

## Environment Setup

### 1. Cloudflare Account
```bash
# Install Wrangler CLI
pnpm add -g wrangler

# Login to Cloudflare
wrangler login
```

### 2. Create KV Namespace
```bash
wrangler kv:namespace create {{PROJECT_NAME}}-kv
# Copy the IDs to wrangler.toml
```

### 3. API Keys
```bash
KIMI_API_KEY=your-api-key
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

## Scripts

- `pnpm dev` - Local development server
- `pnpm deploy` - Deploy to Cloudflare
- `pnpm build` - Build for production
- `pnpm test` - Run tests
- `pnpm lint` - ESLint check

## API Routes

### GET /
Welcome message with version info

### GET /api/health
Health check endpoint

### POST /api/analyze
Analyze text using Kimi K2 Agent

```bash
curl -X POST http://localhost:8787/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Analyze this data..."}'
```

### GET /cache/:key
Retrieve cached data from KV store

### PUT /cache/:key
Store data in KV store

## Scheduled Tasks

Edit `wrangler.toml` to add cron triggers:

```toml
[triggers]
crons = ["0 */6 * * *"]  # Every 6 hours
```

Handler is in `scheduled()` function in `src/index.ts`.

## Deployment

### 1. Configure Domain
In `wrangler.toml`:
```toml
route = "api.example.com/*"
```

### 2. Deploy
```bash
pnpm deploy
```

### 3. Verify
```bash
curl https://api.example.com/api/health
```

## Workers KV Operations

```typescript
// Write
await env.KV.put("key", "value", { expirationTtl: 3600 });

// Read
const value = await env.KV.get("key");

// Delete
await env.KV.delete("key");

// List
const keys = await env.KV.list();
```

## Integrating Kimi K2

In your handler:

```typescript
const result = await callKimiAgent(
  "Your prompt here",
  env.KIMI_API_KEY
);
```

## Cost Optimization

Cloudflare Workers free tier includes:
- ✅ 100,000 requests/day
- ✅ Unlimited KV storage
- ✅ No cold starts
- ✅ Global edge network

## Learn More

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers)
- [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler)
- [Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv)
- [Kimi K2 Integration](https://www.kimi.ai)

## License

MIT
