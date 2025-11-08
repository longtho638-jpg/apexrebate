'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  Trophy, 
  TrendingUp, 
  Shield, 
  Users, 
  DollarSign,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Globe,
  HeadphonesIcon,
  FileText,
  HelpCircle,
  ChevronRight
} from 'lucide-react'

export default function HomePage() {
  const [monthlyVolume, setMonthlyVolume] = useState('100000')
  const [selectedExchange, setSelectedExchange] = useState('binance')
  const [calculatedSavings, setCalculatedSavings] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const exchanges = [
    { id: 'binance', name: 'Binance', rate: 0.04 },
    { id: 'bybit', name: 'Bybit', rate: 0.035 },
    { id: 'okx', name: 'OKX', rate: 0.038 }
  ]

  const wallOfFame = [
    { rank: 1, name: 'Kaison T.', savings: '$45,230', trades: 2847, accuracy: '94.2%' },
    { rank: 2, name: 'Anh Minh N.', savings: '$38,920', trades: 2156, accuracy: '91.8%' },
    { rank: 3, name: 'Trung H.', savings: '$32,150', trades: 1923, accuracy: '89.5%' },
    { rank: 4, name: 'Linh P.', savings: '$28,760', trades: 1654, accuracy: '87.3%' },
    { rank: 5, name: 'Hoang V.', savings: '$25,430', trades: 1432, accuracy: '85.9%' }
  ]

  const faqs = [
    {
      question: 'ApexRebate hoạt động như thế nào?',
      answer: 'Chúng tôi hợp tác với các sàn giao dịch lớn để mang lại mức hoa hồng cao nhất cho bạn. Khi bạn giao dịch qua link affiliate của chúng tôi, bạn nhận được phần hoàn phí từ các giao dịch của mình.'
    },
    {
      question: 'Tôi có thể tiết kiệm được bao nhiêu?',
      answer: 'Tùy thuộc vào khối lượng giao dịch của bạn. Trader trung bình có thể tiết kiệm từ 20-40% tổng phí giao dịch hàng tháng.'
    },
    {
      question: 'Khi nào tôi nhận được tiền hoàn phí?',
      answer: 'Chúng tôi xử lý thanh toán hàng tuần. Bạn sẽ nhận được tiền hoàn phí vào tài khoản đã đăng ký trong vòng 24-48 giờ sau khi xử lý.'
    },
    {
      question: 'Có chi phí ẩn nào không?',
      answer: 'Hoàn toàn không. Dịch vụ của chúng tôi hoàn toàn miễn phí. Bạn chỉ nhận được tiền, không phải trả tiền.'
    }
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Đăng ký tài khoản',
      description: 'Tạo tài khoản ApexRebate miễn phí trong vài phút'
    },
    {
      step: 2,
      title: 'Kết nối sàn giao dịch',
      description: 'Sử dụng link affiliate của chúng tôi để đăng ký sàn giao dịch'
    },
    {
      step: 3,
      title: 'Bắt đầu giao dịch',
      description: 'Giao dịch bình thường như bạn vẫn làm hàng ngày'
    },
    {
      step: 4,
      title: 'Nhận hoàn phí',
      description: 'Tiền hoàn phí được tự động chuyển vào tài khoản của bạn'
    }
  ]

  useEffect(() => {
    const exchange = exchanges.find(e => e.id === selectedExchange)
    if (exchange && monthlyVolume) {
      const volume = parseFloat(monthlyVolume) || 0
      const totalFees = volume * (exchange.rate / 100)
      const savings = totalFees * 0.4 // 40% of fees returned
      setCalculatedSavings(savings)
    }
  }, [monthlyVolume, selectedExchange])

  return (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
  <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-6 bg-slate-700 text-slate-100 border-slate-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Dành cho "Trader Sói Đơn Độc"
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Tối ưu hóa <span className="text-purple-300">lợi nhuận ròng</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Nền tảng hoàn phí minh bạch nhất cho trader nghiêm túc. 
              Chúng tôi không hứa hẹn làm giàu nhanh, chúng tôi cung cấp <span className="font-bold text-purple-300">công cụ tối ưu hóa</span> dựa trên dữ liệu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Bắt đầu tối ưu hóa
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/calculator">
                <Button size="lg" variant="outline" className="border-slate-400 text-slate-200 hover:bg-slate-800 px-8 py-4 text-lg">
                  <Calculator className="w-5 h-5 mr-2" />
                  Phân tích hiệu suất
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-400">
              ✓ Không có chi phí ẩn  ✓ Minh bạch tuyệt đối  ✓ Dành cho trader chuyên nghiệp
            </p>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-slate-800/70 backdrop-blur-sm border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-300">$2.5M+</div>
                <div className="text-slate-300 text-sm">Tổng tiền hoàn</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-300">1,152</div>
                <div className="text-slate-300 text-sm">LTV trung bình ($)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-300">40%</div>
                <div className="text-slate-300 text-sm">Tỷ lệ hoàn phí</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-300">100%</div>
                <div className="text-slate-300 text-sm">Minh bạch</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fee Calculator Section */}
      <section id="calculator" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-800">
              <Calculator className="w-4 h-4 mr-2" />
              Phân tích hiệu suất
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tối ưu hóa lợi nhuận ròng</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Công cụ phân tích chuyên sâu giúp "Trader Sói Đơn Độc" hiểu rõ tác động của phí giao dịch đến lợi nhuận
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
                  Máy tính tối ưu hóa phí
                </CardTitle>
                <CardDescription>
                  Phân tích tác động của phí đến lợi nhuận ròng của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="exchange">Sàn giao dịch</Label>
                    <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exchanges.map(exchange => (
                          <SelectItem key={exchange.id} value={exchange.id}>
                            {exchange.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="volume">Khối lượng hàng tháng (USD)</Label>
                    <Input
                      id="volume"
                      type="number"
                      value={monthlyVolume}
                      onChange={(e) => setMonthlyVolume(e.target.value)}
                      placeholder="100,000"
                    />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Tiết kiệm ước tính hàng tháng</div>
                    <div className="text-4xl font-bold text-purple-600">
                    ${mounted ? calculatedSavings.toLocaleString('en-US') : calculatedSavings}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      Tăng lợi nhuận ròng {(calculatedSavings * 12 / (parseFloat(monthlyVolume) || 1) * 100).toFixed(1)}%/năm
                    </div>
                  </div>
                </div>
                
                <Link href="/auth/signup">
                <Button className="w-full bg-purple-600 hover:bg-purple-700" aria-label="Đăng ký tài khoản để bắt đầu tối ưu hóa lợi nhuận giao dịch">
                Bắt đầu tối ưu hóa
                <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
                  Phân tích cho "Trader Sói"
                </CardTitle>
                <CardDescription>
                  Chi tiết tác động của phí đến hiệu suất giao dịch
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Tổng phí giao dịch</span>
                  <span className="font-bold text-red-600">
                  ${mounted ? ((parseFloat(monthlyVolume) || 0) * (exchanges.find(e => e.id === selectedExchange)?.rate || 0) / 100).toLocaleString('en-US') : ((parseFloat(monthlyVolume) || 0) * (exchanges.find(e => e.id === selectedExchange)?.rate || 0) / 100)}
                  </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Hoàn phí từ ApexRebate</span>
                  <span className="font-bold text-green-600">
                  ${mounted ? calculatedSavings.toLocaleString('en-US') : calculatedSavings}
                  </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Phí ròng sau hoàn</span>
                  <span className="font-bold text-blue-600">
                  ${mounted ? ((parseFloat(monthlyVolume) || 0) * (exchanges.find(e => e.id === selectedExchange)?.rate || 0) / 100 - calculatedSavings).toLocaleString('en-US') : ((parseFloat(monthlyVolume) || 0) * (exchanges.find(e => e.id === selectedExchange)?.rate || 0) / 100 - calculatedSavings)}
                  </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded border border-purple-200">
                    <span className="text-sm font-medium text-purple-800">Tỷ lệ tối ưu hóa</span>
                    <span className="font-bold text-purple-600">
                      {((calculatedSavings / ((parseFloat(monthlyVolume) || 0) * (exchanges.find(e => e.id === selectedExchange)?.rate || 0) / 100)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Lời khuyên cho Trader Sói:</strong> Với khối lượng ${monthlyVolume}/tháng, 
                    việc tối ưu hóa phí có thể tăng lợi nhuận ròng của bạn lên {(calculatedSavings * 12 / (parseFloat(monthlyVolume) || 1) * 100).toFixed(1)}% mỗi năm.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Wall of Fame Section */}
      <section id="wall-of-fame" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-800">
              <Trophy className="w-4 h-4 mr-2" />
              Danh vọng Trader Sói
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Những "Trader Sói Đơn Độc" xuất sắc</h2>
            <p className="text-xl text-gray-600">Minh bạch hiệu suất và thành tích của các thành viên ưu tú</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallOfFame.map((member) => (
              <Card key={member.rank} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                        member.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        member.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                        member.rank === 3 ? 'bg-gradient-to-br from-orange-500 to-orange-700' : 'bg-gradient-to-br from-purple-500 to-purple-700'
                      }`}>
                        {member.rank}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <CardDescription>Elite Trader</CardDescription>
                      </div>
                    </div>
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="text-sm text-gray-600">Tiết kiệm tổng:</span>
                      <span className="font-bold text-green-600">{member.savings}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm text-gray-600">Số giao dịch:</span>
                    <span className="font-semibold text-blue-600">{mounted ? member.trades.toLocaleString('en-US') : member.trades}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                      <span className="text-sm text-gray-600">Độ chính xác:</span>
                      <span className="font-semibold text-purple-600">{member.accuracy}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                      <span className="text-sm text-gray-600">Hiệu suất:</span>
                      <span className="font-semibold text-orange-600">
                        {((parseFloat(member.savings.replace('$', '').replace(',', '')) / member.trades) * 100).toFixed(2)}/trade
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
          <Link href="/wall-of-fame">
          <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50" aria-label="Xem danh sách đầy đủ các thành viên xuất sắc">
          <Users className="w-4 h-4 mr-2" aria-hidden="true" />
          Xem thêm thành viên
          <ChevronRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </Button>
          </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-800">
              <Shield className="w-4 h-4 mr-2" />
              Quy trình minh bạch
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cách ApexRebate hoạt động</h2>
            <p className="text-xl text-gray-600">4 bước đơn giản, không có chi phí ẩn</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="text-center group">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hang Soi Community Section */}
      <section id="hang-soi" className="py-20 bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-800">
              <Users className="w-4 h-4 mr-2" />
              Cộng đồng độc quyền
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">"Hang Sói" - Nơi hội tụ Elite Trader</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cộng đồng riêng tư dành cho những "Trader Sói Đơn Độc" thực sự. 
              Không tín hiệu, không lùa gà - chỉ có phân tích chuyên sâu và tối ưu hóa hiệu suất.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <Card className="border-l-4 border-purple-500">
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-800">
                      <Shield className="w-5 h-5 mr-2" />
                      Nội quy tuyệt đối
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        Cấm tuyệt đối việc "phím hàng" và "lùa gà"
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        Chỉ cho phép thảo luận chuyên sâu về phân tích kỹ thuật
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        Tập trung vào quản lý rủi ro và tâm lý giao dịch
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-800">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Nội dung chuyên biệt
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        Phân tích chi phí ẩn và cấu trúc phí các sàn
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        Chiến lược tối ưu hóa lợi nhuận ròng
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                        Chia sẻ công cụ và bot trading tự phát triển
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="text-center">
              <Card className="p-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <CardHeader className="pb-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">Tham gia "Hang Sói"</CardTitle>
                  <CardDescription className="text-purple-100">
                    Cộng đồng độc quyền chỉ dành cho thành viên đã xác minh
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-purple-100">
                    Hiện có <span className="font-bold text-white">100+</span> thành viên ưu tú
                  </p>
                  <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                    Đăng ký tham gia
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                  <p className="text-xs text-purple-200">
                    * Yêu cầu: Khối lượng giao dịch tối thiểu $50,000/tháng
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-800">
              <HelpCircle className="w-4 h-4 mr-2" />
              Câu hỏi chuyên sâu
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Thắc mắc từ Trader Sói</h2>
            <p className="text-xl text-gray-600">Những câu hỏi thực tế từ những trader nghiêm túc</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <HelpCircle className="w-5 h-5 mr-2 text-purple-600" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Card className="p-6 bg-purple-50 border-purple-200">
              <p className="text-purple-800 font-medium mb-4">
                Câu hỏi khác? Chúng tôi có đội ngũ chuyên gia sẵn sàng tư vấn.
              </p>
              <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-100">
                <HeadphonesIcon className="w-4 h-4 mr-2" />
                Liên hệ chuyên gia
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 bg-slate-700 text-slate-100 border-slate-600">
            <Star className="w-4 h-4 mr-2" />
            Quyết định thông minh
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Sẵn sàng tối ưu hóa lợi nhuận ròng?
          </h2>
          <p className="text-xl mb-8 text-slate-300 leading-relaxed">
            Tham gia cộng đồng những "Trader Sói Đơn Độc" đang sử dụng dữ liệu để tối ưu hóa hiệu suất giao dịch
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                <BarChart3 className="w-5 h-5 mr-2" />
                Bắt đầu tối ưu hóa miễn phí
              </Button>
            </Link>
            <Link href="/hang-soi">
              <Button size="lg" variant="outline" className="border-slate-400 text-slate-200 hover:bg-slate-800 px-8 py-4 text-lg">
                <Users className="w-5 h-5 mr-2" />
                Tìm hiểu về "Hang Sói"
              </Button>
            </Link>
          </div>
          <p className="text-sm text-slate-400">
            ✓ Không yêu cầu thẻ tín dụng  ✓ Bắt đầu trong 5 phút  ✓ Hủy bất kỳ lúc nào
          </p>
        </div>
        </section>
          <Footer />
          </div>
  )
}