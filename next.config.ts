import nextIntl from 'next-intl/plugin';

const withNextIntl = nextIntl('./src/i18n/request.ts');

const config: import('next').NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {},
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
    ];
  },
};

export default withNextIntl(config);
