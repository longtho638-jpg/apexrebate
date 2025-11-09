import { NextRequest, NextResponse } from "next/server";

const OPA_URL =
  process.env.OPA_URL_PAYOUT ||
  process.env.OPA_URL ||
  "http://127.0.0.1:8181/v1/data/apex/payouts/allow_payout";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  // Input tối thiểu; client gửi đè để chi tiết hơn
  const input = {
    user: {
      kyc: !!body?.user?.kyc,
    },
    rules: {
      wash_trading_prohibited: true,
      self_referral_prohibited: true,
      clawback_window_days: Number(body?.rules?.clawback_window_days ?? 30),
    },
    flags: {
      kill_switch_payout: !!body?.flags?.kill_switch_payout,
    },
    txn: {
      value: Number(body?.txn?.value ?? 0),
      age_days: Number(body?.txn?.age_days ?? 0),
    },
  };

  const res = await fetch(OPA_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ input }),
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json(
      { allow: false, reason: "opa_unreachable", input },
      { status: 502 }
    );
  }
  const json = await res.json().catch(() => ({} as any));
  const allow =
    json?.result === true || json?.result?.allow_payout === true;
  return NextResponse.json({ allow, input, opa: json });
}
