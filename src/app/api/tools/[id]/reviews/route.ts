import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const reviews = await db.tool_reviews.findMany({
      where: { toolId: id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    });

    const reviewsWithParsedData = reviews.map(review => {
      const { users, ...rest } = review;
      const userData = users
        ? { id: users.id, name: users.name, avatar: users.image }
        : null;
      return {
        ...rest,
        user: userData,
        pros: review.pros ? JSON.parse(review.pros) : [],
        cons: review.cons ? JSON.parse(review.cons) : []
      };
    });

    const total = await db.tool_reviews.count({
      where: { toolId: id }
    });

    return NextResponse.json({
      reviews: reviewsWithParsedData,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const tool = await db.tools.findUnique({
      where: { id }
    });

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Check if user has purchased this tool
    const purchase = await db.tool_orders.findFirst({
      where: {
        toolId: id,
        buyerId: session.user.id,
        status: 'COMPLETED'
      }
    });

    const body = await request.json();
    const { rating, title, content, pros, cons } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const review = await db.tool_reviews.create({
      data: {
        id: randomUUID(),
        toolId: id,
        userId: session.user.id,
        rating,
        title,
        content,
        pros: pros ? JSON.stringify(pros) : null,
        cons: cons ? JSON.stringify(cons) : null,
        verified: !!purchase,
        updatedAt: new Date()
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    const { users, ...rest } = review;
    const userData = users
      ? { id: users.id, name: users.name, avatar: users.image }
      : null;
    const reviewWithParsedData = {
      ...rest,
      user: userData,
      pros: review.pros ? JSON.parse(review.pros) : [],
      cons: review.cons ? JSON.parse(review.cons) : []
    };

    return NextResponse.json(reviewWithParsedData, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
