import { NextResponse } from 'next/server'
import { verifyPrivatePassword, createPrivateSession, PRIVATE_COOKIE } from '@/lib/privateAccess'
import { maintenancePage } from '@/lib/maintenancePage'
import { recordAccessAttempt } from '@/lib/accessAttempts'

export const runtime = 'nodejs'
function rejected() {
  return new NextResponse(maintenancePage(true), { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' } })
}
export async function POST(request) {
  const origin = request.headers.get('origin')
  if (!origin || origin !== request.nextUrl.origin) {
    await recordAccessAttempt(request, 'cross_site_rejected')
    return rejected()
  }
  let password
  try { password = (await request.formData()).get('password') } catch {
    await recordAccessAttempt(request, 'invalid_request')
    return rejected()
  }
  const valid = await verifyPrivatePassword(password)
  await recordAccessAttempt(request, valid ? 'success' : 'incorrect_password')
  if (!valid) return rejected()
  const response = NextResponse.redirect(new URL('/',request.url),303)
  response.cookies.set(PRIVATE_COOKIE, await createPrivateSession(password), { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'strict', path: '/', maxAge: 8 * 60 * 60 })
  response.headers.set('Cache-Control','private, no-store')
  return response
}
