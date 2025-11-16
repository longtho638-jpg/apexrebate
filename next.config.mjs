import nextIntl from 'next-intl/plugin';

const withNextIntl = nextIntl('./src/i18n/request.ts');

const config = {
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
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.apexrebate.com' }],
        destination: 'https://apexrebate.com/:path*',
        permanent: true,
      },
      {
        source: '/uiux-v3',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:locale/uiux-v3',
        destination: '/:locale',
        permanent: true,
      },
      {
        source: '/tools',
        destination: '/en/tools',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(config);
