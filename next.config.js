const createNextIntlPlugin = require('next-intl/plugin')
const withNextIntl = createNextIntlPlugin('./i18n.js')

const nextConfig = {
  images: { unoptimized: true },
  serverExternalPackages: ['mongodb'],
  // The catch-all API route serves lexikon data via fs; make sure the JSON
  // files are traced into the serverless bundle on Vercel.
  outputFileTracingIncludes: {
    '/api/[[...path]]': ['./data/lexikon/**/*'],
  },
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' }
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  },
  async headers() {
    return [
      {
        // H2: Prevent clickjacking — no external site may frame any page
        // H1: CORS is handled per-route in the API handler; no global wildcard here
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "frame-ancestors 'self'",
              // Clerk's UI, Stripe Checkout, and GA/GTM all inject <script> tags at runtime
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://api.stripe.com https://www.google-analytics.com https://analytics.google.com",
              "frame-src 'self' https://js.stripe.com https://*.clerk.accounts.dev https://*.clerk.com",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), interest-cohort=()' },
        ]
      }
    ]
  }
}

module.exports = withNextIntl(nextConfig)
