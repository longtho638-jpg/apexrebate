import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const b = await prisma.policyBundle.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    version: b?.version || "none",
    algo: b?.algo || null,
    sigHex: b?.sigHex || null,
    entries: (b?.entries as any) || {},
  });
}
