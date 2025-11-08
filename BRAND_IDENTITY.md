# ApexRebate — Brand Identity v1.0 (UI/UX Playbook)

> Bản nhận diện thương hiệu đầy đủ để đội ngũ cấu hình UI/UX thống nhất trên HTML + Tailwind. Tối ưu chế độ dark, hiệu năng, tính tuân thủ và khả năng mở rộng.

---

## 0) TL;DR (dùng ngay)

* **Tagline ngắn**: *“Ngừng lãng phí lợi nhuận.”*
* **Value prop**: Hoàn phí cao + minh bạch tức thời + chứng cứ chi trả (evidence) chuẩn hóa.
* **Giọng điệu**: Tỉnh táo, thẳng, kỹ thuật; ưu tiên bằng chứng, không phóng đại.
* **Primary color**: `wolf.600` #5B8CFF (blue‑wolf)
* **Accent**: `amber.500` #F59E0B (cảnh báo/nhấn mạnh)
* **Success/Error**: `green.500` #22C55E · `red.500` #EF4444
* **Neutral**: `zinc` scale (Tailwind) + `stone` cho nền ấm trong dark.
* **Font**: Inter (UI), JetBrains Mono (số & code), Noto Sans (fallback đa ngôn ngữ).
* **Radius**: `2xl` (16px) làm chuẩn.
* **Shadow**: mượt, ít lớp: `sm`, `md`, `xl` tuỳ bối cảnh.
* **Easing/Motion**: `duration-200` · `ease-out` cho UI; `duration-150` hover; `duration-300` dialog.

---

## 1) Brand Essence

**Sứ mệnh**: Biến chi phí giao dịch thành lợi thế cạnh tranh không thể sao chép.
**Lời hứa**: *Cashback nhanh – minh bạch – có bằng chứng.*
**Giá trị cốt lõi**: Minh bạch, Hiệu quả, Chủ quyền dữ liệu người dùng.
**Archetype**: *The Guide* (cố vấn thực dụng) + *The Engineer* (tối ưu, có chứng cứ).
**Tính cách**: Bình tĩnh, thông tuệ, không màu mè; tôn trọng rủi ro và quy định.

**Trụ cột thông điệp**

1. **Nhanh & chắc**: Thanh toán hoàn phí kịp thời, quy trình rõ, SLA hiển thị.
2. **Minh bạch có chứng cứ**: Mỗi khoản chi trả có "evidence card" (hash, thời gian, trạng thái).
3. **Tối ưu tổng chi phí**: Không chỉ hoàn phí, mà còn công cụ/insight để giảm net-fee dài hạn.

---

## 2) Đối tượng & Giọng điệu

**Đối tượng chính**: Trader "Sói đơn độc", 28–45, kỹ tính, trọng bằng chứng, dị ứng quảng cáo thổi phồng.
**Giọng văn**: Ngắn – rõ – có số liệu. Tránh ẩn dụ khoa trương. Ưu tiên câu chủ động, dùng từ kỹ thuật phổ biến.

**Mẫu câu**

* Tiêu đề: "Nhận lại phần phí bạn xứng đáng."
* Sub‑copy: "Theo dõi mọi khoản hoàn bằng *Evidence Card*. Trả đúng hạn. Không vòng vo."
* CTA: "Kích hoạt hoàn phí của bạn".

---

## 3) Hệ màu (Design Tokens)

> Chuẩn hóa dưới dạng Tailwind theme. Ưu tiên dark mode. Màu bảo toàn độ tương phản ≥ 4.5:1 với text.

**Core (Wolf Blue)**

* `wolf.50` #F5F8FF
* `wolf.100` #E8F0FF
* `wolf.200` #D6E4FF
* `wolf.300` #ADC8FF
* `wolf.400` #84A9FF
* `wolf.500` #6690FF
* `wolf.600` #5B8CFF ← **Primary**
* `wolf.700` #3B6CEB
* `wolf.800` #1F49C9
* `wolf.900` #122E8F

**Neutral**

* Dùng `zinc` làm base (Tailwind có sẵn). Nền dark: `bg-zinc-900`, bề mặt: `bg-zinc-800/50`.

