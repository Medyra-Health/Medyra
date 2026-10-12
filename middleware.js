import { hasPrivateAccess } from '@/lib/privateAccess'

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
  '/pricing(.*)',
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

const appMiddleware = clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname
  if (!COMMERCE_ENABLED && /^\/success(\/|$)/.test(pathname)) {
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

export default async function middleware(request, event) {
  if (!(await hasPrivateAccess(request))) {
    return new NextResponse('Medyra is currently private. Please enter the shared access credentials.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Medyra private preview", charset="UTF-8"',
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }
  const response = await appMiddleware(request, event)
  if (response && process.env.PRIVATE_SITE_ENABLED !== 'false') {
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  }
  return response
}

// Cover pages, API endpoints and direct public file requests.
export const config = { matcher: ['/:path*'] }
