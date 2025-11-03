import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

// Create i18n middleware
const intlMiddleware = createMiddleware({
  locales: ['en', 'vi'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed'
});

export default function middleware(request: NextRequest) {
  // Apply i18n routing
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Static files (_next/static)
  // - Images (_next/image, .ico, .png, .jpg, etc.)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\..*).*)']
};
