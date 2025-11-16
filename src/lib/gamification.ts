import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { UserTier, AchievementCategory, ActivityType } from '@prisma/client';
import { emailTriggers } from '@/lib/email-triggers';

export interface AchievementCondition {
  type: 'savings' | 'referrals' | 'streak' | 'trading_volume' | 'login_days';
  target: number;
  operator?: '>' | '>=' | '=' | '<=';
}

export interface AchievementData {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  points: number;
  tier?: UserTier;
  condition: AchievementCondition;
}

// Predefined achievements
const ACHIEVEMENTS: AchievementData[] = [
  // Savings achievements
  {
    id: 'first_savings',
    name: 'first_savings',
    title: 'Bắt đầu tiết kiệm',
    description: 'Tiết kiệm được khoản đầu tiên của bạn',
    icon: '🎯',
    category: 'SAVINGS',
    points: 10,
    condition: { type: 'savings', target: 1, operator: '>=' }
  },
  {
    id: 'savings_100',
    name: 'savings_100',
    title: 'Nhà tiết kiệm',
    description: 'Tiết kiệm được 100 USD',
    icon: '💰',
    category: 'SAVINGS',
    points: 50,
    condition: { type: 'savings', target: 100, operator: '>=' }
  },
  {
    id: 'savings_500',
    name: 'savings_500',
    title: 'Chuyên gia tiết kiệm',
    description: 'Tiết kiệm được 500 USD',
    icon: '💎',
    category: 'SAVINGS',
    points: 200,
    condition: { type: 'savings', target: 500, operator: '>=' }
  },
  {
    id: 'savings_1000',
    name: 'savings_1000',
    title: 'Bậc thầy tiết kiệm',
    description: 'Tiết kiệm được 1,000 USD',
    icon: '👑',
    category: 'SAVINGS',
    points: 500,
    tier: 'SILVER',
    condition: { type: 'savings', target: 1000, operator: '>=' }
  },

  // Referral achievements
  {
    id: 'first_referral',
    name: 'first_referral',
    title: 'Người giới thiệu',
    description: 'Giới thiệu thành công người dùng đầu tiên',
    icon: '🤝',
    category: 'REFERRALS',
    points: 25,
    condition: { type: 'referrals', target: 1, operator: '>=' }
  },
  {
    id: 'referrals_5',
    name: 'referrals_5',
    title: 'Người kết nối',
    description: 'Giới thiệu thành công 5 người dùng',
    icon: '🌟',
    category: 'REFERRALS',
    points: 100,
    condition: { type: 'referrals', target: 5, operator: '>=' }
  },
  {
    id: 'referrals_10',
    name: 'referrals_10',
    title: 'Người dẫn dắt',
    description: 'Giới thiệu thành công 10 người dùng',
    icon: '🚀',
    category: 'REFERRALS',
    points: 250,
    tier: 'GOLD',
    condition: { type: 'referrals', target: 10, operator: '>=' }
  },

  // Activity streak achievements
  {
    id: 'streak_7',
    name: 'streak_7',
    title: 'Tuần lễ tích cực',
    description: 'Đăng nhập 7 ngày liên tiếp',
    icon: '🔥',
    category: 'ACTIVITY',
    points: 30,
    condition: { type: 'streak', target: 7, operator: '>=' }
  },
  {
    id: 'streak_30',
    name: 'streak_30',
    title: 'Tháng trung thành',
    description: 'Đăng nhập 30 ngày liên tiếp',
    icon: '💪',
    category: 'ACTIVITY',
    points: 150,
    tier: 'SILVER',
    condition: { type: 'streak', target: 30, operator: '>=' }
  },

  // Trading volume achievements
  {
    id: 'volume_100k',
    name: 'volume_100k',
    title: 'Nhà giao dịch tích cực',
    description: 'Khối lượng giao dịch 100,000 USD',
    icon: '📈',
    category: 'TRADING',
    points: 40,
    condition: { type: 'trading_volume', target: 100000, operator: '>=' }
  },
  {
    id: 'volume_1m',
    name: 'volume_1m',
    title: 'Nhà giao dịch chuyên nghiệp',
    description: 'Khối lượng giao dịch 1,000,000 USD',
    icon: '📊',
    category: 'TRADING',
    points: 200,
    tier: 'GOLD',
    condition: { type: 'trading_volume', target: 1000000, operator: '>=' }
  }
];

// Tier thresholds based on total points
const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 500,
  GOLD: 1500,
  PLATINUM: 3000,
  DIAMOND: 5000
};

