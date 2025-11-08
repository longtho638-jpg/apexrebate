/**
 * MASTER SEED SCRIPT - Corrected with proper table names and all fields
 * Run: npx tsx src/lib/seed-master-fixed.ts
 */

import { db } from '@/lib/db';
import { 
  UserRole, UserTier, 
  ToolType, ToolStatus, 
  AchievementCategory, ActivityType,
  Platform, NotificationType, NotificationStatus,
  RegionStatus, DeploymentStrategy, SyncType, SyncStatus
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seedMaster() {
  console.log('🚀 Starting MASTER SEED - All Features (FIXED)\n');

  try {
    // ========================================
    // 1. USERS (Multiple Roles & Tiers)
    // ========================================
    console.log('👥 Seeding Users...');
    
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

    const conciergeUser = await db.users.upsert({
      where: { email: 'concierge@apexrebate.com' },
      update: {},
      create: {
        id: uuidv4(),
        email: 'concierge@apexrebate.com',
        name: 'Concierge Support',
        password: await bcrypt.hash('concierge123', 10),
        role: UserRole.CONCIERGE,
        tier: UserTier.PLATINUM,
        tradingVolume: 5000000,
        totalSaved: 25000,
        referralCount: 50,
        points: 5000,
        streak: 15,
        badgeCount: 15,
        preferredBroker: 'bybit',
        experience: 'advanced',
        referralCode: 'CONCIERGE2025',
        updatedAt: new Date()
      }
    });

    const users: any[] = [];
    const tiers = [UserTier.BRONZE, UserTier.SILVER, UserTier.GOLD, UserTier.PLATINUM, UserTier.DIAMOND];
    const brokers = ['binance', 'bybit', 'okx', 'coinbase', 'kraken'];
    const experiences = ['beginner', 'intermediate', 'advanced', 'expert'];

    for (let i = 0; i < 20; i++) {
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
          tradingVolume: (i + 1) * 100000,
          totalSaved: (i + 1) * 500,
          referralCount: i * 2,
          points: (i + 1) * 100,
          streak: i % 15,
          badgeCount: i % 10,
          preferredBroker: brokers[i % brokers.length],
          experience: experiences[i % experiences.length],
          referralCode: `TRADER${i + 1}`,
          referredBy: i > 5 ? users[Math.floor(Math.random() * Math.min(i, users.length))].id : undefined,
          updatedAt: new Date()
        }
      });
      users.push(user);
    }

    console.log(`✅ Seeded ${users.length + 2} users (Admin, Concierge, ${users.length} traders)\n`);

    // ========================================
    // 2. TOOLS MARKETPLACE
    // ========================================
    console.log('🛠️  Seeding Tools Marketplace...');

    const categories = await Promise.all([
      db.tool_categories.upsert({
        where: { name: 'Technical Indicators' },
        update: {},
        create: { 
          id: uuidv4(),
          name: 'Technical Indicators', 
          description: 'Technical indicators',
          icon: '📊'
        }
      }),
      db.tool_categories.upsert({
        where: { name: 'Trading Bots' },
        update: {},
        create: { 
          id: uuidv4(),
          name: 'Trading Bots',
          description: 'Automated trading bots',
          icon: '🤖'
        }
      }),
      db.tool_categories.upsert({
        where: { name: 'Market Scanner' },
        update: {},
        create: { 
          id: uuidv4(),
          name: 'Market Scanner',
          description: 'Market scanners',
          icon: '🔍'
        }
      }),
      db.tool_categories.upsert({
        where: { name: 'Strategies' },
        update: {},
        create: { 
          id: uuidv4(),
          name: 'Strategies',
          description: 'Trading strategies',
          icon: '📋'
        }
      }),
      db.tool_categories.upsert({
        where: { name: 'Education' },
        update: {},
        create: { 
          id: uuidv4(),
          name: 'Education',
          description: 'Educational content',
          icon: '📚'
        }
      })
    ]);

    const toolsData: any[] = [
      { name: 'RSI Divergence Pro', price: 49.99, category: categories[0].id, type: ToolType.INDICATOR, featured: true },
      { name: 'Grid Trading Bot', price: 199.99, category: categories[1].id, type: ToolType.BOT, featured: true },
      { name: 'Volume Scanner', price: 79.99, category: categories[2].id, type: ToolType.SCANNER, featured: false },
      { name: 'Smart Money Strategy', price: 299.99, category: categories[3].id, type: ToolType.STRATEGY, featured: true },
      { name: 'Crypto Masterclass', price: 149.99, category: categories[4].id, type: ToolType.EDUCATION, featured: false },
    ];

    const tools: any[] = [];
    for (const toolData of toolsData) {
      const tool = await db.tools.upsert({
        where: { 
          name_sellerId: { 
            name: toolData.name, 
            sellerId: adminUser.id 
          } 
        },
        update: {},
        create: {
          id: uuidv4(),
          name: toolData.name,
          description: `Professional ${toolData.type.toLowerCase()} for advanced traders`,
          price: toolData.price,
          categoryId: toolData.category,
          type: toolData.type,
          status: ToolStatus.APPROVED,
          featured: toolData.featured,
          sellerId: adminUser.id,
          image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
          features: JSON.stringify(['Feature 1', 'Feature 2', 'Feature 3']),
          requirements: JSON.stringify(['Requirement 1', 'Requirement 2']),
          documentation: '# Documentation\n\nUsage guide here...',
          updatedAt: new Date()
        }
      });
      tools.push(tool);
    }

    console.log(`✅ Seeded ${categories.length} categories and ${tools.length} tools\n`);

    // ========================================
    // 3. ACHIEVEMENTS
    // ========================================
    console.log('🏆 Seeding Achievements...');

    const achievements = await Promise.all([
      db.achievement.upsert({
        where: { name: 'first_trade' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'first_trade',
          title: 'First Trade',
          description: 'Complete your first trade',
          icon: '🎯',
          category: AchievementCategory.TRADING,
          points: 100,
          condition: 'trading_volume >= 1000',
          updatedAt: new Date()
        }
      }),
      db.achievement.upsert({
        where: { name: 'referral_master' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'referral_master',
          title: 'Referral Master',
          description: 'Refer 10 users',
          icon: '👥',
          category: AchievementCategory.REFERRALS,
          points: 500,
          condition: 'referral_count >= 10',
          updatedAt: new Date()
        }
      }),
      db.achievement.upsert({
        where: { name: 'savings_hero' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'savings_hero',
          title: 'Savings Hero',
          description: 'Save $1000 in fees',
          icon: '💰',
          category: AchievementCategory.SAVINGS,
          points: 1000,
          condition: 'total_saved >= 1000',
          updatedAt: new Date()
        }
      }),
      db.achievement.upsert({
        where: { name: 'streak_warrior' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'streak_warrior',
          title: 'Streak Warrior',
          description: '30 day login streak',
          icon: '🔥',
          category: AchievementCategory.LOYALTY,
          points: 300,
          condition: 'streak >= 30',
          updatedAt: new Date()
        }
      })
    ]);

    // Award achievements to users
    for (const user of users.slice(0, 10)) {
      for (const achievement of achievements.slice(0, 2)) {
        await db.user_achievements.upsert({
          where: {
            userId_achievementId: {
              userId: user.id,
              achievementId: achievement.id
            }
          },
          update: {},
          create: {
            id: uuidv4(),
            userId: user.id,
            achievementId: achievement.id,
            progress: 100,
            pointsAwarded: achievement.points,
            unlockedAt: new Date(),
            updatedAt: new Date()
          }
        });
      }
    }

    console.log(`✅ Seeded ${achievements.length} achievements\n`);

    // ========================================
    // 4. PAYOUTS
    // ========================================
    console.log('💵 Seeding Payouts...');

    let payoutCount = 0;
    for (const user of users.slice(0, 15)) {
      for (let month = 0; month < 6; month++) {
        const date = new Date();
        date.setMonth(date.getMonth() - month);
        
        await db.payouts.create({
          data: {
            id: uuidv4(),
            userId: user.id,
            amount: Math.random() * 500 + 100,
            currency: 'USD',
            period: date.toISOString().slice(0, 7),
            broker: user.preferredBroker || 'binance',
            tradingVolume: (user.tradingVolume || 100000) * (0.8 + Math.random() * 0.4),
            feeRate: 0.0002,
            status: month < 4 ? 'PROCESSED' : 'PENDING',
            processedAt: month < 4 ? date : null,
            updatedAt: new Date()
          }
        });
        payoutCount++;
      }
    }

    console.log(`✅ Seeded ${payoutCount} payouts\n`);

    // ========================================
    // 5. EXCHANGES
    // ========================================
    console.log('🏦 Seeding Exchanges...');

    const exchanges = await Promise.all([
      db.exchanges.upsert({
        where: { name: 'binance' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'binance',
          displayName: 'Binance',
          baseUrl: 'https://api.binance.com',
          isActive: true,
          supportedPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT', 'BNB/USDT']),
          feeStructure: JSON.stringify({ maker: 0.001, taker: 0.001 }),
          affiliateInfo: JSON.stringify({ rebate: 20 }),
          logoUrl: '/exchanges/binance.png',
          websiteUrl: 'https://binance.com',
          updatedAt: new Date()
        }
      }),
      db.exchanges.upsert({
        where: { name: 'bybit' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'bybit',
          displayName: 'Bybit',
          baseUrl: 'https://api.bybit.com',
          isActive: true,
          supportedPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT']),
          feeStructure: JSON.stringify({ maker: 0.001, taker: 0.001 }),
          affiliateInfo: JSON.stringify({ rebate: 25 }),
          logoUrl: '/exchanges/bybit.png',
          websiteUrl: 'https://bybit.com',
          updatedAt: new Date()
        }
      }),
      db.exchanges.upsert({
        where: { name: 'okx' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'okx',
          displayName: 'OKX',
          baseUrl: 'https://www.okx.com',
          isActive: true,
          supportedPairs: JSON.stringify(['BTC/USDT', 'ETH/USDT']),
          feeStructure: JSON.stringify({ maker: 0.0008, taker: 0.001 }),
          affiliateInfo: JSON.stringify({ rebate: 30 }),
          logoUrl: '/exchanges/okx.png',
          websiteUrl: 'https://okx.com',
          updatedAt: new Date()
        }
      })
    ]);

    // Create exchange accounts for users
    let accountCount = 0;
    for (const user of users.slice(0, 10)) {
      const exchange = exchanges[Math.floor(Math.random() * exchanges.length)];
      await db.exchange_accounts.upsert({
        where: {
          userId_exchangeId: {
            userId: user.id,
            exchangeId: exchange.id
          }
        },
        update: {},
        create: {
          id: uuidv4(),
          userId: user.id,
          exchangeId: exchange.id,
          apiKey: `key_${user.id}_${exchange.name}`,
          secret: `secret_${user.id}_${exchange.name}`,
          isActive: true,
          tradingVolume: user.tradingVolume || 100000,
          totalSaved: user.totalSaved || 500,
          updatedAt: new Date()
        }
      });
      accountCount++;
    }

    console.log(`✅ Seeded ${exchanges.length} exchanges and ${accountCount} accounts\n`);

    // ========================================
    // 6. DEPLOYMENT REGIONS (Multi-region)
    // ========================================
    console.log('🌍 Seeding Deployment Regions...');

    const regions = await Promise.all([
      db.deployment_regions.upsert({
        where: { code: 'us-east-1' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'US East (Virginia)',
          code: 'us-east-1',
          endpoint: 'https://us-east-1.apexrebate.com',
          status: RegionStatus.ACTIVE,
          latency: 50,
          load: 45,
          capabilities: JSON.stringify(['api', 'websocket', 'cdn']),
          priority: 1,
          updatedAt: new Date()
        }
      }),
      db.deployment_regions.upsert({
        where: { code: 'eu-west-1' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'EU West (Ireland)',
          code: 'eu-west-1',
          endpoint: 'https://eu-west-1.apexrebate.com',
          status: RegionStatus.ACTIVE,
          latency: 80,
          load: 35,
          capabilities: JSON.stringify(['api', 'websocket']),
          priority: 2,
          updatedAt: new Date()
        }
      }),
      db.deployment_regions.upsert({
        where: { code: 'ap-southeast-1' },
        update: {},
        create: {
          id: uuidv4(),
          name: 'Asia Pacific (Singapore)',
          code: 'ap-southeast-1',
          endpoint: 'https://ap-southeast-1.apexrebate.com',
          status: RegionStatus.ACTIVE,
          latency: 120,
          load: 50,
          capabilities: JSON.stringify(['api']),
          priority: 3,
          updatedAt: new Date()
        }
      })
    ]);

    console.log(`✅ Seeded ${regions.length} deployment regions\n`);

    // ========================================
    // 7. USER ACTIVITIES
    // ========================================
    console.log('📊 Seeding User Activities...');

    const activityTypes = [
      ActivityType.LOGIN,
      ActivityType.TRADING_VOLUME,
      ActivityType.REFERRAL,
      ActivityType.SAVINGS_MILESTONE,
      ActivityType.ACHIEVEMENT_UNLOCKED
    ];

    let activityCount = 0;
    for (const user of users.slice(0, 12)) {
      for (let i = 0; i < 5; i++) {
        await db.user_activities.create({
          data: {
            id: uuidv4(),
            userId: user.id,
            type: activityTypes[i % activityTypes.length],
            description: `Activity ${i + 1} for ${user.name}`,
            points: Math.floor(Math.random() * 100) + 10,
            metadata: JSON.stringify({ detail: 'activity metadata' }),
            updatedAt: new Date()
          }
        });
        activityCount++;
      }
    }

    console.log(`✅ Seeded ${activityCount} user activities\n`);

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n🎉 MASTER SEED COMPLETED!\n');
    console.log('Summary:');
    console.log(`  👥 Users: ${await db.users.count()}`);
    console.log(`  🛠️  Tools: ${await db.tools.count()}`);
    console.log(`  📦 Categories: ${await db.tool_categories.count()}`);
    console.log(`  🏆 Achievements: ${await db.achievement.count()}`);
    console.log(`  💵 Payouts: ${await db.payouts.count()}`);
    console.log(`  🏦 Exchanges: ${await db.exchanges.count()}`);
    console.log(`  🔗 Exchange Accounts: ${await db.exchange_accounts.count()}`);
    console.log(`  🌍 Deployment Regions: ${await db.deployment_regions.count()}`);
    console.log(`  📊 User Activities: ${await db.user_activities.count()}`);

  } catch (error) {
    console.error('❌ Master seed failed:', error);
    throw error;
  }
}

export default seedMaster;

// Run seed
seedMaster()
  .then(async () => {
    await db.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
