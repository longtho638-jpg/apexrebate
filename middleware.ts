import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Simple in-memory rate limiter (for production, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per window
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return true;
  }

  userLimit.count++;
  return false;
}

// Create i18n middleware
const intlMiddleware = createMiddleware({
  locales: ['en', 'vi'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed'
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // Removed redirects for /uiux-v3 as we now have client-only pages

  // 🔒 AUTH PROTECTION: Check for protected routes
  // NOTE: /tools (browsing) is PUBLIC but /tools/upload and /tools/analytics are protected
  const protectedRoutes = ['/dashboard', '/profile', '/referrals', '/admin', '/tools/upload', '/tools/analytics'];
  
  // Extract locale from pathname if present (e.g., /vi/dashboard → vi)
  const localeMatch = pathname.match(/^\/(en|vi)(\/.*)?$/);
  const locale = localeMatch ? localeMatch[1] : null;
  const pathWithoutLocale = locale ? (localeMatch[2] || '/') : pathname;
  
  // Check if this is a protected route (with or without locale)
  const isProtectedRoute = protectedRoutes.some(route => 
    pathWithoutLocale === route || 
    pathWithoutLocale.startsWith(`${route}/`)
  );

  if (isProtectedRoute) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // No token = redirect to signin (locale-aware)
    if (!token) {
      const signInPath = locale ? `/${locale}/auth/signin` : '/auth/signin';
      const signInUrl = new URL(signInPath, request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // ✅ Enhanced admin route protection with proper path matching
    if (pathWithoutLocale === '/admin' || pathWithoutLocale.startsWith('/admin/')) {
      const userRole = (token.role as string) || 'USER';
      
      // Only ADMIN and CONCIERGE can access /admin
      if (userRole !== 'ADMIN' && userRole !== 'CONCIERGE') {
        const dashboardPath = locale ? `/${locale}/dashboard` : '/dashboard';
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
    }
  }

  // Apply i18n routing for all other requests
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Static files (_next/static)
  // - Images (_next/image, .ico, .png, .jpg, etc.)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\..*).*)']
};
