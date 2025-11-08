# ApexRebate — Brand Pack v1.1 (Marketing + Email + OG + Theme)

> Gói mở rộng: Marketing site (HTML+Tailwind), guideline long‑form (tone & nội dung), mẫu email (transactional/newsletter/onboarding) + OG image templates, và biến thể sáng–tối nâng cao. Tương thích trực tiếp với **Brand Identity v1.0** đã xuất bản.

---

## A) Marketing Site Blueprint (HTML + Tailwind)

**Trang:** Home, Product (Evidence), Pricing, Docs (Getting Started), Blog (optional), Legal (ToS/Privacy), Status.
**Điều hướng tối giản**: Logo (trái), menu (ẩn trên mobile, `lg:flex`), CTA.

### A.1 Header/Nav (sticky)

```html
<header class="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/75 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
  <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
    <a href="/" class="flex items-center gap-2 text-zinc-100">
      <span class="inline-block h-2 w-2 rounded-full bg-wolf-600"></span>
      <span class="font-semibold">ApexRebate</span>
    </a>
    <nav class="hidden items-center gap-6 text-sm text-zinc-300 lg:flex">
      <a href="/product" class="hover:text-white">Sản phẩm</a>
      <a href="/pricing" class="hover:text-white">Bảng giá</a>
      <a href="/docs" class="hover:text-white">Docs</a>
      <a href="/status" class="hover:text-white">Status</a>
    </nav>
    <div class="flex items-center gap-3">
      <a href="/signin" class="hidden text-sm text-zinc-300 hover:text-white sm:inline">Đăng nhập</a>
      <a href="/start" class="inline-flex h-9 items-center rounded-2xl bg-wolf-600 px-4 text-sm font-semibold text-white shadow-md transition hover:bg-wolf-700">Kích hoạt hoàn phí</a>
    </div>
  </div>
</header>
```

### A.2 Hero (marketing)

```html
<section class="bg-gradient-to-b from-zinc-950 to-zinc-950/90">
  <div class="mx-auto max-w-7xl px-6 py-20">
    <div class="max-w-2xl">
      <span class="inline-flex items-center gap-2 rounded-full bg-wolf-600/10 px-3 py-1 text-xs font-medium text-wolf-300 ring-1 ring-wolf-600/30">Evidence‑First Cashback</span>
      <h1 class="mt-4 text-5xl font-bold tracking-tight text-white">Ngừng lãng phí lợi nhuận.</h1>
      <p class="mt-4 text-lg text-zinc-400">Tự động tối ưu tổng chi phí giao dịch. Mỗi khoản chi trả đều có bằng chứng ký số.</p>
      <div class="mt-8 flex items-center gap-4">
        <a href="/start" class="inline-flex h-11 items-center rounded-2xl bg-wolf-600 px-6 text-base font-semibold text-white shadow-md transition hover:bg-wolf-700">Bắt đầu miễn phí</a>
        <a href="/product" class="text-sm font-medium text-zinc-300 hover:text-white">Tìm hiểu sản phẩm →</a>
      </div>
    </div>
  </div>
</section>
```

### A.3 Feature Grid (3×)

```html
<section class="py-16">
  <div class="mx-auto max-w-7xl px-6">
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <article class="rounded-2xl bg-zinc-900/50 p-6 ring-1 ring-zinc-800">
        <h3 class="text-lg font-semibold text-white">Trả nhanh, có SLA</h3>
        <p class="mt-2 text-sm text-zinc-400">Theo dõi lịch chi trả, trạng thái, và thời hạn qua dashboard.</p>
      </article>
      <article class="rounded-2xl bg-zinc-900/50 p-6 ring-1 ring-zinc-800">
        <h3 class="text-lg font-semibold text-white">Minh bạch bằng chứng</h3>
        <p class="mt-2 text-sm text-zinc-400">Evidence Card cho mỗi khoản hoàn: hash, thời gian, chữ ký.</p>
      </article>
      <article class="rounded-2xl bg-zinc-900/50 p-6 ring-1 ring-zinc-800">
        <h3 class="text-lg font-semibold text-white">Tối ưu net‑fee</h3>
        <p class="mt-2 text-sm text-zinc-400">Insight & chính sách giúp giảm chi phí dài hạn một cách an toàn.</p>
      </article>
    </div>
  </div>
</section>
```

