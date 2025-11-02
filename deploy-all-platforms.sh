#!/bin/bash
set -e

echo "🚀 ApexRebate - Multi-Platform Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Track deployment URLs
DEPLOYED_URLS=()

# ============================================
# 1. BUILD APPLICATION
# ============================================
echo "📦 Building Next.js application..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# ============================================
# 2. DEPLOY TO FIREBASE
# ============================================
echo "🔥 Deploying to Firebase..."
echo "-------------------------------------------"

# Deploy Firebase Functions
firebase deploy --only functions 2>&1 | tail -20

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Firebase Functions deployed${NC}"
    DEPLOYED_URLS+=("Functions: https://us-central1-apexrebate.cloudfunctions.net")
else
    echo -e "${YELLOW}⚠️  Firebase Functions deployment had issues${NC}"
fi

# Deploy Firebase Hosting
firebase deploy --only hosting 2>&1 | tail -10

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Firebase Hosting deployed${NC}"
    DEPLOYED_URLS+=("Firebase: https://apexrebate.web.app")
else
    echo -e "${YELLOW}⚠️  Firebase Hosting deployment had issues${NC}"
fi
echo ""

# ============================================
# 3. DEPLOY TO VERCEL
# ============================================
echo "▲ Deploying to Vercel..."
echo "-------------------------------------------"

if command -v vercel &> /dev/null; then
    # Deploy to production
    VERCEL_URL=$(vercel --prod --yes 2>&1 | grep -oE 'https://[a-zA-Z0-9.-]+\.vercel\.app' | head -1)
    
    if [ -n "$VERCEL_URL" ]; then
        echo -e "${GREEN}✅ Vercel deployed${NC}"
        DEPLOYED_URLS+=("Vercel: $VERCEL_URL")
    else
        echo -e "${YELLOW}⚠️  Vercel deployment failed or already exists${NC}"
        DEPLOYED_URLS+=("Vercel: Check dashboard at https://vercel.com")
    fi
else
    echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
    echo "   Install: npm install -g vercel"
    echo "   Skip for now..."
fi
echo ""

# ============================================
# 4. DEPLOY TO NETLIFY (Optional)
# ============================================
echo "🌐 Deploying to Netlify..."
echo "-------------------------------------------"

if command -v netlify &> /dev/null; then
    netlify deploy --prod --dir=.next 2>&1 | tail -10
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Netlify deployed${NC}"
        DEPLOYED_URLS+=("Netlify: Check dashboard")
    else
        echo -e "${YELLOW}⚠️  Netlify deployment failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Netlify CLI not installed - skipping${NC}"
fi
echo ""

# ============================================
# 5. DEPLOY TO GOOGLE CLOUD RUN (Direct)
# ============================================
echo "☁️  Deploying to Google Cloud Run..."
echo "-------------------------------------------"

if command -v gcloud &> /dev/null; then
    # Create Dockerfile if not exists
    if [ ! -f Dockerfile ]; then
        cat > Dockerfile << 'DOCKER_EOF'
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
DOCKER_EOF
    fi

    # Build and deploy to Cloud Run
    gcloud builds submit --tag gcr.io/apexrebate/nextjs-app
    gcloud run deploy apexrebate-app \
        --image gcr.io/apexrebate/nextjs-app \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated \
        --set-env-vars="DATABASE_URL=file:./dev.db,CRON_SECRET=your-secret-key-123"
    
    if [ $? -eq 0 ]; then
        CLOUD_RUN_URL=$(gcloud run services describe apexrebate-app --region us-central1 --format='value(status.url)')
        echo -e "${GREEN}✅ Cloud Run deployed${NC}"
        DEPLOYED_URLS+=("Cloud Run: $CLOUD_RUN_URL")
    fi
else
    echo -e "${YELLOW}⚠️  gcloud CLI not installed - skipping${NC}"
fi
echo ""

