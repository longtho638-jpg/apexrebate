'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  Shield,
  BarChart3,
  MessageSquare,
  Trophy,
  Star,
  Lock,
  Eye,
  ThumbsUp,
  Clock,
  TrendingUp,
  BookOpen,
  Zap,
  Target,
  CheckCircle2,
  AlertCircle,
  Crown,
  Filter
} from 'lucide-react'
import SocialGraph from '@/components/hang-soi/social-graph'
import ARPUUplift from '@/components/gamification/arpu-uplift'

export default function HangSoiPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [joinRequest, setJoinRequest] = useState({
    name: '',
    email: '',
    experience: '',
    monthlyVolume: '',
    reason: ''
  })

  const communityStats = [
    { label: 'Thành viên ưu tú', value: '127+', icon: Users },
    { label: 'Tổng khối lượng', value: '$15.2M/tháng', icon: BarChart3 },
    { label: 'Thảo luận chất lượng', value: '3,847', icon: MessageSquare },
    { label: 'Tỷ lệ giữ chân', value: '98%', icon: Target }
  ]

  const recentDiscussions = [
    {
      id: 1,
      title: 'Phân tích chi phí ẩn trên Bybit Futures',
      author: 'Kaison T.',
      category: 'Phí giao dịch',
      replies: 23,
      likes: 45,
      time: '2 giờ trước',
      isPinned: true
    },
    {
      id: 2,
      title: 'Chiến lược hedge arbitrage giữa Binance và OKX',
      author: 'Anh Minh N.',
      category: 'Chiến lược',
      replies: 18,
      likes: 38,
      time: '5 giờ trước'
    },
    {
      id: 3,
      title: 'Bot trading tự phát triển: Tối ưu hóa entry/exit',
      author: 'Trung H.',
      category: 'Công cụ',
      replies: 31,
      likes: 67,
      time: '1 ngày trước'
    },
    {
      id: 4,
      title: 'Phân tích tâm lý FOMO/FUD và cách kiểm soát',
      author: 'Linh P.',
      category: 'Tâm lý giao dịch',
      replies: 15,
      likes: 29,
      time: '2 ngày trước'
    }
  ]

  const eliteMembers = [
    {
      rank: 1,
      name: 'Kaison T.',
      title: 'Quant Trader',
      savings: '$45,230',
      contributions: 147,
      specialties: ['Arbitrage', 'Market Making', 'Risk Management'],
      joinDate: 'Tháng 1, 2024'
    },
    {
      rank: 2,
      name: 'Anh Minh N.',
      title: 'System Developer',
      savings: '$38,920',
      contributions: 123,
      specialties: ['Bot Development', 'API Integration', 'Data Analysis'],
      joinDate: 'Tháng 2, 2024'
    },
    {
      rank: 3,
      name: 'Trung H.',
      title: 'Technical Analyst',
      savings: '$32,150',
      contributions: 98,
      specialties: ['Technical Analysis', 'Pattern Recognition', 'Backtesting'],
      joinDate: 'Tháng 1, 2024'
    }
  ]

  const communityRules = [
    {
      title: 'Không tín hiệu, không lùa gà',
      description: 'Cấm tuyệt đối việc đưa ra tín hiệu mua/bán hoặc khuyến nghị đầu tư. Chỉ tập trung vào phân tích và phương pháp luận.',
      icon: Shield,
      type: 'critical'
    },
    {
      title: 'Minh bạch dữ liệu',
      description: 'Mọi phân tích phải đi kèm với dữ liệu và nguồn tham khảo rõ ràng. Không chấp nhận các khẳng định vô căn cứ.',
      icon: Eye,
      type: 'important'
    },
    {
      title: 'Tôn trọng sự riêng tư',
      description: 'Không chia sẻ thông tin cá nhân của thành viên bên ngoài cộng đồng. Mọi thảo luận mang tính bảo mật.',
      icon: Lock,
      type: 'important'
    },
    {
      title: 'Chất lượng hơn số lượng',
      description: 'Ưu tiên các bài viết có chiều sâu, phân tích kỹ thuật thay vì các bình luận ngắn, không có giá trị.',
      icon: Star,
      type: 'normal'
    }
  ]

  const [submitting, setSubmitting] = useState(false)

  const handleSubmitRequest = async () => {
    try {
      setSubmitting(true)
      const res = await fetch('/api/hang-soi/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinRequest)
      })
      if (res.ok) {
        alert('Đơn đăng ký đã được gửi. Vui lòng kiểm tra email.')
        setJoinRequest({ name: '', email: '', experience: '', monthlyVolume: '', reason: '' })
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <Badge className="mb-6 bg-slate-700 text-slate-100 border-slate-600">
                <Crown className="w-4 h-4 mr-2" />
                Cộng đồng độc quyền
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                "Hang Sói"
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                Nơi hội tụ những "Trader Sói Đơn Độc" ưu tú. 
                Không tín hiệu, không lùa gà - chỉ có phân tích chuyên sâu, 
                chia sẻ công cụ và tối ưu hóa hiệu suất.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold">
                  <Users className="w-5 h-5 mr-2" />
                  Đăng ký tham gia
                  <Crown className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-slate-400 text-slate-200 hover:bg-slate-800 px-8 py-4 text-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Tìm hiểu thêm
                </Button>
              </div>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-slate-800/70 backdrop-blur-sm border-t border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {communityStats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-2xl font-bold text-purple-300">{stat.value}</div>
                    <div className="text-slate-300 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Mạng lưới
              </TabsTrigger>
              <TabsTrigger value="gamification" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Thử thách
              </TabsTrigger>
              <TabsTrigger value="discussions" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Thảo luận
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Thành viên
              </TabsTrigger>
              <TabsTrigger value="join" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Tham gia
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="w-6 h-6 mr-2 text-purple-600" />
                        Nội quy cộng đồng
                      </CardTitle>
                      <CardDescription>
                        Những quy tắc cốt lõi làm nên chất lượng của "Hang Sói"
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {communityRules.map((rule, index) => (
                        <div key={index} className={`p-4 rounded-lg border-l-4 ${
                          rule.type === 'critical' ? 'bg-red-50 border-red-500' :
                          rule.type === 'important' ? 'bg-orange-50 border-orange-500' :
                          'bg-blue-50 border-blue-500'
                        }`}>
                          <div className="flex items-start gap-3">
                            <rule.icon className={`w-5 h-5 mt-0.5 ${
                              rule.type === 'critical' ? 'text-red-600' :
                              rule.type === 'important' ? 'text-orange-600' :
                              'text-blue-600'
                            }`} />
                            <div>
                              <h4 className="font-semibold text-gray-900">{rule.title}</h4>
                              <p className="text-gray-600 text-sm mt-1">{rule.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
                        Nội dung chuyên biệt
                      </CardTitle>
                      <CardDescription>
                        Những chủ đề được thảo luận trong cộng đồng
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900">Phân tích kỹ thuật</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                              Phân tích cấu trúc phí các sàn
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                              Chiến lược tối ưu hóa lợi nhuận ròng
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                              Backtesting và xác minh chiến lược
                            </li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900">Công cụ & Công nghệ</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                              Chia sẻ bot trading tự phát triển
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                              API integration và automation
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                              Công cụ phân tích dữ liệu tùy chỉnh
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Trophy className="w-6 h-6 mr-2 text-purple-600" />
                        Top Contributors
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {eliteMembers.map((member) => (
                        <div key={member.rank} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            member.rank === 1 ? 'bg-yellow-500' :
                            member.rank === 2 ? 'bg-gray-400' :
                            'bg-orange-600'
                          }`}>
                            {member.rank}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{member.name}</p>
                            <p className="text-xs text-gray-600">{member.title}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">{member.savings}</p>
                            <p className="text-xs text-gray-500">{member.contributions} đóng góp</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                    <CardHeader>
                      <CardTitle className="text-white">Yêu cầu tham gia</CardTitle>
                      <CardDescription className="text-purple-100">
                        Đối với "Trader Sói Đơn Độc" thực sự
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-300" />
                        <span className="text-sm">Khối lượng tối thiểu $50,000/tháng</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-300" />
                        <span className="text-sm">Kinh nghiệm giao dịch 2+ năm</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-300" />
                        <span className="text-sm">Cam kết tuân thủ nội quy</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-300" />
                        <span className="text-sm">Phỏng vấn với admin</span>
                      </div>
                      <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 mt-4">
                        Nộp đơn tham gia
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Social Network Tab */}
            <TabsContent value="network" className="space-y-8">
              <SocialGraph />
            </TabsContent>

            {/* Gamification Tab */}
            <TabsContent value="gamification" className="space-y-8">
              <ARPUUplift />
            </TabsContent>

            {/* Discussions Tab */}
            <TabsContent value="discussions" className="space-y-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <MessageSquare className="w-6 h-6 mr-2 text-purple-600" />
                        Thảo luận gần đây
                      </CardTitle>
                      <CardDescription>
                        Những cuộc thảo luận chất lượng cao từ cộng đồng
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Lọc
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentDiscussions.map((discussion) => (
                      <div key={discussion.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {discussion.isPinned && (
                                <Badge variant="secondary" className="text-xs">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  Ghim
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {discussion.category}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 hover:text-purple-600 cursor-pointer">
                              {discussion.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>by {discussion.author}</span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {discussion.time}
                              </span>
                              <span className="flex items-center">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                {discussion.replies}
                              </span>
                              <span className="flex items-center">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                {discussion.likes}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-6 h-6 mr-2 text-purple-600" />
                    Thành viên ưu tú
                  </CardTitle>
                  <CardDescription>
                    Những "Trader Sói" xuất sắc nhất của cộng đồng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eliteMembers.map((member) => (
                      <Card key={member.rank} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                                member.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                member.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                                'bg-gradient-to-br from-orange-500 to-orange-700'
                              }`}>
                                {member.rank}
                              </div>
                              <div>
                                <CardTitle className="text-lg">{member.name}</CardTitle>
                                <CardDescription>{member.title}</CardDescription>
                              </div>
                            </div>
                            <Trophy className="w-6 h-6 text-yellow-500" />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Tiết kiệm:</span>
                            <span className="font-bold text-green-600">{member.savings}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Đóng góp:</span>
                            <span className="font-semibold">{member.contributions}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Tham gia:</span>
                            <span className="font-semibold">{member.joinDate}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Chuyên môn:</p>
                            <div className="flex flex-wrap gap-1">
                              {member.specialties.map((specialty, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Join Tab */}
            <TabsContent value="join" className="space-y-8">
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Crown className="w-6 h-6 mr-2 text-purple-600" />
                      Đơn đăng ký tham gia "Hang Sói"
                    </CardTitle>
                    <CardDescription>
                      Chỉ dành cho những "Trader Sói Đơn Độc" thực sự nghiêm túc
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-orange-800">Lưu ý quan trọng</h4>
                          <p className="text-orange-700 text-sm mt-1">
                            Chúng tôi chỉ chấp nhận những trader thực sự nghiêm túc và phù hợp với văn hóa cộng đồng. 
                            Mọi đơn đăng ký sẽ được xem xét kỹ lưỡng.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Họ và tên *</Label>
                        <Input
                          id="name"
                          value={joinRequest.name}
                          onChange={(e) => setJoinRequest({...joinRequest, name: e.target.value})}
                          placeholder="Nhập họ và tên của bạn"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={joinRequest.email}
                          onChange={(e) => setJoinRequest({...joinRequest, email: e.target.value})}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="experience">Kinh nghiệm giao dịch *</Label>
                        <Input
                          id="experience"
                          value={joinRequest.experience}
                          onChange={(e) => setJoinRequest({...joinRequest, experience: e.target.value})}
                          placeholder="Ví dụ: 3 năm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="monthlyVolume">Khối lượng hàng tháng (USD) *</Label>
                        <Input
                          id="monthlyVolume"
                          value={joinRequest.monthlyVolume}
                          onChange={(e) => setJoinRequest({...joinRequest, monthlyVolume: e.target.value})}
                          placeholder="Ví dụ: 100000"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reason">Lý do muốn tham gia *</Label>
                      <Textarea
                        id="reason"
                        value={joinRequest.reason}
                        onChange={(e) => setJoinRequest({...joinRequest, reason: e.target.value})}
                        placeholder="Hãy chia sẻ lý do bạn muốn tham gia cộng đồng và những gì bạn có thể đóng góp..."
                        rows={4}
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Quy trình xét duyệt:</h4>
                      <ol className="space-y-1 text-sm text-blue-700">
                        <li>1. Nộp đơn đăng ký</li>
                        <li>2. Admin xem xét hồ sơ (2-3 ngày)</li>
                        <li>3. Phỏng vấn online (nếu cần)</li>
                        <li>4. Thông báo kết quả</li>
                      </ol>
                    </div>

                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={handleSubmitRequest}
                      disabled={submitting || !joinRequest.name || !joinRequest.email || !joinRequest.experience || !joinRequest.monthlyVolume || !joinRequest.reason}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      {submitting ? 'Đang gửi...' : 'Nộp đơn đăng ký'}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      Bằng cách nộp đơn, bạn đồng ý tuân thủ tất cả nội quy của cộng đồng.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      </div>
    </>
  )
}