### A.4 Social Proof (logo + quote)

```html
<section class="py-12">
  <div class="mx-auto max-w-7xl px-6">
    <p class="text-center text-sm uppercase tracking-wide text-zinc-500">Tin cậy bởi các nhà phân phối & trader chuyên nghiệp</p>
    <div class="mt-6 grid grid-cols-2 items-center gap-6 opacity-80 sm:grid-cols-3 lg:grid-cols-6">
      <div class="h-9 rounded-md bg-zinc-800/60"></div>
      <div class="h-9 rounded-md bg-zinc-800/60"></div>
      <div class="h-9 rounded-md bg-zinc-800/60"></div>
      <div class="h-9 rounded-md bg-zinc-800/60"></div>
      <div class="h-9 rounded-md bg-zinc-800/60"></div>
      <div class="h-9 rounded-md bg-zinc-800/60"></div>
    </div>
  </div>
</section>
```

### A.5 Pricing (teaser)

```html
<section id="pricing" class="py-16">
  <div class="mx-auto max-w-7xl px-6">
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="rounded-2xl bg-zinc-900/50 p-6 ring-1 ring-zinc-800">
        <h3 class="text-xl font-semibold text-white">Starter</h3>
        <p class="mt-1 text-zinc-400">Cá nhân / thử nghiệm</p>
        <div class="mt-4 text-3xl font-bold text-white">$0</div>
        <ul class="mt-4 space-y-2 text-sm text-zinc-400">
          <li>• Evidence Card cơ bản</li>
          <li>• Email thông báo chi trả</li>
        </ul>
        <a href="/start" class="mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl bg-wolf-600 px-4 text-sm font-semibold text-white hover:bg-wolf-700">Bắt đầu</a>
      </div>
      <div class="rounded-2xl bg-zinc-900/50 p-6 ring-1 ring-wolf-700">
        <h3 class="text-xl font-semibold text-white">Pro</h3>
        <p class="mt-1 text-zinc-400">Trader nghiêm túc</p>
        <div class="mt-4 text-3xl font-bold text-white">$29<span class="text-base text-zinc-400">/tháng</span></div>
        <ul class="mt-4 space-y-2 text-sm text-zinc-400">
          <li>• SLA hiển thị</li>
          <li>• Lịch sử & export CSV</li>
          <li>• Hỗ trợ ưu tiên</li>
        </ul>
        <a href="/start" class="mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl bg-wolf-600 px-4 text-sm font-semibold text-white hover:bg-wolf-700">Dùng Pro</a>
      </div>
      <div class="rounded-2xl bg-zinc-900/50 p-6 ring-1 ring-zinc-800">
        <h3 class="text-xl font-semibold text-white">Partner</h3>
        <p class="mt-1 text-zinc-400">NPP & cộng tác viên</p>
        <div class="mt-4 text-3xl font-bold text-white">Tuỳ chỉnh</div>
        <ul class="mt-4 space-y-2 text-sm text-zinc-400">
          <li>• Cổng đối tác</li>
          <li>• SLA đối tác & báo cáo</li>
          <li>• Điều khoản riêng</li>
        </ul>
        <a href="/contact" class="mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl bg-zinc-800 px-4 text-sm font-semibold text-zinc-100 ring-1 ring-zinc-700 hover:bg-zinc-700">Liên hệ</a>
      </div>
    </div>
  </div>
</section>
```

### A.6 FAQ + Footer

