import { NextResponse } from "next/server";
import crypto from "crypto";
import { checkTwoEyes, getIdem } from "@/src/lib/twoEyes";

const globalAny = global as unknown as { __DLQ__?: any[]; __IDEM__?: Set<string> };
globalAny.__DLQ__ ||= [];
globalAny.__IDEM__ ||= new Set<string>();

function ok(body: any, status = 200) {
  return NextResponse.json(body, { status });
}

function bad(body: any, status = 400) {
  return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
  if (!checkTwoEyes(req)) return bad({ error: "two_eyes_required" }, 401);

  const idem = getIdem(req);
  if (!idem) return bad({ error: "idempotency_required" }, 409);
  if (globalAny.__IDEM__!.has(idem)) return ok({ ok: true, dedup: true });
  globalAny.__IDEM__!.add(idem);

  const body = await req.json().catch(() => ({}));
  const { id } = body as { id?: string };
  if (!id) return bad({ error: "missing_id" }, 422);

  const itemIdx = globalAny.__DLQ__!.findIndex((x: any) => x.id === id);
  if (itemIdx < 0) return bad({ error: "not_found" }, 404);
  const item = globalAny.__DLQ__![itemIdx];

  // HMAC demo cho replay payload (nối với broker/webhook thật ở prod)
  const payload = JSON.stringify(item.payload ?? {});
  const secret = process.env.BROKER_HMAC || "demo";
  const mac = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  // TODO: gửi lại tới endpoint thật (fetch) kèm header HMAC + timestamp
  // await fetch(process.env.REPLAY_TARGET!, { method:"POST", headers:{ "x-signature": mac, "x-timestamp": Date.now().toString() }, body: payload })

  // Giả lập: xóa khỏi DLQ khi "thành công"
  globalAny.__DLQ__!.splice(itemIdx, 1);
  return ok({ ok: true, replayed: id, hmac: mac });
}

export const dynamic = "force-dynamic";
