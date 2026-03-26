const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['mongodb'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: ['*'],
    },
  },
  images: {
    domains: ['localhost', 'medyra.de'],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['en', 'de', 'bn', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'tr', 'ar', 'zh', 'ja', 'ko', 'hi', 'ru'],
    defaultLocale: 'en',
    localeDetection: true,
  },
};

module.exports = withPWA(nextConfig);
