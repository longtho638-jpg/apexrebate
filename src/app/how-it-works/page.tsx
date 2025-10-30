'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  DollarSign,
  Calculator,
  Trophy,
  Mail,
  Handshake,
  BarChart3,
  Target,
  Zap,
  Eye,
  Lock,
  Star,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/navbar';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  timeRequired: string;
  actionText: string;
}

interface Phase {
  id: string;
  name: string;
  title: string;
  description: string;
  duration: string;
  goal: string;
  features: string[];
  status: 'current' | 'completed' | 'upcoming';
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Đăng ký Yêu cầu',
    description: 'Điền form đăng ký Concierge trên trang chủ',
    icon: <Users className="w-6 h-6" />,
    details: [
      'Cung cấp email và thông tin giao dịch cơ bản',
      'Mô tả kinh nghiệm và khối lượng giao dịch dự kiến',
      'Nhập mã giới thiệu (nếu có)'
    ],
    timeRequired: '2 phút',
    actionText: 'Đăng ký ngay'
  },
  {
    id: 2,
    title: 'Xác thực Concierge',
    description: 'Đội ngũ Concierge liên hệ xác thực trong 24 giờ',
    icon: <Mail className="w-6 h-6" />,
    details: [
      'Email cá nhân hóa từ đội ngũ Concierge',
      'Xác minh thông tin và giải đáp thắc mắc',
      'Tư vấn sàn giao dịch phù hợp nhất'
    ],
    timeRequired: '24 giờ',
    actionText: 'Chờ xác thực'
  },
  {
    id: 3,
    title: 'Tạo Tài khoản',
    description: 'Đăng ký tài khoản qua link affiliate của ApexRebate',
    icon: <Handshake className="w-6 h-6" />,
    details: [
      'Sử dụng link riêng biệt để đảm bảo tracking',
      'Giữ nguyên tài khoản hiện có nếu đã có',
      'Hoàn tất xác minh KYC theo yêu cầu sàn'
    ],
    timeRequired: '5 phút',
    actionText: 'Tạo tài khoản'
  },
  {
    id: 4,
    title: 'Giao dịch & Nhận Hoàn phí',
    description: 'Bắt đầu giao dịch bình thường và nhận báo cáo hàng tuần',
    icon: <TrendingUp className="w-6 h-6" />,
    details: [
      'Giao dịch như bình thường trên sàn đã chọn',
      'Nhận email báo cáo chi tiết hàng tuần',
      'Tiền hoàn phí chuyển trong 24 giờ sau báo cáo'
    ],
    timeRequired: 'Hàng tuần',
    actionText: 'Bắt đầu giao dịch'
  }
];

