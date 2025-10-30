import { db } from '@/lib/db'
import { emailService, EmailType } from '@/lib/email'
import { ZAI } from 'z-ai-web-dev-sdk'

export interface MarketingCampaign {
  id: string
  name: string
  type: CampaignType
  trigger: CampaignTrigger
  segments: UserSegment[]
  content: CampaignContent
  schedule: CampaignSchedule
  status: 'draft' | 'active' | 'paused' | 'completed'
  metrics: CampaignMetrics
  createdAt: Date
  updatedAt: Date
}

export enum CampaignType {
  WELCOME_SERIES = 'welcome_series',
  RE_ENGAGEMENT = 're_engagement',
  EDUCATIONAL = 'educational',
  PROMOTIONAL = 'promotional',
  REFERRAL = 'referral',
  MILESTONE = 'milestone',
  NEWSLETTER = 'newsletter'
}

export enum CampaignTrigger {
  USER_SIGNUP = 'user_signup',
  FIRST_PAYOUT = 'first_payout',
  INACTIVITY = 'inactivity',
  TIER_UPGRADE = 'tier_upgrade',
  ACHIEVEMENT_UNLOCK = 'achievement_unlock',
  SCHEDULED = 'scheduled',
  BEHAVIOR_BASED = 'behavior_based'
}

export interface UserSegment {
  id: string
  name: string
  criteria: SegmentCriteria
  userCount?: number
}

export interface SegmentCriteria {
  tradingVolume?: { min?: number; max?: number }
  registrationDate?: { from?: Date; to?: Date }
  lastActive?: { before?: Date; after?: Date }
  tier?: string[]
  broker?: string[]
  referralCount?: { min?: number; max?: number }
  hasPayouts?: boolean
  emailVerified?: boolean
}

export interface CampaignContent {
  subject: string
  template: string
  personalization: PersonalizationRule[]
  cta?: CallToAction
}

export interface PersonalizationRule {
  field: string
  type: 'dynamic' | 'conditional'
  template: string
  condition?: string
}

export interface CallToAction {
  text: string
  url: string
  type: 'primary' | 'secondary'
}

export interface CampaignSchedule {
  type: 'immediate' | 'delayed' | 'recurring'
  delay?: number // in minutes
  frequency?: 'daily' | 'weekly' | 'monthly'
  sendTime?: string // HH:MM format
  timezone?: string
  endDate?: Date
}

export interface CampaignMetrics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  unsubscribed: number
  revenue?: number
}

export class MarketingAutomation {
  private static instance: MarketingAutomation
  private zai: any = null

  private constructor() {}

  static getInstance(): MarketingAutomation {
    if (!MarketingAutomation.instance) {
      MarketingAutomation.instance = new MarketingAutomation()
    }
    return MarketingAutomation.instance
  }

  async initializeZAI() {
    try {
      this.zai = await ZAI.create()
      console.log('Marketing automation initialized with ZAI SDK')
    } catch (error) {
      console.error('Failed to initialize ZAI SDK for marketing:', error)
    }
  }

  async createWelcomeSeries(userId: string, userEmail: string, userName: string) {
    const welcomeEmails = [
      {
        type: EmailType.WELCOME,
        delay: 0, // Immediate
        data: { userName, isFirstEmail: true }
      },
      {
        type: EmailType.WEEKLY_DIGEST,
        delay: 1440, // 1 day later
        data: { userName, isWelcome: true, day: 1 }
      },
      {
        type: EmailType.CONCIERGE_UPDATE,
        delay: 4320, // 3 days later
        data: { userName, personalTip: true }
      },
      {
        type: EmailType.WEEKLY_DIGEST,
        delay: 10080, // 7 days later
        data: { userName, isWelcome: true, day: 7 }
      }
    ]

    for (const email of welcomeEmails) {
      const scheduledFor = new Date(Date.now() + email.delay * 60 * 1000)
      await emailService.scheduleEmail(
        userId,
        email.type,
        userEmail,
        scheduledFor,
        email.data
      )
    }

    console.log(`✅ Welcome series created for user ${userId}`)
  }

  async createReEngagementCampaign() {
    try {
      // Find inactive users (30+ days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      const inactiveUsers = await db.user.findMany({
        where: {
          emailVerified: true,
          lastActiveAt: { lt: thirtyDaysAgo },
          totalSaved: { gt: 0 } // Only users who have saved something
        },
        take: 100
      })

      console.log(`📊 Found ${inactiveUsers.length} inactive users for re-engagement`)

