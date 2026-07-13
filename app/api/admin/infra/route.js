import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import {
  checkMongoHealth,
  checkStripeHealth,
  checkClerkHealth,
  checkVercelHealth,
  checkSearchConsoleHealth,
  checkAtlasHealth,
} from '@/lib/infraHealth'

const ADMIN_EMAILS = ['abralur28@gmail.com', 'philipp.mattar@googlemail.com']

export async function GET() {
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress
  if (!user || !ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [mongo, stripe, clerk, vercel, searchConsole, atlas] = await Promise.all([
    checkMongoHealth(),
    checkStripeHealth(),
    checkClerkHealth(),
    checkVercelHealth(),
    checkSearchConsoleHealth(),
    checkAtlasHealth(),
  ])

  return NextResponse.json({ mongo, stripe, clerk, vercel, searchConsole, atlas })
}
