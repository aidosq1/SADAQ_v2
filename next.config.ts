import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: false,

  async redirects() {
    return [
      // Старая заглушка входа для представителей
      { source: '/:locale(ru|kk|en)/calendar/register', destination: '/:locale/auth/signin', permanent: true },
      { source: '/calendar/register', destination: '/auth/signin', permanent: true },
      // Дубль страницы истории
      { source: '/:locale(ru|kk|en)/history', destination: '/:locale/about/history', permanent: true },
      { source: '/history', destination: '/about/history', permanent: true },
    ];
  },

  // JSON из API не должен попадать в поиск; robots.txt его не закрывает,
  // чтобы поисковик мог отрисовать клиентские страницы
  async headers() {
    return [
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
