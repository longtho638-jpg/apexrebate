'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  FileText,
  Trophy,
  Mail,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import EmailRitualTracker from '@/components/concierge/email-ritual-tracker'
import WallOfFame from '@/components/hang-soi/wall-of-fame'

export default function ConciergePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          Concierge Dashboard - Phase 1
        </h1>
        <p className="text-muted-foreground">
          Your personalized journey to becoming a successful ApexRebate trader
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="/concierge/claim">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Submit Rebate Claim
              </CardTitle>
              <CardDescription>
                Manually submit your trading rebate claim for concierge processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Manual Process
                </Badge>
                <ArrowRight className="h-4 w-4 text-blue-500" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="#onboarding">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-500" />
                Email Ritual Tracker
              </CardTitle>
              <CardDescription>
                Track your onboarding progress and claim bonuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  220K VND Rewards
                </Badge>
                <ArrowRight className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href="#wall-of-fame">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Wall of Fame
              </CardTitle>
              <CardDescription>
                See top performers and community champions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  1,247 Kaison
                </Badge>
                <ArrowRight className="h-4 w-4 text-yellow-500" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="onboarding" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="onboarding" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Onboarding Journey
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Hang Sói Community
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Your Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding" className="space-y-4">
          <EmailRitualTracker />
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <WallOfFame />
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Concierge Status
              </CardTitle>
              <CardDescription>
                Current status and next steps in your ApexRebate journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-medium">Account Status</h3>
                  <Badge className="bg-green-100 text-green-800">Active Kaison</Badge>
                  <p className="text-sm text-muted-foreground">
                    Member since: November 7, 2024
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Current Tier</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Bronze Tier
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Next: Silver (50 more trades)
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Quick Stats</h3>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">2</div>
                    <div className="text-sm text-muted-foreground">Claims Submitted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">125,000</div>
                    <div className="text-sm text-muted-foreground">VND Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">5</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">2</div>
                    <div className="text-sm text-muted-foreground">Referrals</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Next Recommended Actions</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-blue-900">Submit First Rebate Claim</div>
                      <div className="text-sm text-blue-700">Earn 15,000 VND bonus upon completion</div>
                    </div>
                    <Button size="sm" className="ml-auto bg-blue-600 hover:bg-blue-700">
                      <Link href="/concierge/claim">Start Now</Link>
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <User className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium text-green-900">Invite a Friend</div>
                      <div className="text-sm text-green-700">Unlock 20,000 VND referral bonus</div>
                    </div>
                    <Button size="sm" variant="outline" className="ml-auto">
                      Share Link
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Phase 1 Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-purple-900">
              🎯 Phase 1: Manual Excellence - Jobs' Simplicity
            </h2>
            <p className="text-purple-700 max-w-2xl mx-auto">
              We're focusing on perfecting the concierge experience for our first 100 'Kaison' traders.
              Every interaction is personal, every process is manual, and every outcome delivers the 'aha' moment
              of understanding ApexRebate's value.
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                Manual Processing
              </Badge>
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                Personal Touch
              </Badge>
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                Guaranteed Success
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
