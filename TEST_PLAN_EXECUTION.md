# Hướng dẫn chạy kiểm thử (ApexRebate)

Tài liệu này ánh xạ nhanh kế hoạch kiểm thử của bạn vào các lệnh chạy thực tế trong repo và cách xác minh kết quả.

## 1) Unit tests (Jest)

Mục tiêu: kiểm tra nhanh logic API ở mức handler, đặc biệt với bảo vệ 401 cho endpoints nhạy cảm và tính ổn định của `/api/dashboard`.

- Kiểm tra 401 khi chưa đăng nhập:
  - `tests/unit/api/user-profile.test.ts`
  - `tests/unit/api/user-referrals.test.ts`
- Kiểm tra `/api/dashboard` trả về dữ liệu tối thiểu:
  - `tests/unit/api/dashboard.test.ts`

Chạy:

```bash
npm run test
```

## 2) E2E tests (Playwright)

Mục tiêu: xác minh trải nghiệm Guest và chức năng Calculator theo kế hoạch (điều hướng, nội dung, tính toán, xử lý lỗi).

- Guest pages & điều hướng: `tests/e2e/guest.spec.ts`
- Calculator (hợp lệ/không hợp lệ, đổi sàn/loại): `tests/e2e/calculator.spec.ts`
- Auth → Dashboard (credentials): `tests/e2e/auth-login-dashboard.spec.ts`

Biến môi trường cho bài test đăng nhập:

```bash
export TEST_USER_EMAIL="user@example.com"
export TEST_USER_PASSWORD="yourpassword"
```

Nếu thiếu biến trên, bài test login sẽ tự động `skip` (không ảnh hưởng các bài khác).

Seed TEST_USER nhanh (local/CI) qua endpoint bảo vệ secret:

```bash
# Yêu cầu .env có SEED_SECRET_KEY và server đang chạy localhost:3000
curl -s -X POST "http://localhost:3000/api/testing/seed-test-user" \
  -H "Authorization: Bearer $SEED_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"ci.e2e.tester@apexrebate.com","password":"Password123!"}'

# (Khuyến nghị) Seed dữ liệu payouts để Dashboard/Payouts hiển thị phong phú hơn
curl -s -X POST "http://localhost:3000/api/testing/seed-test-data" \
  -H "Authorization: Bearer $SEED_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"ci.e2e.tester@apexrebate.com","payouts":6,"startMonthsAgo":5,"brokers":["binance","bybit","okx"],"referralsCount":2,"grantAchievements":true,"clean":true}'
```

Chạy (tự khởi động dev server nếu chạy local):

```bash
npm run test:e2e
```

Tùy chọn giao diện UI:

```bash
npm run test:e2e:ui
```

Ghi chú:
- CI có thể dùng biến `BASE_URL` để trỏ tới preview/production (Playwright đã hỗ trợ `use.baseURL`).
- Nếu dev server không thể khởi động do biến môi trường, set `BASE_URL` tới một instance đang chạy.

## 3) API & Bảo mật (Postman/Newman)

Repo đã có collection Postman: `tests/apexrebate-api.postman_collection.json`.

- Đã wiring sẵn Newman trong package.json và CI.
  - Local:
    ```bash
    # BASE_URL mặc định lên CI là preview/localhost; local bạn có thể đặt thủ công
    export BASE_URL="http://localhost:3000"
    npm run test:api
    ```
  - CI: tự động chạy sau khi dev server sẵn sàng (job prepare).
- Kiểm thử rate-limit và injection/XSS: sử dụng `tests/security-test.sh` như cơ sở, hoặc thêm request lặp/độc hại trong Postman.

## 4) Luồng Auth/User/Admin

- E2E đăng nhập/đăng ký đầy đủ thường cần test account và provider cấu hình. Đề xuất:
  - Dùng account test qua `.env` rồi viết thêm spec: `tests/e2e/auth.spec.ts` (đã có khung cơ bản) và `dashboard` smoke.
  - Với môi trường thiếu biến nhạy cảm, có thể `test.skip` có điều kiện cho các ca cần đăng nhập.

## 5) Mapping nhanh với kế hoạch

- Guest: guest.spec.ts + calculator.spec.ts (điều hướng, hình ảnh/heading, SEO title, tính toán/calculator, responsive cơ bản)
- Auth: auth.spec.ts (hiện có), mở rộng thêm ca không hợp lệ/validation (đề xuất)
- User: thêm spec dashboard sau khi có TEST_USER (đề xuất)
- Admin: sau khi có role admin và trang quản trị, thêm smoke (đề xuất)
- API & Bảo mật: unit (401, dashboard), Postman/Newman, shell script security (đề xuất mở rộng)

## 6) Sự cố thường gặp

- Dev server không start: kiểm tra `.env` hoặc chạy Playwright với `BASE_URL` đã có server.
- Thiếu type Jest trong TS: đã import `@jest/globals` trong các test Node để tránh lỗi type.

---

Thực thi xanh (green) tối thiểu: `npm run test` PASS + `npm run test:e2e` PASS cho guest/calculator trên môi trường local.
