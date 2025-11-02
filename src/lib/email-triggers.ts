// Email triggers for ApexRebate
import { db } from '@/lib/db'

export interface EmailTriggerData {
  userId: string
  type: 'welcome' | 'cashback' | 'milestone' | 'referral' | 'monthly_report'
  data: Record<string, any>
}

class EmailTriggers {
  static async triggerWelcomeEmail(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) return
    
    // Send welcome email logic here
    console.log(`Welcome email sent to ${user.email}`)
  }

  static async triggerCashbackEmail(userId: string, amount: number, period: string) {
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) return
    
    // Send cashback email logic here
    console.log(`Cashback email sent to ${user.email}: $${amount} for ${period}`)
  }

  static async triggerMilestoneEmail(userId: string, milestone: string) {
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) return
    
    // Send milestone email logic here
    console.log(`Milestone email sent to ${user.email}: ${milestone}`)
  }

  static async triggerReferralEmail(userId: string, referralData: any) {
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) return
    
    // Send referral email logic here
    console.log(`Referral email sent to ${user.email}`)
  }

  static async triggerMonthlyReport(userId: string, reportData: any) {
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) return
    
    // Send monthly report email logic here
    console.log(`Monthly report sent to ${user.email}`)
  }

  static async checkInactivityWarnings() {
    console.log('🔍 Checking for inactive users...')
    
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // Find users who haven't logged in for 30+ days
      const inactiveUsers = await db.user.findMany({
        where: {
          lastActiveAt: {
            lt: thirtyDaysAgo
          }
        },
        take: 50
      })

      console.log(`Found ${inactiveUsers.length} inactive users`)

      for (const user of inactiveUsers) {
        console.log(`Sending inactivity warning to ${user.email}`)
        // TODO: Send email via email service
      }

      return inactiveUsers.length
    } catch (error) {
      console.error('Error checking inactivity:', error)
      return 0
    }
  }

  static async sendConciergeUpdates() {
    console.log('🎯 Sending concierge updates...')
    
    try {
      // Find users with low tier (likely seed/sprout users)
      const seedUsers = await db.user.findMany({
        where: {
          tier: 'BRONZE'
        },
        take: 50
      })

      console.log(`Sending updates to ${seedUsers.length} seed/sprout users`)

      for (const user of seedUsers) {
        console.log(`Sending concierge update to ${user.email}`)
        // TODO: Send personalized concierge email
      }

      return seedUsers.length
    } catch (error) {
      console.error('Error sending concierge updates:', error)
      return 0
    }
  }
}

export const emailTriggers = EmailTriggers
export default EmailTriggers