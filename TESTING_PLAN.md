# Kế Hoạch Kiểm Thử ApexRebate

**Phiên bản:** 1.0  
**Ngày:** 5 tháng 11, 2025  
**Người tạo:** Technical Team  
**Mục đích:** Đảm bảo tất cả luồng hoạt động ổn định trước khi bàn giao cho Nhà sáng lập

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Định Nghĩa Luồng](#định-nghĩa-luồng)
3. [Kế Hoạch Kiểm Thử Chi Tiết](#kế-hoạch-kiểm-thử-chi-tiết)
4. [Ví Dụ Prompt Sửa Lỗi](#ví-dụ-prompt-sửa-lỗi)
5. [Checklist Tổng Hợp](#checklist-tổng-hợp)

---

## 🎯 Tổng Quan

### Tầm Quan Trọng Của Kiểm Thử

Theo hướng dẫn từ BugBug.io, một website với nhiều trang và luồng tương tác cần được kiểm thử kỹ lưỡng để đảm bảo:

- ✅ **Tính năng hoạt động đúng** trên mọi trang
- ✅ **Tính dễ sử dụng** và trải nghiệm người dùng mượt mà
- ✅ **Hiệu suất tốt** trên nhiều thiết bị và trình duyệt
- ✅ **Bảo mật chặt chẽ** với dữ liệu người dùng

### Phương Pháp Kiểm Thử

Áp dụng quy trình **SVR (Explorers – Verifier – Corrector – Lặp)**:

1. **Explorers:** Khám phá và thực hiện test cases
2. **Verifier:** Xác minh kết quả và ghi nhận lỗi
3. **Corrector:** Sửa lỗi với Copilot/manual coding
4. **Lặp:** Kiểm thử lại cho đến khi pass

---

## 📊 Định Nghĩa Luồng

| Luồng | Trang/API | Chức Năng Chính |
|-------|-----------|-----------------|
| **Guest** | /, /calculator, /wall-of-fame, /faq, /how-it-works | Nội dung công khai, tính toán tiết kiệm, điều hướng |
| **Auth** | /auth/signin, /auth/signup | Đăng ký, đăng nhập, OAuth, xác thực email |
| **User** | /dashboard, /profile, /referrals, /payouts | Dashboard cá nhân, cập nhật hồ sơ, quản lý giới thiệu |
| **Admin** | /admin, /admin/users, /admin/payouts | Quản trị hệ thống, thống kê, xử lý payout |

---

## 🧪 Kế Hoạch Kiểm Thử Chi Tiết

### 1. Luồng Guest

#### 1.1. Trang Chủ

- [ ] Load không lỗi, hero section hiển thị
- [ ] Menu điều hướng hoạt động (Calculator, FAQ, How it Works)
- [ ] Responsive: mobile (375px), tablet (768px), desktop (1920px)
- [ ] Lighthouse score > 90, LCP < 2.5s

#### 1.2. Calculator

- [ ] Tính toán đúng với input hợp lệ (Binance/Bybit/OKX)
- [ ] Validation: Volume = 0 → hiển thị lỗi
- [ ] Validation: Volume âm → hiển thị lỗi
- [ ] Validation: Ký tự đặc biệt → reject
- [ ] Chart phân tích hiển thị sau tính toán

### 2. Luồng Auth

#### 2.1. Đăng Ký

- [ ] Đăng ký thành công với email/password hợp lệ
- [ ] Reject email trùng lặp
- [ ] Reject email sai định dạng
- [ ] Reject password < 8 ký tự
- [ ] Referral code hợp lệ → lưu referredBy

#### 2.2. Đăng Nhập

- [ ] Đăng nhập thành công → redirect /dashboard
- [ ] Sai password → hiển thị lỗi
- [ ] Rate limiting: 5 lần/phút
- [ ] OAuth Google hoạt động (nếu có)
- [ ] Session cookie tạo ra (HttpOnly, Secure)

### 3. Luồng User

#### 3.1. Dashboard

- [ ] API /api/dashboard gọi thành công
- [ ] Stats cards hiển thị đúng (Total Savings, Volume, Tier)
- [ ] Chart "Savings History" render
- [ ] Pie chart "Broker Distribution" đúng tỷ lệ
- [ ] Tab Analytics: dự báo chính xác
- [ ] Tab Referrals: copy link/code hoạt động
- [ ] Tab Achievements: progress bar hiển thị
- [ ] Responsive mobile

#### 3.2. Profile

- [ ] Load dữ liệu từ /api/user/profile
- [ ] Cập nhật name/volume thành công
- [ ] Validation: name rỗng → lỗi

### 4. Luồng Admin

#### 4.1. Phân Quyền

- [ ] Admin/Concierge truy cập /admin thành công
- [ ] User thường bị chặn (403 hoặc redirect)
- [ ] Guest redirect /auth/signin

#### 4.2. Overview

- [ ] API /api/admin/stats load đúng
- [ ] Stats: totalUsers, totalPayouts chính xác
- [ ] Nút "Làm mới" gọi lại API

#### 4.3. Users Tab

- [ ] Load danh sách từ /api/admin/users
- [ ] Filter by role (User/Admin/Concierge)
- [ ] Filter by status (Verified/Unverified)
- [ ] Search by name/email
- [ ] Deep-link: /admin/users/USER_ID → drawer mở
- [ ] Drawer hiển thị user info

#### 4.4. Payouts Tab

- [ ] Load từ /api/admin/payouts
- [ ] Filter by status (Pending/Processed)
- [ ] Process payout: status → PROCESSED
- [ ] Reject process payout đã processed
- [ ] Export CSV hoạt động

#### 4.5. URL Sync

- [ ] Tab change → URL ?tab=... cập nhật
- [ ] Filter change → URL params cập nhật
- [ ] Search debounce 400ms → URL ?search=...
- [ ] Reload với query → state restore

#### 4.6. Analytics Tracking

- [ ] admin_tab_change tracked
- [ ] admin_filter_change tracked
- [ ] admin_refresh tracked
- [ ] admin_export_csv tracked
- [ ] admin_payout_process tracked
- [ ] Events lưu vào event_logs (sau khi có endpoint)

### 5. API & Bảo Mật

#### 5.1. API Testing

- [ ] /api/calculator: tính toán đúng, rate limit 60/phút
- [ ] /api/dashboard: 401 nếu không auth
- [ ] /api/admin/*: 403 nếu không phải admin
- [ ] Tất cả API trả đúng status code

#### 5.2. Security

- [ ] SQL Injection: input validation chặn
- [ ] XSS: HTML sanitize, không execute script
- [ ] CSRF: token verify
- [ ] Rate limiting hoạt động

---

## 💡 Ví Dụ Prompt Sửa Lỗi

### Mẫu 1: Calculator Validation Bug

```markdown
**Lỗi:** Trang /calculator cho phép volume = 0 và vẫn tính toán.

**Yêu cầu:**
1. File: src/app/calculator/page.tsx
2. Thêm validation: nếu volume <= 0, hiển thị error "Volume phải > 0"
3. Disable nút "Tính toán" khi invalid
4. Viết test Playwright cho case này

**Kiểm tra:**
- Nhập 0 → error hiển thị
- Nhập -100 → error hiển thị
- Nhập 1000000 → tính toán OK
```

### Mẫu 2: Admin Payout Error

```markdown
**Lỗi:** Nút "Xử lý" hiển thị cho payouts đã processed.

**Yêu cầu:**
1. Frontend: src/app/admin/page.tsx
   - Ẩn nút nếu status !== 'PENDING'
2. Backend: src/app/api/admin/payouts/[id]/process/route.ts
   - Check status trước khi process
   - Trả error: "Payout đã được xử lý"
3. Toast hiển thị error message rõ ràng

**Test:**
- Click nút trên processed payout → nút disabled hoặc không hiển thị
```

---

## ✅ Checklist Tổng Hợp

### Guest Flow
- [ ] Trang chủ responsive
- [ ] Calculator validation đầy đủ
- [ ] Wall of Fame load
- [ ] FAQ accordion hoạt động

### Auth Flow
- [ ] Đăng ký hợp lệ
- [ ] Đăng nhập thành công
- [ ] Rate limiting
- [ ] Security (SQL injection, XSS, CSRF)

### User Flow
- [ ] Dashboard load < 3s
- [ ] All tabs hoạt động
- [ ] Profile update
- [ ] Payouts export

### Admin Flow
- [ ] Phân quyền chặn user thường
- [ ] Stats chính xác
- [ ] Users filter/search/deep-link
- [ ] Payouts process/reject
- [ ] URL sync
- [ ] Analytics tracking

### API & Performance
- [ ] Tất cả endpoints đúng status code
- [ ] Rate limiting
- [ ] Security tests pass
- [ ] Performance: p95 < target

### Browser Compatibility
- [ ] Chrome, Firefox, Safari, Edge
- [ ] Mobile Safari, Mobile Chrome

---

## 📊 Báo Cáo Kết Quả (Template)

```markdown
# Báo Cáo Kiểm Thử
**Ngày:** [DATE]
**Tester:** [NAME]

## Tổng Quan
- Tổng: 150 test cases
- Passed: 145
- Failed: 5
- Pass Rate: 96.7%

## Failed Cases
1. TC-G-2.3: Calculator volume=0 bug
2. TC-AD-4.5: Admin process processed payout

## Performance
- Dashboard: 2.1s ✅
- API p95: 145ms ✅
- Lighthouse: 92 ✅

## Recommendations
- Fix P0/P1 bugs trước deploy
- Tăng cường password policy
- Monitor analytics sau deploy
```

---

## �� Quy Trình Deploy

1. Fix all P0/P1 bugs
2. Re-test failed cases
3. Staging deployment + smoke test
4. Production deploy (gradual rollout)
5. Post-deploy verification:
   - Check Vercel logs
   - Monitor Sentry
   - Verify analytics events
   - Test critical flows

---

**Mục tiêu:** Đạt pass rate ≥ 95% trước production deployment 🎯
