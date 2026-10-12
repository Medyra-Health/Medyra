import { hasPrivateAccess, verifyPrivatePassword, createPrivateSession, PRIVATE_COOKIE } from '@/lib/privateAccess'
import { maintenancePage } from '@/lib/maintenancePage'

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

function privateResponse(error = false) {
  return new NextResponse(maintenancePage(error), {
    status: error ? 401 : 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Retry-After': '3600' },
  })
}

export default async function middleware(request, event) {
  if (request.nextUrl.pathname === '/private-access' && request.method === 'POST') {
    // Reject cross-site submissions; passwords never appear in URLs or logs.
    const origin = request.headers.get('origin')
    if (!origin || origin !== request.nextUrl.origin) return privateResponse(true)
    let password
    try { password = (await request.formData()).get('password') } catch { return privateResponse(true) }
    if (!(await verifyPrivatePassword(password))) return privateResponse(true)
    const response = NextResponse.redirect(new URL('/', request.url), 303)
    response.cookies.set(PRIVATE_COOKIE, await createPrivateSession(password), {
      httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'strict', path: '/', maxAge: 60 * 60 * 8,
    })
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }
  if (!(await hasPrivateAccess(request))) {
    if (/^\/(api|trpc)(\/|$)/.test(request.nextUrl.pathname)) {
      return NextResponse.json({ error: 'Medyra is temporarily unavailable. Administrator access only.' }, { status: 503, headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' } })
    }
    return privateResponse()
  }
  const response = await appMiddleware(request, event)
  if (response && process.env.PRIVATE_SITE_ENABLED !== 'false') {
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  }
  return response
}

export const config = { matcher: ['/:path*'] }
