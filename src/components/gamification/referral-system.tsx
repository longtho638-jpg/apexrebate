'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Users, Gift, Share2, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ReferralData {
  referralCode: string;
  referralCount: number;
  referralLink: string;
  referredUsers: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    totalSaved: number;
  }>;
}

export function ReferralSystem() {
  const { data: session } = useSession();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchReferralData();
    }
  }, [session]);

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referrals');
      if (response.ok) {
        const data = await response.json();
        setReferralData(data);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Đã sao chép vào clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Không thể sao chép');
    }
  };

  const applyReferralCode = async () => {
    if (!referralCode.trim()) {
      toast.error('Vui lòng nhập mã giới thiệu');
      return;
    }

    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode: referralCode.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Áp dụng mã giới thiệu thành công!');
        setReferralCode('');
        fetchReferralData();
      } else {
        toast.error(data.error || 'Không thể áp dụng mã giới thiệu');
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi');
    }
  };

  const shareReferralLink = async () => {
    if (!referralData?.referralLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tham gia ApexRebate',
          text: 'Tham gia ApexRebate để tối ưu hóa lợi nhuận giao dịch của bạn!',
          url: referralData.referralLink
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      copyToClipboard(referralData.referralLink);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mã giới thiệu</p>
                <p className="text-lg font-bold text-blue-600">
                  {referralData?.referralCode || '---'}
                </p>
              </div>
              <Gift className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lời mời thành công</p>
                <p className="text-lg font-bold text-green-600">
                  {referralData?.referralCount || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Phần thưởng</p>
                <p className="text-lg font-bold text-purple-600">50 điểm</p>
              </div>
              <Gift className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share Your Referral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="w-5 h-5" />
              <span>Chia sẻ lời mời</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Link giới thiệu của bạn
              </label>
              <div className="flex space-x-2">
                <Input
                  value={referralData?.referralLink || ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={() => copyToClipboard(referralData?.referralLink || '')}
                  variant="outline"
                  size="icon"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={shareReferralLink} className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ link
              </Button>
              <Button
                onClick={() => copyToClipboard(referralData?.referralCode || '')}
                variant="outline"
              >
                <Copy className="w-4 h-4 mr-2" />
                Sao chép mã
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Nhận thưởng khi giới thiệu</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 50 điểm cho mỗi người dùng mới đăng ký</li>
                <li>• Thành tựu đặc biệt cho 5, 10 lời mời thành công</li>
                <li>• Người được giới thiệu cũng nhận được phần thưởng</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Apply Referral Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="w-5 h-5" />
              <span>Áp dụng mã giới thiệu</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Nhập mã giới thiệu
              </label>
              <div className="flex space-x-2">
                <Input
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Nhập mã 8 ký tự"
                  maxLength={8}
                  className="flex-1 uppercase"
                />
                <Button onClick={applyReferralCode}>
                  Áp dụng
                </Button>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Lợi ích khi áp dụng mã</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Nhận điểm thưởng chào mừng</li>
                <li>• Bắt đầu hành trình tiết kiệm phí giao dịch</li>
                <li>• Truy cập các tính năng độc quyền</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referred Users List */}
      {referralData?.referredUsers && referralData.referredUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Người dùng đã giới thiệu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralData.referredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {user.name?.charAt(0) || user.email.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name || user.email}</p>
                      <p className="text-sm text-gray-600">
                        Tham gia {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      Tiết kiệm ${user.totalSaved.toFixed(2)}
                    </p>
                    <Badge variant="secondary">Hoạt động</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}