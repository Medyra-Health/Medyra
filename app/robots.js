export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/upload',
          '/reports/',
          '/api/',
          '/success',
        ],
      },
    ],
    sitemap: 'https://medyra.de/sitemap.xml',
    host: 'https://medyra.de',
  }
}
