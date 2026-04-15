import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

// Profile limits per tier
const PROFILE_LIMITS = {
  free:     0,
  onetime:  0,
  personal: 2,
  family:   5,
  clinic:   null, // unlimited
  admin:    null,
}

const ADMIN_EMAIL = 'abralur28@gmail.com'

let _client = null, _db = null
async function getDb() {
  if (_db) { try { await _db.admin().ping(); return _db } catch { _client = null; _db = null } }
  _client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })
  await _client.connect()
  _db = _client.db(process.env.DB_NAME || 'medyra')
  return _db
}

async function getEffectiveTier(userId) {
  try {
    const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
      cache: 'no-store',
    })
    if (res.ok) {
      const u = await res.json()
      const email = u.email_addresses?.[0]?.email_address
      if (email === ADMIN_EMAIL) return 'admin'
    }
  } catch {}
  const db = await getDb()
  const user = await db.collection('users').findOne({ clerkId: userId })
  return user?.subscription?.tier || 'free'
}

// GET /api/profiles — fetch all profiles for the user
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const user = await db.collection('users').findOne({ clerkId: userId })
  const tier = await getEffectiveTier(userId)
  // Use 'in' check — null means unlimited; ?? 0 would wrongly convert null→0
  const limit = tier in PROFILE_LIMITS ? PROFILE_LIMITS[tier] : 0

  return NextResponse.json({
    profiles: user?.profiles || [],
    tier,
    limit,
    unlimited: limit === null,
    canCreate: limit === null || (user?.profiles || []).length < limit,
  })
}

// POST /api/profiles — create a new profile
export async function POST(request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, dob, relationship, gender, color } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const db = await getDb()
  const user = await db.collection('users').findOne({ clerkId: userId })
  const tier = await getEffectiveTier(userId)
  const limit = tier in PROFILE_LIMITS ? PROFILE_LIMITS[tier] : 0

  if (limit !== null && (user?.profiles || []).length >= limit) {
    return NextResponse.json({
      error: 'profile_limit_reached',
      tier,
      limit,
      message: `Your ${tier} plan allows up to ${limit} profile${limit === 1 ? '' : 's'}. Upgrade to add more.`,
    }, { status: 403 })
  }

  const profile = {
    id: uuidv4(),
    name: name.trim(),
    dob: dob || null,
    relationship: relationship || 'self',
    gender: gender || 'prefer_not',
    color: color || 'emerald',
    biomarkers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await db.collection('users').updateOne(
    { clerkId: userId },
    { $push: { profiles: profile }, $set: { updatedAt: new Date() } },
    { upsert: true }
  )

  return NextResponse.json({ success: true, profile })
}

// PUT /api/profiles — update a profile or add biomarker entry
export async function PUT(request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { profileId, updates, biomarkerEntry } = body
  if (!profileId) return NextResponse.json({ error: 'profileId required' }, { status: 400 })

  const db = await getDb()

  if (biomarkerEntry) {
    // Add a biomarker snapshot to a profile
    await db.collection('users').updateOne(
      { clerkId: userId, 'profiles.id': profileId },
      {
        $push: { 'profiles.$.biomarkers': { ...biomarkerEntry, recordedAt: new Date() } },
        $set: { 'profiles.$.updatedAt': new Date() },
      }
    )
  } else if (updates) {
    const setFields = {}
    const allowed = ['name', 'dob', 'relationship', 'gender', 'color']
    allowed.forEach(k => { if (updates[k] !== undefined) setFields[`profiles.$.${k}`] = updates[k] })
    setFields['profiles.$.updatedAt'] = new Date()
    await db.collection('users').updateOne(
      { clerkId: userId, 'profiles.id': profileId },
      { $set: setFields }
    )
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/profiles?id=xxx — remove a profile
export async function DELETE(request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const profileId = searchParams.get('id')
  if (!profileId) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const db = await getDb()
  await db.collection('users').updateOne(
    { clerkId: userId },
    { $pull: { profiles: { id: profileId } } }
  )

  return NextResponse.json({ success: true })
}
