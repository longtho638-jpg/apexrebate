'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Zap,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Crown
} from 'lucide-react'

interface CohortData {
  period: string
  cohort: string
  users: number
  revenue: number
  ltv: number
  churn: number
  retention: number[]
}

interface ARPUData {
  segment: string
  currentARPU: number
  targetARPU: number
  growth: number
  users: number
  potential: number
}

export default function ApexProPage() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [isLoading, setIsLoading] = useState(false)

  // Mock cohort data
  const cohortData: CohortData[] = [
    {
      period: '2024-10',
      cohort: 'October 2024',
      users: 89,
      revenue: 1250000,
      ltv: 14045,
      churn: 12,
      retention: [100, 89, 78, 65, 58, 52, 47, 43, 40, 38]
    },
    {
      period: '2024-09',
      cohort: 'September 2024',
      users: 156,
      revenue: 2100000,
      ltv: 13462,
      churn: 18,
      retention: [100, 92, 84, 76, 69, 63, 58, 54, 51, 48, 46, 44]
    },
    {
      period: '2024-08',
      cohort: 'August 2024',
      users: 203,
      revenue: 2800000,
      ltv: 13793,
      churn: 22,
      retention: [100, 95, 88, 81, 75, 70, 66, 62, 59, 56, 54, 52]
    }
  ]

  // Mock ARPU data
  const arpuData: ARPUData[] = [
    {
      segment: 'Bronze Tier',
      currentARPU: 8500,
      targetARPU: 12000,
      growth: 41,
      users: 456,
      potential: 1568000
    },
    {
      segment: 'Silver Tier',
      currentARPU: 18500,
      targetARPU: 25000,
      growth: 35,
      users: 234,
      potential: 1519000
    },
    {
      segment: 'Gold Tier',
      currentARPU: 32000,
      targetARPU: 45000,
      growth: 40,
      users: 89,
      potential: 1148000
    },
    {
      segment: 'Diamond Tier',
      currentARPU: 58000,
      targetARPU: 75000,
      growth: 29,
      users: 23,
      potential: 391000
    }
  ]

  const totalRevenue = cohortData.reduce((sum, cohort) => sum + cohort.revenue, 0)
  const totalUsers = cohortData.reduce((sum, cohort) => sum + cohort.users, 0)
  const avgLTV = Math.round(cohortData.reduce((sum, cohort) => sum + cohort.ltv, 0) / cohortData.length)
  const totalPotential = arpuData.reduce((sum, segment) => sum + segment.potential, 0)

  const refreshData = async () => {
    setIsLoading(true)
    // Mock API call
    setTimeout(() => setIsLoading(false), 1500)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            ApexPro Analytics
          </h1>
          <p className="text-muted-foreground">
            Advanced analytics for scaling from 100 to 1000+ users
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshData} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalRevenue / 1000000).toFixed(1)}M VND</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              +24.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              +18.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average LTV</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLTV.toLocaleString()} VND</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              +12.8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU Potential</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalPotential / 1000000).toFixed(1)}M VND</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <Zap className="h-3 w-3 text-blue-500 mr-1" />
              Untapped opportunity
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cohorts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="arpu">ARPU Optimization</TabsTrigger>
          <TabsTrigger value="predictions">Growth Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="cohorts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Performance</CardTitle>
              <CardDescription>
                Track user cohorts and their lifetime value over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cohortData.map((cohort) => (
                  <div key={cohort.period} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{cohort.cohort}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cohort.users} users • {cohort.revenue.toLocaleString()} VND revenue
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {cohort.ltv.toLocaleString()} VND LTV
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {cohort.churn}% churn rate
                        </div>
                      </div>
                    </div>

                    {/* Retention Curve */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Retention Rate (Months)</span>
                        <span>{cohort.retention[cohort.retention.length - 1]}% at month 10</span>
                      </div>
                      <div className="grid grid-cols-10 gap-1">
                        {cohort.retention.map((rate, index) => (
                          <div key={index} className="text-center">
                            <div
                              className="bg-blue-500 rounded-t mx-auto"
                              style={{
                                height: `${rate * 0.6}px`,
                                width: '20px',
                                minHeight: '4px'
                              }}
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arpu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ARPU Optimization by Tier</CardTitle>
              <CardDescription>
                Identify opportunities to increase average revenue per user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {arpuData.map((segment) => (
                  <div key={segment.segment} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{segment.segment}</h3>
                        <p className="text-sm text-muted-foreground">
                          {segment.users} users
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        +{segment.growth}% potential
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current ARPU</div>
                        <div className="font-medium">{segment.currentARPU.toLocaleString()} VND</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Target ARPU</div>
                        <div className="font-medium text-blue-600">{segment.targetARPU.toLocaleString()} VND</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Potential Revenue</div>
                        <div className="font-medium text-green-600">{(segment.potential / 1000000).toFixed(1)}M VND</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress to Target</span>
                        <span>{Math.round((segment.currentARPU / segment.targetARPU) * 100)}%</span>
                      </div>
                      <Progress value={(segment.currentARPU / segment.targetARPU) * 100} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Upsell Opportunities
                      </Button>
                      <Button size="sm" variant="outline">
                        Create Campaign
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Projections</CardTitle>
              <CardDescription>
                AI-powered predictions for scaling to 1000+ users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Revenue Forecast</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Next 30 days</span>
                      <span className="font-medium">8.2M VND</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Next 90 days</span>
                      <span className="font-medium">24.5M VND</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Next 6 months</span>
                      <span className="font-medium">89.3M VND</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">User Growth</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current users</span>
                      <span className="font-medium">{totalUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Target: 1000 users</span>
                      <span className="font-medium text-blue-600">3 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Target: 5000 users</span>
                      <span className="font-medium text-green-600">8 months</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Key Recommendations</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Focus on Silver tier upgrades - highest ROI potential</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Implement referral program for organic growth</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>Launch gamification features to boost engagement</span>
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
