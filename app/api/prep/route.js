import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { MongoClient } from 'mongodb'

const ADMIN_EMAIL = 'abralur28@gmail.com'

async function isAdminUser() {
  try {
    const user = await currentUser()
    return user?.emailAddresses?.some(e => e.emailAddress === ADMIN_EMAIL) || false
  } catch {
    return false
  }
}

// ── Anthropic ──────────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── System prompt ──────────────────────────────────────────────────────────
const PREP_SYSTEM_PROMPT = `You are a medical communication assistant helping patients prepare for a doctor's appointment in Germany.

Your job is to take the patient's free-form description of their symptoms and situation — written in any language — and convert it into a structured, professional German summary they can show to their doctor.

STRICT RULES:
- Never diagnose anything
- Never suggest medications or treatments
- Never say what the patient "might have" or "could be"
- Never use alarmist language
- Always frame output as "the patient reports..." not "the patient has..."
- Output must be in German
- Keep a neutral, clinical-communication tone
- End every output with this disclaimer in German: "Dieses Dokument wurde zur Kommunikation erstellt und stellt keine medizinische Diagnose dar."

OUTPUT STRUCTURE (always follow this exactly):

**Patientenzusammenfassung für den Arztbesuch**

Datum: [today's date in German format DD.MM.YYYY]

**Hauptbeschwerden**
[2-4 bullet points of the main symptoms the patient described, in German]

**Zeitlicher Verlauf**
[When symptoms started, how they've changed]

**Begleitende Symptome**
[Any secondary symptoms mentioned]

**Relevante Vorgeschichte**
[Any medications, allergies, past conditions the patient mentioned. If none mentioned, write: "Keine Angaben"]

**Fragen an den Arzt**
[Generate 3 sensible questions the patient might want to ask, based on what they described. Frame as questions, not conclusions.]

Dieses Dokument wurde zur Kommunikation erstellt und stellt keine medizinische Diagnose dar.`

// ── Tier limits (uses per calendar month, null = unlimited) ────────────────
const PREP_LIMITS = {
  free:     1,
  onetime:  1,
  personal: null,
  family:   null,
  clinic:   null,
  admin:    null,
}

// ── MongoDB ────────────────────────────────────────────────────────────────
let _client = null
let _db = null

async function getDb() {
  if (_db) {
    try { await _db.admin().ping(); return _db } catch { _client = null; _db = null }
  }
  _client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })
  await _client.connect()
  _db = _client.db(process.env.DB_NAME || 'medyra')
  return _db
}

// ── Route handler ──────────────────────────────────────────────────────────
export async function POST(request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const input = (body.input || '').trim()

  if (!input || input.length < 10) {
    return NextResponse.json({ error: 'Please describe your symptoms in more detail.' }, { status: 400 })
  }

  // Soft-cap input at ~800 tokens (~3200 chars) to control cost
  const cappedInput = input.slice(0, 3200)

  // ── Tier + usage check ───────────────────────────────────────────────────
  const db = await getDb()
  const [user, admin] = await Promise.all([
    db.collection('users').findOne({ clerkId: userId }),
    isAdminUser(),
  ])

  const tier = user?.subscription?.tier || 'free'
  const effectiveTier = admin ? 'admin' : tier
  const monthLimit = PREP_LIMITS[effectiveTier] ?? 1

  if (monthLimit !== null) {
    // Count this calendar month's prep uses
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const usedThisMonth = (user?.prepDocs || []).filter(
      d => new Date(d.createdAt) >= startOfMonth
    ).length

    if (usedThisMonth >= monthLimit) {
      return NextResponse.json({
        error: 'limit_reached',
        tier: effectiveTier,
        limit: monthLimit,
        used: usedThisMonth,
      }, { status: 429 })
    }
  }

  // ── Claude call ──────────────────────────────────────────────────────────
  let output
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: PREP_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `The patient has described their situation as follows:\n\n${cappedInput}\n\nPlease generate the structured German doctor summary based on this description.`
      }],
      temperature: 0.2,
    })
    output = response.content[0].text.trim()
  } catch (err) {
    console.error('Claude error:', err)
    return NextResponse.json({ error: 'AI service unavailable. Please try again.' }, { status: 502 })
  }

  // ── Record usage ─────────────────────────────────────────────────────────
  await db.collection('users').updateOne(
    { clerkId: userId },
    {
      $push: { prepDocs: { createdAt: new Date(), inputLength: cappedInput.length } },
      $set: { updatedAt: new Date() },
    },
    { upsert: true }
  )

  return NextResponse.json({ success: true, output, tier: effectiveTier })
}

// ── GET: return current usage for this month ───────────────────────────────
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const [user, admin] = await Promise.all([
    db.collection('users').findOne({ clerkId: userId }),
    isAdminUser(),
  ])

  const tier = user?.subscription?.tier || 'free'
  const effectiveTier = admin ? 'admin' : tier
  const monthLimit = PREP_LIMITS[effectiveTier] ?? 1

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const usedThisMonth = (user?.prepDocs || []).filter(
    d => new Date(d.createdAt) >= startOfMonth
  ).length

  return NextResponse.json({
    tier: effectiveTier,
    limit: monthLimit,
    used: usedThisMonth,
    unlimited: monthLimit === null,
    canUse: monthLimit === null || usedThisMonth < monthLimit,
  })
}
