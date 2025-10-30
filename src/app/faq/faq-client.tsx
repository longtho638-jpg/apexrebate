'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  Calculator, 
  Users, 
  TrendingUp,
  Clock,
  DollarSign,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  Trophy
} from 'lucide-react';
import Navbar from '@/components/navbar';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  priority: 'high' | 'medium' | 'low';
}

const faqData: FAQItem[] = [
  // High Priority - Core Business Model
  {
    id: '1',
    category: 'Dịch Vụ Concierge',
    question: 'ApexRebate là gì và tại sao lại là "Dịch Vụ Concierge"?',
    answer: 'ApexRebate không phải là một nền tảng tự động hoàn toàn. Chúng tôi là dịch vụ hoàn phí thủ công, tận tâm dành riêng cho "Trader Sói Đơn Độc". Mỗi tuần, đội ngũ Concierge sẽ cá nhân hóa email báo cáo và xử lý thủ công các khoản hoàn phí để đảm bảo tính minh bạch và chính xác tuyệt đối.',
    priority: 'high'
  },
  {
    id: '2',
    category: 'Dịch Vụ Concierge',
    question: 'Tại sao chỉ giới hạn 100 thành viên trong giai đoạn HẠT GIỐNG?',
    answer: 'Chúng tôi tập trung vào chất lượng thay vì số lượng. 100 thành viên đầu tiên sẽ nhận được sự chăm sóc cá nhân hóa tối đa, giúp chúng tôi hoàn thiện quy trình Concierge và xây dựng nền tảng vững chắc cho cộng đồng "Hang Sói" sau này.',
    priority: 'high'
  },
  {
    id: '3',
    category: 'Hoàn Phí',
    question: 'Mức hoàn phí thực tế là bao nhiêu?',
    answer: 'Mức hoàn phí phụ thuộc vào sàn giao dịch và khối lượng của bạn. Ví dụ: Với Binance Futures, chúng tôi có thể hoàn lại 40% hoa hồng nhận được từ sàn, tương đương khoảng 4-8% tổng phí giao dịch của bạn. Công cụ tính toán trên trang chủ sẽ cho con số chính xác.',
    priority: 'high'
  },
  {
    id: '4',
    category: 'Hoàn Phí',
    question: 'Khi nào tôi nhận được tiền hoàn phí?',
    answer: 'Chúng tôi xử lý hoàn phí hàng tuần. Mỗi thứ Sáu, bạn sẽ nhận được email cá nhân hóa từ đội ngũ Concierge báo cáo số tiền tiết kiệm được trong tuần. Tiền sẽ được chuyển vào tài khoản của bạn trong vòng 24 giờ sau khi email được gửi.',
    priority: 'high'
  },
  
  // Medium Priority - Process & Security
  {
    id: '5',
    category: 'Quy Trình',
    question: 'Tôi cần làm gì để bắt đầu?',
    answer: 'Quá trình rất đơn giản: 1) Điền form đăng ký trên trang chủ, 2) Đội ngũ Concierge sẽ liên hệ trong 24 giờ để xác thực, 3) Tạo tài khoản qua link affiliate của chúng tôi, 4) Bắt đầu giao dịch bình thường, 5) Nhận báo cáo và hoàn phí hàng tuần.',
    priority: 'medium'
  },
  {
    id: '6',
    category: 'Quy Trình',
    question: 'Tôi có cần chuyển tài khoản hiện tại không?',
    answer: 'Không. Bạn giữ nguyên tài khoản và giao dịch như bình thường. Điều duy nhất thay đổi là bạn đăng ký qua link affiliate của chúng tôi để được hưởng chính sách hoàn phí tốt nhất.',
    priority: 'medium'
  },
  {
    id: '7',
    category: 'Bảo Mật',
    question: 'Thông tin giao dịch của tôi có an toàn không?',
    answer: 'Tuyệt đối an toàn. Chúng tôi không có quyền truy cập vào tài khoản giao dịch của bạn. Chúng tôi chỉ nhận dữ liệu về khối lượng giao dịch từ sàn qua chương trình affiliate để tính toán hoàn phí. Mọi thông tin cá nhân đều được mã hóa và bảo vệ.',
    priority: 'medium'
  },
  {
    id: '8',
    category: 'Bảo Mật',
    question: 'Tại sao ApexRebate lại tin tưởng được?',
    answer: 'Chúng tôi xây dựng niềm tin qua sự minh bạch tuyệt đối: 1) Công khai công thức tính toán, 2) Báo cáo chi tiết hàng tuần, 3) Xử lý thủ công bởi đội ngũ Concierge, 4) Cộng đồng "Trader Sói Đơn Độc" xác thực, 5) Cam kết không ẩn phí.',
    priority: 'medium'
  },
  
  // Low Priority - Additional Info
  {
    id: '9',
    category: 'Cộng Đồng',
    question: '"Hang Sói - The Wolf\'s Den" là gì?',
    answer: 'Đây là cộng đồng riêng tư dành cho 100 thành viên ưu tú đầu tiên. Nơi chúng tôi chia sẻ các phân tích chuyên sâu, chiến lược tối ưu hóa lợi nhuận, và kết nối các trader có cùng tư duy. Cấm "phím hàng", "lùa gà" - chỉ tập trung vào phân tích kỹ thuật và quản lý rủi ro.',
    priority: 'low'
  },
  {
    id: '10',
    category: 'Cộng Đồng',
    question: 'Làm thế nào để được mời vào "Hang Sói"?',
    answer: '100 thành viên đầu tiên của giai đoạn HẠT GIỐNG sẽ tự động được mời. Sau đó, chỉ có thể vào qua lời mời từ thành viên hiện tại hoặc khi có vị trí trống (rất hiếm).',
    priority: 'low'
  },
  {
    id: '11',
    category: 'Tương Lai',
    question: 'ApexPro SaaS là gì?',
    answer: 'Khi chuyển sang giai đoạn CÂY, chúng tôi sẽ ra mắt ApexPro - gói SaaS $19/tháng với các tính năng phân tích nâng cao: báo cáo thuế tự động, chỉ số PnL chuyên sâu, và các công cụ tối ưu hóa hiệu suất giao dịch.',
    priority: 'low'
  },
  {
    id: '12',
    category: 'Tương Lai',
    question: 'Kế hoạch dài hạn của ApexRebate là gì?',
    answer: 'Chúng tôi phát triển theo mô hình 4 giai đoạn: HẠT GIỐNG → CÂY → RỪNG → ĐẤT. Mục tiêu cuối cùng trở thành "hệ điều hành" cho thành công của trader, với các dịch vụ từ công cụ báo cáo thuế đến kết nối với quỹ đầu tư.',
    priority: 'low'
  }
];

