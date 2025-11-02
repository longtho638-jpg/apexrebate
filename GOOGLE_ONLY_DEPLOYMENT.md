# 🎯 100% Google Ecosystem Deployment

## ✅ Stack: Firebase + Google Cloud ONLY

- **Frontend:** Firebase Hosting
- **Backend API:** Cloud Functions (Gen 2)
- **Cron Jobs:** Cloud Scheduler → Cloud Functions
- **Database:** Prisma + SQLite (or Cloud SQL)
- **Monitoring:** Cloud Monitoring
- **Logs:** Cloud Logging
- **Storage:** Firebase Storage (optional)

**No External Services:** ✅ No Vercel, No Netlify, No Ngrok

---

## 🚀 One-Command Deploy

```bash
./deploy-to-firebase.sh
```

**Or manually:**

```bash
# 1. Build
npm run build

# 2. Deploy everything
firebase deploy
```

---

## 📦 What Gets Deployed

### Firebase Hosting
- Next.js static assets
- Public files
- Routing to Cloud Functions for SSR

### Cloud Functions
- `ssr` - Next.js SSR handler
- `scheduledCronJobs` - Scheduled cron executor
- `triggerCronJobs` - Manual trigger
- `manualPayout` - Payment processing
- `submitIntakeForm` - Form handler
- `getWallOfFame` - Public data
- `getBrokerData` - Broker info

---

## 🌐 Your URLs (After Deploy)

### Main App
```
https://apexrebate.web.app
https://apexrebate.firebaseapp.com
```

### Custom Domain (Optional)
```
https://apexrebate.com  ← Connect in Firebase Console
```

### Cloud Functions
```
https://us-central1-apexrebate.cloudfunctions.net/scheduledCronJobs
https://us-central1-apexrebate.cloudfunctions.net/triggerCronJobs
```

---

## 🔧 Environment Variables

### Production Setup

1. **Update `.env` for production:**

```env
# Firebase Hosting URL
NEXT_PUBLIC_API_URL=https://apexrebate.web.app

# Database
DATABASE_URL=file:./prod.db

# Auth
NEXTAUTH_URL=https://apexrebate.web.app
NEXTAUTH_SECRET=your-production-secret-here

# Cron
CRON_SECRET=your-secret-key-123

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

2. **Update Functions env:**

```bash
# Already configured in functions/.env.yaml:
APP_URL: "https://apexrebate.web.app"
CRON_SECRET: "your-secret-key-123"
```

---

## 🧪 Testing After Deploy

### 1. Test Main App
```bash
curl https://apexrebate.web.app
```

### 2. Test Cron API
```bash
curl -X POST https://apexrebate.web.app/api/cron/run-jobs \
  -H "Authorization: Bearer your-secret-key-123" \
  -H "Content-Type: application/json"
```

### 3. Test Cloud Function
```bash
curl -X POST https://triggercronjobs-fyesnthnra-uc.a.run.app \
  -H "Authorization: Bearer your-secret-key-123"
```

### 4. Health Check
```bash
./scripts/cron-health-check.sh
```

---

## 📊 Firebase Hosting + Functions Architecture

```
┌─────────────────────────────────────────────────┐
│   User Request → apexrebate.web.app             │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         Firebase Hosting                        │
│  ┌───────────────────────────────────────────┐  │
│  │  Static: .next/standalone/public          │  │
│  │  Routes: Rewrite to SSR function         │  │
│  └───────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│         Cloud Functions                         │
│  ┌───────────────────────────────────────────┐  │
│  │  ssr → Next.js SSR                        │  │
│  │  /api/cron/run-jobs → Cron logic         │  │
│  └───────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────┐    ┌──────────────────┐
│ Cloud        │    │ Scheduled        │
│ Scheduler    │───▶│ CronJobs         │
│ (Hourly)     │    │ (Cloud Function) │
└──────────────┘    └──────────────────┘
```

---

## 🎯 Custom Domain Setup (Optional)

### 1. In Firebase Console

1. Go to: https://console.firebase.google.com/project/apexrebate/hosting
2. Click **Add custom domain**
3. Enter: `apexrebate.com`
4. Follow DNS setup instructions
5. Add provided TXT and A records to your DNS

### 2. Update Environment

```bash
# Update functions/.env.yaml:
APP_URL: "https://apexrebate.com"

# Redeploy
firebase deploy --only functions
```

---

## 🔄 Continuous Deployment

### GitHub Actions (100% Google)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: apexrebate
```

---

## 💰 Costs (Free Tier)

### Firebase Hosting
- **Storage:** 10 GB free
- **Bandwidth:** 360 MB/day free
- **Custom domain:** Free SSL

### Cloud Functions
- **Invocations:** 2M/month free
- **Compute:** 400K GB-sec free
- **Network:** 5 GB egress free

### Cloud Scheduler
- **Jobs:** 3 jobs free

**Total:** ~$0/month for small usage ✅

---

## 🔧 Troubleshooting

### Build fails

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Deploy fails

```bash
# Check Firebase login
firebase login --reauth

# Check project
firebase use apexrebate

# Deploy step by step
firebase deploy --only hosting
firebase deploy --only functions
```

### Functions can't reach API

```bash
# Check URL in functions/.env.yaml
cat functions/.env.yaml

# Should be:
# APP_URL: "https://apexrebate.web.app"

# Redeploy if wrong
firebase deploy --only functions
```

---

## 📚 Firebase Resources

- **Console:** https://console.firebase.google.com/project/apexrebate
- **Hosting:** https://console.firebase.google.com/project/apexrebate/hosting
- **Functions:** https://console.firebase.google.com/project/apexrebate/functions
- **Docs:** https://firebase.google.com/docs

---

## 🎉 Success Checklist

- [ ] `npm run build` succeeds
- [ ] `firebase deploy` completes
- [ ] Can access https://apexrebate.web.app
- [ ] `/api/cron/run-jobs` returns 200 OK
- [ ] Cloud Functions can trigger cron
- [ ] Health check passes

---

## 🚀 Deploy Now!

```bash
./deploy-to-firebase.sh
```

**100% Google Ecosystem - No external services! ✅**

---

*Last Updated: 2025-10-31*
*Infrastructure: 100% Firebase + Google Cloud*
*External Dependencies: ZERO*
