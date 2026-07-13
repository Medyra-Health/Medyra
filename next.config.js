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
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self';" },
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