**Semantic**

* Success: `green.500` #22C55E
* Warning/Accent: `amber.500` #F59E0B
* Error: `red.500` #EF4444
* Info: `sky.500` #0EA5E9

**Data‑viz (10 màu quay vòng)**
`[#5B8CFF, #22C55E, #F59E0B, #EF4444, #06B6D4, #A855F7, #EAB308, #10B981, #F43F5E, #3B82F6]`

**Overlay/Glass**

* Backdrop: `bg-zinc-900/60` + `backdrop-blur-sm` (modal, drawer).
* Card hover: `bg-zinc-800/70` + `ring-1 ring-zinc-700/50`.

---

## 4) Typography

* **UI**: Inter, `font-sans` (fallback: system-ui, Segoe UI, Roboto, Noto Sans).
* **Số liệu/Code**: JetBrains Mono cho bảng & ID; cỡ nhỏ + tracking rộng.

**Scale (rem)**

* Display: 48/40/32
* Title: 28/24
* Body: 16 (default), 14 (muted), 12 (caption)
* Line-height: 1.3 (title), 1.6 (body)

**Weight**: 700 (hero), 600 (title), 500 (CTA/label), 400 (body).

---

## 5) Radius, Shadow, Border, Spacing

* **Radius chuẩn**: `2xl` (16px). Phân cấp: `md`(6), `xl`(12), `2xl`(16), `3xl`(24), `full`.
* **Shadow**: `sm` (list), `md` (card), `xl` (modal). Tránh nhiều lớp gây mờ.
* **Border**: `ring-1` màu `zinc-700/50` trong dark; `zinc-200` trong light.
* **Spacing**: theo Tailwind 4/8 grid: `2, 3, 4, 6, 8, 12` cho container; `1, 1.5, 2` cho nội bộ atom.

---

## 6) Icon/Illustration

* **Icon**: Lucide (thin, kỹ thuật); kích thước 16/20/24.
* **Style**: Outline + 1 trọng điểm màu `wolf.600`. Tránh gradient lòe loẹt.
* **Empty state**: nét vector mảnh, 1–2 màu trung tính + nhấn `wolf.500`.

---

## 7) Motion (vi mô)

* Hover: `transition duration-150 ease-out`
* Press: `scale-95` trong `100ms`
* Dialog/Drawer: `duration-300 ease-out`, `opacity 0→100` + `translate-y 2→0`.
* Skeleton shimmer: `animate-pulse` tiết kiệm.

---

## 8) Nội dung & Viết lách

* Tránh hứa "lãi", "đảm bảo". Dùng ngôn ngữ *giảm chi phí*, *có chứng cứ*.
* Tránh emoji lạm dụng. Có thể dùng 1 biểu tượng sói tinh gọn ở empty state.
* Định dạng số: dùng nhóm nghìn, 2 chữ số thập phân khi cần, đơn vị rõ (USDT, USD).
* Cảnh báo rủi ro hiển thị khi có nội dung liên quan.

**Mẫu microcopy**

* Badge trạng thái: `Paid`, `Pending`, `Disputed`, `Paused`.
* Tooltip: "Khoản chi trả đã được ký & bám bằng chứng."
* Empty: "Chưa có giao dịch liên kết. Thêm tài khoản sàn để bắt đầu."

---

## 9) Thành phần cốt lõi (UI Components)

### 9.1 Button

* **Primary**: `bg-wolf-600 hover:bg-wolf-700 text-white`
* **Secondary**: `bg-zinc-800 hover:bg-zinc-700 text-zinc-100 ring-1 ring-zinc-700/50`
* **Danger**: `bg-red-500 hover:bg-red-600 text-white`

**Kích thước**: `h-9 px-4 text-sm` (chuẩn), `h-11 px-6 text-base` (hero), `h-8 px-3 text-xs` (table).

### 9.2 Card

`rounded-2xl bg-zinc-900/50 ring-1 ring-zinc-800 shadow-md p-5`

### 9.3 Form controls

