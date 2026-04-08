import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
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

  // Use Clerk backend SDK (secret key) — reliable regardless of middleware config
  try {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    const email = clerkUser.emailAddresses?.find(e => e.emailAddress === ADMIN_EMAIL)?.emailAddress
    if (!email) return NextResponse.json({ error: 'Forbidden — not admin email' }, { status: 403 })
  } catch (err) {
    return NextResponse.json({ error: 'Could not verify identity: ' + err.message }, { status: 500 })
  }

  const db = await getDb()
  const result = await db.collection('users').updateOne(
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

  return NextResponse.json({ success: true, modified: result.modifiedCount, upserted: result.upsertedCount })
}
