import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Production Seed API - Pages Router Version
 * More reliable for Vercel deployment
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Security check
    const auth = req.headers.authorization;
    if (!process.env.SEED_SECRET_KEY || auth !== `Bearer ${process.env.SEED_SECRET_KEY}`) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Valid SEED_SECRET_KEY required'
      });
    }

    if (req.method === 'GET') {
      // Check seed status
      const counts = {
        users: await prisma.user.count(),
        tools: await prisma.tool.count(),
        categories: await prisma.toolCategory.count(),
        achievements: await prisma.achievement.count(),
        payouts: await prisma.payout.count(),
        exchanges: await prisma.exchange.count(),
        exchangeAccounts: await prisma.exchangeAccount.count(),
        regions: await prisma.deploymentRegion.count(),
        mobileUsers: await prisma.mobileUser.count(),
        notifications: await prisma.notification.count(),
        activities: await prisma.userActivity.count()
      };

      const isSeeded = counts.users > 5;

      return res.json({
        seeded: isSeeded,
        data: counts,
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      // Check if already seeded
      const userCount = await prisma.user.count();
      if (userCount > 5) {
        return res.status(400).json({ 
          warning: 'Database appears to be already seeded',
          currentUsers: userCount,
          message: 'Delete existing data first or use force=true'
        });
      }

      // Dynamic import seed function
      const seedModule = await import('../../src/lib/seed-master');
      
      console.log('Starting production seed...');
      await seedModule.default();
      
      // Get final counts
      const counts = {
        users: await prisma.user.count(),
        tools: await prisma.tool.count(),
        categories: await prisma.toolCategory.count(),
        achievements: await prisma.achievement.count(),
        payouts: await prisma.payout.count(),
        exchanges: await prisma.exchange.count(),
        exchangeAccounts: await prisma.exchangeAccount.count(),
        regions: await prisma.deploymentRegion.count(),
        mobileUsers: await prisma.mobileUser.count(),
        notifications: await prisma.notification.count(),
        activities: await prisma.userActivity.count()
      };

      return res.json({ 
        success: true, 
        message: 'Production database seeded successfully',
        data: counts,
        timestamp: new Date().toISOString()
      });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (error: any) {
    console.error('Seed production failed:', error);
    return res.status(500).json({ 
      error: 'Seed failed', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
