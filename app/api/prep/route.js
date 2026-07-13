import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { MongoClient } from 'mongodb'
import { encrypt, decrypt, decryptProfile } from '@/lib/encryption'
import { generateText } from '@/lib/aiClient'

// Monthly prep limits. null = truly unlimited (clinic/admin).
const PREP_LIMITS = {
  free:     1,
  personal: 30,
  family:   60,
  clinic:   null,
  admin:    null,
}

const FAIR_USE_MSG = "You've reached your fair use limit for this month. Contact us if you need more."

const ADMIN_EMAILS = ['abralur28@gmail.com', 'philipp.mattar@googlemail.com']

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

// M4: Resolve the primary verified email — not just email_addresses[0]
async function getEffectiveTier(userId, mongoTier) {
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
  return mongoTier || 'free'
}

const BIOMARKER_META = {
  hemoglobin:  { label: 'Hemoglobin',  unit: 'g/dL',   normalMin: 12,  normalMax: 17.5 },
  ferritin:    { label: 'Ferritin',    unit: 'µg/L',   normalMin: 15,  normalMax: 150  },
  tsh:         { label: 'TSH',         unit: 'mIU/L',  normalMin: 0.4, normalMax: 4.0  },
  hba1c:       { label: 'HbA1c',       unit: '%',      normalMin: 0,   normalMax: 5.6  },
  cholesterol: { label: 'Cholesterol', unit: 'mg/dL',  normalMin: 0,   normalMax: 200  },
  vitaminD:    { label: 'Vitamin D',   unit: 'nmol/L', normalMin: 50,  normalMax: 200  },
  crp:         { label: 'CRP',         unit: 'mg/L',   normalMin: 0,   normalMax: 5    },
  egfr:        { label: 'eGFR',        unit: 'mL/min', normalMin: 60,  normalMax: 120  },
}

function buildProfileContext(profile, locale) {
  if (!profile) return ''
  // C3: profile fields are decrypted before reaching here via decryptProfile()
  const isDE = locale === 'de'
  const name = profile.name || 'Patient'
  const gender = profile.gender && profile.gender !== 'prefer_not' ? profile.gender : null
  const dob = profile.dob ? profile.dob : null
  const lines = []

  lines.push(isDE ? '\n--- PATIENTENPROFIL (aus Medyra Health Vault) ---' : '\n--- PATIENT PROFILE (from Medyra Health Vault) ---')
  lines.push(`Name: ${name}${gender ? `, Gender: ${gender}` : ''}${dob ? `, DoB: ${dob}` : ''}`)

  const biomarkerHistory = profile.biomarkers || []
  if (biomarkerHistory.length === 0) {
    lines.push(isDE ? 'Keine gespeicherten Laborwerte im Health Vault.' : 'No stored lab values in Health Vault.')
  } else {
    lines.push(isDE ? 'Gespeicherte Laborwerte aus dem Health Vault:' : 'Stored lab values from Health Vault:')
    for (const [key, meta] of Object.entries(BIOMARKER_META)) {
      const readings = []
      for (const entry of biomarkerHistory) {
        const match = (entry.values || []).find(v =>
          v.key === key || v.name?.toLowerCase().includes(key.toLowerCase())
        )
        if (match) {
          const val = parseFloat(match.value)
          if (!isNaN(val)) readings.push({ val, date: entry.recordedAt || entry.date })
        }
      }
      if (readings.length === 0) continue
      const latest = readings[readings.length - 1]
      const isAbnormal = latest.val < meta.normalMin || latest.val > meta.normalMax
      let trend = ''
      if (readings.length >= 2) {
        const first = readings[0].val
        const delta = ((latest.val - first) / first) * 100
        if (Math.abs(delta) >= 5) {
          trend = ` [${delta > 0 ? '+' : ''}${delta.toFixed(1)}% over ${readings.length} readings]`
        }
      }
      const abnormalMark = isAbnormal ? ' ⚠ ABNORMAL' : ''
      lines.push(`  • ${meta.label}: ${latest.val} ${meta.unit} (normal ${meta.normalMin}–${meta.normalMax})${abnormalMark}${trend}`)
    }
  }
  lines.push(isDE ? '--- ENDE PATIENTENPROFIL ---\n' : '--- END PATIENT PROFILE ---\n')
  return lines.join('\n')
}

