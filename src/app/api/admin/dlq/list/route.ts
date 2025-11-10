import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// In-memory DLQ store (move to Neon when ready)
const dlqItems: Array<{
  id: string;
  kind: string;
  source: string;
  payload: unknown;
  attempts: number;
  createdAt: Date;
}> = [];

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json({
      items: dlqItems,
      count: dlqItems.length,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list DLQ items" },
      { status: 500 }
    );
  }
}
