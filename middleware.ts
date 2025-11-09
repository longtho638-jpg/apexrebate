import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Mapping of country codes to locales (same as geo-detection.ts)
const COUNTRY_TO_LOCALE: Record<string, string> = {
  // Vietnamese speakers
  'VN': 'vi',
  'KH': 'vi',
  
  // English speakers (default)
  'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en', 'IE': 'en', 'NZ': 'en',
  'SG': 'en', 'HK': 'en', 'PH': 'en', 'IN': 'en', 'MY': 'en', 'TH': 'en',
  'ID': 'en', 'JP': 'en', 'KR': 'en', 'CN': 'en', 'TW': 'en', 'ZA': 'en',
};

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

/**
 * Detect locale from IP geolocation (Cloudflare or Accept-Language)
 */
function detectLocaleFromIP(request: NextRequest): string {
  // Try Cloudflare IP geolocation first
  const cfCountry = request.headers.get('cf-ipcountry');
  if (cfCountry) {
    const locale = COUNTRY_TO_LOCALE[cfCountry.toUpperCase()];
    if (locale) {
      console.log(`[middleware] Locale detected from IP (CF): ${cfCountry} → ${locale}`);
      return locale;
    }
  }

  // Fallback to Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || '';
  if (acceptLanguage.includes('vi')) {
    console.log(`[middleware] Locale detected from Accept-Language: vi`);
    return 'vi';
  }

  console.log(`[middleware] Using default locale: vi`);
  return 'vi';
}

// Create i18n middleware with custom locale detection
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

  // Auto-detect and redirect to appropriate locale for root path
  if (pathname === '/' || pathname === '') {
    const detectedLocale = detectLocaleFromIP(request);
    const redirectPath = detectedLocale === 'vi' ? '/' : '/en';
    console.log(`[middleware] Redirecting root path to: ${redirectPath} (IP locale: ${detectedLocale})`);
    return NextResponse.redirect(new URL(redirectPath, request.url));
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
