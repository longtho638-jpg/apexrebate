import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateTwoEyes, verifyIdempotencyKey } from "@/lib/twoEyes";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const twoEyesToken = req.headers.get("x-two-eyes");
  const idempotencyKey = req.headers.get("x-idempotency-key");

  if (
    !twoEyesToken ||
    !validateTwoEyes(twoEyesToken, process.env.TWO_EYES_TOKEN || "")
  ) {
    return NextResponse.json(
      { error: "Invalid or missing 2-eyes token" },
      { status: 401 }
    );
  }

  if (!idempotencyKey || !verifyIdempotencyKey(idempotencyKey)) {
    return NextResponse.json(
      { error: "Invalid idempotency key" },
      { status: 400 }
    );
  }

  try {
    const { id } = await req.json();

    return NextResponse.json({
      message: "DLQ item replayed",
      id,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to replay DLQ item" }, { status: 500 });
  }
}
