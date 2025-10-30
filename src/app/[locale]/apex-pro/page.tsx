'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Award,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Crown,
  Gem,
  Star,
  FileText,
  Calculator,
  Settings,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Activity,
  Users,
  Globe
} from 'lucide-react';

export default function ApexProPage() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [analyticsData, setAnalyticsData] = useState({
    totalTrades: 0,
    winRate: 0,
    profitFactor: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    avgWin: 0,
    avgLoss: 0,
    totalPnL: 0
  });
  const [taxReport, setTaxReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApexProData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/apex-pro');
        const data = await response.json();
        
        if (data.success) {
          setIsSubscribed(data.isSubscribed);
          setAnalyticsData(data.analyticsData);
          setTaxReport(data.taxReport);
        } else {
          // Fallback to mock data
          const mockAnalyticsData = {
            totalTrades: 1247,
            winRate: 68.5,
            profitFactor: 1.85,
            sharpeRatio: 1.42,
            maxDrawdown: -12.3,
            avgWin: 156.70,
            avgLoss: -84.50,
            totalPnL: 2847.50
          };
          
          const mockTaxReport = {
            year: 2024,
            totalIncome: 2847.50,
            totalExpenses: 142.50,
            taxableIncome: 2705.00,
            estimatedTax: 405.75,
            trades: [
              { date: '2024-05-01', pair: 'BTC/USDT', type: 'Long', pnl: 125.50, fee: 2.50 },
              { date: '2024-05-01', pair: 'ETH/USDT', type: 'Short', pnl: -45.20, fee: 1.80 },
              { date: '2024-05-02', pair: 'SOL/USDT', type: 'Long', pnl: 89.30, fee: 2.10 }
            ]
          };
          
          setAnalyticsData(mockAnalyticsData);
          setTaxReport(mockTaxReport);
        }
      } catch (error) {
        console.error('Failed to fetch ApexPro data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApexProData();
  }, []);

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/apex-pro/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ billingCycle }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsSubscribed(true);
        // Show success message
      } else {
        // Show error message
      }
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const handleDownloadTaxReport = () => {
    // Generate and download tax report
    const csvContent = generateTaxReportCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-report-${new Date().getFullYear()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateTaxReportCSV = () => {
    if (!taxReport) return '';
    
    let csv = 'Date,Pair,Type,PnL,Fee\n';
    taxReport.trades.forEach((trade: any) => {
      csv += `${trade.date},${trade.pair},${trade.type},${trade.pnl},${trade.fee}\n`;
    });
    
    csv += `\nSummary\n`;
    csv += `Total Income,${taxReport.totalIncome}\n`;
    csv += `Total Expenses,${taxReport.totalExpenses}\n`;
    csv += `Taxable Income,${taxReport.taxableIncome}\n`;
    csv += `Estimated Tax,${taxReport.estimatedTax}\n`;
    
    return csv;
  };

  const getPrice = () => {
    return billingCycle === 'monthly' ? 19 : 190; // $19/month or $190/year (2 months free)
  };

  const getFeatures = () => [
    {
      icon: BarChart3,
      title: 'Phân Tích Hiệu Suất Nâng Cao',
      description: 'Sharpe ratio, profit factor, maximum drawdown và các chỉ số chuyên sâu',
      included: true
    },
    {
      icon: FileText,
      title: 'Báo Cáo Thuế Tự Động',
      description: 'Xuất báo cáo thuế theo định dạng CSV, sẵn sàng nộp',
      included: true
    },
    {
      icon: Calculator,
      title: 'Tối Ưu Hóa Chi Phí',
      description: 'Phân tích chi phí ẩn và đề xuất chiến lược giảm thiểu',
      included: true
    },
    {
      icon: Activity,
      title: 'Theo Dõi Thời Gian Thực',
      description: 'Dashboard real-time với các chỉ số giao dịch live',
      included: true
    },
    {
      icon: Download,
      title: 'Xuất Dữ Liệu Nhiều Định Dạng',
      description: 'Hỗ trợ CSV, JSON, PDF cho báo cáo và phân tích',
      included: true
    },
    {
      icon: Shield,
      title: 'Bảo Mật Cấp Doanh Nghiệp',
      description: 'Mã hóa end-to-end và backup dữ liệu tự động',
      included: true
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải dữ liệu ApexPro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Gem className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">ApexPro SaaS</h1>
              <p className="text-slate-600">Công cụ phân tích giao dịch chuyên nghiệp</p>
            </div>
          </div>
          
          {!isSubscribed && (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Nâng cấp lên ApexPro</h2>
                  <p className="text-purple-100 mb-4">
                    Mở khóa toàn bộ tính năng phân tích chuyên sâu và tối ưu hóa giao dịch
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold">${getPrice()}</span>
                      <span className="text-purple-100">/{billingCycle === 'monthly' ? 'tháng' : 'năm'}</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <Badge className="bg-yellow-500 text-yellow-900">
                        Tiết kiệm 20%
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm">Monthly</span>
                    <Switch
                      checked={billingCycle === 'yearly'}
                      onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                    />
                    <span className="text-sm">Yearly</span>
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-white text-purple-600 hover:bg-purple-50"
                    onClick={handleSubscribe}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Nâng cấp ngay
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {isSubscribed ? (
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analytics">Phân Tích</TabsTrigger>
              <TabsTrigger value="tax">Báo Cáo Thuế</TabsTrigger>
              <TabsTrigger value="optimization">Tối Ưu Hóa</TabsTrigger>
              <TabsTrigger value="settings">Cài Đặt</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Tổng Lệnh</p>
                        <p className="text-2xl font-bold text-slate-900">{analyticsData.totalTrades.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Win Rate</p>
                        <p className="text-2xl font-bold text-green-600">{analyticsData.winRate}%</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Target className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Profit Factor</p>
                        <p className="text-2xl font-bold text-purple-600">{analyticsData.profitFactor}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Sharpe Ratio</p>
                        <p className="text-2xl font-bold text-orange-600">{analyticsData.sharpeRatio}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rủi Ro & Hiệu Suất</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-900">Max Drawdown</span>
                        <span className="text-red-600 font-bold">{analyticsData.maxDrawdown}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-900">Avg Win</span>
                        <span className="text-green-600 font-bold">${analyticsData.avgWin.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-900">Avg Loss</span>
                        <span className="text-red-600 font-bold">${analyticsData.avgLoss.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium text-slate-900">Total P&L</span>
                        <span className="text-blue-600 font-bold">${analyticsData.totalPnL.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Phân Tích Xu Hướng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Hiệu Suất Gần Đây</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-blue-700">7 ngày qua</span>
                            <span className="text-sm font-medium text-blue-900">+12.5%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-blue-700">30 ngày qua</span>
                            <span className="text-sm font-medium text-blue-900">+28.3%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-blue-700">90 ngày qua</span>
                            <span className="text-sm font-medium text-blue-900">+45.7%</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Điểm Mạnh</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>✅ Win rate cao trên 65%</li>
                          <li>✅ Profit factor &gt; 1.5</li>
                          <li>✅ Quản lý rủi ro tốt</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tax" className="space-y-6">
              {taxReport && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Báo Cáo Thuế {taxReport.year}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <h4 className="font-medium text-slate-900 mb-3">Tóm Tắt</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Tổng Thu Nhập</span>
                              <span className="font-medium text-green-600">${taxReport.totalIncome.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Tổng Chi Phí</span>
                              <span className="font-medium text-red-600">${taxReport.totalExpenses.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                              <span className="font-medium text-slate-900">Thu Nhập Chịu Thuế</span>
                              <span className="font-bold text-blue-600">${taxReport.taxableIncome.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-slate-900">Thuế Ước Tính</span>
                              <span className="font-bold text-orange-600">${taxReport.estimatedTax.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={handleDownloadTaxReport}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Tải Xuất Báo Cáo CSV
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Lịch Sử Giao Dịch</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {taxReport.trades.map((trade: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{trade.pair}</p>
                              <p className="text-sm text-slate-600">{trade.date} • {trade.type}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${trade.pnl.toFixed(2)}
                              </p>
                              <p className="text-xs text-slate-500">Fee: ${trade.fee}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="optimization" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Phân Tích Chi Phí</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Chi Phí Ẩn Phát Hiện</h4>
                        <p className="text-sm text-orange-700 mb-3">
                          Chúng tôi phát hiện một số chi phí ẩn có thể tối ưu:
                        </p>
                        <ul className="text-sm text-orange-700 space-y-1">
                          <li>• Spread cost: $234.50/tháng</li>
                          <li>• Overnight fees: $67.20/tháng</li>
                          <li>• Inactivity fees: $15.00/tháng</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Đề Xuất Tối Ưu</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>✅ Chuyển sang sàn X để giảm spread 15%</li>
                          <li>✅ Đóng vị trí trước 23:00 để tránh overnight fee</li>
                          <li>✅ Tăng tần suất giao dịch để tránh inactivity fee</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tối Ưu Hóa Hiệu Suất</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Phân Tích Thời Gian</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Hiệu suất tốt nhất trong các khung giờ:
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-blue-700">9:00 - 11:00</span>
                            <span className="text-sm font-medium text-blue-900">Win Rate: 72%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-blue-700">14:00 - 16:00</span>
                            <span className="text-sm font-medium text-blue-900">Win Rate: 68%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-blue-700">20:00 - 22:00</span>
                            <span className="text-sm font-medium text-blue-900">Win Rate: 65%</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Phân Tích Cặp Tiền</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-purple-700">BTC/USDT</span>
                            <span className="text-sm font-medium text-purple-900">Profit Factor: 2.1</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-purple-700">ETH/USDT</span>
                            <span className="text-sm font-medium text-purple-900">Profit Factor: 1.8</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-purple-700">SOL/USDT</span>
                            <span className="text-sm font-medium text-purple-900">Profit Factor: 1.5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cài Đặt ApexPro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">Báo Cáo Tự Động</h4>
                        <p className="text-sm text-slate-600">Gửi báo cáo hàng tuần qua email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">Cảnh Báo Rủi Ro</h4>
                        <p className="text-sm text-slate-600">Thông báo khi drawdown vượt quá 10%</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">Tối Ưu Hóa Tự Động</h4>
                        <p className="text-sm text-slate-600">Gợi ý tối ưu dựa trên phân tích</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">Dữ Liệu Real-time</h4>
                        <p className="text-sm text-slate-600">Cập nhật dashboard theo thời gian thực</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          /* Features Preview */
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Tính Năng ApexPro
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Mở khóa toàn bộ tiềm năng giao dịch với công cụ phân tích chuyên nghiệp
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFeatures().map((feature, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    {feature.included && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8 text-center">
                <Gem className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">
                  Sẵn Sàng Nâng Cấp?
                </h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Tham gia hàng trăm trader chuyên nghiệp đã tin dùng ApexPro để tối ưu hóa 
                  lợi nhuận và giảm thiểu rủi ro
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={handleSubscribe}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Bắt Đầu Dùng Thử Miễn Phí
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}