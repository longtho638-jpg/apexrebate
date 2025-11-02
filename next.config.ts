// next.config.ts
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
    ];
  },
};

export default withNextIntl(config);