import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { toolId, affiliateCode } = body;

    // Validate affiliate code
    const affiliate = await db.user.findFirst({
      where: { referralCode: affiliateCode }
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: 'Invalid affiliate code' },
        { status: 400 }
      );
    }

    // Create affiliate link
    const affiliateLink = await db.toolAffiliateLink.upsert({
      where: {
        toolId_affiliateId: {
          toolId,
          affiliateId: affiliate.id
        }
      },
      update: {},
      create: {
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
    const session = await auth();
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
      const stats = await db.toolAffiliateLink.findMany({
        where: { 
          affiliateId: session.user.id,
          toolId 
        },
        include: {
          tool: {
            select: {
              name: true,
              price: true
            }
          },
          orders: {
            where: { status: 'COMPLETED' }
          }
        }
      });

      const affiliateStats = stats.map(link => ({
        id: link.id,
        toolName: link.tool.name,
        linkCode: link.linkCode,
        commission: link.commission,
        totalSales: link.orders.length,
        totalRevenue: link.orders.reduce((sum, order) => sum + order.amount, 0),
        totalCommission: link.orders.reduce((sum, order) => sum + (order.amount * link.commission / 100), 0),
        createdAt: link.createdAt
      }));

      return NextResponse.json({ affiliateStats });
    } else {
      // Get all affiliate links for user
      const affiliateLinks = await db.toolAffiliateLink.findMany({
        where: { affiliateId: session.user.id },
        include: {
          tool: {
            select: {
              name: true,
              price: true
            }
          },
          orders: {
            where: { status: 'COMPLETED' }
          }
        }
      });

      const totalStats = affiliateLinks.reduce((acc, link) => {
        return {
          totalLinks: acc.totalLinks + 1,
          totalSales: acc.totalSales + link.orders.length,
          totalRevenue: acc.totalRevenue + link.orders.reduce((sum, order) => sum + order.amount, 0),
          totalCommission: acc.totalCommission + link.orders.reduce((sum, order) => sum + (order.amount * link.commission / 100), 0)
        };
      }, { totalLinks: 0, totalSales: 0, totalRevenue: 0, totalCommission: 0 });

      return NextResponse.json({
        summary: totalStats,
        links: affiliateLinks.map(link => ({
          id: link.id,
          toolName: link.tool.name,
          linkCode: link.linkCode,
          commission: link.commission,
          sales: link.orders.length,
          revenue: link.orders.reduce((sum, order) => sum + order.amount, 0),
          commission: link.orders.reduce((sum, order) => sum + (order.amount * link.commission / 100), 0),
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