# ApexRebate Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions for deploying ApexRebate to various environments, from development to production.

## 🛠 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- PostgreSQL (for production)
- Redis (optional, for caching)

## 🚀 Development Deployment

### 1. Local Setup

```bash
# Clone the repository
git clone <repository-url>
cd apexrebate

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file
nano .env
```

### 2. Environment Configuration

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret-key"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Development settings
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Initialize database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

## 🌐 Production Deployment

### 1. Vercel Deployment (Recommended)

#### Prerequisites
- Vercel account
- Connected GitHub repository

#### Steps

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Configure environment variables in Vercel dashboard
# Add all variables from .env.production
```

#### Environment Variables for Vercel

```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NODE_ENV="production"
```

### 2. Docker Deployment

#### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/apexrebate
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-production-secret
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=apexrebate
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:latest
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

#### Deploy with Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build and run manually
docker build -t apexrebate .
docker run -p 3000:3000 --env-file .env.production apexrebate
```

### 3. Traditional VPS Deployment

#### Server Setup (Ubuntu 22.04)

```bash
# Update system (run as root or with sudo)
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Create database and user
service postgresql start
sudo -u postgres psql
CREATE DATABASE apexrebate;
CREATE USER apexuser WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE apexrebate TO apexuser;
\q
```

#### Application Deployment

```bash
# Clone repository
git clone <repository-url> /var/www/apexrebate
cd /var/www/apexrebate

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Setup environment
cp .env.example .env.production
nano .env.production
```

#### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'apexrebate',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/apexrebate',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/apexrebate
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/apexrebate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL Certificate Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
# Monitor application
pm2 monit

# View logs
pm2 logs apexrebate

# Restart application
pm2 restart apexrebate
```

### Log Management

```bash
# Setup log rotation
sudo nano /etc/logrotate.d/apexrebate

/var/www/apexrebate/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

## 🚀 CI/CD Pipeline

### Agentic CI/CD Pipeline (Recommended)

Dự án này được trang bị **Agentic Pipeline**, một hệ thống CI/CD nâng cao với các cổng kiểm soát chất lượng (policy gates) và khả năng tự động rollback. Đây là phương pháp triển khai được khuyến nghị để đảm bảo an toàn và ổn định.

**Luồng hoạt động (10 bước):**
1.  **A1-A3**: Lint, Unit Test, Build (Cổng kiểm tra chất lượng code)
2.  **A7**: Deploy bản Preview lên Vercel
3.  **A4**: Chạy E2E Test trên môi trường Preview
4.  **A5, A8**: Ký số bằng chứng (evidence) và thu thập số liệu (guardrails)
5.  **A6**: Kiểm tra Policy Gate (so sánh số liệu với SLOs)
6.  **A9**: Nếu tất cả các cổng đều qua, deploy lên Production
7.  **A10**: Nếu có lỗi, tự động Rollback về phiên bản ổn định trước đó

**Cách sử dụng:**
- **Tự động**: Chỉ cần `git push` lên nhánh `main`, pipeline sẽ tự động chạy.
- **Thủ công**: Vào tab "Actions" trên GitHub và trigger workflow `agentic.yml`.

Để biết thêm chi tiết, vui lòng tham khảo các tài liệu sau:
- `AGENTIC_README.md`
- `AGENTIC_SETUP.md`
- `AGENTIC_QUICK_REFERENCE.md`

```yaml
# .github/workflows/agentic.yml (Simplified example)
name: Agentic CI/CD Pipeline

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  agentic-pipeline:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      # ... (các bước A1-A10 được định nghĩa trong agentic.yml thực tế)
      - name: Run Agentic Pipeline
        run: echo "Running full Agentic pipeline..."
```

## 🔧 Environment Variables

### Development
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key"
NODE_ENV="development"
```

### Production
```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-very-secure-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NODE_ENV="production"
```

## 📈 Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_payouts_user_id ON payouts(user_id);
CREATE INDEX idx_payouts_created_at ON payouts(created_at);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
```

### 2. Caching Strategy

```javascript
// Implement Redis caching for API responses
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache API responses
export async function getCachedData(key, fetchFunction, ttl = 300) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetchFunction();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

### 3. CDN Configuration

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
  },
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://your-cdn-domain.com' 
    : undefined,
};
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database connection
   psql $DATABASE_URL -c "SELECT 1;"
   ```

2. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

3. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

4. **Port Conflicts**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   # Kill process
   kill -9 <PID>
   ```

### Health Checks

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Tuning_Your_PostgreSQL_Server)
- [Nginx Configuration Guide](https://www.nginx.com/resources/wiki/start/)

---

For support, please contact: support@apexrebate.com