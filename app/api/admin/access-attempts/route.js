import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { accessAttemptsCollection } from '@/lib/accessAttempts'

const ADMIN_EMAILS = ['abralur28@gmail.com', 'philipp.mattar@googlemail.com']
export async function GET() {
  const user = await currentUser()
  if (!user?.emailAddresses?.some(item => item.verification?.status === 'verified' && ADMIN_EMAILS.includes(item.emailAddress.toLowerCase()))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const collection = await accessAttemptsCollection()
    const cutoff = new Date(Date.now()-30*86400000)
    const filter = { createdAt: { $gte: cutoff } }
    const [total, success, sources, attempts] = await Promise.all([
      collection.countDocuments(filter),
      collection.countDocuments({ ...filter, result: 'success' }),
      collection.distinct('ip',{ ...filter, ip: { $ne: null } }),
      collection.find(filter, { projection: { createdAt: 1, result: 1, ip: 1, country: 1, region: 1, city: 1, userAgent: 1 } }).sort({ createdAt: -1 }).limit(100).toArray(),
    ])
    return NextResponse.json({ total, success, failed: total-success, sources: sources.length, attempts, retentionDays: 30 }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch { return NextResponse.json({ error: 'Access logs are currently unavailable. Please try again.' },{ status: 503 }) }
}