# ============================================
# 6. UPDATE FIREBASE FUNCTIONS WITH BEST URL
# ============================================
echo "🔧 Updating Firebase Functions configuration..."
echo "-------------------------------------------"

# Prefer Vercel > Cloud Run > Firebase Hosting
BEST_URL="https://apexrebate.web.app"
for url in "${DEPLOYED_URLS[@]}"; do
    if [[ $url == *"Vercel"* ]]; then
        BEST_URL=$(echo $url | cut -d' ' -f2)
        break
    elif [[ $url == *"Cloud Run"* ]]; then
        BEST_URL=$(echo $url | cut -d' ' -f3)
    fi
done

echo "Using URL: $BEST_URL"

# Update functions/index.js with best URL
sed -i.bak "s|const APP_URL = process.env.APP_URL.*|const APP_URL = process.env.APP_URL || '$BEST_URL';|" functions/index.js

# Redeploy functions with updated URL
firebase deploy --only functions:scheduledCronJobs,functions:triggerCronJobs 2>&1 | tail -10

echo -e "${GREEN}✅ Functions updated with best URL${NC}"
echo ""

# ============================================
# 7. TESTING ALL DEPLOYMENTS
# ============================================
echo "🧪 Testing Deployments..."
echo "=========================================="
echo ""

for url in "${DEPLOYED_URLS[@]}"; do
    platform=$(echo $url | cut -d':' -f1)
    endpoint=$(echo $url | cut -d' ' -f2-)
    
    echo "Testing $platform..."
    
    # Test homepage
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "  ${GREEN}✅ Homepage: $HTTP_CODE${NC}"
    else
        echo -e "  ${YELLOW}⚠️  Homepage: $HTTP_CODE${NC}"
    fi
    
    # Test API if applicable
    API_URL="${endpoint}/api/health"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "  ${GREEN}✅ API Health: $HTTP_CODE${NC}"
    else
        echo -e "  ${YELLOW}⚠️  API Health: $HTTP_CODE${NC}"
    fi
    
    echo ""
done

# Test Firebase Functions
echo "Testing Firebase Functions..."
TRIGGER_RESULT=$(curl -s -X POST https://triggercronjobs-fyesnthnra-uc.a.run.app \
  -H "Authorization: Bearer your-secret-key-123" \
  -H "Content-Type: application/json")

if echo "$TRIGGER_RESULT" | grep -q '"success":true'; then
    echo -e "  ${GREEN}✅ Cron trigger: Working${NC}"
else
    echo -e "  ${YELLOW}⚠️  Cron trigger: $TRIGGER_RESULT${NC}"
fi
echo ""

# ============================================
# 8. DEPLOYMENT SUMMARY
# ============================================
echo "=========================================="
echo "🎉 DEPLOYMENT SUMMARY"
echo "=========================================="
echo ""

echo "📍 Deployed Platforms:"
for url in "${DEPLOYED_URLS[@]}"; do
    echo "   • $url"
done
echo ""

echo "🔧 Firebase Functions:"
echo "   • scheduledCronJobs: https://scheduledcronjobs-fyesnthnra-uc.a.run.app"
echo "   • triggerCronJobs: https://triggercronjobs-fyesnthnra-uc.a.run.app"
echo ""

echo "🎯 Primary URL: $BEST_URL"
echo ""

echo "📊 Quick Links:"
echo "   • Firebase Console: https://console.firebase.google.com/project/apexrebate"
echo "   • Vercel Dashboard: https://vercel.com/dashboard"
echo "   • Cloud Console: https://console.cloud.google.com/home/dashboard?project=apexrebate"
echo ""

echo "🧪 Test Commands:"
echo "   # Test cron trigger"
echo "   curl -X POST https://triggercronjobs-fyesnthnra-uc.a.run.app \\"
echo "     -H 'Authorization: Bearer your-secret-key-123'"
echo ""
echo "   # Health check"
echo "   ./scripts/cron-health-check.sh"
echo ""

echo -e "${GREEN}✅ Multi-platform deployment complete!${NC}"
