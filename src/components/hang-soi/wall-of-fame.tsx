'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Crown,
  Star,
  Zap
} from 'lucide-react'

interface FameMember {
  id: string
  name: string
  avatar?: string
  rank: number
  totalRebates: number
  tradesCount: number
  streakDays: number
  badges: string[]
  joinDate: string
  isTopPerformer?: boolean
  achievement?: string
}

export default function WallOfFame() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all-time'>('monthly')

  // Mock data for top performers
  const topPerformers: FameMember[] = [
    {
      id: '1',
      name: 'Nguyễn Thị Alpha',
      rank: 1,
      totalRebates: 2500000,
      tradesCount: 145,
      streakDays: 30,
      badges: ['Alpha Trader', 'Consistency King', 'High Volume'],
      joinDate: '2024-01-15',
      isTopPerformer: true,
      achievement: 'First Million VND in Rebates'
    },
    {
      id: '2',
      name: 'Trần Văn Beta',
      rank: 2,
      totalRebates: 1800000,
      tradesCount: 98,
      streakDays: 25,
      badges: ['Rising Star', 'Referral Champion'],
      joinDate: '2024-02-20',
      achievement: 'Most Referrals This Month'
    },
    {
      id: '3',
      name: 'Lê Hoàng Gamma',
      rank: 3,
      totalRebates: 1650000,
      tradesCount: 112,
      streakDays: 20,
      badges: ['Consistent Trader', 'Early Adopter'],
      joinDate: '2024-01-10',
      achievement: 'Longest Streak: 30 Days'
    },
    {
      id: '4',
      name: 'Phạm Minh Delta',
      rank: 4,
      totalRebates: 1420000,
      tradesCount: 87,
      streakDays: 15,
      badges: ['Newcomer', 'Fast Learner'],
      joinDate: '2024-09-01',
      achievement: 'Fastest Growth This Quarter'
    },
    {
      id: '5',
      name: 'Hoàng Thị Epsilon',
      rank: 5,
      totalRebates: 1280000,
      tradesCount: 76,
      streakDays: 12,
      badges: ['Community Builder'],
      joinDate: '2024-03-15',
      achievement: 'Most Helpful Community Member'
    }
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <Trophy className="h-6 w-6 text-purple-500" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500'
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600'
      default:
        return 'bg-gradient-to-r from-purple-400 to-purple-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          🐺 Wall of Fame - Hang Sói
        </h2>
        <p className="text-muted-foreground">
          Celebrating our top performers and community champions
        </p>
      </div>

      <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="all-time">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value={timeframe} className="space-y-4">
          {/* Top 3 Podium */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {topPerformers.slice(0, 3).map((member, index) => (
              <Card key={member.id} className={`relative overflow-hidden ${index === 0 ? 'md:col-span-1 md:row-span-2' : ''}`}>
                <div className={`absolute top-0 left-0 right-0 h-2 ${getRankColor(member.rank)}`} />
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    {getRankIcon(member.rank)}
                  </div>
                  <Avatar className="w-16 h-16 mx-auto mb-2">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-lg font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {member.badges.map((badge) => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {member.totalRebates.toLocaleString()} VND
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.tradesCount} trades • {member.streakDays} day streak
                  </div>
                  {member.achievement && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-yellow-800 text-sm">
                        <Star className="h-4 w-4" />
                        {member.achievement}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Full Leaderboard
              </CardTitle>
              <CardDescription>
                Complete rankings of our top performing Kaison traders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                      {member.rank}
                    </div>

                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="font-medium">{member.name}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {member.totalRebates.toLocaleString()} VND
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {member.tradesCount} trades
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {member.streakDays} day streak
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.badges.map((badge) => (
                          <Badge key={badge} variant="outline" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      {member.achievement && (
                        <div className="text-xs text-yellow-600 font-medium">
                          {member.achievement}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Community Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Kaison</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  +23 this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rebates</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127M VND</div>
                <p className="text-xs text-muted-foreground">
                  +8.2M this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Streak</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18 days</div>
                <p className="text-xs text-muted-foreground">
                  +2 days improvement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Traders</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">892</div>
                <p className="text-xs text-muted-foreground">
                  71% of total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🚀 Ready to Join the Wall of Fame?
              </h3>
              <p className="text-blue-700 mb-4">
                Start trading smarter with ApexRebate and climb the rankings
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start Your Journey
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
