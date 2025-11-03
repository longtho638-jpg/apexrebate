import { NextResponse } from 'next/server';

/**
 * Test API Route - Verify API routes work on Vercel
 */
export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    message: 'API routes are working',
    timestamp: new Date().toISOString()
  });
}
