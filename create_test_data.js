
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function createTestData() {
  // Create test users
  const testUsers = [
    {
      name: 'Alpha Trader',
      email: 'alpha@example.com',
      tradingVolume: 2000000,
      preferredBroker: 'binance',
      experience: 'advanced',
      referralSource: 'social',
      referralCode: 'ALPHA'
    },
    {
      name: 'Beta Trader', 
      email: 'beta@example.com',
      tradingVolume: 1500000,
      preferredBroker: 'bybit',
      experience: 'intermediate',
      referralSource: 'friend',
      referralCode: 'BETA'
    },
    {
      name: 'Gamma Trader',
      email: 'gamma@example.com', 
      tradingVolume: 800000,
      preferredBroker: 'okx',
      experience: 'beginner',
      referralSource: 'search',
      referralCode: 'GAMMA'
    }
  ];

  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        referralCode: userData.referralCode + Math.random().toString(36).substring(2, 6).toUpperCase()
      }
    });
    console.log('Created user:', user.email);

    // Create some payouts for each user
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const payout = await prisma.payout.create({
        data: {
          userId: user.id,
          amount: Math.random() * 500 + 100,
          currency: 'USD',
          period: date.toISOString().slice(0, 7),
          broker: userData.preferredBroker,
          tradingVolume: userData.tradingVolume * (0.8 + Math.random() * 0.4),
          feeRate: 0.0002 + Math.random() * 0.0002,
          status: Math.random() > 0.3 ? 'PROCESSED' : 'PENDING',
          processedAt: Math.random() > 0.3 ? date : null,
          createdAt: date,
          updatedAt: date
        }
      });
      console.log('Created payout for user:', user.email, 'Amount:', payout.amount);
    }
  }

  console.log('Test data created successfully');
  await prisma.$disconnect();
}

createTestData().catch(console.error);

