// Simplified How It Works page
export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">Cách hoạt động</h1>
      <div className="space-y-6">
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Bước 1: Đăng ký</h3>
          <p>Điền form đăng ký trên trang chủ.</p>
        </div>
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Bước 2: Xác thực</h3>
          <p>Đội ngũ liên hệ xác thực.</p>
        </div>
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Bước 3: Giao dịch</h3>
          <p>Bắt đầu giao dịch và nhận hoàn phí.</p>
        </div>
      </div>
    </div>
  );
}
