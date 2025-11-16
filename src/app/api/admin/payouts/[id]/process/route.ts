import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendPayoutNotification } from '@/lib/notifications/service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin or concierge
    if (session.user.role !== 'ADMIN' && session.user.role !== 'CONCIERGE') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const payoutId = id;

    // Find the payout
    const payout = await db.payouts.findUnique({
      where: { id: payoutId }
    });

    if (!payout) {
      return NextResponse.json(
        { error: 'Payout not found' },
        { status: 404 }
      );
    }

    // Update payout status to processed
    const updatedPayout = await db.payouts.update({
      where: { id: payoutId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedPayout,
      message: 'Payout processed successfully'
    });

  } catch (error) {
    console.error('Process payout error:', error);
    return NextResponse.json(
      { error: 'Failed to process payout' },
      { status: 500 }
    );
  }
}
