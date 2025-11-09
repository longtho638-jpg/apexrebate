// Security headers for Next.js middleware or vercel.json
// Use in middleware.ts or configure in next.config.ts

export const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Prevent MIME sniffing
  'X-Content-Type-Options': 'nosniff',
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Permissions policy (formerly Feature-Policy)
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  // Strict transport security
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  // CSP (non-strict version for compatibility)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'strict-dynamic' https: 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "connect-src 'self' https: wss:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  // Additional security headers
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block'
};

export function addSecurityHeaders(res: any) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  return res;
}