```html
<section class="py-16">
  <div class="mx-auto max-w-3xl px-6">
    <h2 class="text-2xl font-semibold text-white">Câu hỏi thường gặp</h2>
    <div class="mt-6 divide-y divide-zinc-800">
      <details class="py-4">
        <summary class="cursor-pointer text-zinc-200">Bằng chứng chi trả gồm những gì?</summary>
        <p class="mt-2 text-sm text-zinc-400">Mỗi khoản hoàn có hash, timestamp, chữ ký và trạng thái—hiển thị trong Evidence Card.</p>
      </details>
      <details class="py-4">
        <summary class="cursor-pointer text-zinc-200">Tần suất chi trả?</summary>
        <p class="mt-2 text-sm text-zinc-400">Theo chu kỳ cấu hình (tuần/tháng) và hiển thị rõ SLA trên dashboard.</p>
      </details>
    </div>
  </div>
</section>
<footer class="border-t border-zinc-800/60 py-10 text-sm text-zinc-400">
  <div class="mx-auto max-w-7xl px-6">
    <div class="flex flex-col justify-between gap-6 sm:flex-row">
      <p>© 2025 ApexRebate. Evidence‑First Cashback.</p>
      <nav class="flex gap-6">
        <a class="hover:text-white" href="/privacy">Privacy</a>
        <a class="hover:text-white" href="/tos">Terms</a>
        <a class="hover:text-white" href="/status">Status</a>
      </nav>
    </div>
  </div>
</footer>
```

---

## B) Guideline Long‑Form (Content & Tone)

**Nguyên tắc 3C**: **Clear** (rõ ràng), **Credible** (có chứng cứ), **Calm** (bình tĩnh).

* **Headline**: ngắn ≤ 10 từ, nêu lợi ích → "Giảm net‑fee, giữ lợi nhuận."
* **Lead**: 1–2 câu, trả lời *cái gì + khác biệt + bằng chứng*.
* **Body**: đoạn 3–5 câu, có số liệu (SLA, thời gian, mức phủ sàn), tránh hứa hẹn lợi nhuận.

**Cấu trúc trang Product**:

1. Vấn đề (chi phí phân tán, theo dõi khó).
2. Giải pháp (cashback + evidence).
3. Cách hoạt động (kết nối tài khoản sàn → dashboard → chi trả → evidence card).
4. An toàn & tuân thủ (chữ ký, audit logs, 2‑eyes).
5. CTA.

**Style check** (tự kiểm):

* Từ cấm: "chắc chắn thắng", "bảo đảm lợi nhuận".
* Từ khuyến khích: "minh bạch", "theo dõi", "bằng chứng", "SLA", "audit".

---

## C) Theme Variants (Sáng/Tối nâng cao)

> Mặc định **dark**. Thêm lớp `light` bằng cách gắn class vào `<html>` để chuyển.

### C.1 Tokens (Tailwind)

```js
// tailwind.config.js (bổ sung)
extend: {
  colors: {
    wolf: { /* như v1.0 */ }
  },
}
```

### C.2 Utility Mapping

* **Dark (mặc định)**: `bg-zinc-950`, surface `bg-zinc-900/50`, text `zinc-200/400/500`, ring `zinc-800`, primary `wolf-600`.
* **Light**: nền `bg-white`, surface `bg-white`, text `zinc-700/500`, border `zinc-200`, primary giữ `wolf-600`.

**Ví dụ container switcher**

```html
<html class="dark"> <!-- hoặc class="light" -->
```

**Light card**

```html
<article class="rounded-2xl bg-white p-5 ring-1 ring-zinc-200 shadow-md">
  <h3 class="text-zinc-900">Tiêu đề</h3>
  <p class="text-zinc-600">Nội dung...</p>
</article>
```

---

## D) Email Templates (Production‑ready)

> Email HTML dùng layout table + inline style để tương thích. Giữ màu theo tokens. Với Tailwind, có thể dùng Maizzle/Preline để **inline** tự động; ở đây bản dưới đã inline sẵn.

### D.1 Transactional: "Payout Notice"

