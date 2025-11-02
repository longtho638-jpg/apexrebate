// Temporarily no-op middleware to isolate server error
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
	locales: ['en', 'vi'],
	defaultLocale: 'vi',
	localeDetection: false
});

export const config = {
	matcher: ['/', '/(vi|en)/:path*']
};
