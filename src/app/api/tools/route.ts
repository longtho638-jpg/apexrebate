import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause: any = {};
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    
    if (type && type !== 'all') {
      whereClause.type = type;
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build order clause
    let orderBy: any = {};
    switch (sort) {
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
      default:
        orderBy = { sales: 'desc' };
        break;
    }

    // Get tools with seller info
    const tools = await db.tool.findMany({
      where: whereClause,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            reviews: true,
            orders: true
          }
        }
      },
      orderBy,
      skip: offset,
      take: limit
    });

    // Get total count for pagination
    const total = await db.tool.count({ where: whereClause });

    // Calculate average rating for each tool
    const toolsWithRating = await Promise.all(
      tools.map(async (tool) => {
        const ratingData = await db.toolReview.aggregate({
          where: { toolId: tool.id },
          _avg: { rating: true },
          _count: { rating: true }
        });

        return {
          ...tool,
          rating: ratingData._avg.rating || 0,
          reviews: ratingData._count.rating || 0,
          sales: tool._count.orders
        };
      })
    );

    return NextResponse.json({
      tools: toolsWithRating,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

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
    const {
      name,
      description,
      price,
      category,
      type,
      image,
      features,
      requirements,
      documentation
    } = body;

    // Validate required fields
    if (!name || !description || !price || !category || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create tool
    const tool = await db.tool.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        type,
        image,
        features,
        requirements,
        documentation,
        sellerId: session.user.id,
        status: 'PENDING'
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    console.error('Error creating tool:', error);
    return NextResponse.json(
      { error: 'Failed to create tool' },
      { status: 500 }
    );
  }
}