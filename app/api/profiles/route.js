import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { encrypt, decrypt, decryptProfile } from '@/lib/encryption'

// Profile limits per tier
const PROFILE_LIMITS = {
  free:     0,
  onetime:  0,
  personal: 2,
  family:   5,
  clinic:   null, // unlimited
  admin:    null,
}

const ADMIN_EMAILS = ['abralur28@gmail.com', 'philipp.mattar@googlemail.com']

let _client = null, _db = null
async function getDb() {
  if (_db) { try { await _db.admin().ping(); return _db } catch { _client = null; _db = null } }
  _client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })
  await _client.connect()
  _db = _client.db(process.env.DB_NAME || 'medyra')
  return _db
}

// M4: Resolve the primary verified email — not just email_addresses[0]
async function getEffectiveTier(userId) {
  try {
    const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
      cache: 'no-store',
    })
    if (res.ok) {
      const u = await res.json()
      const primaryId = u.primary_email_address_id
      const primaryEmailObj = u.email_addresses?.find(
        e => e.id === primaryId && e.verification?.status === 'verified'
      )
      if (primaryEmailObj && ADMIN_EMAILS.includes(primaryEmailObj.email_address)) return 'admin'
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
  const limit = tier in PROFILE_LIMITS ? PROFILE_LIMITS[tier] : 0

  // C3: Decrypt PII fields before returning to client
  const profiles = (user?.profiles || []).map(decryptProfile)

  return NextResponse.json({
    profiles,
    tier,
    limit,
    unlimited: limit === null,
    canCreate: limit === null || profiles.length < limit,
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

  // C3: Encrypt PII fields at rest
  const profile = {
    id: uuidv4(),
    name: encrypt(name.trim()),
    dob: dob ? encrypt(dob) : null,
    relationship: relationship || 'self',
    gender: encrypt(gender || 'prefer_not'),
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

  // Return decrypted profile to client
  return NextResponse.json({ success: true, profile: decryptProfile(profile) })
}

// PUT /api/profiles — update a profile or add biomarker entry
export async function PUT(request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { profileId, updates, biomarkerEntry } = body

  // M3: Validate profileId is a plain string (prevent NoSQL operator injection)
  if (!profileId || typeof profileId !== 'string') {
    return NextResponse.json({ error: 'profileId must be a non-empty string' }, { status: 400 })
  }

  const db = await getDb()

  if (biomarkerEntry) {
    // M3: Whitelist biomarkerEntry fields — never spread arbitrary user input into $push
    const safeEntry = {
      reportId: typeof biomarkerEntry.reportId === 'string' ? biomarkerEntry.reportId : undefined,
      recordedAt: new Date(),
      values: Array.isArray(biomarkerEntry.values)
        ? biomarkerEntry.values.map(v => ({
            key: typeof v.key === 'string' ? v.key : '',
            name: typeof v.name === 'string' ? v.name : '',
            value: typeof v.value === 'number' ? v.value : parseFloat(v.value) || 0,
            flag: ['normal', 'high', 'low', 'critical'].includes(v.flag) ? v.flag : 'normal',
          }))
        : [],
    }
    await db.collection('users').updateOne(
      { clerkId: userId, 'profiles.id': profileId },
      {
        $push: { 'profiles.$.biomarkers': safeEntry },
        $set: { 'profiles.$.updatedAt': new Date() },
      }
    )
  } else if (updates) {
    const setFields = {}
    // C3: Encrypt updated PII fields; whitelist allowed keys
    if (updates.name !== undefined) setFields['profiles.$.name'] = encrypt(String(updates.name))
    if (updates.dob !== undefined) setFields['profiles.$.dob'] = updates.dob ? encrypt(String(updates.dob)) : null
    if (updates.gender !== undefined) setFields['profiles.$.gender'] = encrypt(String(updates.gender))
    if (updates.relationship !== undefined) setFields['profiles.$.relationship'] = String(updates.relationship)
    if (updates.color !== undefined) setFields['profiles.$.color'] = String(updates.color)
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
  if (!profileId || typeof profileId !== 'string') {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const db = await getDb()
  await db.collection('users').updateOne(
    { clerkId: userId },
    { $pull: { profiles: { id: profileId } } }
  )

  return NextResponse.json({ success: true })
}
