'use client';

import { useState, useEffect } from 'react';
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
  Star,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading, Subheading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import { Fieldset, Legend, Label, Description } from '@/components/catalyst/fieldset';
import { Input } from '@/components/catalyst/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/catalyst/tabs';
import { Strong } from '@/components/catalyst/text';
import { Badge } from '@/components/catalyst/badge';

export default function Dashboard() {
  const [userData, setUserData] = useState({
    totalSavings: 0,
    monthlySavings: 0,
    totalVolume: 0,
    memberSince: '',
    rank: 'Bronze',
    nextRankProgress: 0,
    referrals: 0,
    referralEarnings: 0,
  });

  const [savingsHistory, setSavingsHistory] = useState<any[]>([]);
  const [brokerStats, setBrokerStats] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/dashboard');
        const result = await response.json();

        if (result.success && result.data) {
          setUserData(result.data.userData);
          setSavingsHistory(result.data.savingsHistory);
          setBrokerStats(result.data.brokerStats);
          setAchievements(result.data.achievements);
        } else {
          const mockUserData = {
            totalSavings: 2847.5,
            monthlySavings: 237.29,
            totalVolume: 2500000,
            memberSince: '2024-01-15',
            rank: 'Silver',
            nextRankProgress: 65,
            referrals: 3,
            referralEarnings: 142.5,
          };

          const mockSavingsHistory = [
            { month: '2024-01', savings: 145.2, volume: 1200000 },
            { month: '2024-02', savings: 189.45, volume: 1500000 },
            { month: '2024-03', savings: 234.8, volume: 1800000 },
            { month: '2024-04', savings: 278.9, volume: 2100000 },
            { month: '2024-05', savings: 237.29, volume: 2500000 },
          ];

          const mockBrokerStats = [
            { broker: 'Binance', volume: 1500000, savings: 142.5, percentage: 60 },
            { broker: 'Bybit', volume: 750000, savings: 71.25, percentage: 30 },
            { broker: 'OKX', volume: 250000, savings: 23.54, percentage: 10 },
          ];

          const mockAchievements = [
            {
              id: 'first_savings',
              title: 'Tiết kiệm đầu tiên',
              description: 'Hoàn thành lần hoàn phí đầu tiên',
              icon: 'Star',
              unlocked: true,
              date: '2024-01-15',
            },
            {
              id: 'monthly_100',
              title: 'Thành viên tháng',
              description: 'Tiết kiệm hơn $100 trong tháng',
              icon: 'Award',
              unlocked: true,
              date: '2024-02-01',
            },
            {
              id: 'referral_1',
              title: 'Người giới thiệu',
              description: 'Giới thiệu thành công 1 thành viên',
              icon: 'Users',
              unlocked: true,
              date: '2024-03-10',
            },
            {
              id: 'savings_1000',
              title: 'Nhà tiết kiệm',
              description: 'Tổng tiết kiệm đạt $1,000',
              icon: 'Crown',
              unlocked: true,
              date: '2024-04-15',
            },
            {
              id: 'savings_5000',
              title: 'Bậc thầy tiết kiệm',
              description: 'Tổng tiết kiệm đạt $5,000',
              icon: 'Gem',
              unlocked: false,
              progress: 57,
            },
            {
              id: 'apex_pro',
              title: 'ApexPro Member',
              description: 'Nâng cấp lên ApexPro SaaS',
              icon: 'Shield',
              unlocked: false,
              progress: 80,
            },
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
      case 'Bronze':
        return 'bg-orange-100 text-orange-900';
      case 'Silver':
        return 'bg-gray-100 text-gray-900';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-900';
      case 'Platinum':
        return 'bg-purple-100 text-purple-900';
      case 'Diamond':
        return 'bg-blue-100 text-blue-900';
      default:
        return 'bg-slate-100 text-slate-900';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Bronze':
        return Star;
      case 'Silver':
        return Award;
      case 'Gold':
        return Crown;
      case 'Platinum':
        return Gem;
      case 'Diamond':
        return Shield;
      default:
        return Star;
    }
  };

  const renderAchievementIcon = (iconName: string) => {
    const iconProps = 'w-6 h-6 text-white';
    switch (iconName) {
      case 'Star':
        return <Star className={iconProps} />;
      case 'Award':
        return <Award className={iconProps} />;
      case 'Users':
        return <Users className={iconProps} />;
      case 'Crown':
        return <Crown className={iconProps} />;
      case 'Gem':
        return <Gem className={iconProps} />;
      case 'Shield':
        return <Shield className={iconProps} />;
      default:
        return <Star className={iconProps} />;
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Text className="text-slate-600">Đang tải dữ liệu...</Text>
        </div>
      </div>
    );
  }

  const RankIcon = getRankIcon(userData.rank);

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Heading>Dashboard</Heading>
          <Subheading>
            Chào mừng trở lại! Đây là trung tâm kiểm soát ApexRebate của bạn.
          </Subheading>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Savings */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-sm font-medium text-slate-600 mb-2">
                  Tổng Tiết Kiệm
                </Text>
                <div className="text-2xl font-bold text-slate-900">
                  ${userData.totalSavings.toLocaleString()}
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Monthly Savings */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-sm font-medium text-slate-600 mb-2">
                  Tiết Kiệm Tháng Này
                </Text>
                <div className="text-2xl font-bold text-slate-900">
                  ${userData.monthlySavings.toLocaleString()}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Trading Volume */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-sm font-medium text-slate-600 mb-2">
                  Tổng Khối Lượng
                </Text>
                <div className="text-2xl font-bold text-slate-900">
                  ${(userData.totalVolume / 1000000).toFixed(1)}M
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Current Rank */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-sm font-medium text-slate-600 mb-2">
                  Hạng Hiện Tại
                </Text>
                <Badge className={getRankColor(userData.rank)}>
                  <RankIcon className="w-3 h-3 mr-1 inline" />
                  {userData.rank}
                </Badge>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
            <TabsTrigger value="analytics">Phân Tích</TabsTrigger>
            <TabsTrigger value="referrals">Giới Thiệu</TabsTrigger>
            <TabsTrigger value="achievements">Thành Tựu</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Savings History */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <Heading level={3}>Lịch Sử Tiết Kiệm</Heading>
                </div>
                <div className="space-y-4">
                  {savingsHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                    >
                      <div>
                        <Text className="font-medium text-slate-900">
                          {item.month}
                        </Text>
                        <Text className="text-sm text-slate-600">
                          ${(item.volume / 1000000).toFixed(1)}M volume
                        </Text>
                      </div>
                      <Text className="font-bold text-green-600">
                        ${item.savings.toFixed(2)}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>

              {/* Broker Distribution */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <PieChart className="w-5 h-5 text-slate-600" />
                  <Heading level={3}>Phân Bổ Theo Sàn</Heading>
                </div>
                <div className="space-y-4">
                  {brokerStats.map((broker, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Text className="font-medium text-slate-900">
                          {broker.broker}
                        </Text>
                        <Text className="text-sm text-slate-600">
                          ${broker.savings.toFixed(2)}
                        </Text>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${broker.percentage}%` }}
                        />
                      </div>
                      <Text className="text-xs text-slate-500">
                        ${(broker.volume / 1000000).toFixed(1)}M volume
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rank Progress */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-slate-600" />
                <Heading level={3}>Tiến Trình Hạng</Heading>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="font-medium text-slate-900 mb-1">
                      Hạng Hiện Tại: <Strong>{userData.rank}</Strong>
                    </Text>
                    <Text className="text-sm text-slate-600">
                      Thành viên từ {userData.memberSince}
                    </Text>
                  </div>
                  <Badge className={getRankColor(userData.rank)}>
                    <RankIcon className="w-3 h-3 mr-1 inline" />
                    {userData.rank}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${userData.nextRankProgress}%` }}
                    />
                  </div>
                  <Text className="text-sm text-slate-600">
                    {userData.nextRankProgress}% đến hạng tiếp theo
                  </Text>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <Heading level={3} className="mb-6">
                  Phân Tích Hiệu Suất
                </Heading>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Text className="font-medium text-blue-900 mb-2">
                      Tỷ Lệ Hoàn Phí Hiệu Quả
                    </Text>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      4.2%
                    </div>
                    <Text className="text-sm text-blue-700">
                      Cao hơn trung bình 0.8%
                    </Text>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <Text className="font-medium text-green-900 mb-2">
                      Tối Ưu Hóa Chi Phí
                    </Text>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      23.5%
                    </div>
                    <Text className="text-sm text-green-700">
                      Giảm chi phí ẩn
                    </Text>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <Heading level={3} className="mb-6">
                  Dự Báo Tiết Kiệm
                </Heading>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Text className="font-medium text-purple-900 mb-2">
                      Dự Kiếm Tháng Tới
                    </Text>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      ${(userData.monthlySavings * 1.1).toFixed(2)}
                    </div>
                    <Text className="text-sm text-purple-700">
                      Dựa trên xu hướng hiện tại
                    </Text>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <Text className="font-medium text-orange-900 mb-2">
                      Mục Tiêu Năm
                    </Text>
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      ${(userData.monthlySavings * 12).toFixed(2)}
                    </div>
                    <Text className="text-sm text-orange-700">
                      Cần thêm $
                      {(
                        userData.monthlySavings * 12 -
                        userData.totalSavings
                      ).toFixed(2)}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-slate-600" />
                  <Heading level={3}>Thống Kê Giới Thiệu</Heading>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <Text className="font-medium text-slate-900">
                        Tổng Lượt Giới Thiệu
                      </Text>
                      <Text className="text-sm text-slate-600">
                        Thành viên đã đăng ký
                      </Text>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {userData.referrals}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <Text className="font-medium text-green-900">
                        Thu Nhập Giới Thiệu
                      </Text>
                      <Text className="text-sm text-green-600">Tổng cộng</Text>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      ${userData.referralEarnings.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <Heading level={3} className="mb-6">
                  Link Giới Thiệu
                </Heading>
                <Fieldset className="space-y-6">
                  <div className="space-y-3">
                    <Legend>Link Cá Nhân</Legend>
                    <Description>Chia sẻ link này với bạn bè</Description>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value="https://apexrebate.com?ref=TRADER123"
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            'https://apexrebate.com?ref=TRADER123',
                            'link'
                          )
                        }
                        className="gap-2"
                      >
                        {copiedField === 'link' ? (
                          <>
                            <Check className="w-4 h-4" />
                            Đã sao chép
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Sao Chép
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Legend>Mã Giới Thiệu</Legend>
                    <Description>Mã duy nhất của bạn</Description>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value="TRADER123"
                        readOnly
                        className="flex-1 font-mono"
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          copyToClipboard('TRADER123', 'code')
                        }
                        className="gap-2"
                      >
                        {copiedField === 'code' ? (
                          <>
                            <Check className="w-4 h-4" />
                            Đã sao chép
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Sao Chép
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Fieldset>
              </div>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-8">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-slate-600" />
                <Heading level={3}>Thành Tựu Đạt Được</Heading>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition ${
                      achievement.unlocked
                        ? 'border-green-200 bg-green-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          achievement.unlocked
                            ? 'bg-green-500'
                            : 'bg-slate-300'
                        }`}
                      >
                        {renderAchievementIcon(achievement.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text className="font-medium text-slate-900">
                          {achievement.title}
                        </Text>
                        <Text className="text-sm text-slate-600 mb-2">
                          {achievement.description}
                        </Text>
                        {achievement.unlocked ? (
                          <Text className="text-xs text-green-600">
                            Đạt được: {achievement.date}
                          </Text>
                        ) : (
                          <div className="space-y-1">
                            <div className="w-full bg-slate-300 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${achievement.progress}%`,
                                }}
                              />
                            </div>
                            <Text className="text-xs text-slate-500">
                              {achievement.progress}%
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
