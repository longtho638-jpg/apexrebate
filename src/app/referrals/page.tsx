'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Share2, 
  Copy, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Gift, 
  Target,
  Award,
  Crown,
  Star,
  ExternalLink,
  QrCode,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  HelpCircle,
  Telegram
} from 'lucide-react';
import Navbar from '@/components/navbar';

interface Referral {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'active' | 'completed';
  joinedAt: string;
  tradingVolume?: number;
  totalEarnings?: number;
  avatar?: string;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  conversionRate: number;
  topEarner: boolean;
}

export default function ReferralsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchReferralData();
  }, [session, status, router]);

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/user/referrals');
      const data = await response.json();
      
      if (data.success) {
        setReferralStats(data.stats);
        setReferrals(data.referrals);
        setReferralCode(data.referralCode);
        setReferralLink(data.referralLink);
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setShareMessage(`✅ ${type} copied to clipboard!`);
      
      setTimeout(() => {
        setCopied(false);
        setShareMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setShareMessage('❌ Failed to copy to clipboard');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join me on ApexRebate - Cashback for Serious Traders');
    const body = encodeURIComponent(`Hey!

I've been using ApexRebate for serious traders like us, and I thought you'd be interested.

ApexRebate offers:
• Up to 40% commission rebates
• Personal concierge service
• Weekly performance reports
• Access to exclusive "Wolf's Den" community

My referral code: ${referralCode}

Join here: ${referralLink}

Let me know if you have any questions!

Best regards`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaSocial = (platform: string) => {
    const text = encodeURIComponent('Join me on ApexRebate - Cashback for Serious Traders');
    const url = encodeURIComponent(referralLink);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Calendar className="w-4 h-4" />;
      case 'completed': return <Award className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-200">
              <Gift className="w-4 h-4 mr-2" />
              Chương trình Giới thiệu
            </Badge>
            
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Mời bạn bè, nhận thưởng
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Chia sẻ ApexRebate với các trader khác và nhận hoa hồng từ giao dịch của họ. 
              Càng nhiều người bạn giới thiệu, càng nhiều phần thưởng!
            </p>
          </div>

          {shareMessage && (
            <div className={`max-w-md mx-auto p-4 rounded-lg mb-6 text-center ${
              shareMessage.includes('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {shareMessage}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Referral Code & Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Mã giới thiệu của bạn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {referralCode}
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Mã giới thiệu độc quyền của bạn
                  </p>
                  <Button 
                    onClick={() => copyToClipboard(referralCode, 'Referral code')}
                    className="w-full"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Sao chép mã
                  </Button>
                </div>

                <div className="bg-slate-50 rounded-lg p-6">
                  <Label className="text-sm font-medium text-slate-700 mb-2">
                    Link giới thiệu hoàn chỉnh
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={referralLink}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      onClick={() => copyToClipboard(referralLink, 'Referral link')}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Chia sẻ link này để bạn bè đăng ký với mã của bạn tự động
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Share Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  Chia sẻ ngay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    onClick={shareViaEmail}
                    variant="outline"
                    className="flex flex-col items-center space-y-2 h-auto py-3"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-xs">Email</span>
                  </Button>
                  
                  <Button
                    onClick={() => shareViaSocial('twitter')}
                    variant="outline"
                    className="flex flex-col items-center space-y-2 h-auto py-3"
                  >
                    <Twitter className="w-5 h-5" />
                    <span className="text-xs">Twitter</span>
                  </Button>
                  
                  <Button
                    onClick={() => shareViaSocial('facebook')}
                    variant="outline"
                    className="flex flex-col items-center space-y-2 h-auto py-3"
                  >
                    <Facebook className="w-5 h-5" />
                    <span className="text-xs">Facebook</span>
                  </Button>
                  
                  <Button
                    onClick={() => shareViaSocial('telegram')}
                    variant="outline"
                    className="flex flex-col items-center space-y-2 h-auto py-3"
                  >
                    <Telegram className="w-5 h-5" />
                    <span className="text-xs">Telegram</span>
                  </Button>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Mẹo chia sẻ hiệu quả:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Thêm lời nhắn cá nhân để tăng tỷ lệ chuyển đổi</li>
                    <li>• Chia sẻ trong các nhóm trader nghiêm túc</li>
                    <li>• Nhấn mạnh lợi ích: hoàn phí cao, dịch vụ Concierge</li>
                    <li>• Kể câu chuyện thành công của chính bạn</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Referral List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Danh sách giới thiệu
                  </div>
                  <Badge variant="secondary">
                    {referrals.length} người
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Chưa có lời giới thiệu nào
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Bắt đầu chia sẻ mã giới thiệu của bạn để mời bạn bè tham gia
                    </p>
                    <Button onClick={() => copyToClipboard(referralLink, 'Referral link')}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Chia sẻ ngay
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {referral.avatar ? (
                              <img src={referral.avatar} alt={referral.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <Users className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{referral.name}</p>
                            <p className="text-sm text-slate-600">{referral.email}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(referral.status)}`}>
                            {getStatusIcon(referral.status)}
                            <span className="capitalize">{referral.status}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(referral.joinedAt).toLocaleDateString('vi-VN')}
                          </p>
                          {referral.totalEarnings && (
                            <p className="text-sm font-semibold text-green-600 mt-1">
                              ${referral.totalEarnings.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Thống kê giới thiệu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {referralStats && (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ${referralStats.totalEarnings.toFixed(2)}
                      </div>
                      <p className="text-sm text-slate-600">Tổng thu nhập</p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-blue-600">
                          {referralStats.totalReferrals}
                        </div>
                        <p className="text-xs text-slate-600">Tổng giới thiệu</p>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {referralStats.activeReferrals}
                        </div>
                        <p className="text-xs text-slate-600">Đang hoạt động</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {referralStats.conversionRate.toFixed(1)}%
                      </div>
                      <p className="text-xs text-slate-600">Tỷ lệ chuyển đổi</p>
                    </div>

                    {referralStats.topEarner && (
                      <div className="bg-yellow-50 rounded-lg p-3 text-center">
                        <Crown className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-yellow-800">
                          Top Referrer!
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Rewards Tiers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Cấp thưởng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">Bronze</span>
                    </div>
                    <span className="text-sm text-slate-600">1-5 người</span>
                  </div>
                  <p className="text-sm text-slate-600">10% hoa hồng</p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Silver</span>
                    </div>
                    <span className="text-sm text-slate-600">6-15 người</span>
                  </div>
                  <p className="text-sm text-slate-600">15% hoa hồng</p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium">Gold</span>
                    </div>
                    <span className="text-sm text-slate-600">16+ người</span>
                  </div>
                  <p className="text-sm text-slate-600">20% hoa hồng</p>
                </div>
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Cách hoạt động
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Chia sẻ mã</p>
                    <p className="text-xs text-slate-600">Gửi mã hoặc link giới thiệu</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Bạn bè đăng ký</p>
                    <p className="text-xs text-slate-600">Sử dụng mã của bạn khi đăng ký</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Bắt đầu giao dịch</p>
                    <p className="text-xs text-slate-600">Bạn bè bắt đầu giao dịch</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-green-600">4</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Nhận thưởng</p>
                    <p className="text-xs text-slate-600">Nhận hoa hồng hàng tháng</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Liên kết nhanh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Hồ sơ
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Trợ giúp
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}