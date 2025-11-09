import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DEFAULT_THRESHOLDS = {
  p95_edge: 250,
  p95_node: 450,
  error_rate: 0.001
};

export async function GET() {
  const file = process.env.SLO_JSON_PATH || "evidence/otel/summary.json";
  let json: any = { ts: Date.now(), data: [] };
  try {
    const full = path.resolve(process.cwd(), file);
    json = JSON.parse(fs.readFileSync(full, "utf8"));
  } catch {
    // ignore; keep empty
  }
  const thresholds = DEFAULT_THRESHOLDS;
  const rows = (json.data || []).map((r: any) => {
    const error_rate = r.count ? r.errors / r.count : 0;
    const status =
      (r.p95_ms <= thresholds.p95_edge && error_rate <= thresholds.error_rate) ? "OK" : "ALERT";
    return { 
      route: r.route, 
      count: r.count, 
      errors: r.errors, 
      p95_ms: r.p95_ms, 
      p99_ms: r.p99_ms, 
      error_rate: Number(error_rate.toFixed(4)), 
      status 
    };
  });
  const ok = rows.filter((x:any)=>x.status==="OK").length;
  const alert = rows.length - ok;
  return NextResponse.json({ ts: json.ts, thresholds, ok, alert, rows });
}
