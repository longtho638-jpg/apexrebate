# 🚀 ApexRebate Production Deployment Guide

## Tổng quan
Hướng dẫn triển khai ApexRebate lên môi trường production sử dụng Google Cloud Platform.

## 📋 Yêu cầu hệ thống

### Prerequisites
- Google Cloud SDK (`gcloud`)
- Docker
- Node.js 18+
- Git

### Google Cloud Setup
1. **Tạo Google Cloud Project**
   ```bash
   gcloud projects create apexrebate-prod
   ```

2. **Enable APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

3. **Tạo Service Account** (nếu cần)
   ```bash
   gcloud iam service-accounts create apexrebate-deployer
   ```

## 🔐 Cấu hình Secrets

### Tạo Secrets trong Google Secret Manager
```bash
# Database URL
echo -n "postgresql://..." | gcloud secrets create DATABASE_URL --data-file=-

# NextAuth Secret
openssl rand -base64 32 | gcloud secrets create NEXTAUTH_SECRET --data-file=-

# NextAuth URL
echo -n "https://apexrebate-prod-xyz.a.run.app" | gcloud secrets create NEXTAUTH_URL --data-file=-
```

### Hoặc sử dụng .env.production
```bash
cp .env.example .env.production
# Edit .env.production với giá trị production
```

## 🏗️ Triển khai Production

### Phương pháp 1: Sử dụng Script tự động (Khuyến nghị)
```bash
# Full deployment
./deploy-production.sh

# Hoặc từng bước
./deploy-production.sh check    # Kiểm tra prerequisites
./deploy-production.sh build    # Build image
./deploy-production.sh push     # Push to GCR
./deploy-production.sh deploy   # Deploy to Cloud Run
```

### Phương pháp 2: Manual Deployment
```bash
# 1. Build và push image
npm run build
docker build -t gcr.io/apexrebate-prod/apexrebate:latest .
docker push gcr.io/apexrebate-prod/apexrebate:latest

# 2. Deploy to Cloud Run
gcloud run deploy apexrebate \
  --image gcr.io/apexrebate-prod/apexrebate:latest \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest"
```

## 📊 Cấu hình Production

### Environment Variables
```bash
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://...
LOG_LEVEL=info
```

### Database
- Sử dụng PostgreSQL trên Google Cloud SQL hoặc Neon.tech
- Chạy migrations: `npx prisma migrate deploy`

### Monitoring & Logging
```bash
# View logs
gcloud logs read --service=apexrebate --region=asia-southeast1

# Setup monitoring
gcloud monitoring uptime-checks create http apexrebate-uptime \
  --checked-resource-uri=https://apexrebate-prod.a.run.app
```

## 🔧 Quản lý Production

### Scaling
```bash
# Tăng max instances
gcloud run services update apexrebate --max-instances=20

# Tăng CPU/Memory
gcloud run services update apexrebate --cpu=4 --memory=4Gi
```

### Rollback
```bash
# Rollback to previous version
gcloud run revisions list --service=apexrebate
gcloud run services update-traffic apexrebate --to-revisions=apexrebate-00001-abc=100
```

### Custom Domain
```bash
# Setup custom domain
gcloud run domain-mappings create \
  --service=apexrebate \
  --domain=apexrebate.com
```

## 🧪 Testing Production

### Health Check
```bash
curl https://your-domain.com/api/health
```

### E2E Testing trên Production
```bash
# Update playwright config
BASE_URL=https://your-domain.com npm run test:e2e
```

## 🚨 Troubleshooting

### Common Issues

**1. Build Failures**
```bash
# Check build logs
npm run build 2>&1 | tee build.log

# Fix memory issues
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**2. Deployment Timeouts**
```bash
# Increase timeout
gcloud run deploy apexrebate --timeout=600
```

**3. Database Connection Issues**
```bash
# Check database connectivity
npx prisma db push --accept-data-loss
```

**4. Cold Start Issues**
```bash
# Set min instances
gcloud run services update apexrebate --min-instances=1
```

## 📈 Performance Optimization

### CDN Setup
```bash
# Enable Cloud CDN for static assets
gcloud compute backend-services update apexrebate-backend --enable-cdn
```

### Caching
- Redis cho session storage
- Cloud CDN cho static assets
- Database query caching

### Monitoring
- Cloud Monitoring dashboards
- Alert policies cho errors/latency
- Custom metrics cho business KPIs

## 🔒 Security Checklist

- [ ] HTTPS enabled (auto với Cloud Run)
- [ ] Secrets stored in Secret Manager
- [ ] Database connections encrypted
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Error messages don't leak sensitive info

## 📞 Support

For deployment issues:
1. Check Cloud Run logs: `gcloud logs read --service=apexrebate`
2. Verify secrets: `gcloud secrets list`
3. Test locally: `npm run dev`
4. Check documentation: [Cloud Run Docs](https://cloud.google.com/run/docs)

---

## 🎉 Deployment Summary

Sau khi triển khai thành công:

✅ **Application URL**: https://apexrebate-prod-[hash].a.run.app
✅ **Health Check**: `/api/health`
✅ **Logs**: Cloud Logging
✅ **Monitoring**: Cloud Monitoring
✅ **Scaling**: Auto-scaling enabled
✅ **Security**: HTTPS + Secret Manager

**Chúc mừng! ApexRebate đã sẵn sàng phục vụ production! 🎊**
