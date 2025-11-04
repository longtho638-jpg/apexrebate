# 📋 BÀN GIAO HỆ THỐNG APEXREBATE CHO NHÀ SÁNG LẬP

## 🎯 TỔNG QUAN

ApexRebate đã hoàn thành giai đoạn SEED và sẵn sàng cho vận hành production.

### Trạng thái hiện tại
- ✅ **Production URL**: https://apexrebate.com
- ✅ **Database**: Neon Postgres với 31 tables, 23 users seeded
- ✅ **Deployment**: Vercel serverless
- ✅ **Monitoring**: Auto-monitoring mỗi 5 phút
- ✅ **Features**: Full-stack - auth, dashboard, exchanges, rebates, referrals

---

## 🔐 THÔNG TIN ĐĂNG NHẬP

### Admin Account
```
Email: admin@apexrebate.com
Password: [Cần reset qua /api/auth/forgot-password]
Role: ADMIN
```

### Seeded Test Users
- **23 users** từ BRONZE đến DIAMOND tiers
- **Emails**: user_1@example.com đến user_23@example.com

---

## 🚀 LUỒNG KIỂM TRA

### 1. Guest Flow - Scripts đã có
```bash
./scripts/test-guest-flows.sh
./scripts/test-guest-flows-fixed.sh
```

### 2. Registration + Login
1. Visit https://apexrebate.com/auth/signup
2. Register new user → verify email → login
3. Access /dashboard

### 3. Authenticated Dashboard
- Profile management
- Exchange connections (Binance, Bybit, OKX)
- Rebate calculator
- Payouts history
- Referral system

### 4. Admin Panel
- URL: https://apexrebate.com/admin
- User management
- Payout approvals
- System analytics

---

## 🛠️ MONITORING

**Script**: `scripts/monitor-production.sh`
- Runs every 5 minutes via cron
- Checks: main site, dashboard, APIs
- Alerts: Discord/Slack webhooks
- Logs: `logs/monitor.log`

**Cron entry:**
```
*/5 * * * * cd /Users/macbookprom1/apexrebate-1 && bash -lc './scripts/monitor-production.sh once' >> /tmp/apexrebate-monitor.log 2>&1
```

---

## 🗄️ DATABASE

**Connection:**
```
postgresql://neondb_owner:npg_dCrmFngj5t7z@ep-blue-heart-a1246js1-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Console**: https://console.neon.tech

**Key Queries:**
```sql
-- Admin users
SELECT email, role FROM users WHERE role='ADMIN';

-- User stats
SELECT COUNT(*), role FROM users GROUP BY role;

-- Payouts summary
SELECT COUNT(*), SUM(amount) FROM payouts WHERE status='COMPLETED';
```

---

## 📊 KEY METRICS

- **Users**: 23 seeded (check production count)
- **Tools**: 13 in marketplace
- **Payouts**: 189 seeded (6 months history)
- **Exchanges**: 3 (Binance, Bybit, OKX)
- **Exchange Accounts**: 18 connected

---

## 🚨 TROUBLESHOOTING

**Login issues:**
```sql
-- Verify email manually
UPDATE users SET "emailVerified"=NOW() WHERE email='user@example.com';
```

**Slow performance:**
```bash
# Check monitoring
./scripts/monitor-production.sh once

# View Vercel analytics
https://vercel.com/longtho638-jpg/apexrebate/analytics
```

---

## 📞 SUPPORT

- **GitHub**: https://github.com/longtho638-jpg/apexrebate
- **Vercel**: https://vercel.com/longtho638-jpg/apexrebate
- **Neon**: https://console.neon.tech

---

## ✅ PRE-LAUNCH CHECKLIST

- [ ] Change admin password
- [ ] Rotate SEED_SECRET_KEY
- [ ] Setup customer support channel
- [ ] Configure error tracking (Sentry)
- [ ] Load testing
- [ ] Update Terms of Service
- [ ] Update Privacy Policy
- [ ] SEO optimization

---

**🚀 Chúc vận hành thành công!**

*Last Updated: Nov 4, 2025*
*Version: 1.0.0 - Production Ready ✅*
