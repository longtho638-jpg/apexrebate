export const runtime = 'edge'

/**
 * Edge proxy for backup cleanup service
 * Forwards requests to Firebase Functions backend
 */
export async function GET(req: Request) {
  return proxyRequest(req)
}

export async function POST(req: Request) {
  return proxyRequest(req)
}

async function proxyRequest(req: Request): Promise<Response> {
  const backend = process.env.BACKUP_SERVICE_URL
  if (!backend) {
    return new Response(JSON.stringify({ error: 'BACKUP_SERVICE_URL not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }

  const url = new URL(req.url)
  const target = backend + (url.search || '')
  const headers = new Headers(req.headers)

  // Inject auth token if backend requires authentication
  if (process.env.BACKUP_AUTH_TOKEN && !headers.has('authorization')) {
    headers.set('authorization', process.env.BACKUP_AUTH_TOKEN)
  }

  const resp = await fetch(target, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
  })

  return new Response(resp.body, {
    status: resp.status,
    headers: {
      'content-type': resp.headers.get('content-type') || 'application/json',
      'cache-control': 'no-store'
    }
  })
}
