#!/usr/bin/env node

/**
 * Seed Admin User for ApexRebate
 * Creates an admin account for testing
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const db = new PrismaClient();

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...');

    // Check if admin already exists
    const existingAdmin = await db.users.findUnique({
      where: { email: 'admin@apexrebate.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin already exists:', existingAdmin.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@12345', 10);

    // Create admin user
    const admin = await db.users.create({
      data: {
        id: 'admin-seed-001',
        email: 'admin@apexrebate.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
        referralCode: 'ADMIN001',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    console.log('✅ Admin user created:');
    console.log('   Email: admin@apexrebate.com');
    console.log('   Password: Admin@12345');
    console.log('   Role: ADMIN');
    console.log('   ID:', admin.id);

    // Create 10 test users for demo
    const testUsers = [];
    for (let i = 1; i <= 10; i++) {
      const email = `user${i}@apexrebate.com`;
      
      // Check if user exists
      const existing = await db.users.findUnique({
        where: { email }
      });

      if (!existing) {
        const hashedPass = await bcrypt.hash('User@12345', 10);
        const testUser = await db.users.create({
          data: {
            id: `user-seed-${i}`,
            email,
            name: `Test User ${i}`,
            password: hashedPass,
            role: 'USER',
            emailVerified: new Date(),
            referralCode: `USER${String(i).padStart(3, '0')}`,
            preferredBroker: ['Binance', 'Bybit', 'OKX'][Math.floor(Math.random() * 3)],
            tradingVolume: Math.floor(Math.random() * 5000000),
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
          }
        });
        testUsers.push(testUser);
      }
    }

    console.log(`\n✅ Created ${testUsers.length} test users`);

    // Create test payouts
    const allUsers = await db.users.findMany({ where: { role: 'USER' } });
    let payoutsCreated = 0;

    for (const user of allUsers.slice(0, 5)) {
      for (let j = 0; j < 3; j++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.random() * 30);

        try {
          await db.payout.create({
            data: {
              userId: user.id,
              amount: Math.floor(Math.random() * 500) + 100,
              currency: 'USD',
              period: `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`,
              broker: ['Binance', 'Bybit', 'OKX'][Math.floor(Math.random() * 3)],
              tradingVolume: Math.floor(Math.random() * 2000000),
              feeRate: 0.0002 + Math.random() * 0.0003,
              status: Math.random() > 0.3 ? 'PROCESSED' : 'PENDING',
              processedAt: Math.random() > 0.3 ? date : null,
              createdAt: date,
              updatedAt: date,
            }
          });
          payoutsCreated++;
        } catch (e) {
          // Ignore duplicates
        }
      }
    }

    console.log(`✅ Created ${payoutsCreated} test payouts`);
    console.log('\n🎉 Seeding complete!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

seedAdmin();
