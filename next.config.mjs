import nextIntl from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = nextIntl('./src/i18n/request.ts');

const config = {
  reactStrictMode: true,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    instrumentationHook: true,
  },
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
        destination: '/uiux-v5',
        permanent: true,
      },
      {
        source: '/:locale/uiux-v3',
        destination: '/:locale/uiux-v5',
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

// Wrap with Sentry if enabled
const finalConfig = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(
      withNextIntl(config),
      {
        // Sentry Webpack Plugin options
        silent: true,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
      {
        // Upload source maps for better error tracking
        widenClientFileUpload: true,
        transpileClientSDK: true,
        tunnelRoute: '/monitoring',
        hideSourceMaps: true,
        disableLogger: true,
      }
    )
  : withNextIntl(config);

export default finalConfig;
