import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateTwoEyes } from "@/lib/twoEyes";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const twoEyesToken = req.headers.get("x-two-eyes");

  if (
    !twoEyesToken ||
    !validateTwoEyes(twoEyesToken, process.env.TWO_EYES_TOKEN || "")
  ) {
    return NextResponse.json(
      { error: "Invalid or missing 2-eyes token" },
      { status: 401 }
    );
  }

  try {
    const { id } = await req.json();

    return NextResponse.json({
      message: "DLQ item deleted",
      id,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete DLQ item" }, { status: 500 });
  }
}
