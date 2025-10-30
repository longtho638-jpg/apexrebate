# ApexRebate - Nền tảng Hoàn phí Giao dịch Tiền điện tử

## 📋 Tổng quan

ApexRebate là một nền tảng FinTech thế hệ mới, được thiết kế để cung cấp dịch vụ hoàn phí giao dịch (cashback) cho các nhà giao dịch tiền điện tử. Với sự tập trung vào tính minh bạch, hiệu quả và cộng đồng, ApexRebate đang cách mạng hóa cách các trader tối ưu hóa lợi nhuận ròng của họ.

## 🎯 Tầm nhìn & Sứ mệnh

**Tầm nhìn:** Trở thành "hệ điều hành" cho sự thành công của trader, cung cấp một hệ sinh thái toàn diện giúp tối ưu hóa lợi nhuận và xây dựng cộng đồng trader chất lượng cao.

**Sứ mệnh:** Giúp các trader giảm thiểu chi phí giao dịch, tối đa hóa lợi nhuận ròng, và xây dựng một cộng đồng "Sói Đơn Độc" - những trader độc lập, có kỷ luật và tư duy hệ thống.

## 🚀 Tính năng Nổi bật

### 1. Hệ thống Quản lý Người dùng
- **Đăng ký/Đăng nhập** an toàn với NextAuth.js
- **Hồ sơ cá nhân** đầy đủ thông tin
- **Mã giới thiệu** tự động và hệ thống theo dõi
- **Cấp độ thành viên** dựa trên khối lượng giao dịch

### 2. Máy tính Hoàn phí Thông minh
- **Tính toán thời gian thực** cho nhiều sàn giao dịch
- **Hỗ trợ:** Binance, Bybit, OKX
- **Phân tích chi tiết** các cấp độ VIP
- **Dự báo lợi nhuận** dựa trên khối lượng giao dịch

### 3. Hệ thống Giới thiệu
- **Mã giới thiệu độc quyền** cho mỗi người dùng
- **Theo dõi hiệu suất** giới thiệu theo thời gian thực
- **Chương trình Đại sứ** với các cấp độ thưởng khác nhau
- **Thống kê chi tiết** về số người giới thiệu và thưởng

### 4. Bảng tin Danh vọng (Wall of Fame)
- **Xếp hạng Top Performer** hàng tháng
- **Thống kê tổng quan** về số tiền đã tiết kiệm
- **Vinh danh** những trader xuất sắc
- **Cộng đồng minh bạch** và đáng tin cậy

### 5. Lịch sử Hoàn phí
- **Theo dõi chi tiết** tất cả các khoản hoàn phí
- **Bộ lọc nâng cao** theo thời gian và sàn giao dịch
- **Xuất dữ liệu CSV** cho báo cáo thuế
- **Thống kê tổng hợp** và biểu đồ trực quan

### 6. Hệ thống Thông báo Thời gian thực
- **Thông báo tức thì** khi có hoàn phí mới
- **Cảnh báo giới thiệu** thành công
- **Cập nhật hệ thống** quan trọng
- **Tích hợp Socket.IO** cho hiệu suất cao

### 7. Quản trị viên Hệ thống
- **Dashboard quản lý** người dùng
- **Xử lý hoàn phí** tự động và thủ công
- **Thống kê hệ thống** chi tiết
- **Quản lý vai trò** và quyền truy cập

## 🛠 Công nghệ Sử dụng

### Frontend
- **Next.js 15** với App Router
- **TypeScript 5** cho type safety
- **Tailwind CSS 4** cho styling
- **shadcn/ui** component library
- **Lucide React** icons
- **Framer Motion** animations
- **Recharts** cho biểu đồ

### Backend
- **NextAuth.js v4** cho authentication
- **Prisma ORM** cho database management
- **PostgreSQL** database
- **Socket.IO** cho real-time communication
- **bcryptjs** cho password hashing
- **Zod** cho validation

### Infrastructure
- **Node.js** runtime
- **SQLite** cho development
- **ESLint** cho code quality
- **Prettier** cho code formatting

## 📊 Cấu trúc Database

```sql
-- Users Table
- id, email, name, password, role
- tradingVolume, preferredBroker, experience
- referralCode, referredBy, createdAt

-- Payouts Table  
- id, amount, userId, broker, tradeType
- status, createdAt, processedAt

-- Referrals Table
- id, referrerId, referredId, status
- rewardAmount, createdAt

-- Notifications Table
- id, userId, type, title, message
- read, createdAt
```

## 🚀 Quick Start

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Cài đặt
```bash
# Clone repository
git clone <repository-url>
cd apexrebate

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env với configuration phù hợp

# Setup database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL=file:./dev.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📱 Responsive Design

ApexRebate được thiết kế hoàn toàn responsive:
- **Mobile-first approach**
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly** interface
- **Optimized** cho cả desktop và mobile

## 🔒 Security Features

- **JWT-based authentication**
- **Password hashing** với bcryptjs
- **CSRF protection** qua NextAuth
- **Input validation** với Zod
- **SQL injection prevention** qua Prisma ORM
- **XSS protection** với proper sanitization

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/signin` - Đăng nhập
- `GET /api/auth/session` - Lấy session hiện tại

### User Management
- `GET /api/user/profile` - Lấy thông tin người dùng
- `PUT /api/user/profile` - Cập nhật thông tin
- `GET /api/user/referrals` - Lấy thông tin giới thiệu
- `GET /api/user/payouts` - Lấy lịch sử hoàn phí

### Calculator
- `GET /api/calculator` - Tính toán hoàn phí

### Wall of Fame
- `GET /api/wall-of-fame` - Lấy bảng xếp hạng

### Notifications
- `GET /api/notifications` - Lấy thông báo
- `PUT /api/notifications/:id/read` - Đánh dấu đã đọc

## 📈 Performance Optimization

- **Code splitting** tự động với Next.js
- **Image optimization** với Next.js Image
- **Database indexing** cho queries nhanh hơn
- **Caching strategy** cho API responses
- **Lazy loading** cho components nặng

## 🧪 Testing

```bash
# Run ESLint
npm run lint

# Run type checking
npm run type-check

# Build for production
npm run build
```

## 📚 Documentation

- **API Documentation:** `/docs/api`
- **Component Library:** `/docs/components`
- **Database Schema:** `/docs/database`
- **Deployment Guide:** `/docs/deployment`

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Dự án này được cấp phép theo MIT License - xem file [LICENSE](LICENSE) để biết chi tiết.

## 🎯 Roadmap

### Phase 1: HẠT GIỐNG (Tháng 1-9) ✅
- [x] Core platform development
- [x] User authentication system
- [x] Basic calculator functionality
- [x] Referral system
- [x] Wall of Fame

### Phase 2: CÂY (Tháng 10-24) 🚧
- [ ] Advanced analytics dashboard
- [ ] "Hang Sói" community platform
- [ ] ApexPro SaaS features
- [ ] Mobile app development

### Phase 3: RỪNG (Năm 3-4) 📋
- [ ] Tax reporting tools
- [ ] Apex Capital program
- [ ] Tools marketplace
- [ ] API for third-party integration

### Phase 4: ĐẤT (Năm 5+) 📋
- [ ] ApexRebate API platform
- [ ] Apex Ventures fund
- [ ] B2B services
- [ ] Global expansion

## 📞 Contact

- **Website:** https://apexrebate.com
- **Email:** support@apexrebate.com
- **Twitter:** @ApexRebate
- **Discord:** ApexRebate Community

---

**ApexRebate - Where Smart Traders Optimize Their Profits** 🚀