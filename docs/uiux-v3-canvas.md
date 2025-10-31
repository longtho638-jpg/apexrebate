# UI/UX v3 — Tailwind-Only Canvas (Hybrid Mode ⚡)

Canvas này phục vụ clean rebuild giao diện ApexRebate theo chuẩn "Hybrid Mode ⚡ | Codex UI/UX v3 — Tailwind Only". Mọi thành phần đều dùng Tailwind thuần, kết hợp design tokens và i18n tự động dựa trên `data-i18n`.

## 📦 Nội dung chính

- Route mới: `/uiux-v3` (App Router) với layout riêng chứa skip-link, header, footer và `ThemeToggle`.
- Component primitives: button, input, card, table, toast và skeleton được tập hợp lại trong `src/features/uiux-v3/components`.
- Design tokens: cấu hình `tailwind.config.ts` + `globals.css` cập nhật container, animation và utility hỗ trợ container queries.
- Script i18n: `npm run i18n:extract` sinh file JSON từ thuộc tính `data-i18n`.

## 🚀 Cách sử dụng nhanh

```bash
npm run dev
# Mở http://localhost:3000/uiux-v3 để duyệt canvas

npm run i18n:extract
# Hoặc tùy chỉnh: npm run i18n:extract src/app/(uiux-v3) src/components/uiux-v3 --locale=en --out messages/en.uiux-v3.json
```

Tham khảo route `/uiux-v3` để tái cấu trúc các trang hiện có. Mọi copy đều đã gán `data-i18n` để dễ dàng đồng bộ sang file dịch.
