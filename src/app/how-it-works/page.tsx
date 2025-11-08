import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <div className="container mx-auto px-4 py-16 max-w-4xl flex-1">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Cách ApexRebate hoạt động</h1>
          <p className="text-xl text-slate-600">4 bước đơn giản để bắt đầu tối ưu hóa lợi nhuận giao dịch</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900">Đăng ký tài khoản</h3>
            <p className="text-slate-600">Tạo tài khoản ApexRebate miễn phí trong vài phút với thông tin cơ bản.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900">Xác thực và kết nối</h3>
            <p className="text-slate-600">Đội ngũ ApexRebate sẽ liên hệ xác thực và hướng dẫn kết nối tài khoản giao dịch.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900">Bắt đầu giao dịch</h3>
            <p className="text-slate-600">Giao dịch bình thường trên các sàn hỗ trợ. ApexRebate sẽ theo dõi và tính toán hoàn phí tự động.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-yellow-600">4</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900">Nhận hoàn phí</h3>
            <p className="text-slate-600">Hoàn phí được chuyển vào tài khoản định kỳ. Theo dõi hiệu suất và tối ưu hóa lợi nhuận.</p>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold mb-4 text-slate-900">Tại sao chọn ApexRebate?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">40%</div>
              <p className="text-slate-600">Tỷ lệ hoàn phí trung bình</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <p className="text-slate-600">Hỗ trợ liên tục</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <p className="text-slate-600">Bảo mật tuyệt đối</p>
            </div>
          </div>
        </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
