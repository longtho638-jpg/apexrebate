import { db } from '@/lib/db';
import { UserTier, PayoutStatus, ActivityType } from '@prisma/client';
import { nanoid } from 'nanoid';

export class UserService {
  // Create or update user from intake form
  static async createOrUpdateUser(userData: {
    email: string;
    name?: string;
    tradingVolume?: string;
    preferredBroker?: string;
    experience?: string;
    referralSource?: string;
    referralCode?: string;
  }) {
    try {
      const existingUser = await db.users.findUnique({
        where: { email: userData.email }
      });

      // Handle referral logic - lookup referrer by referralCode
      let referredBy: string | null = null;
      if (userData.referralCode && !existingUser) {
        // Only process referral for new users
        const referrer = await db.users.findFirst({
          where: { referralCode: userData.referralCode }
        });
        if (referrer) {
          referredBy = referrer.id;
        }
      }

      if (existingUser) {
        // Update existing user
        return await db.users.update({
          where: { email: userData.email },
          data: {
            tradingVolume: userData.tradingVolume ? parseFloat(userData.tradingVolume) : undefined,
            preferredBroker: userData.preferredBroker,
            experience: userData.experience,
            referralSource: userData.referralSource,
            lastActiveAt: new Date(),
            updatedAt: new Date()
          }
        });
      } else {
        // Create new user with generated referral code
        const userReferralCode = nanoid(8).toUpperCase();
        
        return await db.users.create({
          data: {
            id: nanoid(),
            email: userData.email,
            name: userData.name,
            tradingVolume: userData.tradingVolume ? parseFloat(userData.tradingVolume) : 0,
            preferredBroker: userData.preferredBroker,
            experience: userData.experience,
            referralSource: userData.referralSource,
            referralCode: userReferralCode,
            referredBy: referredBy,
            tier: UserTier.BRONZE,
            totalSaved: 0,
            referralCount: 0,
            points: 0,
            streak: 1,
            badgeCount: 0,
            updatedAt: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  }

  // Get user by email
  static async getUserByEmail(email: string) {
    try {
      return await db.users.findUnique({
        where: { email },
        include: {
          payouts: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          user_achievements: {
            include: {
              achievements: true
            }
          },
          user_activities: {
            orderBy: { createdAt: 'desc' },
            take: 20
          }
        }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Update user savings and tier
  static async updateUserSavings(userId: string, savingsAmount: number) {
    try {
      const user = await db.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newTotalSaved = user.totalSaved + savingsAmount;
      const newTier = this.calculateUserTier(newTotalSaved);

      // Update user
      const updatedUser = await db.users.update({
        where: { id: userId },
        data: {
          totalSaved: newTotalSaved,
          tier: newTier,
          lastActiveAt: new Date()
        }
      });

      // Record activity
      await this.recordActivity(userId, ActivityType.SAVINGS_MILESTONE, 
        `Saved $${savingsAmount.toFixed(2)} in rebates`, 
        { amount: savingsAmount, newTotal: newTotalSaved }
      );

      // Check for tier upgrade
      if (newTier !== user.tier) {
        await this.recordActivity(userId, ActivityType.TIER_UPGRADE, 
          `Upgraded to ${newTier} tier`, 
          { oldTier: user.tier, newTier }
        );
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating user savings:', error);
      throw error;
    }
  }

  // Calculate user tier based on total savings
  private static calculateUserTier(totalSaved: number): UserTier {
    if (totalSaved >= 10000) return UserTier.DIAMOND;
    if (totalSaved >= 5000) return UserTier.PLATINUM;
    if (totalSaved >= 2000) return UserTier.GOLD;
    if (totalSaved >= 500) return UserTier.SILVER;
    return UserTier.BRONZE;
  }

  // Record user activity
  static async recordActivity(userId: string, type: ActivityType, description: string, metadata?: any) {
    try {
      return await db.user_activities.create({
        data: {
          id: nanoid(),
          userId,
          type,
          description,
          metadata: metadata ? JSON.stringify(metadata) : null,
          points: this.getActivityPoints(type)
        }
      });
    } catch (error) {
      console.error('Error recording activity:', error);
      throw error;
    }
  }

  // Get points for activity type
  private static getActivityPoints(type: ActivityType): number {
    switch (type) {
      case ActivityType.LOGIN: return 1;
      case ActivityType.REFERRAL: return 50;
      case ActivityType.SAVINGS_MILESTONE: return 10;
      case ActivityType.TIER_UPGRADE: return 100;
      case ActivityType.ACHIEVEMENT_UNLOCKED: return 25;
      case ActivityType.TRADING_VOLUME: return 5;
      case ActivityType.PAYOUT_RECEIVED: return 15;
      case ActivityType.STREAK_MILESTONE: return 20;
      default: return 0;
    }
  }

  // Get Wall of Fame data
  static async getWallOfFame(limit: number = 50) {
    try {
      const users = await db.users.findMany({
        where: {
          totalSaved: { gt: 0 }
        },
        orderBy: {
          totalSaved: 'desc'
        },
        take: limit,
        select: {
          id: true,
          name: true,
          totalSaved: true,
          tier: true,
          createdAt: true,
          payouts: {
            select: {
              broker: true,
              amount: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      // Transform data for frontend
      return users.map((user, index) => ({
        id: user.id,
        anonymousName: `Trader ${String.fromCharCode(65 + index)}`, // A, B, C...
        totalSavings: user.totalSaved,
        broker: user.payouts[0]?.broker || 'Unknown',
        memberSince: user.createdAt.toISOString().split('T')[0],
        tier: user.tier,
        rank: index + 1
      }));
    } catch (error) {
      console.error('Error fetching Wall of Fame:', error);
      throw error;
    }
  }

  // Get dashboard analytics
  static async getDashboardAnalytics(userId: string) {
    try {
      const user = await db.users.findUnique({
        where: { id: userId },
        include: {
          payouts: {
            orderBy: { createdAt: 'desc' },
            take: 100
          },
          user_activities: {
            orderBy: { createdAt: 'desc' },
            take: 50
          },
          user_achievements: {
            include: { achievements: true }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Calculate analytics
      const payouts = user.payouts;
      const totalVolume = payouts.reduce((sum, payout) => sum + payout.tradingVolume, 0);
      const monthlySavings = this.calculateMonthlySavings(payouts);
      const brokerStats = this.calculateBrokerStats(payouts);
      const savingsHistory = this.calculateSavingsHistory(payouts);

      return {
        userData: {
          totalSavings: user.totalSaved,
          monthlySavings,
          totalVolume,
          memberSince: user.createdAt.toISOString().split('T')[0],
          rank: user.tier,
          nextRankProgress: this.calculateNextRankProgress(user.totalSaved, user.tier),
          referrals: user.referralCount,
          referralEarnings: user.referralCount * 47.5 // Assuming $47.5 per referral
        },
        savingsHistory,
        brokerStats,
        achievements: user.user_achievements.map(ua => ({
          id: ua.achievements.id,
          title: ua.achievements.title,
          description: ua.achievements.description,
          icon: ua.achievements.icon,
          unlocked: ua.progress === 100,
          date: ua.unlockedAt.toISOString().split('T')[0],
          progress: ua.progress
        }))
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  }

  // Calculate monthly savings
  private static calculateMonthlySavings(payouts: any[]): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return payouts
      .filter(payout => {
        const payoutDate = new Date(payout.createdAt);
        return payoutDate.getMonth() === currentMonth && payoutDate.getFullYear() === currentYear;
      })
      .reduce((sum, payout) => sum + payout.amount, 0);
  }

  // Calculate broker statistics
  private static calculateBrokerStats(payouts: any[]) {
    const brokerMap = new Map();
    
    payouts.forEach(payout => {
      const current = brokerMap.get(payout.broker) || { volume: 0, savings: 0 };
      brokerMap.set(payout.broker, {
        volume: current.volume + payout.tradingVolume,
        savings: current.savings + payout.amount
      });
    });

    const totalVolume = Array.from(brokerMap.values()).reduce((sum, broker) => sum + broker.volume, 0);
    
    return Array.from(brokerMap.entries()).map(([broker, data]) => ({
      broker,
      volume: data.volume,
      savings: data.savings,
      percentage: totalVolume > 0 ? (data.volume / totalVolume) * 100 : 0
    }));
  }

  // Calculate savings history
  private static calculateSavingsHistory(payouts: any[]) {
    const monthlyMap = new Map();
    
    payouts.forEach(payout => {
      const monthKey = payout.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const current = monthlyMap.get(monthKey) || { savings: 0, volume: 0 };
      monthlyMap.set(monthKey, {
        savings: current.savings + payout.amount,
        volume: current.volume + payout.tradingVolume
      });
    });

    return Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12) // Last 12 months
      .map(([month, data]) => ({
        month,
        savings: data.savings,
        volume: data.volume
      }));
  }

  // Calculate next rank progress
  private static calculateNextRankProgress(totalSaved: number, currentTier: UserTier): number {
    const thresholds = {
      [UserTier.BRONZE]: 500,
      [UserTier.SILVER]: 2000,
      [UserTier.GOLD]: 5000,
      [UserTier.PLATINUM]: 10000,
      [UserTier.DIAMOND]: 10000 // Max tier
    };

    const currentThreshold = thresholds[currentTier];
    const nextThreshold = thresholds[this.getNextTier(currentTier)];

    if (currentTier === UserTier.DIAMOND) return 100;
    
    const progress = ((totalSaved - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  // Get next tier
  private static getNextTier(currentTier: UserTier): UserTier {
    switch (currentTier) {
      case UserTier.BRONZE: return UserTier.SILVER;
      case UserTier.SILVER: return UserTier.GOLD;
      case UserTier.GOLD: return UserTier.PLATINUM;
      case UserTier.PLATINUM: return UserTier.DIAMOND;
      default: return UserTier.DIAMOND;
    }
  }
}
