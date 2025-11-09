import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory idempotency store (for demo; use Redis/Neon in prod)
const processed = new Set<string>();

function verify(sig: string, body: string, secret: string): boolean {
  try {
    const mac = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(sig, 'hex'),
      Buffer.from(mac, 'hex')
    );
  } catch {
    return false;
  }
}

export async function handleBrokerWebhook(req: NextRequest) {
  // Validate timestamp (prevent replay)
  const ts = Number(req.headers.get('x-timestamp') || 0);
  if (Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
    return NextResponse.json({ error: 'stale_timestamp' }, { status: 401 });
  }

  // Validate signature
  const sig = req.headers.get('x-signature') || '';
  const body = await req.text();

  if (!process.env.BROKER_HMAC) {
    console.error('BROKER_HMAC not configured');
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  if (!verify(sig, body, process.env.BROKER_HMAC)) {
    return NextResponse.json({ error: 'bad_signature' }, { status: 401 });
  }

  // Parse event
  let evt: any;
  try {
    evt = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  // Check idempotency (prevent double-processing)
  const idemKey = `broker:${evt.id}:${evt.type}`;
  if (processed.has(idemKey)) {
    return NextResponse.json({ ok: true, cached: true }, { status: 200 });
  }

  // Process event
  try {
    // TODO: Call your business logic here
    // await processBrokerEvent(evt);
    processed.add(idemKey);

    // Cleanup old entries (every 100 events)
    if (processed.size > 1000) {
      processed.clear();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json(
      { error: 'processing_error' },
      { status: 500 }
    );
  }
}
