import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
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

// POST /api/admin/activate — sets subscription.tier to 'admin' for the admin account
export async function POST() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const email = user.emailAddresses?.find(e => e.emailAddress === ADMIN_EMAIL)?.emailAddress
  if (!email) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const db = await getDb()
  const result = await db.collection('users').updateOne(
    { clerkId: user.id },
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
