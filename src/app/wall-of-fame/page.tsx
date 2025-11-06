'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Users, Crown, Medal, Star, Shield, Target } from 'lucide-react';

interface WallOfFameUser {
  id: string;
  anonymousName: string;
  totalSavings: number;
  broker: string;
  memberSince: string;
  monthlyVolume: number;
  tradesCount: number;
  rank: number;
  previousRank?: number;
  avatar?: string;
  achievements: string[];
  joinDate: string;
  lastActive: string;
}

interface StatsOverview {
  totalUsers: number;
  totalSavings: number;
  averageSavings: number;
  topSaver: { name: string; amount: number };
  newUsersThisMonth: number;
  totalTrades: number;
}

export default function WallOfFamePage() {
  const [users, setUsers] = useState<WallOfFameUser[]>([]);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallOfFame = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/wall-of-fame');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data);
          setStats(data.stats);
        } else {
          // Fallback to mock data
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Failed to fetch wall of fame:', err);
        setError('Không thể tải dữ liệu. Đang hiển thị dữ liệu mẫu.');
        
        // Fallback to mock data
        const mockUsers: WallOfFameUser[] = [
          {
            id: '1',
            anonymousName: 'Trader Alpha',
            totalSavings: 2847,
            broker: 'Binance',
            memberSince: '2024-01-15',
            monthlyVolume: 2500000,
            tradesCount: 1250,
            rank: 1,
            previousRank: 2,
            achievements: ['Early Adopter', 'Top Saver', 'Consistent Trader'],
            joinDate: '2024-01-15',
            lastActive: '2024-10-07'
          },
          {
            id: '2',
            anonymousName: 'Trader Beta',
            totalSavings: 1923,
            broker: 'Bybit',
            memberSince: '2024-01-20',
            monthlyVolume: 1800000,
            tradesCount: 890,
            rank: 2,
            previousRank: 3,
            achievements: ['Referral Master', 'Volume King'],
            joinDate: '2024-01-20',
            lastActive: '2024-10-06'
          },
          {
            id: '3',
            anonymousName: 'Trader Gamma',
            totalSavings: 1567,
            broker: 'OKX',
            memberSince: '2024-02-01',
            monthlyVolume: 1500000,
            tradesCount: 750,
            rank: 3,
            previousRank: 1,
            achievements: ['Quick Starter', 'Multi-Broker'],
            joinDate: '2024-02-01',
            lastActive: '2024-10-07'
          },
          {
            id: '4',
            anonymousName: 'Trader Delta',
            totalSavings: 1234,
            broker: 'Binance',
            memberSince: '2024-02-10',
            monthlyVolume: 1200000,
            tradesCount: 600,
            rank: 4,
            previousRank: 5,
            achievements: ['Steady Performer'],
            joinDate: '2024-02-10',
            lastActive: '2024-10-05'
          },
          {
            id: '5',
            anonymousName: 'Trader Epsilon',
            totalSavings: 987,
            broker: 'Bybit',
            memberSince: '2024-02-15',
            monthlyVolume: 900000,
            tradesCount: 450,
            rank: 5,
            previousRank: 6,
            achievements: ['Rising Star'],
            joinDate: '2024-02-15',
            lastActive: '2024-10-07'
          },
          {
            id: '6',
            anonymousName: 'Trader Zeta',
            totalSavings: 856,
            broker: 'OKX',
            memberSince: '2024-03-01',
            monthlyVolume: 800000,
            tradesCount: 400,
            rank: 6,
            previousRank: 4,
            achievements: ['Newcomer'],
            joinDate: '2024-03-01',
            lastActive: '2024-10-06'
          }
        ];

        const mockStats: StatsOverview = {
          totalUsers: 156,
          totalSavings: mockUsers.reduce((sum, user) => sum + user.totalSavings, 0),
          averageSavings: 1245,
          topSaver: { name: 'Trader Alpha', amount: 2847 },
          newUsersThisMonth: 23,
          totalTrades: mockUsers.reduce((sum, user) => sum + user.tradesCount, 0)
        };

        setUsers(mockUsers);
        setStats(mockStats);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallOfFame();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-blue-500" />;
    }
  };

  const getRankChange = (current: number, previous?: number) => {
    if (!previous) return null;
    if (current < previous) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    }
    return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
  };

  const getBrokerColor = (broker: string) => {
    switch (broker.toLowerCase()) {
      case 'binance':
        return 'bg-yellow-100 text-yellow-800';
      case 'bybit':
        return 'bg-orange-100 text-orange-800';
      case 'okx':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.broker.toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
            <h1 className="text-3xl font-bold text-slate-900">Bức Tường Danh Vọng</h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Vinh danh những trader ưu tú đã tối ưu hóa lợi nhuận với ApexRebate
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-600">Thành viên</p>
                <p className="text-xl font-bold text-blue-900">{stats.totalUsers}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-600">Tổng tiết kiệm</p>
                <p className="text-xl font-bold text-green-900">${stats.totalSavings.toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4 text-center">
                <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-purple-600">Tiết kiệm TB</p>
                <p className="text-xl font-bold text-purple-900">${stats.averageSavings}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-4 text-center">
                <Crown className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-yellow-600">Top Saver</p>
                <p className="text-lg font-bold text-yellow-900">{stats.topSaver.name}</p>
                <p className="text-sm text-yellow-700">${stats.topSaver.amount}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-sm text-indigo-600">Thành viên mới</p>
                <p className="text-xl font-bold text-indigo-900">+{stats.newUsersThisMonth}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-pink-50 to-pink-100">
              <CardContent className="p-4 text-center">
                <Shield className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                <p className="text-sm text-pink-600">Tổng giao dịch</p>
                <p className="text-xl font-bold text-pink-900">{stats.totalTrades.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Lọc theo sàn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả sàn</SelectItem>
              <SelectItem value="binance">Binance</SelectItem>
              <SelectItem value="bybit">Bybit</SelectItem>
              <SelectItem value="okx">OKX</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Khoảng thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thời gian</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Leaderboard */}
        <Tabs defaultValue="top" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="top">Top Trader</TabsTrigger>
            <TabsTrigger value="rising">Rising Star</TabsTrigger>
            <TabsTrigger value="achievements">Thành tựu</TabsTrigger>
          </TabsList>

          <TabsContent value="top" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-slate-600 mt-4">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className={`hover:shadow-lg transition-shadow ${user.rank <= 3 ? 'border-2 border-yellow-200' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-slate-700">#{user.rank}</span>
                            {getRankIcon(user.rank)}
                            {getRankChange(user.rank, user.previousRank)}
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{user.anonymousName}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getBrokerColor(user.broker)}>
                                {user.broker}
                              </Badge>
                              <span className="text-sm text-slate-500">
                                Thành viên từ {new Date(user.memberSince).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            ${user.totalSavings.toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-500">
                            {user.monthlyVolume.toLocaleString()} USD/tháng
                          </p>
                          <p className="text-xs text-slate-400">
                            {user.tradesCount} giao dịch
                          </p>
                        </div>
                      </div>

                      {user.achievements.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex flex-wrap gap-2">
                            {user.achievements.map((achievement, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {achievement}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rising" className="space-y-4">
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Rising Stars</h3>
                <p className="text-slate-600 mb-4">
                  Những trader mới nổi có tốc độ tăng trưởng ấn tượng
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  {filteredUsers
                    .filter(user => user.achievements.includes('Rising Star') || user.achievements.includes('Newcomer'))
                    .slice(0, 4)
                    .map((user) => (
                      <div key={user.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{user.anonymousName}</p>
                            <p className="text-sm text-slate-500">{user.broker}</p>
                          </div>
                          <p className="font-bold text-green-600">${user.totalSavings}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-6">Hệ thống Thành tựu</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                    <Trophy className="w-8 h-8 text-yellow-600 mb-2" />
                    <h4 className="font-semibold text-yellow-900">Top Saver</h4>
                    <p className="text-sm text-yellow-700">Tiết kiệm trên $2000</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <Users className="w-8 h-8 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-blue-900">Early Adopter</h4>
                    <p className="text-sm text-blue-700">Thành viên đầu tiên</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                    <h4 className="font-semibold text-green-900">Volume King</h4>
                    <p className="text-sm text-green-700">Khối lượng &gt; $2M/tháng</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <Star className="w-8 h-8 text-purple-600 mb-2" />
                    <h4 className="font-semibold text-purple-900">Rising Star</h4>
                    <p className="text-sm text-purple-700">Tăng trưởng nhanh</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                    <Shield className="w-8 h-8 text-indigo-600 mb-2" />
                    <h4 className="font-semibold text-indigo-900">Consistent Trader</h4>
                    <p className="text-sm text-indigo-700">Giao dịch đều đặn</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
                    <Target className="w-8 h-8 text-pink-600 mb-2" />
                    <h4 className="font-semibold text-pink-900">Multi-Broker</h4>
                    <p className="text-sm text-pink-700">Sử dụng nhiều sàn</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}