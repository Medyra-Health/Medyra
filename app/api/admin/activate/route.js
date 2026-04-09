import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { MongoClient } from 'mongodb'

const ADMIN_EMAIL = 'abralur28@gmail.com'

let _client = null
let _db = null
async function getDb() {
  if (_db) { try { await _db.admin().ping(); return _db } catch { _client = null; _db = null } }
  _client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 5, serverSelectionTimeoutMS: 5000 })
  await _client.connect()
  _db = _client.db(process.env.DB_NAME || 'medyra')
  return _db
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify email via direct Clerk REST API — no SDK, always works
  const clerkRes = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  })
  if (!clerkRes.ok) {
    return NextResponse.json({ error: 'Failed to verify identity with Clerk' }, { status: 500 })
  }
  const clerkUser = await clerkRes.json()
  const email = clerkUser.email_addresses?.[0]?.email_address
  if (email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: `Forbidden — ${email} is not the admin account` }, { status: 403 })
  }

  const db = await getDb()
  await db.collection('users').updateOne(
    { clerkId: userId },
    {
      $set: {
        email: ADMIN_EMAIL,
        'subscription.tier': 'admin',
        'subscription.status': 'active',
        'subscription.usageLimit': 999999,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  )

  return NextResponse.json({ success: true, message: 'Admin access activated' })
}
