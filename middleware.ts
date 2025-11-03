import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Create i18n middleware
const intlMiddleware = createMiddleware({
  locales: ['en', 'vi'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed'
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /uiux-v3 → / (301 permanent)
  if (pathname === '/uiux-v3') {
    return NextResponse.redirect(new URL('/', request.url), 301);
  }

  // Redirect /:locale/uiux-v3 → /:locale (301 permanent)
  if (pathname.match(/^\/(en|vi)\/uiux-v3$/)) {
    const locale = pathname.split('/')[1];
    return NextResponse.redirect(new URL(`/${locale}`, request.url), 301);
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