      for (const user of inactiveUsers) {
        const daysInactive = Math.floor(
          (Date.now() - user.lastActiveAt.getTime()) / (24 * 60 * 60 * 1000)
        )

        await emailService.sendImmediateEmail(
          user.id,
          EmailType.INACTIVITY_WARNING,
          user.email,
          {
            userName: user.name,
            daysInactive,
            totalSaved: user.totalSaved,
            lastActiveDate: user.lastActiveAt.toLocaleDateString('vi-VN')
          }
        )
      }

    } catch (error) {
      console.error('Failed to create re-engagement campaign:', error)
    }
  }

  async createEducationalSeries() {
    const educationalTopics = [
      {
        type: EmailType.WEEKLY_DIGEST,
        topic: 'Trading Fee Optimization',
        data: { educationalTopic: 'fee_optimization', isEducational: true }
      },
      {
        type: EmailType.WEEKLY_DIGEST,
        topic: 'Risk Management',
        data: { educationalTopic: 'risk_management', isEducational: true }
      },
      {
        type: EmailType.WEEKLY_DIGEST,
        topic: 'Advanced Trading Strategies',
        data: { educationalTopic: 'advanced_strategies', isEducational: true }
      }
    ]

    // Get active users who might benefit from educational content
    const activeUsers = await db.user.findMany({
      where: {
        emailVerified: true,
        lastActiveAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      take: 200
    })

    for (const user of activeUsers) {
      // Send one educational email per week
      const randomTopic = educationalTopics[Math.floor(Math.random() * educationalTopics.length)]
      
      await emailService.sendImmediateEmail(
        user.id,
        randomTopic.type,
        user.email,
        {
          ...randomTopic.data,
          userName: user.name,
          currentTier: user.tier,
          totalSaved: user.totalSaved
        }
      )
    }
  }

  async createReferralCampaign() {
    try {
      // Find users with high referral potential
      const potentialReferrers = await db.user.findMany({
        where: {
          emailVerified: true,
          totalSaved: { gt: 100 }, // Users who have saved significant amount
          referralCount: { lt: 5 } // But haven't referred many people yet
        },
        take: 50
      })

      for (const user of potentialReferrers) {
        await emailService.sendImmediateEmail(
          user.id,
          EmailType.REFERRAL_SUCCESS,
          user.email,
          {
            userName: user.name,
            currentReferrals: user.referralCount,
            totalSaved: user.totalSaved,
            referralCode: user.referralCode,
            potentialEarnings: user.referralCount * 50 // Estimate potential earnings
          }
        )
      }

    } catch (error) {
      console.error('Failed to create referral campaign:', error)
    }
  }

  async generatePersonalizedContent(user: any, campaignType: CampaignType): Promise<string> {
    if (!this.zai) {
      await this.initializeZAI()
    }

    try {
      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a marketing copywriter for ApexRebate, a premium trading rebate service.
            Generate personalized marketing content based on user data and campaign type.
            The content should be:
            - Highly personalized with specific user data
            - Motivational and action-oriented
            - Professional yet friendly tone
            - Include relevant metrics and achievements
            - Focus on value proposition`
          },
          {
            role: 'user',
            content: `Generate personalized marketing content for:
            
            Campaign Type: ${campaignType}
            User Data:
            - Name: ${user.name}
            - Current Tier: ${user.tier}
            - Total Saved: $${user.totalSaved}
            - Referral Count: ${user.referralCount}
            - Preferred Broker: ${user.preferredBroker}
            - Trading Volume: $${user.tradingVolume}
            - Member Since: ${user.createdAt}
            
            Create content that references their specific achievements and encourages the desired action.`
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })

      return completion.choices[0]?.message?.content || ''

    } catch (error) {
      console.error('Failed to generate personalized content:', error)
      return this.getFallbackContent(user, campaignType)
    }
  }

  private getFallbackContent(user: any, campaignType: CampaignType): string {
    const templates = {
      [CampaignType.RE_ENGAGEMENT]: `Chào ${user.name}, chúng tôi nhớ bạn! Bạn đã tiết kiệm được $${user.totalSaved} kể từ khi tham gia. Hãy quay lại và tiếp tục hành trình tối ưu hóa lợi nhuận nhé!`,
      [CampaignType.REFERRAL]: `Chào ${user.name}, với ${user.referralCount} lời giới thiệu, bạn đang làm rất tốt! Mời thêm bạn bè để nhận thêm ưu đãi từ ApexRebate.`,
      [CampaignType.EDUCATIONAL]: `Chào ${user.name}, với tư cách là thành viên ${user.tier}, chúng tôi có了一些 chiến lược giao dịch nâng cao dành riêng cho bạn.`,
      [CampaignType.MILESTONE]: `Chúc mừng ${user.name}! Bạn đã đạt được cột mốc tiết kiệm $${user.totalSaved} tại ApexRebate.`
    }

    return templates[campaignType] || `Chào ${user.name}, cảm ơn bạn đã là thành viên ApexRebate!`
  }

  async createMilestoneCampaigns() {
    try {
      // Find users approaching milestones
      const users = await db.user.findMany({
        where: {
          emailVerified: true,
          totalSaved: { gt: 0 }
        },
        take: 100
      })

      for (const user of users) {
        const milestones = [
          { threshold: 1000, message: 'sắp đạt $1,000 tiết kiệm' },
          { threshold: 5000, message: 'sắp đạt $5,000 tiết kiệm' },
          { threshold: 10000, message: 'sắp đạt $10,000 tiết kiệm' },
          { threshold: 25000, message: 'sắp đạt $25,000 tiết kiệm' }
        ]

        for (const milestone of milestones) {
          const progress = user.totalSaved / milestone.threshold
          
          if (progress >= 0.8 && progress < 1.0) { // 80-99% towards milestone
            await emailService.sendImmediateEmail(
              user.id,
              EmailType.MILESTONE_REACHED,
              user.email,
              {
                userName: user.name,
                currentSaved: user.totalSaved,
                milestoneThreshold: milestone.threshold,
                progress: Math.round(progress * 100),
                remaining: milestone.threshold - user.totalSaved,
                message: milestone.message
              }
            )
            break // Only send one milestone email per user
          }
        }
      }

    } catch (error) {
      console.error('Failed to create milestone campaigns:', error)
    }
  }

  async trackEmailMetrics(emailId: string, event: string, data?: any) {
    try {
      // In a real implementation, you would track opens, clicks, etc.
      console.log(`📊 Email event tracked: ${emailId} - ${event}`, data)
      
      // Update campaign metrics
      // This would integrate with your email service provider's webhooks
      
    } catch (error) {
      console.error('Failed to track email metrics:', error)
    }
  }

  async getSegmentUsers(criteria: SegmentCriteria): Promise<any[]> {
    try {
      const whereClause: any = {}

      if (criteria.tradingVolume) {
        whereClause.tradingVolume = {}
        if (criteria.tradingVolume.min) whereClause.tradingVolume.gte = criteria.tradingVolume.min
        if (criteria.tradingVolume.max) whereClause.tradingVolume.lte = criteria.tradingVolume.max
      }

      if (criteria.registrationDate) {
        whereClause.createdAt = {}
        if (criteria.registrationDate.from) whereClause.createdAt.gte = criteria.registrationDate.from
        if (criteria.registrationDate.to) whereClause.createdAt.lte = criteria.registrationDate.to
      }

      if (criteria.lastActive) {
        whereClause.lastActiveAt = {}
        if (criteria.lastActive.before) whereClause.lastActiveAt.lte = criteria.lastActive.before
        if (criteria.lastActive.after) whereClause.lastActiveAt.gte = criteria.lastActive.after
      }

      if (criteria.tier && criteria.tier.length > 0) {
        whereClause.tier = { in: criteria.tier }
      }

      if (criteria.broker && criteria.broker.length > 0) {
        whereClause.preferredBroker = { in: criteria.broker }
      }

      if (criteria.referralCount) {
        whereClause.referralCount = {}
        if (criteria.referralCount.min) whereClause.referralCount.gte = criteria.referralCount.min
        if (criteria.referralCount.max) whereClause.referralCount.lte = criteria.referralCount.max
      }

      if (criteria.hasPayouts !== undefined) {
        if (criteria.hasPayouts) {
          whereClause.payouts = { some: {} }
        } else {
          whereClause.payouts = { none: {} }
        }
      }

      if (criteria.emailVerified !== undefined) {
        whereClause.emailVerified = criteria.emailVerified
      }

      const users = await db.user.findMany({
        where: whereClause,
        take: 1000
      })

      return users

    } catch (error) {
      console.error('Failed to get segment users:', error)
      return []
    }
  }

  async runAutomatedCampaigns() {
    console.log('🚀 Starting automated marketing campaigns...')

    try {
      // Run different campaign types
      await this.createReEngagementCampaign()
      await this.createEducationalSeries()
      await this.createReferralCampaign()
      await this.createMilestoneCampaigns()

      console.log('✅ Automated campaigns completed')
    } catch (error) {
      console.error('Failed to run automated campaigns:', error)
    }
  }

  async generateCampaignReport(campaignId: string) {
    try {
      // Generate comprehensive campaign report
      const report = {
        campaignId,
        generatedAt: new Date(),
        summary: 'Campaign performance report',
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          revenue: 0
        },
        insights: [],
        recommendations: []
      }

      return report
    } catch (error) {
      console.error('Failed to generate campaign report:', error)
      return null
    }
  }
}

export const marketingAutomation = MarketingAutomation.getInstance()