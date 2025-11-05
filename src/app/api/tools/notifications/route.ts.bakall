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
    const { type, toolId, message } = body;

    // Create notification for tool update
    if (type === 'tool_update') {
      // Find all users who favorited or purchased this tool
      const [favoritedUsers, purchasedUsers] = await Promise.all([
        db.toolFavorite.findMany({
          where: { toolId },
          select: { userId: true }
        }),
        db.toolOrder.findMany({
          where: { toolId, status: 'COMPLETED' },
          select: { buyerId: true }
        })
      ]);

      // Combine unique users
      const uniqueUserIds = new Set([
        ...favoritedUsers.map(f => f.userId),
        ...purchasedUsers.map(p => p.buyerId)
      ]);

      // Create notifications for all relevant users
      const notifications = await Promise.all(
        Array.from(uniqueUserIds).map(userId =>
          db.notification.create({
            data: {
              userId,
              type: 'tool_update',
              title: 'Cập nhật công cụ',
              message: message || 'Một công cụ bạn quan tâm đã được cập nhật',
              data: JSON.stringify({ toolId }),
              isRead: false
            }
          })
        )
      );

      return NextResponse.json({ 
        success: true, 
        notificationsCreated: notifications.length 
      });
    }

    return NextResponse.json(
      { error: 'Invalid notification type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error creating tool notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const whereClause: any = { userId: session.user.id };
    if (unreadOnly) {
      whereClause.isRead = false;
    }

    const notifications = await db.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await db.notification.count({ where: whereClause });
    const unreadCount = await db.notification.count({
      where: { userId: session.user.id, isRead: false }
    });

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}