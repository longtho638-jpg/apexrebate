import nextIntl from 'next-intl/plugin';

const withNextIntl = nextIntl('./src/i18n/request.ts');

const config: import('next').NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {},
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://fonts.googleapis.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: wss:; frame-src 'none';",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.apexrebate.com',
          },
        ],
        destination: 'https://apexrebate.com/:path*',
        permanent: true,
      },
      // Make /uiux-v3 an internal alias that redirects to the root
      {
        source: '/uiux-v3',
        destination: '/',
        permanent: true,
      },
      // Locale-aware alias: /:locale/uiux-v3 -> /:locale
      {
        source: '/:locale/uiux-v3',
        destination: '/:locale',
        permanent: true,
      },
      // Fix /tools redirect to use default locale (English)
      {
        source: '/tools',
        destination: '/en/tools',
        permanent: false, // Use 307 temporary redirect để có thể thay đổi sau
      },
    ];
  },
};

export default withNextIntl(config);
