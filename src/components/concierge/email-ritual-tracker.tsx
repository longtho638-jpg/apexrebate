'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Mail, Clock, Trophy, Gift, Users, DollarSign } from 'lucide-react'

interface RitualStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  date?: string
  reward?: string
}

interface EmailRitualTrackerProps {
  userId?: string
}

export default function EmailRitualTracker({ userId = 'demo_user' }: EmailRitualTrackerProps) {
  const [steps, setSteps] = useState<RitualStep[]>([
    {
      id: 'welcome',
      title: 'Welcome Email',
      description: 'Account created and welcome message sent',
      icon: <Mail className="h-5 w-5" />,
      completed: true,
      date: '2024-11-07',
      reward: 'Welcome bonus: 50,000 VND'
    },
    {
      id: 'first_trade',
      title: 'First Trade Detected',
      description: 'Complete your first trade on supported exchange',
      icon: <DollarSign className="h-5 w-5" />,
      completed: false,
      reward: 'First trade bonus: 25,000 VND'
    },
    {
      id: 'claim_submitted',
      title: 'Rebate Claim Submitted',
      description: 'Submit your first rebate claim through concierge',
      icon: <CheckCircle className="h-5 w-5" />,
      completed: false,
      reward: 'Claim bonus: 15,000 VND'
    },
    {
      id: 'payout_received',
      title: 'First Payout Received',
      description: 'Receive your first rebate payout',
      icon: <Gift className="h-5 w-5" />,
      completed: false,
      reward: 'Payout bonus: 10,000 VND'
    },
    {
      id: 'referral_invite',
      title: 'Invite First Friend',
      description: 'Share ApexRebate with a fellow trader',
      icon: <Users className="h-5 w-5" />,
      completed: false,
      reward: 'Referral bonus: 20,000 VND'
    },
    {
      id: 'achievement_unlocked',
      title: 'Achievement Unlocked',
      description: 'Complete all onboarding steps',
      icon: <Trophy className="h-5 w-5" />,
      completed: false,
      reward: 'Achievement badge + 100,000 VND'
    }
  ])

  const completedSteps = steps.filter(step => step.completed).length
  const totalSteps = steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  // Mock progress updates for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setSteps(prev => prev.map(step =>
        step.id === 'first_trade'
          ? { ...step, completed: true, date: '2024-11-08' }
          : step
      ))
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const simulateStepCompletion = (stepId: string) => {
    setSteps(prev => prev.map(step =>
      step.id === stepId
        ? { ...step, completed: true, date: new Date().toISOString().split('T')[0] }
        : step
    ))
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Kaison Onboarding Journey
        </CardTitle>
        <CardDescription>
          Your personalized path to becoming a successful ApexRebate trader
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{completedSteps} of {totalSteps} completed</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>🎯 Aha Moment: First Payout</span>
            <span>🏆 Achievement: Full Completion</span>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4 p-4 rounded-lg border">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                step.completed
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {step.completed ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  step.icon
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${step.completed ? 'text-green-800' : 'text-gray-900'}`}>
                    {step.title}
                  </h3>
                  {step.completed && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Completed
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>

                {step.reward && (
                  <div className="flex items-center gap-2 text-sm">
                    <Gift className="h-4 w-4 text-purple-500" />
                    <span className="text-purple-600 font-medium">{step.reward}</span>
                  </div>
                )}

                {step.date && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Completed on {step.date}</span>
                  </div>
                )}

                {!step.completed && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => simulateStepCompletion(step.id)}
                    className="mt-2"
                  >
                    Mark as Complete (Demo)
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps & Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tips for Success</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Submit your first rebate claim through the concierge form</li>
              <li>• Check your email daily for progress updates and bonuses</li>
              <li>• Invite friends to unlock referral rewards</li>
              <li>• Join the Hang Sói community for exclusive insights</li>
            </ul>
          </CardContent>
        </Card>

        {/* Total Rewards Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-purple-900">Total Potential Rewards</h3>
              <p className="text-sm text-purple-700">
                Complete all steps to unlock maximum benefits
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">220,000 VND</div>
              <div className="text-sm text-purple-500">+ Exclusive badges</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
