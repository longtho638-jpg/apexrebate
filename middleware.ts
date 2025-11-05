import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Create i18n middleware
const intlMiddleware = createMiddleware({
  locales: ['en', 'vi'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed'
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /uiux-v3 → / (301 permanent)
  if (pathname === '/uiux-v3') {
    return NextResponse.redirect(new URL('/', request.url), 301);
  }

  // Redirect /:locale/uiux-v3 → /:locale (301 permanent) - BEFORE intl middleware
  const match = pathname.match(/^\/(en|vi)\/uiux-v3$/);
  if (match) {
    const locale = match[1];
    const targetUrl = locale === 'vi' ? '/' : `/${locale}`;
    return NextResponse.redirect(new URL(targetUrl, request.url), 301);
  }

  // 🔒 AUTH PROTECTION: Check for protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/referrals', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || 
    pathname.startsWith(`${route}/`) ||
    pathname.match(new RegExp(`^/(en|vi)${route}(/|$)`))
  );

  if (isProtectedRoute) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // No token = redirect to signin
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Admin route protection
    if (pathname.includes('/admin')) {
      if (token.role !== 'ADMIN' && token.role !== 'CONCIERGE') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
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
