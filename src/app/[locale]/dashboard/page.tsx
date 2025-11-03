'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Shield, 
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Crown,
  Gem,
  Star
} from 'lucide-react';

export default function Dashboard() {
  const [userData, setUserData] = useState({
    totalSavings: 0,
    monthlySavings: 0,
    totalVolume: 0,
    memberSince: '',
    rank: 'Bronze',
    nextRankProgress: 0,
    referrals: 0,
    referralEarnings: 0
  });

  const [savingsHistory, setSavingsHistory] = useState<any[]>([]);
  const [brokerStats, setBrokerStats] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch user dashboard data
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        
        if (data.success) {
          setUserData(data.userData);
          setSavingsHistory(data.savingsHistory);
          setBrokerStats(data.brokerStats);
          setAchievements(data.achievements);
        } else {
          // Fallback to mock data
          const mockUserData = {
            totalSavings: 2847.50,
            monthlySavings: 237.29,
            totalVolume: 2500000,
            memberSince: '2024-01-15',
            rank: 'Silver',
            nextRankProgress: 65,
            referrals: 3,
            referralEarnings: 142.50
          };
          
          const mockSavingsHistory = [
            { month: '2024-01', savings: 145.20, volume: 1200000 },
            { month: '2024-02', savings: 189.45, volume: 1500000 },
            { month: '2024-03', savings: 234.80, volume: 1800000 },
            { month: '2024-04', savings: 278.90, volume: 2100000 },
            { month: '2024-05', savings: 237.29, volume: 2500000 }
          ];
          
          const mockBrokerStats = [
            { broker: 'Binance', volume: 1500000, savings: 142.50, percentage: 60 },
            { broker: 'Bybit', volume: 750000, savings: 71.25, percentage: 30 },
            { broker: 'OKX', volume: 250000, savings: 23.54, percentage: 10 }
          ];
          
          const mockAchievements = [
            { id: 'first_savings', title: 'Tiết kiệm đầu tiên', description: 'Hoàn thành lần hoàn phí đầu tiên', icon: 'Star', unlocked: true, date: '2024-01-15' },
            { id: 'monthly_100', title: 'Thành viên tháng', description: 'Tiết kiệm hơn $100 trong tháng', icon: 'Award', unlocked: true, date: '2024-02-01' },
            { id: 'referral_1', title: 'Người giới thiệu', description: 'Giới thiệu thành công 1 thành viên', icon: 'Users', unlocked: true, date: '2024-03-10' },
            { id: 'savings_1000', title: 'Nhà tiết kiệm', description: 'Tổng tiết kiệm đạt $1,000', icon: 'Crown', unlocked: true, date: '2024-04-15' },
            { id: 'savings_5000', title: 'Bậc thầy tiết kiệm', description: 'Tổng tiết kiệm đạt $5,000', icon: 'Gem', unlocked: false, progress: 57 },
            { id: 'apex_pro', title: 'ApexPro Member', description: 'Nâng cấp lên ApexPro SaaS', icon: 'Shield', unlocked: false, progress: 80 }
          ];
          
          setUserData(mockUserData);
          setSavingsHistory(mockSavingsHistory);
          setBrokerStats(mockBrokerStats);
          setAchievements(mockAchievements);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Bronze': return 'bg-orange-100 text-orange-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      case 'Platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Bronze': return 'Star';
      case 'Silver': return 'Award';
      case 'Gold': return 'Crown';
      case 'Platinum': return 'Gem';
      default: return 'Shield';
    }
  };

  const renderAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Star': return <Star className="w-5 h-5 text-white" />;
      case 'Award': return <Award className="w-5 h-5 text-white" />;
      case 'Users': return <Users className="w-5 h-5 text-white" />;
      case 'Crown': return <Crown className="w-5 h-5 text-white" />;
      case 'Gem': return <Gem className="w-5 h-5 text-white" />;
      case 'Shield': return <Shield className="w-5 h-5 text-white" />;
      default: return <Star className="w-5 h-5 text-white" />;
    }
  };

  const renderRankIcon = (rank: string) => {
    const iconName = getRankIcon(rank);
    switch (iconName) {
      case 'Star': return <Star className="w-3 h-3 mr-1" />;
      case 'Award': return <Award className="w-3 h-3 mr-1" />;
      case 'Crown': return <Crown className="w-3 h-3 mr-1" />;
      case 'Gem': return <Gem className="w-3 h-3 mr-1" />;
      default: return <Shield className="w-3 h-3 mr-1" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Chào mừng trở lại! Đây là trung tâm kiểm soát ApexRebate của bạn.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Tổng Tiết Kiệm</p>
                  <p className="text-2xl font-bold text-slate-900">${userData.totalSavings.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Tiết Kiệm Tháng Này</p>
                  <p className="text-2xl font-bold text-slate-900">${userData.monthlySavings.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Tổng Khối Lượng</p>
                  <p className="text-2xl font-bold text-slate-900">${(userData.totalVolume / 1000000).toFixed(1)}M</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Hạng Hiện Tại</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getRankColor(userData.rank)}>
                      {renderRankIcon(userData.rank)}
                      {userData.rank}
                    </Badge>
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
            <TabsTrigger value="analytics">Phân Tích</TabsTrigger>
            <TabsTrigger value="referrals">Giới Thiệu</TabsTrigger>
            <TabsTrigger value="achievements">Thành Tựu</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Savings History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Lịch Sử Tiết Kiệm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savingsHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{item.month}</p>
                          <p className="text-sm text-slate-600">${(item.volume / 1000000).toFixed(1)}M volume</p>
                        </div>
                        <p className="font-bold text-green-600">${item.savings.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Broker Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Phân Bổ Theo Sàn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {brokerStats.map((broker, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900">{broker.broker}</span>
                          <span className="text-sm text-slate-600">${broker.savings.toFixed(2)}</span>
                        </div>
                        <Progress value={broker.percentage} className="h-2" />
                        <p className="text-xs text-slate-500">${(broker.volume / 1000000).toFixed(1)}M volume</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rank Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Tiến Trình Hạng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Hạng Hiện Tại: {userData.rank}</p>
                      <p className="text-sm text-slate-600">Thành viên từ {userData.memberSince}</p>
                    </div>
                    <Badge className={getRankColor(userData.rank)}>
                      {renderRankIcon(userData.rank)}
                      {userData.rank}
                    </Badge>
                  </div>
                  <Progress value={userData.nextRankProgress} className="h-3" />
                  <p className="text-sm text-slate-600">{userData.nextRankProgress}% đến hạng tiếp theo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Phân Tích Hiệu Suất</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Tỷ Lệ Hoàn Phí Hiệu Quả</h4>
                      <p className="text-2xl font-bold text-blue-600">4.2%</p>
                      <p className="text-sm text-blue-700">Cao hơn trung bình 0.8%</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Tối Ưu Hóa Chi Phí</h4>
                      <p className="text-2xl font-bold text-green-600">23.5%</p>
                      <p className="text-sm text-green-700">Giảm chi phí ẩn</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dự Báo Tiết Kiệm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Dự Kiếm Tháng Tới</h4>
                      <p className="text-2xl font-bold text-purple-600">${(userData.monthlySavings * 1.1).toFixed(2)}</p>
                      <p className="text-sm text-purple-700">Dựa trên xu hướng hiện tại</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Mục Tiêu Năm</h4>
                      <p className="text-2xl font-bold text-orange-600">${(userData.monthlySavings * 12).toFixed(2)}</p>
                      <p className="text-sm text-orange-700">Cần thêm ${((userData.monthlySavings * 12) - userData.totalSavings).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Thống Kê Giới Thiệu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Tổng Lượt Giới Thiệu</p>
                        <p className="text-sm text-slate-600">Thành viên đã đăng ký</p>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{userData.referrals}</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">Thu Nhập Giới Thiệu</p>
                        <p className="text-sm text-green-600">Tổng cộng</p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">${userData.referralEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Link Giới Thiệu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900 mb-2">Link Cá Nhân</p>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value="https://apexrebate.com?ref=TRADER123" 
                          readOnly 
                          className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded text-sm"
                        />
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Sao Chép
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="font-medium text-purple-900 mb-2">Mã Giới Thiệu</p>
                      <div className="flex items-center gap-2">
                        <span className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded text-sm font-mono">TRADER123</span>
                        <Button size="sm" variant="outline">
                          Sao Chép
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Thành Tựu Đạt Được
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border-2 ${
                        achievement.unlocked 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.unlocked ? 'bg-green-500' : 'bg-slate-300'
                        }`}>
                          {renderAchievementIcon(achievement.icon)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{achievement.title}</h4>
                          <p className="text-sm text-slate-600 mb-2">{achievement.description}</p>
                          {achievement.unlocked ? (
                            <p className="text-xs text-green-600">Đạt được: {achievement.date}</p>
                          ) : (
                            <div className="space-y-1">
                              <Progress value={achievement.progress} className="h-2" />
                              <p className="text-xs text-slate-500">{achievement.progress}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}