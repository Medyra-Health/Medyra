
import { COMMERCE_ENABLED } from '@/lib/commerce'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/forgot-password(.*)',
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
  // Reachable so signed-out visitors get the sign-up gate instead of a 404.
  // The planner is still account-only: it renders inside <SignedIn>, and every
  // /api/medplan handler rejects unauthenticated requests with a 401.
  '/medplan(.*)',
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
  const pathname = request.nextUrl.pathname
  if (!COMMERCE_ENABLED && /^\/(pricing|success)(\/|$)/.test(pathname)) {
    return new NextResponse(null, { status: 404, headers: { 'X-Robots-Tag': 'noindex, nofollow' } })
  }
  if (!COMMERCE_ENABLED && /^\/api\/(checkout|billing-portal)(\/|$)/.test(pathname)) {
    return NextResponse.json({ error: 'Payments are temporarily unavailable' }, { status: 503 })
  }
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
