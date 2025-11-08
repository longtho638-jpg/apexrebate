import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Medal, Star } from 'lucide-react';

const wallOfFameUsers = [
  {
    id: '1',
    anonymousName: 'Trader Alpha',
    totalSavings: 2847,
    broker: 'Binance',
    memberSince: '2024-01-15',
    monthlyVolume: 2500000,
    tradesCount: 1250,
    rank: 1,
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
    achievements: ['Rising Star'],
    joinDate: '2024-02-15',
    lastActive: '2024-10-07'
  }
];

const stats = {
  totalUsers: 156,
  totalSavings: wallOfFameUsers.reduce((sum, user) => sum + user.totalSavings, 0),
  averageSavings: 1245,
  topSaver: { name: 'Trader Alpha', amount: 2847 },
  newUsersThisMonth: 23,
  totalTrades: wallOfFameUsers.reduce((sum, user) => sum + user.tradesCount, 0)
};

function getRankIcon(rank: number) {
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
}

function getBrokerColor(broker: string) {
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
}

export default function WallOfFamePage() {
  return (
    <>
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-white flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-7xl flex-1">
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4 text-center">
              <div className="w-6 h-6 bg-blue-600 rounded mx-auto mb-2"></div>
              <p className="text-sm text-blue-600">Thành viên</p>
              <p className="text-xl font-bold text-blue-900">{stats.totalUsers}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4 text-center">
              <div className="w-6 h-6 bg-green-600 rounded mx-auto mb-2"></div>
              <p className="text-sm text-green-600">Tổng tiết kiệm</p>
              <p className="text-xl font-bold text-green-900">${stats.totalSavings.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4 text-center">
              <div className="w-6 h-6 bg-purple-600 rounded mx-auto mb-2"></div>
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
              <div className="w-6 h-6 bg-pink-600 rounded mx-auto mb-2"></div>
              <p className="text-sm text-pink-600">Tổng giao dịch</p>
              <p className="text-xl font-bold text-pink-900">{stats.totalTrades.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {wallOfFameUsers.map((user) => (
            <Card key={user.id} className={`hover:shadow-lg transition-shadow ${user.rank <= 3 ? 'border-2 border-yellow-200' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-slate-700">#{user.rank}</span>
                      {getRankIcon(user.rank)}
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
        </div>
      </div>
    </>
  );
}
