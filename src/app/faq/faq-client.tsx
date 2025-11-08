'use client';

import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Comprehensive FAQ data
const faqData = [
  {
    id: '1',
    category: 'Giới thiệu',
    question: 'ApexRebate là gì?',
    answer: 'ApexRebate là nền tảng hoàn phí giao dịch toàn diện, giúp trader tối ưu hóa lợi nhuận ròng bằng cách hoàn trả một phần phí giao dịch từ các sàn lớn như Binance, Bybit, OKX.'
  },
  {
    id: '2',
    category: 'Giới thiệu',
    question: 'Mức hoàn phí là bao nhiêu?',
    answer: 'Tùy theo sàn giao dịch và khối lượng giao dịch của bạn, hoàn phí thường dao động từ 20-40% tổng phí giao dịch hàng tháng.'
  },
  {
    id: '3',
    category: 'Thanh toán',
    question: 'Khi nào tôi nhận được tiền hoàn phí?',
    answer: 'Chúng tôi xử lý thanh toán hàng tuần. Tiền hoàn phí sẽ được chuyển vào tài khoản của bạn trong vòng 24-48 giờ sau khi xử lý.'
  },
  {
    id: '4',
    category: 'Thanh toán',
    question: 'Có chi phí ẩn nào không?',
    answer: 'Hoàn toàn không. Dịch vụ của ApexRebate miễn phí hoàn toàn. Bạn chỉ nhận được tiền, không phải trả bất kỳ khoản phí nào.'
  },
  {
    id: '5',
    category: 'Bảo mật',
    question: 'Dữ liệu của tôi có an toàn không?',
    answer: 'Có. Chúng tôi sử dụng mã hóa SSL/TLS, hai yếu tố xác thực (2FA) và không bao giờ lưu trữ khóa API của bạn trên server.'
  },
  {
    id: '6',
    category: 'Bảo mật',
    question: 'ApexRebate có phải là một sàn giao dịch không?',
    answer: 'Không. ApexRebate chỉ là nền tảng hoàn phí affiliate. Bạn vẫn giao dịch trực tiếp trên các sàn lớn, chúng tôi chỉ giúp bạn nhận hoàn phí.'
  }
];

const categories = [...new Set(faqData.map(item => item.category))];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-20">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge className="mb-4 bg-slate-700 text-slate-100 border-slate-600">
              <HelpCircle className="w-4 h-4 mr-2" />
              Câu hỏi thường gặp
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Những câu hỏi từ Trader Sói
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Tìm câu trả lời chi tiết về ApexRebate, hoàn phí, bảo mật và quy trình thanh toán
            </p>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-12">
            {categories.map((category) => (
              <section key={category}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-purple-500">
                  {category}
                </h2>
                <div className="space-y-4">
                  {faqData
                    .filter(item => item.category === category)
                    .map((item) => (
                      <details
                        key={item.id}
                        className="group border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md hover:border-purple-300"
                      >
                        <summary className="cursor-pointer select-none px-6 py-4 flex items-center justify-between font-semibold text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className="flex items-center gap-3">
                            <span className="text-purple-600">▸</span>
                            {item.question}
                          </span>
                          <ChevronDown className="w-5 h-5 text-gray-600 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="px-6 py-4 bg-white text-gray-700 leading-relaxed">
                          <p>{item.answer}</p>
                        </div>
                      </details>
                    ))}
                </div>
              </section>
            ))}
          </div>

          {/* Still have questions CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 text-center">
            <HelpCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Còn câu hỏi khác?
            </h3>
            <p className="text-gray-600 mb-4">
              Đội ngũ chuyên gia ApexRebate sẵn sàng hỗ trợ bạn 24/7
            </p>
            <a
              href="mailto:support@apexrebate.com"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Liên hệ support
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
