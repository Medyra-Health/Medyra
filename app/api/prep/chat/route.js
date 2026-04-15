import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { MongoClient } from 'mongodb'

let _client = null, _db = null
async function getDb() {
  if (_db) { try { await _db.admin().ping(); return _db } catch { _client = null; _db = null } }
  _client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })
  await _client.connect()
  _db = _client.db(process.env.DB_NAME || 'medyra')
  return _db
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

function buildBriefProfileContext(profile) {
  if (!profile) return ''
  const lines = [`\nPatient profile: ${profile.name}`]
  if (profile.dob) lines.push(`DoB: ${profile.dob}`)
  const biomarkerHistory = profile.biomarkers || []
  const abnormalValues = []
  for (const [key, meta] of Object.entries(BIOMARKER_META)) {
    for (const entry of biomarkerHistory) {
      const match = (entry.values || []).find(v => v.key === key || v.name?.toLowerCase().includes(key.toLowerCase()))
      if (match) {
        const val = parseFloat(match.value)
        if (!isNaN(val) && (val < meta.normalMin || val > meta.normalMax)) {
          abnormalValues.push(`${meta.label}: ${val} ${meta.unit} (abnormal)`)
        }
      }
    }
  }
  if (abnormalValues.length > 0) {
    lines.push(`Known abnormal values: ${abnormalValues.slice(0, 4).join(', ')}`)
  }
  return lines.join('. ')
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CHAT_SYSTEM = `You are a warm, professional medical intake assistant for Medyra, helping patients prepare for doctor appointments in Germany.

Your job is to gather enough information through conversation so a structured doctor visit summary can be generated. Ask ONE clear question at a time. Keep responses short (2-4 sentences max).

CATEGORY CONTEXT:
- symptoms: Ask about the main symptom, duration, severity (1-10), and any related symptoms
- diagnosis: Ask about the diagnosis name, when diagnosed, current medications, and what they want to discuss
- results: Ask what type of test/result they have, what values seem abnormal, and what concerns them
- general: Understand what they need — finding a doctor, insurance questions, understanding a procedure, etc.

CONVERSATION FLOW:
1. Start with a warm, specific opening question based on the category
2. Ask 2-4 follow-up questions to gather key details
3. Once you have enough information (after 3-5 user responses), set readyToGenerate to true and let them know you have enough to create their summary

RESPONSE FORMAT — always respond with valid JSON:
{
  "message": "Your response text here",
  "suggestions": ["optional short chip 1", "optional short chip 2", "optional short chip 3"],
  "readyToGenerate": false
}

suggestions: 2-3 SHORT clickable options the user might want to say (under 6 words each). Leave empty array [] if open-ended is better.
readyToGenerate: set to true ONLY after you have collected the core information needed (minimum 3 user messages with substantive content).

RULES:
- Never diagnose
- Never recommend medications
- Stay neutral and supportive
- Respond in the same language the user uses (German or English)
- If user writes in German, respond in German
- Keep suggestions very short (they appear as clickable chips)
- Do NOT use markdown formatting in message text — plain text only`

const CATEGORY_OPENERS = {
  symptoms: {
    en: "What's the main symptom or issue you'd like to discuss with your doctor today?",
    de: "Was ist das Hauptsymptom oder Problem, das Sie heute mit Ihrem Arzt besprechen möchten?",
  },
  diagnosis: {
    en: "What condition or diagnosis have you been given? I'll help you prepare for your follow-up appointment.",
    de: "Welche Diagnose wurde Ihnen gestellt? Ich helfe Ihnen, sich auf Ihren Folgetermin vorzubereiten.",
  },
  results: {
    en: "What type of test results do you have? For example, blood work, an MRI, or a biopsy?",
    de: "Welche Art von Testergebnissen haben Sie? Zum Beispiel Blutuntersuchungen, ein MRT oder eine Biopsie?",
  },
  general: {
    en: "What can I help you with today? For example, finding a specialist, understanding your insurance, or preparing a question for your doctor?",
    de: "Wobei kann ich Ihnen heute helfen? Zum Beispiel einen Spezialisten finden, Ihre Krankenversicherung verstehen oder eine Frage für Ihren Arzt vorbereiten?",
  },
}

const CATEGORY_SUGGESTIONS = {
  symptoms: {
    en: ["Since yesterday", "For a few days", "Over a week", "Longer than a month"],
    de: ["Seit gestern", "Seit einigen Tagen", "Über eine Woche", "Länger als einen Monat"],
  },
  diagnosis: {
    en: ["Just diagnosed", "A few months ago", "More than a year ago"],
    de: ["Gerade diagnostiziert", "Vor einigen Monaten", "Vor mehr als einem Jahr"],
  },
  results: {
    en: ["Blood work", "MRI or CT scan", "Ultrasound", "Biopsy"],
    de: ["Blutuntersuchung", "MRT oder CT", "Ultraschall", "Biopsie"],
  },
  general: {
    en: ["Find a specialist", "Understand my insurance", "Prepare questions", "Understand a procedure"],
    de: ["Spezialisten finden", "Versicherung verstehen", "Fragen vorbereiten", "Eingriff verstehen"],
  },
}

export async function POST(request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { messages, category, locale, profileId } = body

  // Resolve profile for brief context
  let profileContext = ''
  if (profileId) {
    try {
      const db = await getDb()
      const user = await db.collection('users').findOne({ clerkId: userId })
      const profile = (user?.profiles || []).find(p => p.id === profileId)
      if (profile) profileContext = buildBriefProfileContext(profile)
    } catch {}
  }

  // First message (category opener) — return static opener instantly, no API call
  const userMessages = messages.filter(m => m.role === 'user')
  if (userMessages.length === 1 && userMessages[0].content?.startsWith('Category:')) {
    const lang = locale === 'de' ? 'de' : 'en'
    return NextResponse.json({
      message: CATEGORY_OPENERS[category]?.[lang] || CATEGORY_OPENERS.general[lang],
      suggestions: CATEGORY_SUGGESTIONS[category]?.[lang] || [],
      readyToGenerate: false,
    })
  }

  // Build conversation for Claude — strip the category opener
  const conversationMessages = messages
    .filter(m => !(m.role === 'user' && m.content?.startsWith('Category:')))
    .map(m => ({
      role: m.role,
      content: m.content || m.text || '',
    }))

  if (conversationMessages.length === 0) {
    const lang = locale === 'de' ? 'de' : 'en'
    return NextResponse.json({
      message: CATEGORY_OPENERS[category]?.[lang] || CATEGORY_OPENERS.general[lang],
      suggestions: CATEGORY_SUGGESTIONS[category]?.[lang] || [],
      readyToGenerate: false,
    })
  }

  try {
    const systemWithContext = CHAT_SYSTEM
      + `\n\nCurrent category: ${category}\nUser locale: ${locale || 'en'}`
      + (profileContext ? `\n\n${profileContext}\nUse this profile data to ask targeted follow-up questions about any abnormal values or trends you see.` : '')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: systemWithContext,
      messages: conversationMessages,
      temperature: 0.4,
    })

    const rawText = response.content[0].text.trim()

    let parsed
    try {
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      parsed = { message: rawText, suggestions: [], readyToGenerate: false }
    }

    return NextResponse.json({
      message: parsed.message || rawText,
      suggestions: parsed.suggestions || [],
      readyToGenerate: parsed.readyToGenerate || false,
    })
  } catch (err) {
    console.error('Chat route error:', err)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 })
  }
}
