import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  // Bảo vệ bằng HMAC bí mật 1 chiều truyền qua header
  const key = process.env.POLICY_BUNDLE_HMAC || "";
  const hdr = req.headers.get("x-bundle-key") || "";
  if (!key || hdr !== key) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const version = String(body?.version || "");
  const entries = body?.entries || {};
  const algo = String(body?.algo || "HMAC-SHA256");
  const sigHex = String(body?.sigHex || "");
  if (!version || !entries || !sigHex) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 422 });
  }

  // Verify signature: HMAC-SHA256(JSON.stringify({version, entries}))
  if (algo !== "HMAC-SHA256") {
    return NextResponse.json({ error: "unsupported_algo" }, { status: 422 });
  }
  const payload = JSON.stringify({ version, entries });
  const mac = crypto
    .createHmac("sha256", key)
    .update(payload)
    .digest("hex");
  if (
    !crypto.timingSafeEqual(
      Buffer.from(sigHex, "hex"),
      Buffer.from(mac, "hex")
    )
  ) {
    return NextResponse.json({ error: "bad_signature" }, { status: 401 });
  }

  // Lưu bundle, deactivate cũ
  await prisma.$transaction([
    prisma.policyBundle.updateMany({
      data: { active: false },
      where: { active: true },
    }),
    prisma.policyBundle.create({
      data: { version, algo, sigHex, entries, active: true },
    }),
  ]);
  return NextResponse.json({ ok: true, version });
}
