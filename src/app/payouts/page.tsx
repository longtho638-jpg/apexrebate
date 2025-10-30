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
      const data = await response.json();
      
      if (data.success) {
        setPayoutData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch payout data:', error);
      toast.error('Không thể tải dữ liệu thanh toán');
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
      case 'PROCESSED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!payoutData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Không thể tải dữ liệu thanh toán</p>
            <Button onClick={fetchPayoutData}>Thử lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Lịch sử Thanh toán</h1>
              <p className="text-slate-600">
                Theo dõi tất cả các khoản thanh toán hoàn phí của bạn
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Xuất CSV
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Tổng đã nhận</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${payoutData.summary.processedAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {payoutData.summary.totalPayouts} giao dịch
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Đang xử lý</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      ${payoutData.summary.pendingAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Chờ xác nhận
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Trung bình</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${payoutData.summary.averagePayout.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Mỗi lần thanh toán
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Tháng này</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${payoutData.summary.currentMonthAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {payoutData.summary.currentMonthPayouts} lần
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Filter className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Bộ lọc</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Sàn giao dịch</label>
                  <Select value={filter.broker} onValueChange={(value) => setFilter(prev => ({ ...prev, broker: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {payoutData.filters.brokers.map(broker => (
                        <SelectItem key={broker} value={broker}>{broker}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Trạng thái</label>
                  <Select value={filter.status} onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {payoutData.filters.statuses.map(status => (
                        <SelectItem key={status} value={status}>{getStatusText(status)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Kỳ</label>
                  <Select value={filter.period} onValueChange={(value) => setFilter(prev => ({ ...prev, period: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {payoutData.filters.periods.map(period => (
                        <SelectItem key={period} value={period}>{period}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payouts List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Lịch sử thanh toán ({filteredPayouts.length})</span>
                {filteredPayouts.length !== payoutData.payouts.length && (
                  <Badge variant="outline">
                    Đã lọc: {filteredPayouts.length}/{payoutData.payouts.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPayouts.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Không có giao dịch nào</p>
                  <p className="text-sm text-slate-500">
                    {filter.broker !== 'all' || filter.status !== 'all' || filter.period !== 'all' 
                      ? 'Thử thay đổi bộ lọc' 
                      : 'Bắt đầu giao dịch để nhận hoàn phí'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPayouts.map((payout) => (
                    <div key={payout.id} className="border border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            payout.status === 'PROCESSED' ? 'bg-green-100' :
                            payout.status === 'PENDING' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            {getStatusIcon(payout.status)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className="font-semibold text-slate-900">
                                ${payout.amount.toFixed(2)}
                              </h4>
                              <Badge className={getStatusColor(payout.status)}>
                                {getStatusText(payout.status)}
                              </Badge>
                              <Badge variant="outline">{payout.broker}</Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span>Kỳ: {payout.period}</span>
                              <span>•</span>
                              <span>Khối lượng: ${payout.tradingVolume.toLocaleString()}</span>
                              <span>•</span>
                              <span>Tỷ lệ: {(payout.feeRate * 100).toFixed(3)}%</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Ngày tạo: {new Date(payout.createdAt).toLocaleString('vi-VN')}
                              {payout.processedAt && (
                                <span> • Đã xử lý: {new Date(payout.processedAt).toLocaleString('vi-VN')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {payout.notes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
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
      </div>
    </AuthGuard>
  );
}