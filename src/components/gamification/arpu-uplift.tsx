'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trophy,
  Star,
  Zap,
  Target,
  Gift,
  TrendingUp,
  Award,
  Crown,
  Flame,
  DollarSign,
  Users,
  Calendar,
  Rocket
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  progress: number
  maxProgress: number
  reward: {
    type: 'bonus' | 'badge' | 'feature'
    value: string
    amount?: number
  }
  unlocked: boolean
  category: 'trading' | 'social' | 'engagement' | 'revenue'
}

interface StreakData {
  current: number
  longest: number
  multiplier: number
  nextReward: number
}

interface LeaderboardEntry {
  rank: number
  user: string
  score: number
  change: number
  avatar?: string
}

export default function ARPUUplift() {
  const [activeTab, setActiveTab] = useState('achievements')

  // Mock achievements for ARPU uplift
  const achievements: Achievement[] = [
    {
      id: 'first_purchase',
      title: 'First Purchase',
      description: 'Make your first premium purchase',
      icon: <DollarSign className="h-5 w-5" />,
      progress: 1,
      maxProgress: 1,
      reward: { type: 'bonus', value: 'Welcome Bonus', amount: 50000 },
      unlocked: true,
      category: 'revenue'
    },
    {
      id: 'trading_streak',
      title: 'Trading Champion',
      description: 'Complete 30 consecutive trading days',
      icon: <Flame className="h-5 w-5" />,
      progress: 18,
      maxProgress: 30,
      reward: { type: 'badge', value: 'Consistency King' },
      unlocked: false,
      category: 'trading'
    },
    {
      id: 'referral_master',
      title: 'Referral Master',
      description: 'Bring 10 friends to ApexRebate',
      icon: <Users className="h-5 w-5" />,
      progress: 6,
      maxProgress: 10,
      reward: { type: 'bonus', value: 'Referral Bonus', amount: 200000 },
      unlocked: false,
      category: 'social'
    },
    {
      id: 'high_roller',
      title: 'High Roller',
      description: 'Accumulate 5M VND in trading volume',
      icon: <Crown className="h-5 w-5" />,
      progress: 3200000,
      maxProgress: 5000000,
      reward: { type: 'feature', value: 'VIP Support Access' },
      unlocked: false,
      category: 'revenue'
    },
    {
      id: 'community_leader',
      title: 'Community Leader',
      description: 'Reach 1000 reputation points',
      icon: <Award className="h-5 w-5" />,
      progress: 750,
      maxProgress: 1000,
      reward: { type: 'badge', value: 'Community Legend' },
      unlocked: false,
      category: 'engagement'
    },
    {
      id: 'upgrade_champion',
      title: 'Upgrade Champion',
      description: 'Upgrade to Diamond tier',
      icon: <Rocket className="h-5 w-5" />,
      progress: 0,
      maxProgress: 1,
      reward: { type: 'bonus', value: 'Diamond Welcome', amount: 500000 },
      unlocked: false,
      category: 'revenue'
    }
  ]

  // Mock streak data
  const streakData: StreakData = {
    current: 12,
    longest: 28,
    multiplier: 1.5,
    nextReward: 5
  }

  // Mock leaderboard
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, user: 'Nguyễn Thị Alpha', score: 9850, change: 0, avatar: undefined },
    { rank: 2, user: 'Trần Văn Beta', score: 8720, change: 1, avatar: undefined },
    { rank: 3, user: 'Lê Hoàng Gamma', score: 8430, change: -1, avatar: undefined },
    { rank: 4, user: 'Current User', score: 7890, change: 2, avatar: undefined },
    { rank: 5, user: 'Phạm Minh Delta', score: 7650, change: 0, avatar: undefined }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue':
        return 'bg-green-100 text-green-800'
      case 'trading':
        return 'bg-blue-100 text-blue-800'
      case 'social':
        return 'bg-purple-100 text-purple-800'
      case 'engagement':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'bonus':
        return <DollarSign className="h-4 w-4 text-green-500" />
      case 'badge':
        return <Award className="h-4 w-4 text-yellow-500" />
      case 'feature':
        return <Star className="h-4 w-4 text-purple-500" />
      default:
        return <Gift className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Gamification & ARPU Uplift
        </h2>
        <p className="text-muted-foreground">
          Unlock achievements, build streaks, and boost your earnings
        </p>
      </div>

      {/* Current Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streakData.current} days</div>
            <p className="text-xs text-muted-foreground">
              Longest: {streakData.longest} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">750</div>
            <p className="text-xs text-muted-foreground">
              +45 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU Multiplier</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streakData.multiplier}x</div>
            <p className="text-xs text-muted-foreground">
              Next reward in {streakData.nextReward} days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`transition-all ${achievement.unlocked ? 'ring-2 ring-yellow-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        {achievement.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <Badge className={getCategoryColor(achievement.category)} variant="secondary">
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <div className="text-yellow-500">
                        <Trophy className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{achievement.description}</CardDescription>

                  {!achievement.unlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.progress} / {achievement.maxProgress}</span>
                      </div>
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    {getRewardIcon(achievement.reward.type)}
                    <div>
                      <div className="font-medium">{achievement.reward.value}</div>
                      {achievement.reward.amount && (
                        <div className="text-sm text-green-600">
                          {achievement.reward.amount.toLocaleString()} VND
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-orange-500" />
                Trading Streaks
              </CardTitle>
              <CardDescription>
                Build consecutive trading days for bonus multipliers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-orange-500 mb-2">
                  🔥 {streakData.current}
                </div>
                <div className="text-lg text-muted-foreground">Current Streak</div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{streakData.longest}</div>
                  <div className="text-sm text-muted-foreground">Longest Streak</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{streakData.multiplier}x</div>
                  <div className="text-sm text-muted-foreground">Current Multiplier</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{streakData.nextReward}</div>
                  <div className="text-sm text-muted-foreground">Days to Next Reward</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Streak Rewards</h3>
                <div className="space-y-2">
                  {[7, 14, 21, 30, 50, 75, 100].map((days) => (
                    <div key={days} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          streakData.current >= days ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {streakData.current >= days ? '✓' : days}
                        </div>
                        <div>
                          <div className="font-medium">{days} Day Streak</div>
                          <div className="text-sm text-muted-foreground">
                            {days >= 30 ? 'VIP Badge + ' : ''}{(days * 1000).toLocaleString()} VND Bonus
                          </div>
                        </div>
                      </div>
                      {streakData.current >= days && (
                        <Badge className="bg-green-100 text-green-800">Earned</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reputation Leaderboard</CardTitle>
              <CardDescription>
                Top performers this month - climb the ranks!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.rank} className={`flex items-center gap-4 p-3 rounded-lg ${
                    entry.user === 'Current User' ? 'bg-blue-50 border-blue-200' : 'border'
                  }`}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold">
                      {entry.rank}
                    </div>

                    <div className="flex-1">
                      <div className="font-medium">{entry.user}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.score.toLocaleString()} reputation points
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.change > 0 && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {entry.change < 0 && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                      <span className={`text-sm ${
                        entry.change > 0 ? 'text-green-600' :
                        entry.change < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {entry.change !== 0 && (entry.change > 0 ? '+' : '')}{entry.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border">
                <div className="text-center">
                  <h3 className="font-medium text-orange-900 mb-2">Your Ranking</h3>
                  <div className="text-2xl font-bold text-orange-600">#4</div>
                  <div className="text-sm text-orange-700">Up 2 positions this week!</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-6 w-6 text-purple-500" />
                Available Rewards
              </CardTitle>
              <CardDescription>
                Unlock these bonuses through achievements and streaks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Cash Bonuses</div>
                      <div className="text-sm text-muted-foreground">Direct VND rewards</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>• Welcome Bonus: 50,000 VND</div>
                    <div>• Referral Bonus: 20,000 VND per friend</div>
                    <div>• Streak Bonus: 1,000 VND per day</div>
                    <div>• Upgrade Bonus: Up to 500,000 VND</div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-medium">Exclusive Badges</div>
                      <div className="text-sm text-muted-foreground">Recognition & status</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>• Consistency King</div>
                    <div>• Community Legend</div>
                    <div>• Referral Champion</div>
                    <div>• VIP Trader</div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="font-medium">Premium Features</div>
                      <div className="text-sm text-muted-foreground">Enhanced capabilities</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>• Priority Support</div>
                    <div>• Advanced Analytics</div>
                    <div>• Custom Alerts</div>
                    <div>• API Access</div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">ARPU Multipliers</div>
                      <div className="text-sm text-muted-foreground">Boost your earnings</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>• Streak Multiplier: Up to 3x</div>
                    <div>• Tier Bonus: +50% for Diamond</div>
                    <div>• Referral Boost: +25% from network</div>
                    <div>• Achievement Bonus: +10-100%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