const phases: Phase[] = [
  {
    id: 'seed',
    name: 'HẠT GIỐNG',
    title: 'Xây dựng Nền tảng Niềm tin',
    description: 'Tập trung vào 100 thành viên đầu tiên với dịch vụ Concierge thủ công tận tâm.',
    duration: 'Tháng 1-9',
    goal: 'Chứng minh mô hình kinh doanh và xây dựng uy tín',
    features: [
      'Dịch vụ Concierge thủ công',
      'Email cá nhân hóa hàng tuần',
      'Bức tường danh vọng minh bạch',
      'Săn "Sói" thủ công trên X/Twitter'
    ],
    status: 'current',
    icon: <Shield className="w-8 h-8" />
  },
  {
    id: 'tree',
    name: 'CÂY',
    title: 'Phát triển Hệ sinh thái',
    description: 'Mở rộng thành nền tảng và cộng đồng riêng tư "Hang Sói".',
    duration: 'Tháng 10-24',
    goal: 'Trở thành "quán nước" cho trader ưu tú',
    features: [
      'Hệ thống payout tự động',
      'Dashboard theo dõi real-time',
      'Cộng đồng "Hang Sói" private',
      'ApexPro SaaS ($19/tháng)',
      'Bản tin Apex Intel hàng tuần'
    ],
    status: 'upcoming',
    icon: <BarChart3 className="w-8 h-8" />
  },
  {
    id: 'forest',
    name: 'RỪNG',
    title: 'Xây dựng Hệ sinh thái Toàn diện',
    description: 'Mở rộng thành hệ sinh thái tạo ra doanh thu đa nguồn.',
    duration: 'Năm 3-4',
    goal: 'Trở thành công cụ không thể thiếu của trader',
    features: [
      'Công cụ báo cáo thuế tự động',
      'Apex Capital kết nối quỹ đầu tư',
      'Chợ công cụ trading bot',
      'API platform cho bên thứ ba'
    ],
    status: 'upcoming',
    icon: <Target className="w-8 h-8" />
  },
  {
    id: 'land',
    name: 'ĐẤT',
    title: 'Lớp Cơ sở Hạ tầng',
    description: 'Trở thành lớp cơ sở hạ tầng cho hệ sinh thái FinTech mới.',
    duration: 'Năm 5+',
    goal: 'Trở thành "hệ điều hành" cho thành công trader',
    features: [
      'ApexRebate API công khai',
      'Apex Ventures quỹ đầu tư mạo hiểm',
      'Dịch vụ B2B Cashback-as-a-Service',
      'Global expansion và enterprise features'
    ],
    status: 'upcoming',
    icon: <Star className="w-8 h-8" />
  }
];

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedPhase, setSelectedPhase] = useState('seed');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Shield className="w-4 h-4 mr-2" />
            Quy trình Minh bạch
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Cách Hoạt động
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Quy trình 4 bước đơn giản và minh bạch. 
            Mỗi bước được thiết kế để đảm bảo sự an toàn, 
            hiệu quả và tin cậy tuyệt đối cho "Trader Sói Đơn Độc".
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => document.getElementById('process-steps')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Zap className="mr-2 w-5 h-5" />
              Xem quy trình chi tiết
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Target className="mr-2 w-5 h-5" />
              Lộ trình phát triển
            </Button>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section id="process-steps" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Quy trình 4 Bước Đơn giản
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Mỗi bước đều được thiết kế để đảm bảo trải nghiệm liền mạch và an toàn tuyệt đối
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-blue-100" 
                       style={{ width: '100%', left: '100%', top: '2rem' }} />
                )}
                
                <Card className={`h-full cursor-pointer transition-all duration-300 ${
                  activeStep === step.id 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                     onClick={() => setActiveStep(step.id)}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                      activeStep === step.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {step.icon}
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      <Badge variant="outline" className="text-xs">
                        Bước {step.id}
                      </Badge>
                      <span className="ml-2 text-xs text-slate-500">{step.timeRequired}</span>
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="text-center">
                    <p className="text-slate-600 mb-4">{step.description}</p>
                    
                    {activeStep === step.id && (
                      <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                        <div className="border-t pt-3">
                          <h4 className="font-medium text-slate-900 mb-2">Chi tiết:</h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Button size="sm" className="w-full">
                          {step.actionText}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Tại sao Tin tưởng ApexRebate?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Chúng tôi xây dựng niềm tin qua sự minh bạch và bảo mật tuyệt đối
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Minh bạch Tuyệt đối</h3>
              <p className="text-sm text-slate-600">
                Công khai công thức tính toán, báo cáo chi tiết hàng tuần, 
                và không có phí ẩn nào.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Bảo mật Tối đa</h3>
              <p className="text-sm text-slate-600">
                Không truy cập tài khoản giao dịch, mã hóa thông tin, 
                và tuân thủ các tiêu chuẩn bảo mật cao nhất.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Cộng đồng Uy tín</h3>
              <p className="text-sm text-slate-600">
                "Trader Sói Đơn Độc" xác thực, không "lùa gà", 
                chỉ tập trung vào phân tích kỹ thuật.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Lộ trình Phát triển
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Hành trình từ một "hạt giống" trở thành cả một "hệ sinh thái"
            </p>
          </div>

          <Tabs value={selectedPhase} onValueChange={setSelectedPhase} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="seed">HẠT GIỐNG</TabsTrigger>
              <TabsTrigger value="tree">CÂY</TabsTrigger>
              <TabsTrigger value="forest">RỪNG</TabsTrigger>
              <TabsTrigger value="land">ĐẤT</TabsTrigger>
            </TabsList>

            {phases.map((phase) => (
              <TabsContent key={phase.id} value={phase.id} className="mt-6">
                <Card className="p-8">
                  <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                      phase.status === 'current' 
                        ? 'bg-blue-600 text-white' 
                        : phase.status === 'completed'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {phase.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-2xl font-bold text-slate-900">{phase.name}</h3>
                        <Badge className={
                          phase.status === 'current' 
                            ? 'bg-blue-100 text-blue-800'
                            : phase.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }>
                          {phase.status === 'current' ? 'Hiện tại' : 
                           phase.status === 'completed' ? 'Hoàn thành' : 'Sắp tới'}
                        </Badge>
                      </div>
                      
                      <h4 className="text-xl font-semibold text-slate-800 mb-2">{phase.title}</h4>
                      <p className="text-slate-600 mb-4">{phase.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h5 className="font-medium text-slate-900 mb-2">Thời gian</h5>
                          <p className="text-slate-600">{phase.duration}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-slate-900 mb-2">Mục tiêu</h5>
                          <p className="text-slate-600">{phase.goal}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-slate-900 mb-3">Tính năng chính:</h5>
                        <div className="grid md:grid-cols-2 gap-3">
                          {phase.features.map((feature, index) => (
                            <div key={index} className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              <span className="text-sm text-slate-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Sẵn sàng Tối ưu hóa Lợi nhuận?
            </h2>
            
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Hãy trở thành một trong 100 thành viên đầu tiên của giai đoạn HẠT GIỐNG 
              và nhận sự chăm sóc Concierge tận tâm nhất.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.location.href = '/#intake-form'}
              >
                <Users className="mr-2 w-5 h-5" />
                Đăng ký ngay
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.location.href = '/calculator'}
              >
                <Calculator className="mr-2 w-5 h-5" />
                Tính toán tiết kiệm
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}