* Input: `bg-zinc-900/40 focus:bg-zinc-900 ring-1 ring-zinc-800 focus:ring-wolf-600 rounded-xl h-10 px-3`
* Checkbox/Switch: nhấn mạnh trạng thái bằng `ring-wolf-600`.

### 9.4 Badge (status)

* Paid: `bg-green-500/15 text-green-400 ring-1 ring-green-500/20`
* Pending: `bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20`
* Disputed: `bg-red-500/15 text-red-400 ring-1 ring-red-500/20`

### 9.5 Evidence Card (đặc thù Apex)

* Bố cục 2 cột: trái (số tiền, kỳ), phải (hash rút gọn, thời gian, trạng thái).
* Hành động: "Xem chứng cứ", "Tải manifest", "Sao chép hash".

---

## 10) Data‑viz quy ước

* **Biểu đồ**: Area/Line cho xu hướng; Bar cho so sánh; Donut dùng tiết kiệm.
* **Lưới**: `grid-cols-12` cho dashboard; card 3/4/5 cột linh hoạt.
* **Trục & nhãn**: chữ `text-xs text-zinc-400`, lưới mảnh `stroke-zinc-700`.
* **Màu**: dùng bảng ở mục 3; nhấn series chính bằng `wolf.600`.

---

## 11) A11y & Tuân thủ

* Tương phản: ≥ 4.5:1 cho body; ≥ 3:1 cho text lớn.
* Focus ring: luôn hiển thị `focus-visible:outline-none focus-visible:ring-2 ring-wolf-600`.
* Bàn phím: tab order tự nhiên; nút có `aria-label`.
* Bản địa hóa: i18n đầy đủ; đơn vị tiền tệ rõ; thông điệp cảnh báo khu vực hiển thị theo locale.

---

## 12) Tailwind Config (Design Tokens)

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./web/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        wolf: {
          50: '#F5F8FF', 100: '#E8F0FF', 200: '#D6E4FF', 300: '#ADC8FF',
          400: '#84A9FF', 500: '#6690FF', 600: '#5B8CFF', 700: '#3B6CEB',
          800: '#1F49C9', 900: '#122E8F'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Noto Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      borderRadius: {
        '2xl': '16px', '3xl': '24px'
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.08)',
        md: '0 8px 24px -8px rgb(0 0 0 / 0.25)',
        xl: '0 16px 40px -12px rgb(0 0 0 / 0.35)'
      }
    }
  }
}
```

**Web `<head>` (font tải nhanh, không cần CSS riêng)**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
```

---

## 13) Mẫu HTML sẵn dùng (copy‑paste)

### 13.1 Hero

```html
<section class="bg-zinc-950 text-zinc-100">
  <div class="mx-auto max-w-7xl px-6 py-16 lg:py-24">
    <div class="max-w-2xl">
      <span class="inline-flex items-center gap-2 rounded-full bg-wolf-600/10 px-3 py-1 text-xs font-medium text-wolf-300 ring-1 ring-wolf-600/30">Evidence‑First Cashback</span>
      <h1 class="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Ngừng lãng phí lợi nhuận.</h1>
      <p class="mt-4 text-zinc-400">Theo dõi mọi khoản hoàn bằng Evidence Card. Trả đúng hạn. Không vòng vo.</p>
      <div class="mt-8 flex items-center gap-4">
        <a href="#start" class="inline-flex h-11 items-center rounded-2xl bg-wolf-600 px-6 text-base font-semibold text-white shadow-md transition hover:bg-wolf-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wolf-600">Kích hoạt hoàn phí của bạn</a>
        <a href="#evidence" class="text-sm font-medium text-zinc-300 hover:text-white">Xem cách minh bạch hoạt động →</a>
      </div>
    </div>
  </div>
</section>
```

### 13.2 Evidence Card

