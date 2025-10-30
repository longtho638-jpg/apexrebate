'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Download, 
  Users, 
  Activity, 
  Star, 
  Bell,
  Settings,
  BarChart3,
  Globe,
  Apple,
  Android,
  Send,
  RefreshCw,
  TrendingUp,
  Target,
  Zap,
  Shield,
  MessageSquare,
  Plus
} from 'lucide-react';

interface MobileAnalytics {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  totalDownloads: number;
  averageSessionDuration: number;
  screenViews: Record<string, number>;
  userRetention: Record<string, number>;
  crashRate: number;
  appRating: number;
  featureUsage: Record<string, number>;
}

interface MobileFeature {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'beta' | 'inactive';
  adoption: number;
  platform: string[];
}

interface PushNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: any;
  type: 'marketing' | 'transactional' | 'alert';
  scheduledFor?: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
}

export default function MobileAppManagement() {
  const [analytics, setAnalytics] = useState<MobileAnalytics | null>(null);
  const [features, setFeatures] = useState<MobileFeature[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [downloadStats, setDownloadStats] = useState<any>(null);
  const [mobileUsers, setMobileUsers] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'ios' | 'android'>('all');

  useEffect(() => {
    fetchMobileAppData();
    const interval = setInterval(fetchMobileAppData, 60000); // 每分钟刷新
    return () => clearInterval(interval);
  }, []);

  const fetchMobileAppData = async () => {
    try {
      const [analyticsRes, featuresRes, notificationsRes, downloadsRes, usersRes] = await Promise.all([
        fetch('/api/mobile-app?action=analytics'),
        fetch('/api/mobile-app?action=features'),
        fetch('/api/mobile-app?action=notifications'),
        fetch('/api/mobile-app?action=downloads'),
        fetch('/api/mobile-app?action=users')
      ]);

      const analyticsData = await analyticsRes.json();
      const featuresData = await featuresRes.json();
      const notificationsData = await notificationsRes.json();
      const downloadsData = await downloadsRes.json();
      const usersData = await usersRes.json();

      setAnalytics(analyticsData);
      setFeatures(featuresData.features || []);
      setNotifications(notificationsData.notifications || []);
      setDownloadStats(downloadsData);
      setMobileUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch mobile app data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (notification: any) => {
    try {
      const response = await fetch('/api/mobile-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-notification',
          notification
        })
      });

      if (response.ok) {
        fetchMobileAppData();
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'beta': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return <Apple className="h-4 w-4" />;
      case 'android': return <Android className="h-4 w-4" />;
      default: return <Smartphone className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 移动端概览 */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">日活用户</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.dailyActiveUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                月活: {analytics.monthlyActiveUsers.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总下载量</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalDownloads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                累计下载
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">应用评分</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.appRating}</div>
              <p className="text-xs text-muted-foreground">
                用户评分
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">崩溃率</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.crashRate}%</div>
              <p className="text-xs text-muted-foreground">
                稳定性指标
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="features">功能管理</TabsTrigger>
          <TabsTrigger value="notifications">推送通知</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
          <TabsTrigger value="users">用户管理</TabsTrigger>
          <TabsTrigger value="downloads">下载统计</TabsTrigger>
        </TabsList>

        {/* 概览 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 用户留存 */}
            <Card>
              <CardHeader>
                <CardTitle>用户留存率</CardTitle>
                <CardDescription>不同时间段的用户留存情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.userRetention && Object.entries(analytics.userRetention).map(([period, rate]) => (
                    <div key={period} className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {period === 'day1' ? '第1天' : 
                         period === 'day7' ? '第7天' : 
                         period === 'day30' ? '第30天' : '第90天'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Progress value={rate as number} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {rate as number}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 功能使用率 */}
            <Card>
              <CardHeader>
                <CardTitle>功能使用率</CardTitle>
                <CardDescription>各项功能的使用情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.featureUsage && Object.entries(analytics.featureUsage).map(([feature, usage]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {feature === 'pushNotifications' ? '推送通知' :
                         feature === 'biometricAuth' ? '生物识别' :
                         feature === 'darkMode' ? '深色模式' :
                         feature === 'offlineMode' ? '离线模式' : feature}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Progress value={usage as number} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {usage as number}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 屏幕浏览量 */}
          <Card>
            <CardHeader>
              <CardTitle>屏幕浏览量</CardTitle>
              <CardDescription>各页面的访问次数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics?.screenViews && Object.entries(analytics.screenViews).map(([screen, views]) => (
                  <div key={screen} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {screen === 'dashboard' ? '仪表板' :
                         screen === 'calculator' ? '计算器' :
                         screen === 'payouts' ? '返利记录' :
                         screen === 'profile' ? '个人资料' :
                         screen === 'settings' ? '设置' : screen}
                      </span>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{views.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">浏览次数</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 功能管理 */}
        <TabsContent value="features" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">功能管理</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加功能
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {features.map((feature) => (
              <Card key={feature.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{feature.name}</span>
                        <Badge className={getStatusColor(feature.status)}>
                          {feature.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      {feature.platform.map((platform) => (
                        <div key={platform} className="p-1">
                          {getPlatformIcon(platform)}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>采用率</span>
                        <span>{feature.adoption}%</span>
                      </div>
                      <Progress value={feature.adoption} className="h-2" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">支持平台:</span>
                      <span>{feature.platform.join(', ')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 推送通知 */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">推送通知</h3>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              发送通知
            </Button>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>{notification.title}</span>
                        <Badge className={getStatusColor(notification.status)}>
                          {notification.status}
                        </Badge>
                        <Badge variant="outline">{notification.type}</Badge>
                      </CardTitle>
                      <CardDescription>{notification.body}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      发送时间: {notification.sentAt ? 
                        new Date(notification.sentAt).toLocaleString() : 
                        '计划发送: ' + new Date(notification.scheduledFor!).toLocaleString()}
                    </span>
                    <span>用户ID: {notification.userId}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 数据分析 */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 会话时长 */}
            <Card>
              <CardHeader>
                <CardTitle>平均会话时长</CardTitle>
                <CardDescription>用户每次使用应用的平均时间</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {analytics?.averageSessionDuration}分钟
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    较上月提升 12%
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 应用性能 */}
            <Card>
              <CardHeader>
                <CardTitle>应用性能</CardTitle>
                <CardDescription>关键性能指标</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>崩溃率</span>
                    <span className="font-medium">{analytics?.crashRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>应用评分</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{analytics?.appRating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>日活用户</span>
                    <span className="font-medium">{analytics?.dailyActiveUsers.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 用户管理 */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">用户管理</h3>
            <div className="flex space-x-2">
              <Button
                variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform('all')}
              >
                全部
              </Button>
              <Button
                variant={selectedPlatform === 'ios' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform('ios')}
              >
                <Apple className="h-4 w-4 mr-1" />
                iOS
              </Button>
              <Button
                variant={selectedPlatform === 'android' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform('android')}
              >
                <Android className="h-4 w-4 mr-1" />
                Android
              </Button>
            </div>
          </div>

          {mobileUsers && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>总用户数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mobileUsers.total}</div>
                  <p className="text-sm text-muted-foreground">
                    活跃用户: {mobileUsers.activeUsers}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>iOS 用户</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mobileUsers.platformStats.ios}</div>
                  <p className="text-sm text-muted-foreground">
                    占比: {((mobileUsers.platformStats.ios / mobileUsers.total) * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Android 用户</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mobileUsers.platformStats.android}</div>
                  <p className="text-sm text-muted-foreground">
                    占比: {((mobileUsers.platformStats.android / mobileUsers.total) * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 下载统计 */}
        <TabsContent value="downloads" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 下载趋势 */}
            <Card>
              <CardHeader>
                <CardTitle>下载趋势</CardTitle>
                <CardDescription>最近5天的下载情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {downloadStats?.byDate.map((day: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{day.date}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(day.downloads / 300) * 100} className="w-16 h-2" />
                        <span className="text-sm font-medium w-12 text-right">
                          {day.downloads}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 下载来源 */}
            <Card>
              <CardHeader>
                <CardTitle>下载来源</CardTitle>
                <CardDescription>各渠道的下载分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {downloadStats?.sources && Object.entries(downloadStats.sources).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{source}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(count as number / downloadStats.total) * 100} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count as number}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 地区分布 */}
          {downloadStats?.byCountry && (
            <Card>
              <CardHeader>
                <CardTitle>地区分布</CardTitle>
                <CardDescription>按国家/地区的下载统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(downloadStats.byCountry).map(([country, count]) => (
                    <div key={country} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{country}</span>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="text-2xl font-bold">{count as number}</div>
                      <p className="text-xs text-muted-foreground">
                        {(((count as number) / downloadStats.total) * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}