```html
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0a;color:#e5e7eb">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0a0a0a">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="margin:32px 0;background:#0c0c0c;border:1px solid #27272a;border-radius:16px">
            <tr><td style="padding:24px 24px 0;font:700 16px Inter,Arial;color:#fff">ApexRebate</td></tr>
            <tr>
              <td style="padding:16px 24px 0;font:700 24px Inter,Arial;color:#fff">Khoản hoàn đã được chi trả</td>
            </tr>
            <tr>
              <td style="padding:8px 24px 0;font:400 14px Inter,Arial;color:#a1a1aa">Kỳ 2025‑W44 · Bybit · Tài khoản #A1‑93</td>
            </tr>
            <tr>
              <td style="padding:16px 24px">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111827;border:1px solid #27272a;border-radius:12px">
                  <tr>
                    <td style="padding:16px;font:700 20px Inter,Arial;color:#fff">+342.18 USDT</td>
                    <td align="right" style="padding:16px"><span style="display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(34,197,94,.15);color:#86efac;border:1px solid rgba(34,197,94,.2);font:600 12px Inter">Paid</span></td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 16px;font:400 12px Inter;color:#a1a1aa">Hash: c4e1…9b7a · 2025‑11‑07 13:22:41 +07</td>
                    <td align="right" style="padding:0 16px 16px"><a href="{{evidence_url}}" style="font:600 12px Inter;color:#93c5fd;text-decoration:none">Xem chứng cứ →</a></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px"><a href="{{dashboard_url}}" style="display:inline-block;padding:10px 16px;border-radius:12px;background:#5B8CFF;color:#fff;font:600 14px Inter;text-decoration:none">Mở Dashboard</a></td>
            </tr>
            <tr><td style="height:8px"></td></tr>
          </table>
          <div style="font:400 12px Inter,Arial;color:#a1a1aa;margin-bottom:32px">© 2025 ApexRebate</div>
        </td>
      </tr>
    </table>
  </body>
</html>
```

### D.2 Newsletter (modular)

```html
<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0a0a;color:#e5e7eb">
  <table role=presentation width=100% cellpadding=0 cellspacing=0 style="background:#0a0a0a"><tr><td align=center>
    <table role=presentation width=680 cellpadding=0 cellspacing=0 style="margin:32px 0;background:#0c0c0c;border:1px solid #27272a;border-radius:16px">
      <tr><td style="padding:24px;font:700 18px Inter;color:#fff">ApexRebate — Weekly</td></tr>
      <tr><td style="padding:0 24px 8px;font:700 24px Inter;color:#fff">Tối ưu net‑fee tuần này</td></tr>
      <tr><td style="padding:0 24px 16px;font:400 14px Inter;color:#a1a1aa">Bản tin cập nhật tính năng & tips.</td></tr>
      <tr><td style="padding:0 24px 16px;border-top:1px solid #27272a"></td></tr>
      <tr><td style="padding:16px 24px;font:600 16px Inter;color:#fff">Bản cập nhật</td></tr>
      <tr><td style="padding:0 24px 16px;font:400 14px Inter;color:#d4d4d8">• Evidence Card thêm nút tải manifest · • Export CSV theo kỳ · • Cảnh báo SLA.</td></tr>
      <tr><td style="padding:0 24px 24px"><a href="{{blog_url}}" style="display:inline-block;padding:10px 16px;border-radius:12px;background:#5B8CFF;color:#fff;font:600 14px Inter;text-decoration:none">Xem chi tiết</a></td></tr>
    </table>
    <div style="font:400 12px Inter;color:#a1a1aa;margin-bottom:32px">Unsubscribe | © 2025 ApexRebate</div>
  </td></tr></table>
</body></html>
```

### D.3 Onboarding (First‑Win 14 ngày)

```html
<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0a0a;color:#e5e7eb">
  <table role=presentation width=100% cellpadding=0 cellspacing=0><tr><td align=center>
    <table role=presentation width=640 cellpadding=0 cellspacing=0 style="margin:32px 0;background:#0c0c0c;border:1px solid #27272a;border-radius:16px">
      <tr><td style="padding:24px;font:700 20px Inter;color:#fff">Chào mừng đến ApexRebate</td></tr>
      <tr><td style="padding:0 24px 12px;font:400 14px Inter;color:#a1a1aa">Hoàn thành 3 bước để kích hoạt hoàn phí:</td></tr>
      <tr><td style="padding:0 24px 8px;font:400 14px Inter;color:#e5e7eb">1) Kết nối tài khoản sàn → 2) Xác thực email → 3) Thiết lập kỳ chi trả</td></tr>
      <tr><td style="padding:12px 24px"><a href="{{start_url}}" style="display:inline-block;padding:10px 16px;border-radius:12px;background:#5B8CFF;color:#fff;font:600 14px Inter;text-decoration:none">Bắt đầu</a></td></tr>
    </table>
    <div style="font:400 12px Inter;color:#a1a1aa;margin-bottom:32px">Cần trợ giúp? support@apexrebate.com</div>
  </td></tr></table>
</body></html>
```

