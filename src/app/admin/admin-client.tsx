'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';
import AuthGuard from '@/components/auth/auth-guard';
import RoleGuard from '@/components/auth/role-guard';
import Navbar from '@/components/navbar';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  totalPayouts: number;
  totalPayoutAmount: number;
  pendingPayouts: number;
  pendingPayoutAmount: number;
  currentMonthSignups: number;
  currentMonthPayouts: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  tradingVolume?: number;
  preferredBroker?: string;
  referralCode?: string;
  referralCount: number;
  totalSavings: number;
}

interface Payout {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  amount: number;
  currency: string;
  period: string;
  broker: string;
  tradingVolume: number;
  feeRate: number;
  status: string;
  processedAt?: string;
  createdAt: string;
  notes?: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    userRole: 'all',
    userStatus: 'all',
    payoutStatus: 'all',
    search: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Get current locale from router - default to 'vi'
      const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'vi' : 'vi';
      router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/admin`);
    } else if (status === 'authenticated') {
      // Check if user is admin
      if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'CONCIERGE') {
        const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'vi' : 'vi';
        router.push(`/${locale}/dashboard`);
        return;
      }
      fetchAdminData();
    }
  }, [status, router, session]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, payoutsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/payouts')
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const payoutsData = await payoutsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (usersData.success) setUsers(usersData.data);
      if (payoutsData.success) setPayouts(payoutsData.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Không thể tải dữ liệu quản trị');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPayout = async (payoutId: string) => {
    try {
      const response = await fetch(`/api/admin/payouts/${payoutId}/process`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Đã xử lý thanh toán thành công');
        fetchAdminData(); // Refresh data
      } else {
        toast.error(data.error || 'Không thể xử lý thanh toán');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const filteredUsers = users.filter(user => {
    if (filters.userRole !== 'all' && user.role !== filters.userRole) return false;
    if (filters.userStatus === 'verified' && !user.emailVerified) return false;
    if (filters.userStatus === 'unverified' && user.emailVerified) return false;
    if (filters.search && !user.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !user.email.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const filteredPayouts = payouts.filter(payout => {
    if (filters.payoutStatus !== 'all' && payout.status !== filters.payoutStatus) return false;
    return true;
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['ADMIN', 'CONCIERGE']}>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản trị hệ thống</h1>
              <p className="text-slate-600">
                Quản lý người dùng và thanh toán ApexRebate
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={fetchAdminData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="users">Người dùng</TabsTrigger>
              <TabsTrigger value="payouts">Thanh toán</TabsTrigger>
              <TabsTrigger value="settings">Cài đặt</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Tổng người dùng</p>
                          <p className="text-2xl font-bold text-slate-900">
                            {stats.totalUsers}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-green-600">{stats.verifiedUsers} đã xác thực</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Tổng thanh toán</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${stats.totalPayoutAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-sm">
                        <span className="text-slate-600">{stats.totalPayouts} giao dịch</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Đang xử lý</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            ${stats.pendingPayoutAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-sm">
                        <span className="text-slate-600">{stats.pendingPayouts} giao dịch</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">Tháng này</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {stats.currentMonthSignups}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="flex items-center mt-2 text-sm">
                        <span className="text-slate-600">Đăng ký mới</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Quản lý người dùng</CardTitle>
                    <div className="flex space-x-3">
                      <div className="flex space-x-2">
                        <Select value={filters.userRole} onValueChange={(value) => setFilters(prev => ({ ...prev, userRole: value }))}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="CONCIERGE">Concierge</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select value={filters.userStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, userStatus: value }))}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="verified">Đã xác thực</SelectItem>
                            <SelectItem value="unverified">Chưa xác thực</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Tìm kiếm..."
                          value={filters.search}
                          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Người dùng</th>
                          <th className="text-left p-3">Vai trò</th>
                          <th className="text-left p-3">Email</th>
                          <th className="text-left p-3">Sàn</th>
                          <th className="text-left p-3">Tiết kiệm</th>
                          <th className="text-left p-3">Ngày tham gia</th>
                          <th className="text-left p-3">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-slate-50">
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-slate-600">{user.referralCode}</p>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">{user.email}</span>
                                {user.emailVerified ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                                )}
                              </div>
                            </td>
                            <td className="p-3">{user.preferredBroker || '-'}</td>
                            <td className="p-3">${user.totalSavings.toFixed(2)}</td>
                            <td className="p-3">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td className="p-3">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payouts Tab */}
            <TabsContent value="payouts" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Quản lý thanh toán</CardTitle>
                    <Select value={filters.payoutStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, payoutStatus: value }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="PENDING">Đang xử lý</SelectItem>
                        <SelectItem value="PROCESSED">Đã xử lý</SelectItem>
                        <SelectItem value="FAILED">Thất bại</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Người dùng</th>
                          <th className="text-left p-3">Số tiền</th>
                          <th className="text-left p-3">Kỳ</th>
                          <th className="text-left p-3">Sàn</th>
                          <th className="text-left p-3">Trạng thái</th>
                          <th className="text-left p-3">Ngày tạo</th>
                          <th className="text-left p-3">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayouts.map((payout) => (
                          <tr key={payout.id} className="border-b hover:bg-slate-50">
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{payout.user.name}</p>
                                <p className="text-sm text-slate-600">{payout.user.email}</p>
                              </div>
                            </td>
                            <td className="p-3 font-semibold">${payout.amount.toFixed(2)}</td>
                            <td className="p-3">{payout.period}</td>
                            <td className="p-3">{payout.broker}</td>
                            <td className="p-3">
                              <Badge 
                                variant={
                                  payout.status === 'PROCESSED' ? 'default' :
                                  payout.status === 'PENDING' ? 'secondary' : 'destructive'
                                }
                              >
                                {payout.status === 'PROCESSED' ? 'Đã xử lý' :
                                 payout.status === 'PENDING' ? 'Đang xử lý' : 'Thất bại'}
                              </Badge>
                            </td>
                            <td className="p-3">{new Date(payout.createdAt).toLocaleDateString('vi-VN')}</td>
                            <td className="p-3">
                              {payout.status === 'PENDING' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleProcessPayout(payout.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Xử lý
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt hệ thống</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">Cài đặt hệ thống đang được phát triển</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      </RoleGuard>
    </AuthGuard>
  );
}