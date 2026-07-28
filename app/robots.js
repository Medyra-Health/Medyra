export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // robots.txt is public, so anything named here is announced to the
        // world. Account-only routes (dashboard, upload, reports, profiles,
        // prep, clinic, success, admin) are deliberately NOT listed: Clerk
        // already returns 404 to anonymous crawlers, so a rule would add no
        // protection while publishing a map of the private surface.
        // Only paths that really answer 200 to a bot belong here.
        disallow: [
          '/api/',
          '/share/',
          '/sso-callback',
          '/forgot-password',
        ],
      },
    ],
    sitemap: 'https://medyra.de/sitemap.xml',
    host: 'https://medyra.de',
  }
}
