import { NextResponse } from "next/server";
import { checkTwoEyes } from "@/src/lib/twoEyes";

const globalAny = global as unknown as { __DLQ__?: any[] };
globalAny.__DLQ__ ||= [];

export async function POST(req: Request) {
  if (!checkTwoEyes(req))
    return NextResponse.json({ error: "two_eyes_required" }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  const idx = globalAny.__DLQ__!.findIndex((x: any) => x.id === id);
  if (idx < 0) return NextResponse.json({ error: "not_found" }, { status: 404 });

  globalAny.__DLQ__!.splice(idx, 1);
  return NextResponse.json({ ok: true, deleted: id });
}

export const dynamic = "force-dynamic";
