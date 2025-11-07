import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function POST() {
  // Trả về ok ngay (mock)
  return NextResponse.json({ ok: true })
}