const SYSTEM_PROMPTS = {
  de: `Du bist ein medizinischer Kommunikationsassistent, der Patienten bei der Vorbereitung auf Arztbesuche in Deutschland unterstützt.

Du hilfst bei ALLEN medizinbezogenen Fragen, nicht nur bei Symptombeschreibungen. Dazu gehören:
- Strukturierte Arztbriefe aus Symptombeschreibungen erstellen
- Fragen zu Ärzten, Fachrichtungen oder Kliniken beantworten
- Erklärungen zu medizinischen Begriffen oder Abläufen geben
- Tipps zur Vorbereitung auf Arztgespräche

WICHTIGE REGELN:
- Keine Diagnosen stellen
- Keine Medikamente empfehlen
- Niemals alarmierend formulieren
- Neutral und sachlich bleiben
- Antworten immer auf Deutsch

WENN der Patient Symptome beschreibt → erstelle IMMER diese strukturierte Zusammenfassung:

**Patientenzusammenfassung für den Arztbesuch**

Datum: [heutiges Datum im Format TT.MM.JJJJ]

**Hauptbeschwerden**
[2-4 Stichpunkte zu den beschriebenen Hauptsymptomen]

**Zeitlicher Verlauf**
[Wann die Symptome begannen, wie sie sich verändert haben]

**Begleitende Symptome**
[Weitere genannte Symptome]

**Relevante Vorgeschichte**
[Medikamente, Allergien, Vorerkrankungen, falls keine: "Keine Angaben"]

**Fragen an den Arzt**
[3 sinnvolle Fragen, die der Patient stellen könnte]

Dieses Dokument wurde zur Kommunikation erstellt und stellt keine medizinische Diagnose dar.

WENN der Patient eine allgemeine Frage stellt (z.B. Arztsuche, Erklärungen) → beantworte sie hilfreich und direkt auf Deutsch, ohne die obige Struktur zu verwenden.`,

  en: `You are a helpful medical communication assistant supporting patients, especially those navigating healthcare in Germany.

You help with ALL health-related questions, including:
- Creating structured doctor visit summaries from symptom descriptions
- Answering questions about finding doctors, specialists, or clinics
- Explaining medical terms, procedures, or the German healthcare system
- Giving practical tips for preparing for appointments

RULES:
- Never diagnose anything
- Never recommend specific medications
- Never use alarmist language
- Stay neutral and informative
- Always respond in English

IF the patient describes symptoms → ALWAYS create this structured summary:

**Patient Summary for Doctor's Visit**

Date: [today's date in DD/MM/YYYY format]

**Main Complaints**
[2-4 bullet points of the main symptoms described]

**Timeline**
[When symptoms started, how they've changed]

**Accompanying Symptoms**
[Any secondary symptoms mentioned]

**Relevant Medical History**
[Medications, allergies, past conditions, if none: "None provided"]

**Questions for the Doctor**
[3 sensible questions the patient might want to ask]

This document was created for communication purposes and does not constitute a medical diagnosis.

IF the patient asks a general question (e.g. finding a doctor, understanding a term, navigating insurance) → answer it helpfully and directly in English without the structured format above.`,
}

function getSystemPrompt(locale) {
  if (locale === 'de') return SYSTEM_PROMPTS.de
  return SYSTEM_PROMPTS.en
}

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
  const profileId = body.profileId || null
  if (!input || input.length < 10) {
    return NextResponse.json({ error: 'Please describe your symptoms in more detail.' }, { status: 400 })
  }
  const cappedInput = input.slice(0, 3200)

  const db = await getDb()
  const user = await db.collection('users').findOne({ clerkId: userId })

  // C6: Server-side consent check (GDPR Art. 9)
  if (!user?.consentGiven) {
    return NextResponse.json({ error: 'consent_required', message: 'Please provide consent before processing health data' }, { status: 403 })
  }

  const mongoTier = user?.subscription?.tier || 'free'
  const effectiveTier = await getEffectiveTier(userId, mongoTier)

  // C3: Decrypt profile PII before passing to AI context builder
  const rawProfile = profileId ? (user?.profiles || []).find(p => p.id === profileId) || null : null
  const profile = rawProfile ? decryptProfile(rawProfile) : null
  const profileContext = buildProfileContext(profile, locale)
  const monthLimit = effectiveTier in PREP_LIMITS ? PREP_LIMITS[effectiveTier] : 1

  // Check monthly usage limit
  if (monthLimit !== null) {
    const used = (user?.prepDocs || []).filter(
      d => new Date(d.createdAt) >= startOfMonth()
    ).length
    if (used >= monthLimit) {
      return NextResponse.json({
        error: FAIR_USE_MSG,
        limitReached: true,
        tier: effectiveTier,
        limit: monthLimit,
        used,
      }, { status: 429 })
    }
  }

  // Call Claude
  let output
  try {
    const systemPrompt = getSystemPrompt(locale) + (profileContext ? `\n\nIMPORTANT CONTEXT: The following patient profile data is available from their Medyra Health Vault. Use this to pre-populate the Vorerkrankungen / Relevant Medical History section and to highlight any abnormal or trending values in the summary. Do NOT ignore this data.${profileContext}` : '')
    const userContent = profile
      ? `The patient "${profile.name}" has described their situation as follows:\n\n${cappedInput}\n\nPlease generate the structured doctor summary. Use the patient profile biomarker data provided in the system context to enrich the Vorerkrankungen / Medical History section with actual tracked values, noting any ⚠ ABNORMAL values and significant trends.`
      : `The patient has described their situation as follows:\n\n${cappedInput}\n\nPlease generate the structured doctor summary in the correct language.`

    output = await generateText({
      task: 'big',
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
      maxTokens: 1800,
      temperature: 0.2,
    })
  } catch (err) {
    console.error('Claude error:', err)
    return NextResponse.json({ error: 'AI service unavailable. Please try again.' }, { status: 502 })
  }

  // C5: Prune prepDocs older than 30 days (must be separate from $push — MongoDB rejects both on same field)
  const cutoff = new Date(Date.now() - THIRTY_DAYS_MS)
  await db.collection('users').updateOne(
    { clerkId: userId },
    { $pull: { prepDocs: { createdAt: { $lt: cutoff } } } }
  )

  // C3: Encrypt input and output before storing
  await db.collection('users').updateOne(
    { clerkId: userId },
    {
      $push: {
        prepDocs: {
          id: Date.now().toString(),
          createdAt: new Date(),
          input: encrypt(cappedInput),
          inputLength: cappedInput.length,
          output: encrypt(output),
          locale,
          profileId: profileId || null,
          profileName: profile?.name ? encrypt(profile.name) : null,
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

  // C3: Decrypt input, output, profileName when returning history
  const history = (user?.prepDocs || [])
    .filter(d => d.output)
    .slice(-20)
    .reverse()
    .map(d => ({
      id: d.id || String(d.createdAt),
      createdAt: d.createdAt,
      input: decrypt(d.input || ''),
      output: decrypt(d.output),
      profileName: d.profileName ? decrypt(d.profileName) : null,
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
