import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { toolId, affiliateCode } = body;

    // Validate affiliate code
    const affiliate = await db.users.findFirst({
      where: { referralCode: affiliateCode }
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Invalid affiliate code' },
        { status: 400 }
      );
    }

    // Create affiliate link
    const affiliateLink = await db.tool_affiliate_links.upsert({
      where: {
        toolId_affiliateId: {
          toolId,
          affiliateId: affiliate.id
        }
      },
      update: {},
      create: {
        id: randomUUID(),
        toolId,
        affiliateId: affiliate.id,
        linkCode: `${affiliateCode}-${toolId.slice(-8)}`,
        commission: 10.0, // 10% commission
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      affiliateLink: {
        id: affiliateLink.id,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/tools/${toolId}?ref=${affiliateLink.linkCode}`,
        commission: affiliateLink.commission
      }
    });
  } catch (error) {
    console.error('Error creating affiliate link:', error);
    return NextResponse.json(
      { error: 'Failed to create affiliate link' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('toolId');

    if (toolId) {
      // Get affiliate stats for specific tool
      const stats = await db.tool_affiliate_links.findMany({
        where: { 
          affiliateId: session.user.id,
          toolId 
        },
        include: {
          tools: {
            select: {
              name: true,
              price: true
            }
          },
          tool_orders: {
            where: { status: 'COMPLETED' }
          }
        }
      });

      const affiliateStats = stats.map(link => ({
        id: link.id,
        toolName: link.tools.name,
        linkCode: link.linkCode,
        commission: link.commission,
        totalSales: link.tool_orders.length,
        totalRevenue: link.tool_orders.reduce((sum, order) => sum + order.amount, 0),
        totalCommission: link.tool_orders.reduce((sum, order) => sum + (order.amount * link.commission / 100), 0),
        createdAt: link.createdAt
      }));

      return NextResponse.json({ affiliateStats });
    } else {
      // Get all affiliate links for user
      const affiliateLinks = await db.tool_affiliate_links.findMany({
        where: { affiliateId: session.user.id },
        include: {
          tools: {
            select: {
              name: true,
              price: true
            }
          },
          tool_orders: {
            where: { status: 'COMPLETED' }
          }
        }
      });

      const totalStats = affiliateLinks.reduce((acc, link) => {
        return {
          totalLinks: acc.totalLinks + 1,
          totalSales: acc.totalSales + link.tool_orders.length,
          totalRevenue: acc.totalRevenue + link.tool_orders.reduce((sum, order) => sum + order.amount, 0),
          totalCommission: acc.totalCommission + link.tool_orders.reduce((sum, order) => sum + (order.amount * link.commission / 100), 0)
        };
      }, { totalLinks: 0, totalSales: 0, totalRevenue: 0, totalCommission: 0 });

      return NextResponse.json({
        summary: totalStats,
        links: affiliateLinks.map(link => ({
          id: link.id,
          toolName: link.tools.name,
          linkCode: link.linkCode,
          commissionRate: link.commission,
          sales: link.tool_orders.length,
          revenue: link.tool_orders.reduce((sum, order) => sum + order.amount, 0),
          commissionEarned: link.tool_orders.reduce((sum, order) => sum + (order.amount * link.commission / 100), 0),
          createdAt: link.createdAt
        }))
      });
    }
  } catch (error) {
    console.error('Error fetching affiliate data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate data' },
      { status: 500 }
    );
  }
}
