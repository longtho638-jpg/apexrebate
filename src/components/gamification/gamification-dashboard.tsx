'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Star, Trophy, Flame, Users, Target, TrendingUp, Award } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface GamificationData {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    tier: string;
    points: number;
    totalSaved: number;
    referralCount: number;
    streak: number;
    badgeCount: number;
    lastActiveAt: string;
  };
  achievements: Array<{
    id: string;
    achievement: {
      id: string;
      title: string;
      description: string;
      icon: string;
      category: string;
      points: number;
    };
    unlockedAt: string;
    progress: number;
    pointsAwarded: number;
  }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    points: number;
    createdAt: string;
  }>;
  referrals: Array<{
    id: string;
    createdAt: string;
  }>;
  tierProgress: {
    currentTier: string;
    nextTier: string | null;
    currentPoints: number;
    currentThreshold: number;
    nextThreshold: number | null;
    progressPercentage: number;
  };
}

const TIER_COLORS = {
  BRONZE: 'bg-amber-500',
  SILVER: 'bg-gray-400',
  GOLD: 'bg-yellow-500',
  PLATINUM: 'bg-purple-500',
  DIAMOND: 'bg-blue-500'
};

const TIER_ICONS = {
  BRONZE: Medal,
  SILVER: Award,
  GOLD: Trophy,
  PLATINUM: Crown,
  DIAMOND: Star
};

function Medal({ className }: { className?: string }) {
  return <div className={`w-6 h-6 rounded-full bg-amber-500 ${className}`} />;
}

export function GamificationDashboard() {
  const { data: session } = useSession();
  const t = useTranslations('gamification');
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (session?.user) {
      fetchGamificationData();
      // Track login activity
      fetch('/api/gamification/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'login' })
      });
    }
  }, [session]);

  const fetchGamificationData = async () => {
    try {
      const response = await fetch('/api/gamification/achievements');
      if (response.ok) {
        const data = await response.json();
        setGamificationData(data);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAchievements = async () => {
    try {
      const response = await fetch('/api/gamification/achievements', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setGamificationData(data.data);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!gamificationData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Không thể tải dữ liệu game hóa</p>
        </CardContent>
      </Card>
    );
  }

  const { user, achievements, recentActivities, tierProgress } = gamificationData;
  const TierIcon = TIER_ICONS[user.tier as keyof typeof TIER_ICONS];

  return (
    <div className="space-y-6">
      {/* User Tier Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || ''}
                    className="w-16 h-16 rounded-full border-4 border-white/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {user.name?.charAt(0) || user.email.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1">
                  <TierIcon className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name || user.email}</h2>
                <p className="text-white/80">Hạng {user.tier} • {user.points} điểm</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="font-semibold">{user.streak} ngày liên tiếp</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">{user.badgeCount} thành tựu</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng tiết kiệm</p>
                <p className="text-2xl font-bold text-green-600">
                  ${user.totalSaved.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lời mời</p>
                <p className="text-2xl font-bold text-blue-600">{user.referralCount}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điểm thưởng</p>
                <p className="text-2xl font-bold text-purple-600">{user.points}</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Thành tựu</p>
                <p className="text-2xl font-bold text-orange-600">{user.badgeCount}</p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Tiến độ hạng tiếp theo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Hạng {user.tier}</span>
              {tierProgress.nextTier && (
                <span className="font-medium">Hạng {tierProgress.nextTier}</span>
              )}
            </div>
            <Progress 
              value={tierProgress.progressPercentage} 
              className="h-3"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{tierProgress.currentPoints} điểm</span>
              {tierProgress.nextThreshold && (
                <span>{tierProgress.nextThreshold} điểm</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="achievements">Thành tựu</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thành tựu gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.slice(0, 5).map((userAchievement) => (
                  <div key={userAchievement.id} className="flex items-center space-x-3">
                    <div className="text-2xl">{userAchievement.achievement.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium">{userAchievement.achievement.title}</p>
                      <p className="text-sm text-gray-600">{userAchievement.achievement.description}</p>
                    </div>
                    <Badge variant="secondary">+{userAchievement.achievement.points} điểm</Badge>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Chưa có thành tựu nào</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tất cả thành tựu</CardTitle>
              <Button onClick={checkAchievements} size="sm">
                Kiểm tra thành tựu mới
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((userAchievement) => (
                  <div key={userAchievement.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-3xl">{userAchievement.achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{userAchievement.achievement.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {userAchievement.achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">
                            {userAchievement.achievement.category}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">
                            +{userAchievement.pointsAwarded} điểm
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <p className="text-gray-500 text-center py-8 col-span-2">
                    Hoàn thành các nhiệm vụ để mở khóa thành tựu đầu tiên của bạn!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    {activity.points > 0 && (
                      <Badge variant="secondary">+{activity.points} điểm</Badge>
                    )}
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Chưa có hoạt động nào</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}