```html
<article class="rounded-2xl bg-zinc-900/50 p-5 ring-1 ring-zinc-800 shadow-md">
  <div class="flex items-start justify-between gap-4">
    <div>
      <div class="text-xs uppercase text-zinc-400">Kỳ 2025‑W44</div>
      <div class="mt-1 text-2xl font-bold text-white">+342.18 USDT</div>
      <div class="mt-2 text-xs text-zinc-500">Sàn: Bybit · Tài khoản #A1‑93</div>
    </div>
    <span class="rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-medium text-green-400 ring-1 ring-green-500/20">Paid</span>
  </div>
  <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
    <div class="text-zinc-400">Hash</div>
    <div class="font-mono text-zinc-200">c4e1…9b7a</div>
    <div class="text-zinc-400">Thời gian</div>
    <div class="text-zinc-200">2025‑11‑07 13:22:41 +07</div>
  </div>
  <div class="mt-5 flex gap-3">
    <button class="h-9 rounded-xl bg-zinc-800 px-3 text-sm font-medium text-zinc-100 ring-1 ring-zinc-700/50 transition hover:bg-zinc-700">Xem chứng cứ</button>
    <button class="h-9 rounded-xl bg-zinc-800 px-3 text-sm font-medium text-zinc-100 ring-1 ring-zinc-700/50 transition hover:bg-zinc-700">Tải manifest</button>
    <button class="h-9 rounded-xl bg-zinc-800 px-3 text-sm font-medium text-zinc-100 ring-1 ring-zinc-700/50 transition hover:bg-zinc-700">Sao chép hash</button>
  </div>
</article>
```

### 13.3 Bảng số liệu (rút gọn)

```html
<table class="w-full text-left text-sm">
  <thead class="text-zinc-400">
    <tr>
      <th class="py-2 font-medium">Kỳ</th>
      <th class="py-2 font-medium">Sàn</th>
      <th class="py-2 font-medium text-right">Khối lượng</th>
      <th class="py-2 font-medium text-right">Hoàn phí</th>
      <th class="py-2 font-medium text-right">Trạng thái</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-zinc-800 text-zinc-200">
    <tr>
      <td class="py-3">2025‑W44</td>
      <td class="py-3">Bybit</td>
      <td class="py-3 text-right">$1,204,342</td>
      <td class="py-3 text-right text-green-400">+342.18</td>
      <td class="py-3 text-right"><span class="rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-400 ring-1 ring-green-500/20">Paid</span></td>
    </tr>
  </tbody>
</table>
```

---

## 14) Do / Don’t

**Do**

* Giữ layout tối giản, thông tin "tiền tươi" ở trên cùng.
* Mọi giao dịch/chi trả đều có "Xem chứng cứ".
* Dùng màu một cách kỷ luật; primary + 1 accent.

**Don’t**

* Không dùng gradient rực, không đổ bóng nặng tay.
* Không hứa "lợi nhuận" hay "chắc chắn thắng".
* Không giấu trạng thái *Pending/Disputed*.

---

## 15) Checklist triển khai

* [ ] Cấu hình Tailwind (mục 12) + font (head).
* [ ] Bật dark mode mặc định; chuyển theme bằng `class="dark"` ở `<html>`.
* [ ] Áp dụng components mục 9 cho dashboard/portal.
* [ ] Thử nghiệm độ tương phản (A11y) & tab‑navigation.
* [ ] Kiểm thử responsive: sm/md/lg/xl (hero, bảng, evidence card).
* [ ] Viết microcopy theo guideline mục 8.
* [ ] Review Do/Don’t trước khi phát hành.

---

## 16) Phụ lục: Mapping nhanh → Tailwind

* Primary: `bg-wolf-600 hover:bg-wolf-700 text-white`
* Text base: `text-zinc-200`, muted: `text-zinc-400`, subtler: `text-zinc-500`
* Surface: `bg-zinc-900/50 ring-1 ring-zinc-800`
* Border list: `divide-y divide-zinc-800`
* Focus: `focus-visible:ring-2 focus-visible:ring-wolf-600`
* Elevation: `shadow-sm|md|xl`
* Radius: `rounded-2xl`

---

> Phiên bản: v1.0 · Sẵn sàng áp dụng cho Seed/TREE/FOREST UI. Khi mở rộng sang Marketing site, kế thừa toàn bộ tokens & giọng điệu này.
