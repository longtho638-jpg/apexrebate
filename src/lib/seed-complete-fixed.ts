/**
 * COMPREHENSIVE SEED SCRIPT - Fully corrected for production dashboard
 */

import { db } from '@/lib/db';
import { UserRole, UserTier, ToolType, ToolStatus, AchievementCategory, ActivityType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seedComplete() {
  console.log('🚀 Starting Comprehensive Seed...\n');

  try {
    console.log('👥 Seeding Users with realistic data...');
    
    // Admin user (for dashboard display)
    const adminUser = await db.users.upsert({
      where: { email: 'admin@apexrebate.com' },
      update: {},
      create: {
        id: uuidv4(),
        email: 'admin@apexrebate.com',
        name: 'Admin User',
        password: await bcrypt.hash('admin123', 10),
        role: UserRole.ADMIN,
        tier: UserTier.DIAMOND,
        tradingVolume: 10000000,
        totalSaved: 50000,
        referralCount: 100,
        points: 10000,
        streak: 30,
        badgeCount: 25,
        preferredBroker: 'binance',
        experience: 'expert',
        referralCode: 'ADMIN2025',
        updatedAt: new Date()
      }
    });

    // Demo user (for dashboard testing)
    const demoUser = await db.users.upsert({
      where: { email: 'demo@apexrebate.com' },
      update: {},
      create: {
        id: uuidv4(),
        email: 'demo@apexrebate.com',
        name: 'Demo Trader',
        password: await bcrypt.hash('demo123', 10),
        role: UserRole.USER,
        tier: UserTier.DIAMOND,
        tradingVolume: 10000000,
        totalSaved: 50000,
        referralCount: 15,
        points: 5000,
        streak: 45,
        badgeCount: 18,
        preferredBroker: 'binance',
        experience: 'expert',
        referralCode: 'DEMO2025',
        updatedAt: new Date()
      }
    });

    // Regular traders
    const users: any[] = [];
    const tiers = [UserTier.BRONZE, UserTier.SILVER, UserTier.GOLD, UserTier.PLATINUM, UserTier.DIAMOND];
    const brokers = ['binance', 'bybit', 'okx'];

    for (let i = 0; i < 10; i++) {
      const tier = tiers[i % tiers.length];
      const user = await db.users.upsert({
        where: { email: `trader${i + 1}@example.com` },
        update: {},
        create: {
          id: uuidv4(),
          email: `trader${i + 1}@example.com`,
          name: `Trader ${i + 1}`,
          password: await bcrypt.hash('password123', 10),
          role: UserRole.USER,
          tier,
          tradingVolume: (i + 1) * 500000,
          totalSaved: (i + 1) * 1000,
          referralCount: i + 2,
          points: (i + 1) * 200,
          streak: i + 5,
          badgeCount: i + 3,
          preferredBroker: brokers[i % brokers.length],
          experience: 'advanced',
          referralCode: `TRADER${i + 1}`,
          updatedAt: new Date()
        }
      });
      users.push(user);
    }

    console.log(`✅ Seeded ${users.length + 2} users (Admin, Demo + ${users.length} traders)\n`);

    console.log('💵 Seeding Payouts for dashboard...');

    let payoutCount = 0;
    // Create 6 months of payout history for demo user
    for (let month = 0; month < 6; month++) {
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      date.setDate(15); // Mid-month for consistency
      
      const amount = 500 + Math.random() * 3000;
      const volume = 2000000 + Math.random() * 3000000;
      
      await db.payouts.create({
        data: {
          id: uuidv4(),
          userId: demoUser.id,
          amount: Math.round(amount * 100) / 100,
          currency: 'USD',
          period: date.toISOString().slice(0, 7),
          broker: 'binance',
          tradingVolume: Math.round(volume),
          feeRate: 0.0002,
          status: 'PROCESSED',
          processedAt: date,
          updatedAt: date
        }
      });
      payoutCount++;
    }

    // Create payouts for other users
    for (const user of users.slice(0, 8)) {
      for (let month = 0; month < 3; month++) {
        const date = new Date();
        date.setMonth(date.getMonth() - month);
        
        await db.payouts.create({
          data: {
            id: uuidv4(),
            userId: user.id,
            amount: Math.round((Math.random() * 500 + 100) * 100) / 100,
            currency: 'USD',
            period: date.toISOString().slice(0, 7),
            broker: user.preferredBroker || 'binance',
            tradingVolume: (user.tradingVolume || 500000) * (0.7 + Math.random() * 0.5),
            feeRate: 0.0002,
            status: month < 2 ? 'PROCESSED' : 'PENDING',
            processedAt: month < 2 ? date : null,
            updatedAt: date
          }
        });
        payoutCount++;
      }
    }

    console.log(`✅ Seeded ${payoutCount} payouts\n`);

    console.log('🏆 Seeding Achievements...');

    const achievements = await Promise.all([
      db.achievements.upsert({
        where: { name: 'first_savings' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'first_savings',
          title: 'Tiết kiệm đầu tiên',
          description: 'Hoàn thành lần hoàn phí đầu tiên',
          icon: 'Star',
          category: AchievementCategory.SAVINGS,
          points: 100,
          condition: 'totalSaved >= 1'
        }
      }),
      db.achievements.upsert({
        where: { name: 'monthly_100' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'monthly_100',
          title: 'Thành viên tháng',
          description: 'Tiết kiệm hơn $100 trong tháng',
          icon: 'Award',
          category: AchievementCategory.ACTIVITY,
          points: 200,
          condition: 'monthlySavings >= 100'
        }
      }),
      db.achievements.upsert({
        where: { name: 'referral_master' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'referral_master',
          title: 'Người giới thiệu',
          description: 'Giới thiệu thành công 1 thành viên',
          icon: 'Users',
          category: AchievementCategory.REFERRALS,
          points: 300,
          condition: 'referralCount >= 1'
        }
      }),
      db.achievements.upsert({
        where: { name: 'savings_1000' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'savings_1000',
          title: 'Nhà tiết kiệm',
          description: 'Tổng tiết kiệm đạt $1,000',
          icon: 'Crown',
          category: AchievementCategory.SAVINGS,
          points: 500,
          condition: 'totalSaved >= 1000'
        }
      }),
      db.achievements.upsert({
        where: { name: 'savings_5000' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'savings_5000',
          title: 'Bậc thầy tiết kiệm',
          description: 'Tổng tiết kiệm đạt $5,000',
          icon: 'Gem',
          category: AchievementCategory.SAVINGS,
          points: 1000,
          condition: 'totalSaved >= 5000'
        }
      })
    ]);

    // Award achievements to demo user
    for (const achievement of achievements) {
      await db.user_achievements.upsert({
        where: {
          userId_achievementId: {
            userId: demoUser.id,
            achievementId: achievement.id
          }
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: demoUser.id,
          achievementId: achievement.id,
          progress: 100,
          pointsAwarded: achievement.points,
          unlockedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
        }
      });
    }

    console.log(`✅ Seeded ${achievements.length} achievements\n`);

    console.log('📊 Seeding Activities...');

    let activityCount = 0;
    const activityTypes = [ActivityType.LOGIN, ActivityType.TRADING_VOLUME, ActivityType.REFERRAL, ActivityType.SAVINGS_MILESTONE];

    for (const user of [demoUser, ...users.slice(0, 5)]) {
      for (let i = 0; i < 8; i++) {
        await db.user_activities.create({
        data: {
        id: uuidv4(),
        userId: user.id,
        type: activityTypes[i % activityTypes.length],
        description: `Activity ${i + 1}`,
        points: Math.floor(Math.random() * 100) + 50,
        metadata: JSON.stringify({ detail: 'activity data' })
        }
        });
        activityCount++;
      }
    }

    console.log(`✅ Seeded ${activityCount} activities\n`);

    // ========================================
    // SUMMARY
    // ========================================
    const counts = await Promise.all([
      db.users.count(),
      db.payouts.count(),
      db.achievements.count(),
      db.user_achievements.count(),
      db.user_activities.count()
    ]);

    console.log('🎉 SEED COMPLETED!\n');
    console.log('Summary:');
    console.log(`  👥 Users: ${counts[0]}`);
    console.log(`  💵 Payouts: ${counts[1]}`);
    console.log(`  🏆 Achievements: ${counts[2]}`);
    console.log(`  ⭐ User Achievements: ${counts[3]}`);
    console.log(`  📊 Activities: ${counts[4]}`);
    console.log(`\n✨ Demo user email: demo@apexrebate.com (password: demo123)`);
    console.log(`✨ Dashboard ready at: /vi/dashboard\n`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seedComplete()
  .then(async () => {
    await db.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
