import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verify(sig: string, body: string, secret: string) {
  const mac = crypto.createHmac("sha256", secret).update(body).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(mac, "hex"));
  } catch {
    return false;
  }
}

async function withIdem(_key: string, fn: () => Promise<void>) {
  await fn();
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("x-signature") || "";
  const ts  = Number(req.headers.get("x-timestamp") || 0);
  if (Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
    return NextResponse.json({ error: "stale" }, { status: 401 });
  }
  const body = await req.text();
  if (!verify(sig, body, process.env.BROKER_HMAC!)) {
    return NextResponse.json({ error: "bad_sig" }, { status: 401 });
  }
  const evt = JSON.parse(body);
  await withIdem(`broker:${evt.id}`, async () => {
    // TODO: handle event
  });
  return NextResponse.json({ ok: true });
}
