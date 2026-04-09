import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { MongoClient } from 'mongodb'

// ── Access rules ───────────────────────────────────────────────────────────
// null = unlimited, number = uses per calendar month
const PREP_LIMITS = {
  free:     1,
  onetime:  1,
  personal: null,
  family:   null,
  clinic:   null,
  admin:    null,
}

const ADMIN_EMAIL = 'abralur28@gmail.com'

// Determine the user's effective tier for prep access
async function getEffectiveTier(userId, mongoTier) {
  // Always check if this is the admin email via Clerk REST (secret key — reliable)
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
  return mongoTier || 'free'
}

// ── Anthropic ──────────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPTS = {
  de: `You are a medical communication assistant helping patients prepare for a doctor's appointment in Germany.

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

Dieses Dokument wurde zur Kommunikation erstellt und stellt keine medizinische Diagnose dar.`,

  en: `You are a medical communication assistant helping patients prepare for a doctor's appointment.

Your job is to take the patient's free-form description of their symptoms and situation — written in any language — and convert it into a structured, professional English summary they can show to their doctor.

STRICT RULES:
- Never diagnose anything
- Never suggest medications or treatments
- Never say what the patient "might have" or "could be"
- Never use alarmist language
- Always frame output as "the patient reports..." not "the patient has..."
- Output must be in English
- Keep a neutral, clinical-communication tone
- End every output with this disclaimer: "This document was created for communication purposes and does not constitute a medical diagnosis."

OUTPUT STRUCTURE (always follow this exactly):

**Patient Summary for Doctor's Visit**

Date: [today's date in format DD/MM/YYYY]

**Main Complaints**
[2-4 bullet points of the main symptoms the patient described, in English]

**Timeline**
[When symptoms started, how they've changed]

**Accompanying Symptoms**
[Any secondary symptoms mentioned]

**Relevant Medical History**
[Any medications, allergies, past conditions the patient mentioned. If none mentioned, write: "None provided"]

**Questions for the Doctor**
[Generate 3 sensible questions the patient might want to ask, based on what they described. Frame as questions, not conclusions.]

This document was created for communication purposes and does not constitute a medical diagnosis.`,
}

function getSystemPrompt(locale) {
  if (locale === 'de') return SYSTEM_PROMPTS.de
  // Default: English for all other locales (patient can always manually switch to DE)
  return SYSTEM_PROMPTS.en
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

function startOfMonth() {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

// ── POST: generate a prep summary ─────────────────────────────────────────
export async function POST(request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const input = (body.input || '').trim()
  const locale = body.locale || 'en'
  if (!input || input.length < 10) {
    return NextResponse.json({ error: 'Please describe your symptoms in more detail.' }, { status: 400 })
  }
  const cappedInput = input.slice(0, 3200)

  const db = await getDb()
  const user = await db.collection('users').findOne({ clerkId: userId })
  const mongoTier = user?.subscription?.tier || 'free'
  const effectiveTier = await getEffectiveTier(userId, mongoTier)
  // Use 'in' check so null (unlimited) is preserved — null ?? 1 would wrongly return 1
  const monthLimit = effectiveTier in PREP_LIMITS ? PREP_LIMITS[effectiveTier] : 1

  // Check monthly usage limit
  if (monthLimit !== null) {
    const used = (user?.prepDocs || []).filter(
      d => new Date(d.createdAt) >= startOfMonth()
    ).length
    if (used >= monthLimit) {
      return NextResponse.json({
        error: 'limit_reached',
        tier: effectiveTier,
        limit: monthLimit,
        used,
      }, { status: 429 })
    }
  }

  // Call Claude
  let output
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: getSystemPrompt(locale),
      messages: [{
        role: 'user',
        content: `The patient has described their situation as follows:\n\n${cappedInput}\n\nPlease generate the structured doctor summary in the correct language.`,
      }],
      temperature: 0.2,
    })
    output = response.content[0].text.trim()
  } catch (err) {
    console.error('Claude error:', err)
    return NextResponse.json({ error: 'AI service unavailable. Please try again.' }, { status: 502 })
  }

  // Save to history
  await db.collection('users').updateOne(
    { clerkId: userId },
    {
      $push: {
        prepDocs: {
          id: Date.now().toString(),
          createdAt: new Date(),
          input: cappedInput,
          inputLength: cappedInput.length,
          output,
          locale,
        },
      },
      $set: { updatedAt: new Date() },
    },
    { upsert: true }
  )

  return NextResponse.json({ success: true, output, tier: effectiveTier })
}

// ── GET: return usage info + history ──────────────────────────────────────
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const user = await db.collection('users').findOne({ clerkId: userId })
  const mongoTier = user?.subscription?.tier || 'free'
  const effectiveTier = await getEffectiveTier(userId, mongoTier)
  const monthLimit = effectiveTier in PREP_LIMITS ? PREP_LIMITS[effectiveTier] : 1

  const used = (user?.prepDocs || []).filter(
    d => new Date(d.createdAt) >= startOfMonth()
  ).length

  const history = (user?.prepDocs || [])
    .filter(d => d.output)
    .slice(-20)
    .reverse()
    .map(d => ({
      id: d.id || String(d.createdAt),
      createdAt: d.createdAt,
      input: d.input || '',
      output: d.output,
    }))

  return NextResponse.json({
    tier: effectiveTier,
    limit: monthLimit,
    used,
    unlimited: monthLimit === null,
    canUse: monthLimit === null || used < monthLimit,
    history,
  })
}