export class GamificationService {
  /**
   * Initialize achievements in the database
   */
  static async initializeAchievements() {
    for (const achievement of ACHIEVEMENTS) {
      await db.achievements.upsert({
        where: { name: achievement.name },
        update: {
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          points: achievement.points,
          tier: achievement.tier,
          condition: JSON.stringify(achievement.condition)
        },
        create: {
          id: achievement.id,
          name: achievement.name,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          points: achievement.points,
          tier: achievement.tier,
          condition: JSON.stringify(achievement.condition)
        }
      });
    }
  }

  /**
   * Check and unlock achievements for a user
   */
  static async checkAchievements(userId: string) {
    const user = await db.users.findUnique({
      where: { id: userId },
      include: {
        user_achievements: {
          select: { achievementId: true }
        }
      }
    });

    if (!user) return;

    const unlockedAchievementIds = (user.user_achievements ?? []).map(a => a.achievementId);
    const availableAchievements = await db.achievements.findMany({
      where: {
        isActive: true,
        id: { notIn: unlockedAchievementIds }
      }
    });

    for (const achievement of availableAchievements) {
      const condition = JSON.parse(achievement.condition) as AchievementCondition;
      const isUnlocked = await this.checkCondition(user, condition);

      if (isUnlocked) {
        await this.unlockAchievement(userId, achievement.id);
      }
    }
  }

  /**
   * Check if a user meets a specific achievement condition
   */
  private static async checkCondition(user: any, condition: AchievementCondition): Promise<boolean> {
    const { type, target, operator = '>=' } = condition;
    let value = 0;

    switch (type) {
      case 'savings':
        value = user.totalSaved || 0;
        break;
      case 'referrals':
        value = user.referralCount || 0;
        break;
      case 'streak':
        value = user.streak || 0;
        break;
      case 'trading_volume':
        value = user.tradingVolume || 0;
        break;
      default:
        return false;
    }

    switch (operator) {
      case '>': return value > target;
      case '>=': return value >= target;
      case '=': return value === target;
      case '<=': return value <= target;
      default: return value >= target;
    }
  }

  /**
   * Unlock an achievement for a user
   */
  static async unlockAchievement(userId: string, achievementId: string) {
    const achievement = await db.achievements.findUnique({
      where: { id: achievementId }
    });

    if (!achievement) return;

    // Create user achievement record
    await db.user_achievements.create({
      data: {
        id: randomUUID(),
        userId,
        achievementId,
        unlockedAt: new Date(),
        progress: 100,
        pointsAwarded: achievement.points
      }
    });

    // Award points to user
    await db.users.update({
      where: { id: userId },
      data: {
        points: { increment: achievement.points },
        badgeCount: { increment: 1 }
      }
    });

    // Log activity
    await this.logActivity(userId, 'ACHIEVEMENT_UNLOCKED', `Mở thành tựu: ${achievement.title}`, {
      achievementId,
      points: achievement.points
    }, achievement.points);

    // Send achievement email notification
    try {
      await emailTriggers.onAchievementUnlocked(userId, achievement.title, achievement.points);
    } catch (emailError) {
      console.error('Failed to send achievement email:', emailError);
    }

    // Check for tier upgrade
    await this.checkTierUpgrade(userId);
  }

  /**
   * Check and update user tier based on points
   */
  static async checkTierUpgrade(userId: string) {
    const user = await db.users.findUnique({
      where: { id: userId }
    });

    if (!user) return;

    let newTier = user.tier;
    
    // Check from highest to lowest tier
    if (user.points >= TIER_THRESHOLDS.DIAMOND) {
      newTier = 'DIAMOND';
    } else if (user.points >= TIER_THRESHOLDS.PLATINUM) {
      newTier = 'PLATINUM';
    } else if (user.points >= TIER_THRESHOLDS.GOLD) {
      newTier = 'GOLD';
    } else if (user.points >= TIER_THRESHOLDS.SILVER) {
      newTier = 'SILVER';
    }

    if (newTier !== user.tier) {
      await db.users.update({
        where: { id: userId },
        data: { tier: newTier }
      });

      await this.logActivity(userId, 'TIER_UPGRADE', `Nâng cấp lên hạng: ${newTier}`, {
        oldTier: user.tier,
        newTier
      }, 100);

      // Send tier upgrade email notification
      try {
        await emailTriggers.onTierUpgrade(userId, newTier);
      } catch (emailError) {
        console.error('Failed to send tier upgrade email:', emailError);
      }
    }
  }

