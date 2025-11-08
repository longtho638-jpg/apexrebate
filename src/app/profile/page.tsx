'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Settings, 
  Shield, 
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Target,
  Clock,
  Award,
  HelpCircle,
  Users
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string;
  tradingVolume: number;
  preferredBroker: string;
  experience: string;
  referralCode: string;
  referralCount: number;
  totalSavings: number;
  memberSince: string;
  status: string;
  phone?: string;
  timezone?: string;
  notifications: {
    email: boolean;
    payout: boolean;
    referral: boolean;
    weekly: boolean;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
        setEditedProfile(data.data);
      } else if (session?.user) {
        // Fallback to session data
        const fallbackProfile: UserProfile = {
          id: session.user.id || '',
          email: session.user.email || '',
          name: session.user.name || '',
          image: session.user.image || undefined,
          role: session.user.role || 'user',
          tradingVolume: 0,
          preferredBroker: 'binance',
          experience: 'beginner',
          referralCode: '',
          referralCount: 0,
          totalSavings: 0,
          memberSince: new Date().toISOString(),
          status: 'active',
          notifications: {
            email: true,
            payout: true,
            referral: true,
            weekly: true
          }
        };
        setProfile(fallbackProfile);
        setEditedProfile(fallbackProfile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaveMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
    setSaveMessage('');
  };

  const handleSave = async () => {
    if (!editedProfile) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile),
      });

      const data = await response.json();
      
      if (data.success) {
        setProfile(editedProfile);
        setIsEditing(false);
        setSaveMessage('✅ Profile updated successfully!');
      } else {
        setSaveMessage(`❌ ${data.error || 'Failed to update profile'}`);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSaveMessage('❌ Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (!editedProfile) return;
    
    setEditedProfile({
      ...editedProfile,
      [field]: value
    });
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    if (!editedProfile) return;
    
    setEditedProfile({
      ...editedProfile,
      notifications: {
        ...editedProfile.notifications,
        [type]: value
      }
    });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 bg-gradient-to-b from-slate-50 to-white">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Profile not found
              </h3>
              <p className="text-slate-600 mb-4">
                Unable to load your profile information.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-50 to-white">
      
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Hồ sơ cá nhân</h1>
              <p className="text-slate-600">Quản lý thông tin và cài đặt giao dịch của bạn</p>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} variant="outline">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>

          {saveMessage && (
            <div className={`p-4 rounded-lg mb-6 ${
              saveMessage.includes('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {saveMessage}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.image} alt={profile.name} />
                    <AvatarFallback className="bg-blue-600 text-white text-lg">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{profile.name}</h3>
                    <p className="text-slate-600">{profile.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {profile.role}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Họ và tên</Label>
                    <Input
                      id="name"
                      value={editedProfile?.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={editedProfile?.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+84 123 456 789"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="timezone">Múi giờ</Label>
                  <Select
                    value={editedProfile?.timezone || 'UTC+7'}
                    onValueChange={(value) => handleInputChange('timezone', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC+7">UTC+7 (Hà Nội)</SelectItem>
                      <SelectItem value="UTC+8">UTC+8 (Singapore)</SelectItem>
                      <SelectItem value="UTC+9">UTC+9 (Tokyo)</SelectItem>
                      <SelectItem value="UTC+0">UTC+0 (London)</SelectItem>
                      <SelectItem value="UTC-5">UTC-5 (New York)</SelectItem>
                      <SelectItem value="UTC-8">UTC-8 (San Francisco)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Trading Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Thông tin giao dịch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tradingVolume">Khối lượng giao dịch hàng tháng (USD)</Label>
                    <Input
                      id="tradingVolume"
                      type="number"
                      value={editedProfile?.tradingVolume || 0}
                      onChange={(e) => handleInputChange('tradingVolume', parseFloat(e.target.value))}
                      disabled={!isEditing}
                      placeholder="1,000,000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preferredBroker">Sàn giao dịch ưa thích</Label>
                    <Select
                      value={editedProfile?.preferredBroker || 'binance'}
                      onValueChange={(value) => handleInputChange('preferredBroker', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="binance">Binance</SelectItem>
                        <SelectItem value="bybit">Bybit</SelectItem>
                        <SelectItem value="okx">OKX</SelectItem>
                        <SelectItem value="huobi">Huobi</SelectItem>
                        <SelectItem value="kucoin">KuCoin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience">Kinh nghiệm giao dịch</Label>
                  <Select
                    value={editedProfile?.experience || 'beginner'}
                    onValueChange={(value) => handleInputChange('experience', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Mới bắt đầu (&lt;1 năm)</SelectItem>
                      <SelectItem value="intermediate">Trung cấp (1-3 năm)</SelectItem>
                      <SelectItem value="advanced">Nâng cao (3-5 năm)</SelectItem>
                      <SelectItem value="expert">Chuyên gia (&gt;5 năm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Cài đặt thông báo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Thông báo email</p>
                      <p className="text-sm text-slate-600">Nhận thông báo quan trọng qua email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editedProfile?.notifications?.email || false}
                      onChange={(e) => handleNotificationChange('email', e.target.checked)}
                      disabled={!isEditing}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Thông báo hoàn phí</p>
                      <p className="text-sm text-slate-600">Nhận thông báo khi có hoàn phí mới</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editedProfile?.notifications?.payout || false}
                      onChange={(e) => handleNotificationChange('payout', e.target.checked)}
                      disabled={!isEditing}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Thông báo giới thiệu</p>
                      <p className="text-sm text-slate-600">Nhận thông báo khi có người dùng mã giới thiệu</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editedProfile?.notifications?.referral || false}
                      onChange={(e) => handleNotificationChange('referral', e.target.checked)}
                      disabled={!isEditing}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Báo cáo hàng tuần</p>
                      <p className="text-sm text-slate-600">Nhận báo cáo tổng kết hàng tuần từ Concierge</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editedProfile?.notifications?.weekly || false}
                      onChange={(e) => handleNotificationChange('weekly', e.target.checked)}
                      disabled={!isEditing}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Thống kê
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${profile.totalSavings.toLocaleString()}
                  </div>
                  <p className="text-sm text-slate-600">Tổng tiết kiệm</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-blue-600">
                      {profile.referralCount}
                    </div>
                    <p className="text-xs text-slate-600">Lời giới thiệu</p>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-purple-600">
                      ${(profile.tradingVolume * 0.0004 * 12).toFixed(0)}
                    </div>
                    <p className="text-xs text-slate-600">Phí/năm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Mã giới thiệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="bg-slate-100 rounded-lg p-3 mb-3">
                    <div className="text-xl font-bold text-slate-900">
                      {profile.referralCode || 'COMING_SOON'}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    Chia sẻ mã này với bạn bè để nhận thưởng
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Target className="w-4 h-4 mr-2" />
                    Sao chép mã
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Hành động nhanh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/payouts">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Lịch sử hoàn phí
                  </Button>
                </Link>
                <Link href="/referrals">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Quản lý giới thiệu
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Trợ giúp
                  </Button>
                </Link>
                
                <Separator />
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={handleSignOut}
                >
                  <X className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
              </CardContent>
            </Card>

            {/* Member Since */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">
                    Thành viên từ
                  </p>
                  <p className="font-semibold text-slate-900">
                    {new Date(profile.memberSince).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}