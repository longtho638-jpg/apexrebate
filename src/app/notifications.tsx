'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Mail, 
  Settings, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  TrendingUp,
  Award,
  Users,
  Eye,
  EyeOff
} from 'lucide-react'
import { useSession } from 'next-auth/react'

interface NotificationData {
  email: string
  emailVerified: boolean
  memberSince: string
  notifications: Array<{
    id: string
    type: string
    subject: string
    status: string
    sentAt?: string
    createdAt: string
    error?: string
  }>
  stats: {
    totalSent: number
    totalPending: number
    totalFailed: number
  }
}

interface EmailPreferences {
  welcome: boolean
  payoutReceived: boolean
  achievementUnlocked: boolean
  tierUpgrade: boolean
  referralSuccess: boolean
  weeklyDigest: boolean
  monthlyReport: boolean
  inactivityWarning: boolean
  milestoneReached: boolean
  conciergeUpdate: boolean
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const [notificationData, setNotificationData] = useState<NotificationData | null>(null)
  const [preferences, setPreferences] = useState<EmailPreferences>({
    welcome: true,
    payoutReceived: true,
    achievementUnlocked: true,
    tierUpgrade: true,
    referralSuccess: true,
    weeklyDigest: true,
    monthlyReport: true,
    inactivityWarning: true,
    milestoneReached: true,
    conciergeUpdate: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchNotificationData()
    }
  }, [session])

  const fetchNotificationData = async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      const result = await response.json()
      
      if (result.success) {
        setNotificationData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch notification data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreferenceChange = async (key: keyof EmailPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
    
    // In a real implementation, you would save this to the backend
    try {
      setSaving(true)
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: { ...preferences, [key]: value }
        })
      })
      
      if (response.ok) {
        console.log('Preferences updated successfully')
      }
    } catch (error) {
      console.error('Failed to update preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã gửi</Badge>
      case 'pending':
        return <Badge variant="secondary">Chờ gửi</Badge>
      case 'failed':
        return <Badge variant="destructive">Thất bại</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const getPreferenceIcon = (key: string) => {
    switch (key) {
      case 'welcome':
        return <Mail className="h-4 w-4" />
      case 'payoutReceived':
        return <TrendingUp className="h-4 w-4" />
      case 'achievementUnlocked':
        return <Award className="h-4 w-4" />
      case 'tierUpgrade':
        return <Users className="h-4 w-4" />
      case 'referralSuccess':
        return <Users className="h-4 w-4" />
      case 'weeklyDigest':
        return <Calendar className="h-4 w-4" />
      case 'monthlyReport':
        return <Calendar className="h-4 w-4" />
      case 'inactivityWarning':
        return <AlertTriangle className="h-4 w-4" />
      case 'milestoneReached':
        return <TrendingUp className="h-4 w-4" />
      case 'conciergeUpdate':
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPreferenceLabel = (key: string) => {
    switch (key) {
      case 'welcome':
        return 'Email chào mừng'
      case 'payoutReceived':
        return 'Thông báo hoàn phí'
      case 'achievementUnlocked':
        return 'Mở khóa thành tựu'
      case 'tierUpgrade':
        return 'Nâng cấp hạng'
      case 'referralSuccess':
        return 'Giới thiệu thành công'
      case 'weeklyDigest':
        return 'Tổng kết hàng tuần'
      case 'monthlyReport':
        return 'Báo cáo hàng tháng'
      case 'inactivityWarning':
        return 'Cảnh báo không hoạt động'
      case 'milestoneReached':
        return 'Đạt cột mốc'
      case 'conciergeUpdate':
        return 'Cập nhật Concierge'
      default:
        return key
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!notificationData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Không thể tải dữ liệu thông báo</h1>
          <Button onClick={fetchNotificationData}>Thử lại</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thông báo</h1>
            <p className="text-muted-foreground">
              Quản lý cài đặt thông báo và xem lịch sử email
            </p>
          </div>
        </div>

        {/* Email Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Thông tin Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{notificationData.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {notificationData.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{notificationData.stats.totalSent} đã gửi</p>
                  <p className="text-sm text-muted-foreground">Thành công</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Thành viên từ</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(notificationData.memberSince).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="preferences" className="space-y-4">
          <TabsList>
            <TabsTrigger value="preferences">Cài đặt</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cài đặt Thông báo
                </CardTitle>
                <CardDescription>
                  Chọn loại thông báo bạn muốn nhận
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(preferences).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getPreferenceIcon(key)}
                        <div>
                          <p className="font-medium">{getPreferenceLabel(key)}</p>
                          <p className="text-sm text-muted-foreground">
                            Nhận thông báo khi có sự kiện liên quan
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => handlePreferenceChange(key as keyof EmailPreferences, checked)}
                        disabled={saving}
                      />
                    </div>
                  ))}
                </div>
                
                {saving && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 animate-spin" />
                    Đang lưu cài đặt...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Lịch sử Thông báo
                </CardTitle>
                <CardDescription>
                  Xem các thông báo đã gửi gần đây
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notificationData.notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <EyeOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Chưa có thông báo nào</p>
                    </div>
                  ) : (
                    notificationData.notifications.map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="mt-1">
                          {getStatusIcon(notification.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{notification.subject}</p>
                            {getStatusBadge(notification.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Loại: {getPreferenceLabel(notification.type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.sentAt 
                              ? `Đã gửi: ${new Date(notification.sentAt).toLocaleString('vi-VN')}`
                              : `Tạo: ${new Date(notification.createdAt).toLocaleString('vi-VN')}`
                            }
                          </p>
                          {notification.error && (
                            <p className="text-xs text-red-600 mt-1">
                              Lỗi: {notification.error}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}