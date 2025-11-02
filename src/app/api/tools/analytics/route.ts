import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

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
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Overview statistics
    const [totalTools, totalSales, totalRevenue, activeSellers] = await Promise.all([
      db.tool.count({
        where: { status: 'APPROVED' }
      }),
      db.toolOrder.count({
        where: {
          createdAt: { gte: startDate },
          status: 'COMPLETED'
        }
      }),
      db.toolOrder.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),
      db.user.count({
        where: {
          toolsSold: {
            some: {
              status: 'APPROVED'
            }
          }
        }
      })
    ]);

    // Average rating
    const avgRatingResult = await db.toolReview.aggregate({
      _avg: { rating: true }
    });

    // Top tools by revenue
    const topTools = await db.tool.findMany({
      where: { status: 'APPROVED' },
      include: {
        orders: {
          where: {
            createdAt: { gte: startDate },
            status: 'COMPLETED'
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        categoryObj: {
          select: {
            name: true
          }
        }
      },
      take: 10
    });

    const topToolsData = topTools
      .map(tool => {
        const revenue = tool.orders.reduce((sum, order) => sum + order.amount, 0);
        const sales = tool.orders.length;
        const avgRating = tool.reviews.length > 0 
          ? tool.reviews.reduce((sum, review) => sum + review.rating, 0) / tool.reviews.length 
          : 0;

        return {
          id: tool.id,
          name: tool.name,
          sales,
          revenue,
          rating: avgRating,
          category: tool.categoryObj?.name || 'Unknown'
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Category statistics
    const categoryStats = await db.toolCategory.findMany({
      include: {
        tools: {
          where: { status: 'APPROVED' },
          include: {
            orders: {
              where: {
                createdAt: { gte: startDate },
                status: 'COMPLETED'
              }
            }
          }
        }
      }
    });

    const categoryStatsData = categoryStats.map(category => {
      const toolCount = category.tools.length;
      const revenue = category.tools.reduce((sum, tool) => 
        sum + tool.orders.reduce((orderSum, order) => orderSum + order.amount, 0), 0
      );
      
      // Calculate growth (mock data for now)
      const growth = Math.floor(Math.random() * 20) - 5; // -5 to 15%

      return {
        category: category.name,
        count: toolCount,
        revenue,
        growth
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Recent sales
    const recentSales = await db.toolOrder.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        tool: {
          select: {
            name: true
          }
        },
        buyer: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const recentSalesData = recentSales.map(sale => ({
      id: sale.id,
      toolName: sale.tool.name,
      buyerName: sale.buyer.name || 'Anonymous',
      amount: sale.amount,
      timestamp: sale.createdAt.toISOString()
    }));

    // Calculate growth rate (mock data for now)
    const growthRate = Math.floor(Math.random() * 15) + 5; // 5-20%

    const analyticsData = {
      overview: {
        totalTools,
        totalSales,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeSellers,
        averageRating: avgRatingResult._avg.rating || 0,
        growthRate
      },
      topTools: topToolsData,
      categoryStats: categoryStatsData,
      recentSales: recentSalesData
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching tools analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}