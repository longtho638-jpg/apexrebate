'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Eye,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingDown,
  Zap,
  Shield,
  Award,
  RefreshCw
} from 'lucide-react';
import Navbar from '@/components/navbar';
import AnalyticsCharts from '@/components/dashboard/analytics-charts';
import { useToast } from '@/components/ui/use-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DashboardClient() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
        setLastUpdated(new Date());
        
        if (showRefreshIndicator) {
          toast({
            title: "Data refreshed",
            description: "Your dashboard data has been updated",
            variant: "success",
          });
        } else {
          toast({
            title: "Dashboard loaded",
            description: "Your analytics data has been refreshed",
            variant: "success",
          });
        }
      } else {
        setError('Failed to load dashboard data');
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError('Error loading dashboard');
      console.error('Dashboard error:', err);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleExport = useCallback(() => {
    toast({
      title: "Export Started",
      description: "Your dashboard data is being prepared for download",
      variant: "info",
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Dashboard data has been downloaded successfully",
        variant: "success",
      });
    }, 2000);
  }, [toast]);

  const handleRefresh = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Memoize calculations for better performance
  const metrics = useMemo(() => {
    if (!dashboardData) return null;
    
    const { overview, metrics: dataMetrics } = dashboardData;
    return {
      ...overview,
      ...dataMetrics,
      savingsPercentage: overview.totalSavings > 0 ? (overview.currentMonthSavings / overview.totalSavings) * 100 : 0,
      isGrowing: overview.currentMonthSavings > overview.averageWeeklyPayout * 4
    };
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchDashboardData()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData || !metrics) return null;

  const { user, overview, payoutHistory, monthlyPerformance, metrics: rawMetrics, brokerDistribution, savingsAnalysis } = dashboardData;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Enhanced Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.email}</p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="w-4 h-4 mr-1" />
                {user.status}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Savings</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    ${overview.totalSavings.toFixed(2)}
                  </p>
                  <div className="flex items-center mt-1 sm:mt-2 text-xs sm:text-sm">
                    <ArrowUpRight className="w-3 h-3 sm:w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">+12.5%</span>
                    <span className="text-muted-foreground ml-1 hidden sm:inline">vs last month</span>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 sm:mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Monthly Goal</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-1.5 sm:h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Monthly Savings</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    ${overview.currentMonthSavings.toFixed(2)}
                  </p>
                  <div className="flex items-center mt-1 sm:mt-2 text-xs sm:text-sm">
                    {metrics.isGrowing ? (
                      <>
                        <ArrowUpRight className="w-3 h-3 sm:w-4 h-4 text-green-600 mr-1" />
                        <span className="text-green-600">+8.2%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="w-3 h-3 sm:w-4 h-4 text-red-600 mr-1" />
                        <span className="text-red-600">-2.1%</span>
                      </>
                    )}
                    <span className="text-muted-foreground ml-1 hidden sm:inline">vs last month</span>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <Badge variant={metrics.isGrowing ? "default" : "destructive"} className="text-xs">
                  {metrics.isGrowing ? "Growing" : "Declining"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avg Weekly Payout</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    ${overview.averageWeeklyPayout.toFixed(2)}
                  </p>
                  <div className="flex items-center mt-1 sm:mt-2 text-xs sm:text-sm">
                    <Clock className="w-3 h-3 sm:w-4 h-4 text-muted-foreground mr-1" />
                    <span className="text-muted-foreground">Next: ~${overview.nextPayoutEstimate.toFixed(2)}</span>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Zap className="w-3 h-3 mr-1" />
                  <span>Auto-payout enabled</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Year Projection</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    ${overview.yearlyProjection.toFixed(0)}
                  </p>
                  <div className="flex items-center mt-1 sm:mt-2 text-xs sm:text-sm">
                    <Target className="w-3 h-3 sm:w-4 h-4 text-muted-foreground mr-1" />
                    <span className="text-muted-foreground hidden sm:inline">Based on avg 3mo</span>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200 text-xs">
                  Top 15% Trader
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Recent Payouts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Payouts</CardTitle>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payoutHistory.slice(0, 5).map((payout, index) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-green-100' : 'bg-slate-100'
                        }`}>
                          <CheckCircle className={`w-5 h-5 ${
                            index === 0 ? 'text-green-600' : 'text-slate-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">${payout.amount.toFixed(2)}</p>
                          <p className="text-sm text-slate-600">{payout.period}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                          {payout.status}
                        </Badge>
                        <p className="text-sm text-slate-600 mt-1">
                          {new Date(payout.processedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Account Info */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Member Since</p>
                    <p className="text-slate-900">{new Date(user.memberSince).toLocaleDateString()}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Preferred Broker</p>
                    <p className="text-slate-900 capitalize">{user.preferredBroker}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Trading Volume</p>
                    <p className="text-slate-900">${(user.tradingVolume / 1000000).toFixed(1)}M/month</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Effective Rate</p>
                    <p className="text-slate-900">{(rawMetrics.savingsRate * 100).toFixed(3)}%</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Trades</p>
                    <p className="text-slate-900">{rawMetrics.totalTrades.toLocaleString()}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-slate-600">Trust Score</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-full mr-1 ${
                              i < 4 ? 'bg-yellow-400' : 'bg-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-600">4.8/5.0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Performance Chart */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {monthlyPerformance.map((month, index) => (
                <div key={month.month} className={`text-center p-4 rounded-lg ${
                  index === monthlyPerformance.length - 1 ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'
                }`}>
                  <p className="text-sm text-slate-600 mb-2">
                    {new Date(month.month + '-01').toLocaleDateString('en', { month: 'short' })}
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    ${month.savings.toFixed(0)}
                  </p>
                  <p className="text-xs text-slate-600">
                    ${(month.volume / 1000000).toFixed(1)}M vol
                  </p>
                  {index === monthlyPerformance.length - 1 && (
                    <Badge variant="outline" className="mt-2 text-xs bg-blue-50 text-blue-800 border-blue-200">
                      Current
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Analytics Section */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Advanced Analytics
              </CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                <PieChartIcon className="w-4 h-4 mr-1" />
                AI-Powered Insights
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <AnalyticsCharts 
                  monthlyPerformance={monthlyPerformance}
                  metrics={rawMetrics}
                  brokerDistribution={brokerDistribution}
                  savingsAnalysis={savingsAnalysis}
                />
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Efficiency Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-green-600">
                          {savingsAnalysis.efficiencyScore}/100
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Your savings efficiency is in the top 15% of traders
                      </p>
                      <Progress value={savingsAnalysis.efficiencyScore} className="mt-3" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Growth Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-blue-600">
                          {savingsAnalysis.growthRate > 0 ? '+' : ''}{savingsAnalysis.growthRate.toFixed(1)}%
                        </div>
                        {savingsAnalysis.growthRate > 0 ? (
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Month-over-month savings growth
                      </p>
                      <Progress value={Math.max(0, savingsAnalysis.growthRate + 50)} className="mt-3" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Consistency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-purple-600">
                          {savingsAnalysis.consistencyScore}%
                        </div>
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Trading consistency score
                      </p>
                      <Progress value={savingsAnalysis.consistencyScore} className="mt-3" />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Broker Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {brokerDistribution.map((broker, index) => (
                          <div key={broker.name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm font-medium">{broker.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">${broker.value.toFixed(2)}</p>
                              <p className="text-xs text-slate-600">{broker.percentage}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {savingsAnalysis.monthlyBreakdown.slice(-6).map((month) => (
                          <div key={month.month} className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {new Date(month.month + '-01').toLocaleDateString('en', { month: 'short' })}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${(month.actualSavings / month.potentialSavings) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold w-16 text-right">
                                ${month.actualSavings.toFixed(0)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="insights" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                        AI Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-1">Optimization Opportunity</p>
                          <p className="text-xs text-blue-700">
                            Increase trading volume by 15% to maximize rebate benefits
                          </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-900 mb-1">Strong Performance</p>
                          <p className="text-xs text-green-700">
                            Your efficiency score puts you in the top 15% of traders
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm font-medium text-purple-900 mb-1">Recommendation</p>
                          <p className="text-xs text-purple-700">
                            Consider diversifying across multiple brokers for better rates
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="w-5 h-5 mr-2 text-red-500" />
                        Goals & Targets
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Monthly Target</span>
                            <span>${(overview.currentMonthSavings / 500 * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={(overview.currentMonthSavings / 500) * 100} className="h-2" />
                          <p className="text-xs text-slate-600 mt-1">$500 goal</p>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Year Progress</span>
                            <span>{(overview.totalSavings / 6000 * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={(overview.totalSavings / 6000) * 100} className="h-2" />
                          <p className="text-xs text-slate-600 mt-1">$6,000 yearly goal</p>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Efficiency Target</span>
                            <span>{(savingsAnalysis.efficiencyScore)}%</span>
                          </div>
                          <Progress value={savingsAnalysis.efficiencyScore} className="h-2" />
                          <p className="text-xs text-slate-600 mt-1">90% efficiency goal</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}