const categories = ['Tất cả', 'Dịch Vụ Concierge', 'Hoàn Phí', 'Quy Trình', 'Bảo Mật', 'Cộng Đồng', 'Tương Lai'];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [expandedItems, setExpandedItems] = useState<string[]>(['1', '2', '3', '4']); // Expand high priority by default

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Quan trọng';
      case 'medium': return 'Thường gặp';
      case 'low': return 'Thông tin';
      default: return 'Khác';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
            <HelpCircle className="w-4 h-4 mr-2" />
            Trung tâm Trợ giúp
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Câu hỏi thường gặp
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Mọi thắc mắc của "Trader Sói Đơn Độc" về dịch vụ Concierge hoàn phí 
            và cộng đồng ApexRebate đều được giải đáp chi tiết tại đây.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => document.getElementById('faq-search')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Search className="mr-2 w-5 h-5" />
              Tìm kiếm câu trả lời
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('faq-contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <ArrowRight className="mr-2 w-5 h-5" />
              Vẫn cần hỗ trợ?
            </Button>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section id="faq-search" className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi hoặc từ khóa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`${
                    selectedCategory === category 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-slate-600">
              Tìm thấy {filteredFAQs.length} câu hỏi
              {searchTerm && ` cho "${searchTerm}"`}
              {selectedCategory !== 'Tất cả' && ` trong "${selectedCategory}"`}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Không tìm thấy câu hỏi nào
                </h3>
                <p className="text-slate-600 mb-4">
                  Thử thay đổi từ khóa hoặc chọn danh mục khác
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Tất cả');
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((item) => (
                <Card key={item.id} className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                            {getPriorityLabel(item.priority)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg text-left text-slate-900">
                          {item.question}
                        </CardTitle>
                      </div>
                      <div className="flex items-center text-slate-400">
                        {expandedItems.includes(item.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedItems.includes(item.id) && (
                    <CardContent>
                      <Separator className="mb-4" />
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Tính toán tiết kiệm</h3>
              <p className="text-sm text-slate-600 mb-4">
                Xem số tiền bạn có thể tiết kiệm với công cụ của chúng tôi
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/#calculator'}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Tính ngay
              </Button>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Xem thành viên</h3>
              <p className="text-sm text-slate-600 mb-4">
                Các trader ưu tú đã tiết kiệm bao nhiêu với ApexRebate
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/#wall-of-fame'}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Xem ngay
              </Button>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Cách hoạt động</h3>
              <p className="text-sm text-slate-600 mb-4">
                Quy trình minh bạch 4 bước đơn giản
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/#how-it-works'}
              >
                <Shield className="w-4 h-4 mr-2" />
                Tìm hiểu
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="faq-contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Vẫn còn câu hỏi?
          </h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Đội ngũ Concierge của ApexRebate luôn sẵn sàng hỗ trợ "Trader Sói Đơn Độc". 
            Chúng tôi trả lời trong vòng 24 giờ.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-slate-900"
              onClick={() => window.location.href = 'mailto:support@apexrebate.com'}
            >
              <HelpCircle className="mr-2 w-5 h-5" />
              Email hỗ trợ
            </Button>
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.location.href = '/#intake-form'}
            >
              <ArrowRight className="mr-2 w-5 h-5" />
              Đăng ký ngay
            </Button>
          </div>
          
          <div className="mt-8 text-sm text-slate-400">
            <p>📧 support@apexrebate.com | ⏰ Phản hồi trong 24 giờ | 🎯 Dành cho trader nghiêm túc</p>
          </div>
        </div>
      </section>
    </div>
  );
}