  /**
   * Log user activity
   */
  static async logActivity(
    userId: string, 
    type: ActivityType, 
    description: string, 
    metadata?: any,
    points?: number
  ) {
    await db.user_activities.create({
      data: {
        id: randomUUID(),
        userId,
        type,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        points: points || 0
      }
    });

    // Update user points if applicable
    if (points && points > 0) {
      await db.users.update({
        where: { id: userId },
        data: { 
          points: { increment: points },
          lastActiveAt: new Date()
        }
      });
    }
  }

  /**
   * Update user activity streak
   */
  static async updateActivityStreak(userId: string) {
    const user = await db.users.findUnique({
      where: { id: userId }
    });

    if (!user) return;

    const now = new Date();
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
    
    // Check if last activity was yesterday
    const isConsecutiveDay = lastActive && 
      now.getDate() === lastActive.getDate() + 1 &&
      now.getMonth() === lastActive.getMonth() &&
      now.getFullYear() === lastActive.getFullYear();

    let newStreak = 1;
    if (isConsecutiveDay) {
      newStreak = (user.streak || 0) + 1;
    } else if (lastActive && now.toDateString() === lastActive.toDateString()) {
      // Same day, don't update streak
      return;
    }

    await db.users.update({
      where: { id: userId },
      data: { 
        streak: newStreak,
        lastActiveAt: now
      }
    });

    // Log login activity
    await this.logActivity(userId, 'LOGIN', 'Đăng nhập hàng ngày', { streak: newStreak }, 5);

    // Check for streak achievements
    await this.checkAchievements(userId);
  }

  /**
   * Get user gamification data
   */
  static async getUserGamification(userId: string) {
    const user = await db.users.findUnique({
      where: { id: userId },
      include: {
        user_achievements: {
          include: { achievements: true },
          orderBy: { unlockedAt: 'desc' }
        },
        user_activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        referredUsers: {
          select: { id: true, createdAt: true }
        }
      }
    });

    if (!user) return null;

    // Calculate next tier progress
    const currentTier = (user.tier as keyof typeof TIER_THRESHOLDS) || 'BRONZE';
    const currentTierThreshold = TIER_THRESHOLDS[currentTier] ?? 0;
    const tiers = Object.entries(TIER_THRESHOLDS).sort(([,a], [,b]) => a - b);
    const currentTierIndex = tiers.findIndex(([tier]) => tier === currentTier);
    const nextTier = tiers[currentTierIndex + 1];
    const nextTierThreshold = nextTier ? nextTier[1] : null;
    const progressToNextTier = nextTierThreshold 
      ? ((user.points - currentTierThreshold) / (nextTierThreshold - currentTierThreshold)) * 100
      : 100;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        tier: user.tier,
        points: user.points,
        totalSaved: user.totalSaved,
        referralCount: user.referralCount,
        streak: user.streak,
        badgeCount: user.badgeCount,
        lastActiveAt: user.lastActiveAt
      },
      achievements: (user.user_achievements ?? []).map(({ achievements, ...rest }) => ({
        ...rest,
        achievement: achievements
      })),
      recentActivities: user.user_activities ?? [],
      referrals: user.referredUsers,
      tierProgress: {
        currentTier: user.tier,
        nextTier: nextTier ? nextTier[0] : null,
        currentPoints: user.points,
        currentThreshold: currentTierThreshold,
        nextThreshold: nextTierThreshold,
        progressPercentage: Math.min(progressToNextTier, 100)
      }
    };
  }

  /**
   * Process referral and award points
   */
  static async processReferral(referrerId: string, referredUserId: string) {
    // Get referred user info for email
    const referredUser = await db.users.findUnique({
      where: { id: referredUserId },
      select: { name: true, email: true }
    });

    // Update referrer stats
    await db.users.update({
      where: { id: referrerId },
      data: {
        referralCount: { increment: 1 }
      }
    });

    // Award referral points
    await this.logActivity(referrerId, 'REFERRAL', 'Giới thiệu thành công người dùng mới', {
      referredUserId
    }, 50);

    // Send referral success email
    if (referredUser) {
      try {
        await emailTriggers.onReferralSuccess(referrerId, referredUser.name || referredUser.email?.split('@')[0] || 'Anonymous');
      } catch (emailError) {
        console.error('Failed to send referral success email:', emailError);
      }
    }

    // Check for new achievements
    await this.checkAchievements(referrerId);
  }

  /**
   * Update savings and check milestones
   */
  static async updateSavings(userId: string, amount: number) {
    await db.users.update({
      where: { id: userId },
      data: {
        totalSaved: { increment: amount }
      }
    });

    await this.logActivity(userId, 'SAVINGS_MILESTONE', `Tiết kiệm thêm $${amount.toFixed(2)}`, {
      amount
    }, Math.floor(amount / 10));

    await this.checkAchievements(userId);
  }
}
