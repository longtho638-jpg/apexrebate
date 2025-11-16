import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    if (tool.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Tool is not available for purchase' },
        { status: 400 }
      );
    }

    // Check if user already purchased this tool
    const existingPurchase = await db.tool_orders.findFirst({
      where: {
        toolId: id,
        buyerId: session.user.id,
        status: 'COMPLETED'
      }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You have already purchased this tool' },
        { status: 400 }
      );
    }

    // Create order
    const order = await db.tool_orders.create({
      data: {
        id: randomUUID(),
        toolId: id,
        buyerId: session.user.id,
        sellerId: tool.sellerId,
        amount: tool.price,
        currency: 'USD',
        status: 'PENDING',
        downloadUrl: `https://apexrebate.com/tools/${id}/download`,
        licenseKey: generateLicenseKey(),
        updatedAt: new Date()
      },
      include: {
        tools: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    });

    const seller = await db.users.findUnique({
      where: { id: tool.sellerId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    const { tools: toolInfo, ...orderRest } = order;

    return NextResponse.json(
      {
        ...orderRest,
        tool: toolInfo,
        seller
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    if (i > 0) result += '-';
    for (let j = 0; j < 4; j++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
}
