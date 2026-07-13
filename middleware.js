import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing(.*)',
  '/api/webhook/(.*)',
  '/api(.*)',
  '/lexikon(.*)',
  '/blog(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/contact(.*)',
  '/impressum(.*)',
  '/verstehen(.*)',
  '/check(.*)',
  '/arztbrief(.*)',
  '/entlassungsbericht(.*)',
  '/krankenkasse(.*)',
  '/medikamente(.*)',
  '/sprachen(.*)',
  '/share(.*)',
  '/app(.*)',
  '/manifest.json',
  '/sitemap.xml',
  '/robots.txt',
])

const SUPPORTED_LOCALES = ['en', 'de', 'bn', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'tr', 'ar', 'zh', 'ja', 'ko', 'hi', 'ur', 'ru']

// First-visit only: pick the best-matching supported locale from the
// browser's Accept-Language header, so a German browser sees German without
// the user having to find and use the language switcher.
function detectLocaleFromHeader(request) {
  const header = request.headers.get('accept-language') || ''
  const tags = header
    .split(',')
    .map(part => part.split(';')[0].trim().toLowerCase())
    .filter(Boolean)
  for (const tag of tags) {
    const base = tag.split('-')[0]
    if (SUPPORTED_LOCALES.includes(base)) return base
  }
  return null
}

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  const response = NextResponse.next()

  if (!request.cookies.has('locale')) {
    const detected = detectLocaleFromHeader(request)
    if (detected) {
      response.cookies.set('locale', detected, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
    }
  }

  return response
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
