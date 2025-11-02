import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tool = await db.tool.findUnique({
      where: { id: params.id }
    });

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await db.toolFavorite.findUnique({
      where: {
        toolId_userId: {
          toolId: params.id,
          userId: session.user.id
        }
      }
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Tool already favorited' },
        { status: 400 }
      );
    }

    const favorite = await db.toolFavorite.create({
      data: {
        toolId: params.id,
        userId: session.user.id
      }
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const favorite = await db.toolFavorite.findUnique({
      where: {
        toolId_userId: {
          toolId: params.id,
          userId: session.user.id
        }
      }
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    await db.toolFavorite.delete({
      where: {
        toolId_userId: {
          toolId: params.id,
          userId: session.user.id
        }
      }
    });

    return NextResponse.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}