// Email triggers for ApexRebate
import { db } from '@/lib/db'

export interface EmailTriggerData {
  userId: string
  type: 'welcome' | 'cashback' | 'milestone' | 'referral' | 'monthly_report'
  data: Record<string, any>
}

class EmailTriggers {
  static async triggerWelcomeEmail(userId: string) {
    const user = await db.users.findUnique({
      where: { id: userId }
    })
    
    if (!user) return
    
    // Send welcome email logic here
    console.log(`Welcome email sent to ${user.email}`)
  }

  static async triggerCashbackEmail(userId: string, amount: number, period: string) {
    const user = await db.users.findUnique({
      where: { id: userId }
    })
    
    if (!user) return
    
    // Send cashback email logic here
    console.log(`Cashback email sent to ${user.email}: $${amount} for ${period}`)
  }

  static async triggerMilestoneEmail(userId: string, milestone: string) {
    const user = await db.users.findUnique({
      where: { id: userId }
    })
    
    if (!user) return
    
    // Send milestone email logic here
    console.log(`Milestone email sent to ${user.email}: ${milestone}`)
  }

  static async triggerReferralEmail(userId: string, referralData: any) {
    const user = await db.users.findUnique({
      where: { id: userId }
    })
    
    if (!user) return
    
    // Send referral email logic here
    console.log(`Referral email sent to ${user.email}`)
  }

  static async triggerMonthlyReport(userId: string, reportData: any) {
    const user = await db.users.findUnique({
      where: { id: userId }
    })
    
    if (!user) return
    
    // Send monthly report email logic here
    console.log(`Monthly report sent to ${user.email}`)
  }

  static async onAchievementUnlocked(userId: string, achievementTitle: string, points: number) {
    const user = await db.users.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user) return;

    console.log(`[EmailTriggers] Achievement unlocked for ${user.email}: ${achievementTitle} (+${points} điểm)`);
  }

  static async onTierUpgrade(userId: string, newTier: string) {
    const user = await db.users.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user) return;

    console.log(`[EmailTriggers] Tier upgrade for ${user.email}: ${newTier}`);
  }

  static async onReferralSuccess(userId: string, referredUserName: string) {
    const user = await db.users.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user) return;

    console.log(`[EmailTriggers] Referral success for ${user.email}: referred ${referredUserName}`);
  }
}

export const emailTriggers = EmailTriggers
export default EmailTriggers