---

## E) OG Image Templates (SVG/HTML)

> Dùng cho Twitter/X, Facebook, Zalo, LinkedIn. Kích thước khuyến nghị: 1200×630.

### E.1 SVG (dynamic text)

```svg
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0b0f"/>
      <stop offset="100%" stop-color="#12121a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="80" cy="70" r="6" fill="#5B8CFF"/>
  <text x="110" y="78" font-family="Inter,Arial" font-size="28" fill="#fff" font-weight="700">ApexRebate</text>
  <text x="100" y="200" font-family="Inter,Arial" font-size="62" fill="#fff" font-weight="800">Ngừng lãng phí lợi nhuận.</text>
  <text x="100" y="260" font-family="Inter,Arial" font-size="28" fill="#cbd5e1" font-weight="500">Evidence‑First Cashback · Trả nhanh · Minh bạch có chứng cứ</text>
  <rect x="100" y="320" width="420" height="80" rx="18" fill="#0b1220" stroke="#1f3b99"/>
  <text x="130" y="372" font-family="JetBrains Mono, monospace" font-size="26" fill="#c7d2fe">+342.18 USDT · 2025‑W44 · Paid</text>
  <text x="100" y="560" font-family="Inter,Arial" font-size="22" fill="#94a3b8">apexrebate.com</text>
</svg>
```

### E.2 HTML Canvas (render server‑side)

```html
<div class="flex h-[630px] w-[1200px] items-center justify-start bg-gradient-to-br from-zinc-950 to-zinc-900 p-12">
  <div>
    <div class="mb-6 flex items-center gap-3 text-white">
      <span class="h-2 w-2 rounded-full bg-wolf-600"></span>
      <span class="text-2xl font-bold">ApexRebate</span>
    </div>
    <h1 class="max-w-3xl text-6xl font-extrabold text-white">Ngừng lãng phí lợi nhuận.</h1>
    <p class="mt-4 text-2xl text-zinc-300">Evidence‑First Cashback · Trả nhanh · Minh bạch có chứng cứ</p>
    <div class="mt-8 rounded-2xl border border-wolf-700/60 bg-zinc-900/40 px-6 py-4 font-mono text-2xl text-zinc-200">+342.18 USDT · 2025‑W44 · Paid</div>
    <div class="mt-10 text-xl text-zinc-400">apexrebate.com</div>
  </div>
</div>
```

---

## F) Asset Manifest & Checklist

**Manifest đề xuất**

* `/web/index.html` (home)
* `/web/product.html`
* `/web/pricing.html`
* `/web/docs/*`
* `/web/blog/*` (tùy chọn)
* `/web/privacy.html`, `/web/tos.html`, `/web/status.html`
* `/assets/og/*` (SVG/PNG sinh từ template)

**Checklist xuất bản**

* [ ] Kiểm tra A11y (contrast, focus ring, tab order).
* [ ] Responsive mobile‑first (sm→xl).
* [ ] Lighthouse ≥ 90 (Perf/Best‑Practices/SEO).
* [ ] OpenGraph/Twitter meta + favicon.
* [ ] Sitemap + robots.txt.
* [ ] Email DKIM/SPF/DMARC + List‑Unsubscribe.
* [ ] Min hoá ảnh, preconnect fonts.

---

## G) Notes tích hợp (Firebase‑first)

* Hosting: `firebase.json` rewrite → `/index.html` SPA hoặc multi‑page tĩnh.
* Secrets: không nhúng vào client. Email gửi qua Functions/ESP, log evidence chỉ hiển thị dữ liệu đã công khai.
* Status: liên kết `/status` tới status page đã có SLO.
* OG Image: build job Cloud Run/Functions sinh PNG từ SVG/HTML (puppeteer) kèm chữ ký nếu cần.

---

**Phiên bản**: v1.1 · Kế thừa tokens v1.0 · Sẵn sàng ship ra Seed/TREE/FOREST.
