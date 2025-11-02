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
    const tool = await db.tool.findUnique({
      where: { id },
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
      }
    });

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const ratingData = await db.toolReview.aggregate({
      where: { toolId: id },
      _avg: { rating: true },
      _count: { rating: true }
    });

    // Check if user has favorited or purchased this tool
    const session = await getServerSession(authOptions);
    let isFavorited = false;
    let isPurchased = false;

    if (session?.user) {
      const favorite = await db.toolFavorite.findUnique({
        where: {
          toolId_userId: {
            toolId: id,
            userId: session.user.id
          }
        }
      });
      isFavorited = !!favorite;

      const purchase = await db.toolOrder.findFirst({
        where: {
          toolId: id,
          buyerId: session.user.id,
          status: 'COMPLETED'
        }
      });
      isPurchased = !!purchase;
    }

    const toolWithDetails = {
      ...tool,
      rating: ratingData._avg.rating || 0,
      reviews: ratingData._count.rating || 0,
      sales: tool._count.orders,
      isFavorited,
      isPurchased,
      features: tool.features ? JSON.parse(tool.features) : [],
      requirements: tool.requirements ? JSON.parse(tool.requirements) : []
    };

    return NextResponse.json(toolWithDetails);
  } catch (error) {
    console.error('Error fetching tool:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const tool = await db.tool.findUnique({
      where: { id }
    });

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Check if user is the seller
    if (tool.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the seller can update this tool' },
        { status: 403 }
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

    const updatedTool = await db.tool.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        type,
        image,
        features,
        requirements,
        documentation
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

    return NextResponse.json(updatedTool);
  } catch (error) {
    console.error('Error updating tool:', error);
    return NextResponse.json(
      { error: 'Failed to update tool' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const tool = await db.tool.findUnique({
      where: { id }
    });

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Check if user is the seller or admin
    if (tool.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only the seller or admin can delete this tool' },
        { status: 403 }
      );
    }

    await db.tool.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Tool deleted successfully' });
  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json(
      { error: 'Failed to delete tool' },
      { status: 500 }
    );
  }
}