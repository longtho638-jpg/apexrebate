'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Download,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import AuthGuard from '@/components/auth/auth-guard';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { toast } from 'sonner';

interface PayoutData {
  payouts: Array<{
    id: string;
    amount: number;
    currency: string;
    period: string;
    broker: string;
    tradingVolume: number;
    feeRate: number;
    status: 'PENDING' | 'PROCESSED' | 'FAILED';
    processedAt?: string;
    createdAt: string;
    notes?: string;
  }>;
  summary: {
    totalPayouts: number;
    totalAmount: number;
    pendingAmount: number;
    processedAmount: number;
    averagePayout: number;
    currentMonthPayouts: number;
    currentMonthAmount: number;
  };
  filters: {
    brokers: string[];
    statuses: string[];
    periods: string[];
  };
}

export default function PayoutsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    broker: 'all',
    status: 'all',
    period: 'all'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchPayoutData();
    }
  }, [status, router]);

  const fetchPayoutData = async () => {
    try {
      const response = await fetch('/api/user/payouts');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPayoutData(data.data);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to fetch payout data:', error);
      toast.error('Không thể tải dữ liệu thanh toán. Vui lòng đăng nhập lại.');
      
      // Set mock/empty data to prevent white screen
      setPayoutData({
        payouts: [],
        summary: {
          totalPayouts: 0,
          totalAmount: 0,
          pendingAmount: 0,
          processedAmount: 0,
          averagePayout: 0,
          currentMonthPayouts: 0,
          currentMonthAmount: 0,
        },
        filters: {
          brokers: [],
          statuses: [],
          periods: [],
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPayoutData();
    setIsRefreshing(false);
    toast.success('Dữ liệu đã được cập nhật');
  };

  const handleExport = () => {
    if (!payoutData) return;
    
    const csvContent = [
      ['Ngày', 'Kỳ', 'Sàn', 'Số tiền', 'Trạng thái', 'Khối lượng', 'Tỷ lệ phí'].join(','),
      ...payoutData.payouts.map(payout => [
        new Date(payout.createdAt).toLocaleDateString('vi-VN'),
        payout.period,
        payout.broker,
        payout.amount.toFixed(2),
        payout.status,
        payout.tradingVolume.toLocaleString(),
        (payout.feeRate * 100).toFixed(3) + '%'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payouts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Đã xuất file CSV');
  };

  const filteredPayouts = payoutData?.payouts.filter(payout => {
    if (filter.broker !== 'all' && payout.broker !== filter.broker) return false;
    if (filter.status !== 'all' && payout.status !== filter.status) return false;
    if (filter.period !== 'all' && !payout.period.includes(filter.period)) return false;
    return true;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROCESSED': return 'bg-green-900/20 text-green-400 border-green-700/50';
      case 'PENDING': return 'bg-amber-900/20 text-amber-400 border-amber-700/50';
      case 'FAILED': return 'bg-red-900/20 text-red-400 border-red-700/50';
      default: return 'bg-zinc-900/20 text-zinc-400 border-zinc-700/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PROCESSED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'FAILED': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PROCESSED': return 'Đã xử lý';
      case 'PENDING': return 'Đang xử lý';
      case 'FAILED': return 'Thất bại';
      default: return status;
    }
  };

  if (status === 'loading' || isLoading) {
  return (
  <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
  <div className="text-center">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wolf-600 mx-auto mb-4"></div>
  <p className="text-zinc-400">Loading...</p>
  </div>
  <Footer />
    </div>
  );
}

  if (!payoutData) {
  return (
  <AuthGuard>
  <div className="min-h-screen bg-zinc-950">
  <Navbar />
  <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
  <Card className="max-w-md w-full mx-4 bg-zinc-900/50 border-zinc-800">
  <CardContent className="p-8 text-center">
  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
  <h3 className="text-xl font-semibold text-zinc-100 mb-2">
  Không thể tải dữ liệu
  </h3>
  <p className="text-zinc-400 mb-6">
  Vui lòng kiểm tra kết nối hoặc đăng nhập lại
  </p>
  <div className="flex gap-3 justify-center">
  <Button onClick={fetchPayoutData} variant="outline" className="border-zinc-700 text-zinc-200 hover:bg-zinc-800">
  <RefreshCw className="w-4 h-4 mr-2" />
  Thử lại
  </Button>
  <Button onClick={() => router.push('/auth/signin')} className="bg-wolf-600 hover:bg-wolf-700 text-white">
  Đăng nhập
  </Button>
  </div>
  </CardContent>
  </Card>
  </div>
  </div>
    <Footer />
    </AuthGuard>
    );
  }

  return (
  <AuthGuard>
  <div className="min-h-screen bg-zinc-950">
  <Navbar />

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Header */}
  <div className="flex justify-between items-center mb-8">
  <div>
  <h1 className="text-3xl font-bold text-zinc-100 mb-2">Lịch sử Thanh toán</h1>
  <p className="text-zinc-400">
  Theo dõi tất cả các khoản thanh toán hoàn phí của bạn
  </p>
  </div>
  <div className="flex space-x-3">
  <Button
  variant="outline"
  onClick={handleRefresh}
  disabled={isRefreshing}
    className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
  >
  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
    Làm mới
  </Button>
  <Button variant="outline" onClick={handleExport} className="border-zinc-700 text-zinc-200 hover:bg-zinc-800">
  <Download className="w-4 h-4 mr-2" />
    Xuất CSV
    </Button>
    </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
          <div className="flex items-center justify-between">
          <div>
          <p className="text-sm font-medium text-zinc-400">Tổng đã nhận</p>
          <p className="text-2xl font-bold text-green-400">
          ${payoutData.summary.processedAmount.toFixed(2)}
          </p>
          </div>
          <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
          {payoutData.summary.totalPayouts} giao dịch
          </p>
          </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
          <div className="flex items-center justify-between">
          <div>
          <p className="text-sm font-medium text-zinc-400">Đang xử lý</p>
          <p className="text-2xl font-bold text-amber-400">
          ${payoutData.summary.pendingAmount.toFixed(2)}
          </p>
          </div>
          <div className="w-12 h-12 bg-amber-900/20 rounded-full flex items-center justify-center">
          <Clock className="w-6 h-6 text-amber-400" />
          </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
          Chờ xác nhận
          </p>
          </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
          <div className="flex items-center justify-between">
          <div>
          <p className="text-sm font-medium text-zinc-400">Trung bình</p>
          <p className="text-2xl font-bold text-wolf-400">
          ${payoutData.summary.averagePayout.toFixed(2)}
          </p>
          </div>
          <div className="w-12 h-12 bg-wolf-900/20 rounded-full flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-wolf-400" />
          </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
          Mỗi lần thanh toán
          </p>
          </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
          <div className="flex items-center justify-between">
          <div>
          <p className="text-sm font-medium text-zinc-400">Tháng này</p>
          <p className="text-2xl font-bold text-purple-400">
          ${payoutData.summary.currentMonthAmount.toFixed(2)}
          </p>
          </div>
          <div className="w-12 h-12 bg-purple-900/20 rounded-full flex items-center justify-center">
          <Calendar className="w-6 h-6 text-purple-400" />
          </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
          {payoutData.summary.currentMonthPayouts} lần
          </p>
          </CardContent>
          </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6 bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-6">
          <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-zinc-400" />
          <h3 className="font-semibold text-zinc-100">Bộ lọc</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
          <label className="text-sm font-medium text-zinc-300 mb-2 block">Sàn giao dịch</label>
          <Select value={filter.broker} onValueChange={(value) => setFilter(prev => ({ ...prev, broker: value }))}>
          <SelectTrigger className="border-zinc-700 bg-zinc-800 text-zinc-200">
          <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-zinc-700 bg-zinc-800">
          <SelectItem value="all" className="text-zinc-200">Tất cả</SelectItem>
          {payoutData.filters.brokers.map(broker => (
          <SelectItem key={broker} value={broker} className="text-zinc-200">{broker}</SelectItem>
          ))}
          </SelectContent>
          </Select>
          </div>

          <div>
          <label className="text-sm font-medium text-zinc-300 mb-2 block">Trạng thái</label>
          <Select value={filter.status} onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}>
          <SelectTrigger className="border-zinc-700 bg-zinc-800 text-zinc-200">
          <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-zinc-700 bg-zinc-800">
          <SelectItem value="all" className="text-zinc-200">Tất cả</SelectItem>
          {payoutData.filters.statuses.map(status => (
          <SelectItem key={status} value={status} className="text-zinc-200">{getStatusText(status)}</SelectItem>
          ))}
          </SelectContent>
          </Select>
          </div>

          <div>
          <label className="text-sm font-medium text-zinc-300 mb-2 block">Kỳ</label>
          <Select value={filter.period} onValueChange={(value) => setFilter(prev => ({ ...prev, period: value }))}>
          <SelectTrigger className="border-zinc-700 bg-zinc-800 text-zinc-200">
          <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-zinc-700 bg-zinc-800">
          <SelectItem value="all" className="text-zinc-200">Tất cả</SelectItem>
          {payoutData.filters.periods.map(period => (
          <SelectItem key={period} value={period} className="text-zinc-200">{period}</SelectItem>
          ))}
          </SelectContent>
          </Select>
          </div>
          </div>
          </CardContent>
          </Card>

          {/* Payouts List */}
          <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
          <CardTitle className="flex justify-between items-center text-zinc-100">
          <span>Lịch sử thanh toán ({filteredPayouts.length})</span>
          {filteredPayouts.length !== payoutData.payouts.length && (
          <Badge variant="outline" className="border-zinc-700 text-zinc-300">
          Đã lọc: {filteredPayouts.length}/{payoutData.payouts.length}
          </Badge>
          )}
          </CardTitle>
          </CardHeader>
          <CardContent>
          {filteredPayouts.length === 0 ? (
          <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
          <p className="text-zinc-400 mb-2">Không có giao dịch nào</p>
          <p className="text-sm text-zinc-500">
          {filter.broker !== 'all' || filter.status !== 'all' || filter.period !== 'all'
          ? 'Thử thay đổi bộ lọc'
          : 'Bắt đầu giao dịch để nhận hoàn phí'
          }
          </p>
          </div>
          ) : (
                <div className="space-y-4">
                {filteredPayouts.map((payout) => (
                <div key={payout.id} className="border border-zinc-700 rounded-lg p-6 hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                payout.status === 'PROCESSED' ? 'bg-green-900/20' :
                payout.status === 'PENDING' ? 'bg-amber-900/20' : 'bg-red-900/20'
                }`}>
                {getStatusIcon(payout.status)}
                </div>
                <div>
                <div className="flex items-center space-x-3 mb-1">
                <h4 className="font-semibold text-zinc-100">
                ${payout.amount.toFixed(2)}
                </h4>
                <Badge className={getStatusColor(payout.status)}>
                {getStatusText(payout.status)}
                </Badge>
                <Badge variant="outline" className="border-zinc-600 text-zinc-300">{payout.broker}</Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-zinc-400">
                <span>Kỳ: {payout.period}</span>
                <span>•</span>
                <span>Khối lượng: ${payout.tradingVolume.toLocaleString()}</span>
                <span>•</span>
                <span>Tỷ lệ: {(payout.feeRate * 100).toFixed(3)}%</span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                Ngày tạo: {new Date(payout.createdAt).toLocaleString('vi-VN')}
                {payout.processedAt && (
                <span> • Đã xử lý: {new Date(payout.processedAt).toLocaleString('vi-VN')}</span>
                )}
                </div>
                </div>
                </div>
                <div className="text-right">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:bg-zinc-700">
                <Eye className="w-4 h-4" />
                </Button>
                </div>
                </div>
                {payout.notes && (
                <div className="mt-3 p-3 bg-blue-900/20 rounded text-sm text-blue-300 border border-blue-700/50">
                <strong>Ghi chú:</strong> {payout.notes}
                </div>
                )}
                </div>
                ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </AuthGuard>
  );
}