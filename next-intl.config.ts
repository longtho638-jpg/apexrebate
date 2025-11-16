import { defineConfig } from 'next-intl/config';

export default defineConfig({
  locales: ['en', 'vi', 'th', 'id'],
  defaultLocale: 'vi',
  localeDetection: true,
});
