'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Star, 
  Eye,
  Download,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalTools: number;
    totalSales: number;
    totalRevenue: number;
    activeSellers: number;
    averageRating: number;
    growthRate: number;
  };
  topTools: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    rating: number;
    category: string;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
    revenue: number;
    growth: number;
  }>;
  recentSales: Array<{
    id: string;
    toolName: string;
    buyerName: string;
    amount: number;
    timestamp: string;
  }>;
}

export default function ToolsMarketplaceAnalytics() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tools/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không thể tải dữ liệu phân tích</h1>
            <Button onClick={fetchAnalytics}>Thử lại</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Phân tích Chợ Công Cụ</h1>
              <p className="text-green-100 mt-2">
                Theo dõi hiệu suất và xu hướng thị trường công cụ giao dịch
              </p>
            </div>
            <div className="flex gap-2">
              {['24h', '7d', '30d', '90d'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className={timeRange === range ? 'bg-white text-green-600' : 'text-white border-white hover:bg-white/10'}
                >
                  {range === '24h' ? '24 giờ' : range === '7d' ? '7 ngày' : range === '30d' ? '30 ngày' : '90 ngày'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Công Cụ</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalTools}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{analytics.overview.growthRate}%</span> so với kỳ trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.overview.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> so với kỳ trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã Bán</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.2%</span> so với kỳ trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người Bán</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.activeSellers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3</span> người bán mới
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
            <TabsTrigger value="tools">Top Công Cụ</TabsTrigger>
            <TabsTrigger value="categories">Danh Mục</TabsTrigger>
            <TabsTrigger value="sales">Giao Dịch Gần Đây</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Chỉ Số Hiệu Suất
                  </CardTitle>
                  <CardDescription>
                    Các chỉ số quan trọng về hiệu suất thị trường
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Đánh giá trung bình</span>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-bold">{analytics.overview.averageRating.toFixed(1)}/5.0</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tỷ lệ chuyển đổi</span>
                    <span className="font-bold">3.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Giá trị đơn hàng trung bình</span>
                    <span className="font-bold">${(analytics.overview.totalRevenue / analytics.overview.totalSales).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tỷ lệ khách hàng quay lại</span>
                    <span className="font-bold">24.5%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Growth Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Xu Hướng Tăng Trưởng
                  </CardTitle>
                  <CardDescription>
                    Tốc độ tăng trưởng các chỉ số chính
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Doanh thu</span>
                      <span className="text-sm text-green-600">+12.5%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Số lượng công cụ</span>
                      <span className="text-sm text-green-600">+8.3%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Người bán</span>
                      <span className="text-sm text-green-600">+15.2%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Đánh giá</span>
                      <span className="text-sm text-green-600">+5.1%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Top Công Cụ Bán Chạy
                </CardTitle>
                <CardDescription>
                  Các công cụ có doanh thu và số lượng bán cao nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topTools.map((tool, index) => (
                    <div key={tool.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{tool.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">{tool.category}</Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span>{tool.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${tool.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{tool.sales} đã bán</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Thống Kê Danh Mục
                </CardTitle>
                <CardDescription>
                  Phân bổ công cụ và doanh thu theo danh mục
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.categoryStats.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{category.count} công cụ</span>
                          <span className="font-bold">${category.revenue.toLocaleString()}</span>
                          <Badge variant={category.growth > 0 ? 'default' : 'secondary'}>
                            {category.growth > 0 ? '+' : ''}{category.growth}%
                          </Badge>
                        </div>
                      </div>
                      <Progress 
                        value={(category.revenue / analytics.overview.totalRevenue) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Giao Dịch Gần Đây
                </CardTitle>
                <CardDescription>
                  Các giao dịch gần đây trên nền tảng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Download className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{sale.toolName}</h4>
                          <p className="text-sm text-muted-foreground">Bought by {sale.buyerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${sale.amount}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(sale.timestamp).toLocaleDateString()}
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