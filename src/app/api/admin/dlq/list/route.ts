import { NextResponse } from "next/server";

// NOTE: dev in-memory; PRODUCTION: thay bằng Neon table (append-only)
const globalAny = global as unknown as { __DLQ__?: any[] };
globalAny.__DLQ__ ||= [
  {
    id: "e1",
    kind: "webhook",
    source: "brokerA",
    payload: { demo: true },
    attempts: 3,
    createdAt: Date.now() - 86400000,
  },
];

export async function GET() {
  const items = (globalAny.__DLQ__ || []).slice(0, 200);
  return NextResponse.json({ items });
}

export const dynamic = "force-dynamic";
