import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import pdfParse from 'pdf-parse'
import Stripe from 'stripe'
import { Webhook } from 'svix'
import { encrypt, decrypt } from '@/lib/encryption'
import { getCheckerEntries } from '@/lib/werte'
import { generateText, generateVisionText } from '@/lib/aiClient'

function encryptReport(doc) {
  return {
    ...doc,
    fileName: encrypt(doc.fileName),
    extractedText: encrypt(doc.extractedText),
    explanation: encrypt(
      typeof doc.explanation === 'string' ? doc.explanation : JSON.stringify(doc.explanation)
    ),
  }
}

function decryptReport(report) {
  if (!report) return report
  const r = { ...report }
  if (r.fileName) r.fileName = decrypt(r.fileName)
  if (r.extractedText) r.extractedText = decrypt(r.extractedText)
  if (r.explanation != null) {
    const raw = typeof r.explanation === 'string'
      ? decrypt(r.explanation)
      : JSON.stringify(r.explanation)
    try { r.explanation = JSON.parse(raw) } catch { r.explanation = raw }
  }
  if (Array.isArray(r.conversations)) {
    r.conversations = r.conversations.map(c => ({
      ...c,
      question: decrypt(c.question),
      answer: decrypt(c.answer),
    }))
  }
  return r
}

// ============================================================================
// INITIALIZATION
// ============================================================================

let mongoClient = null
let db = null
let isConnecting = false

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

// ============================================================================
// DATABASE
// ============================================================================

async function connectToMongo() {
  if (db && mongoClient) {
    try {
      await db.admin().ping()
      return db
    } catch {
      mongoClient = null
      db = null
    }
  }
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 100))
    return connectToMongo()
  }
  try {
    isConnecting = true
    if (!process.env.MONGO_URL) throw new Error('MONGO_URL not set')
    mongoClient = new MongoClient(process.env.MONGO_URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    })
    await mongoClient.connect()
    db = mongoClient.db(process.env.DB_NAME || 'medyra')
    console.log('✅ MongoDB connected')
    // C5: Enforce 30-day retention on reports (matches stated privacy policy)
    db.collection('reports').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true }).catch(() => {})
    return db
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`)
  } finally {
    isConnecting = false
  }
}

// ============================================================================
// CORS
// ============================================================================

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://medyra.de'

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Vary', 'Origin')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// ============================================================================
// MEDICAL PROMPT
// ============================================================================

const MEDICAL_PROMPT = `You are a medical document interpreter helping patients understand ANY medical or health-related document in plain language: lab reports (Laborbefund), doctor letters and findings (Arztbrief, Befund, Entlassungsbericht), prescriptions (Rezept, Medikationsplan), health insurance letters (Krankenkasse), vaccination records, radiology reports, and similar documents.

CRITICAL RULES:
- Always start with the disclaimer
- Never diagnose or prescribe
- Use simple, non-scary language
- Always recommend consulting their physician

First identify what kind of document this is, then explain it using the structure that fits.

You MUST respond with VALID JSON only (no markdown, no code blocks):
{
  "disclaimer": "This is educational information, not medical advice. Consult your doctor for personalized medical guidance.",
  "docType": "lab" | "letter" | "prescription" | "insurance" | "other",
  "inShort": "One plain-language sentence with the single most important takeaway of this document",
  "summary": "Brief 2-3 sentence overview",
  "tests": [
    {
      "name": "Test name",
      "value": "Patient result with units",
      "normalRange": "Normal range with units",
      "explanation": "What this test measures",
      "interpretation": "What the result means in plain language",
      "flag": "normal",
      "category": "Blood count"
    }
  ],
  "sections": [
    {
      "title": "Short section heading in plain language",
      "content": "Plain-language explanation of this part of the document",
      "items": ["Optional bullet points, e.g. individual medications, coverage facts, or explained findings"]
    }
  ],
  "questionsForDoctor": ["Question 1", "Question 2", "Question 3"],
  "nextSteps": ["Concrete, calm suggested next step", "Another next step"]
}

HOW TO USE tests VS sections:
- "tests" is ONLY for measurable values with results (lab values, vitals). If the document contains no measured values, return an empty tests array.
- "sections" carries everything else, adapted to the document:
  - Doctor letter / findings: sections like "What the doctor found", "What the medical terms mean", "What happens next". Translate every piece of jargon.
  - Prescription / medication plan: one section per medication with items covering what it is for, how to take it, and important notes found in the document.
  - Insurance letter: sections like "What this letter says", "What it means for you", "What you need to do", including amounts and deadlines found in the letter.
  - Lab report: sections may be empty or carry non-numeric remarks from the report.
- A document can have both (e.g. a doctor letter quoting lab values).

flag must be: "normal", "high", "low", or "critical"
category must be one of: "Blood count", "Metabolism & lipids", "Kidney & liver", "Thyroid & hormones", "Vitamins & minerals", "Inflammation & immunity", "Other"
nextSteps: 2-4 short, actionable, non-alarming steps (e.g. discuss a value at the next routine visit, recheck in 3 months, submit a form by the stated deadline). Only suggest urgency if something is critical.
questionsForDoctor: for insurance letters these may be questions for the insurer instead.
The document may be in German or English. Keep the original terms recognizable (e.g. "Hämoglobin (Hemoglobin)", "Zuzahlung (copayment)").
If the text is not a medical or health-related document at all, say so politely in the summary, with empty tests and sections.
Return ONLY valid JSON. No other text.`

// Locale code -> language the explanation should be written in.
// Falls back to English for unknown locales.
const EXPLANATION_LANGUAGES = {
  en: 'English', de: 'German', tr: 'Turkish', ar: 'Arabic', fr: 'French',
  es: 'Spanish', it: 'Italian', pt: 'Portuguese', nl: 'Dutch', pl: 'Polish',
  ru: 'Russian', zh: 'Simplified Chinese', ja: 'Japanese', ko: 'Korean',
  hi: 'Hindi', ur: 'Urdu', bn: 'Bengali',
}

// User-selected document type on the upload page. Passed to the model as a
// hint so classification never fights the user's intent.
const DOC_TYPE_HINTS = {
  lab: 'The user says this is a lab report (Laborbefund / Blutbild).',
  letter: 'The user says this is a doctor letter, discharge summary, or radiology/pathology report (Arztbrief, Entlassungsbericht, Befund). Focus on translating every finding and medical term into plain language.',
  medication: 'The user says this is a medication plan or prescription (Medikationsplan, Rezept). Create one section per medication: what it is for, how to take it, and important notes from the document.',
  insurance: 'The user says this is a health insurance letter (Krankenkasse). Explain what it says, what it means for them, and what they need to do.',
}

const CHAT_PROMPT = `You are Medyra AI, a friendly, empathetic health assistant that helps patients understand their medical reports. Medyra AI is powered by Claude, made by Anthropic.

RULES:
- Respond in clear, plain language, no jargon
- Never diagnose conditions or prescribe treatments
- Always encourage the patient to consult their doctor for medical decisions
- Be warm and reassuring, not scary
- Give specific, helpful answers based on the patient's actual report data provided in the context
- When referencing past reports, mention the date/time to help the patient track trends
- Keep answers concise but complete (2-5 sentences unless a longer explanation is truly needed)
- End every response with a gentle reminder to discuss findings with their doctor if the topic is clinical
- NEVER respond with JSON, always respond in natural conversational text
- Respond in the same language the patient writes in (German question -> German answer, Turkish question -> Turkish answer)
- If a user sincerely asks what AI model or technology powers this assistant, be transparent: this assistant is powered by Claude AI, made by Anthropic`

// Monthly chat fair-use limits (hard cap, silently blocked, no auto-upgrade)
const FAIR_USE_LIMITS = {
  free:     { chat: 4   },
  personal: { chat: 200 },
  family:   { chat: 400 },
  clinic:   { chat: 999999 },
  admin:    { chat: Infinity },
}

const FAIR_USE_MSG = "You've reached your fair use limit for this month. Contact us if you need more."

function currentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Returns { allowed, used, limit } and resets counters if month has rolled over.
// Does NOT increment, call incrementFairUse separately after the action succeeds.
async function checkFairUse(userId, feature, database) {
  const user = await database.collection('users').findOne({ clerkId: userId })
  const tier = user?.subscription?.tier || 'free'
  const limits = FAIR_USE_LIMITS[tier] ?? FAIR_USE_LIMITS.free
  const limit = limits[feature] ?? 4

  const monthKey = currentMonthKey()
  const fairUse = user?.fairUse || {}
  const stored = fairUse[feature] || {}

  const used = stored.month === monthKey ? (stored.count || 0) : 0

  return { allowed: limit === Infinity || used < limit, used, limit, tier }
}

async function incrementFairUse(userId, feature, database) {
  const monthKey = currentMonthKey()
  await database.collection('users').updateOne(
    { clerkId: userId },
    [
      {
        $set: {
          [`fairUse.${feature}`]: {
            $cond: {
              if: { $eq: [{ $ifNull: [`$fairUse.${feature}.month`, ''] }, monthKey] },
              then: { month: monthKey, count: { $add: [`$fairUse.${feature}.count`, 1] } },
              else: { month: monthKey, count: 1 },
            },
          },
        },
      },
    ]
  )
}

// ============================================================================
// FILE PROCESSING
// ============================================================================

async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer)
  const text = data.text.trim()
  if (!text || text.length < 10) throw new Error('PDF has no readable text')
  return text
}

async function extractTextFromImage(buffer, mimeType) {
  const validMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)
    ? mimeType
    : 'image/jpeg'
  const fullText = await generateVisionText({
    imageBuffer: buffer,
    mimeType: validMime,
    prompt: 'Extract all text from this medical report image. Return only the raw extracted text, no commentary.',
  })
  if (!fullText || fullText.length < 10) throw new Error('No readable text found in image')
  return fullText
}

// ============================================================================
// AI
// ============================================================================

async function getAIExplanation(extractedText, { docType, language } = {}) {
  const languageName = EXPLANATION_LANGUAGES[language] || 'English'
  const docHint = DOC_TYPE_HINTS[docType]
  const system = MEDICAL_PROMPT
    + `\n\nWrite ALL explanation text (summary, interpretations, sections, questions, next steps) in ${languageName}. Keep the JSON keys and flag/docType/category enum values in English exactly as specified.`
    + (docHint ? `\n\n${docHint}` : '')
  let text = await generateText({
    task: 'big',
    system,
    messages: [{
      role: 'user',
      content: `Analyze this medical document and return JSON:\n\n${extractedText.substring(0, 10000)}`
    }],
    maxTokens: 4096,
    temperature: 0.3
  })

  // Strip markdown code fences
  text = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim()

  // Find the outermost JSON object even if the model added preamble/postamble text
  const jsonStart = text.indexOf('{')
  const jsonEnd = text.lastIndexOf('}')
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    text = text.substring(jsonStart, jsonEnd + 1)
  }

  try {
    const parsed = JSON.parse(text)
    if (!parsed.disclaimer) parsed.disclaimer = 'This is educational information, not medical advice. Consult your doctor.'
    if (!parsed.summary) parsed.summary = 'Report analyzed.'
    if (!Array.isArray(parsed.tests)) parsed.tests = []
    if (!Array.isArray(parsed.sections)) parsed.sections = []
    if (!Array.isArray(parsed.questionsForDoctor)) parsed.questionsForDoctor = []
    if (!Array.isArray(parsed.nextSteps)) parsed.nextSteps = []
    return parsed
  } catch {
    // Last resort: return structured error so the page still renders cleanly
    return {
      disclaimer: 'This is educational information, not medical advice. Consult your doctor.',
      summary: 'We could not fully parse this report. Please try uploading again or use a clearer scan.',
      tests: [],
      questionsForDoctor: ['What do these results mean?', 'Do I need follow-up tests?', 'Any lifestyle changes needed?']
    }
  }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

const ADMIN_EMAIL = 'abralur28@gmail.com'

async function isAdminUser() {
  try {
    const user = await currentUser()
    return user?.emailAddresses?.some(e => e.emailAddress === ADMIN_EMAIL) || false
  } catch {
    return false
  }
}

const FREE_REPORT_LIMIT = 3 // per calendar month

function startOfCurrentMonth() {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

async function ensureUserExists(userId, database) {
  const user = await database.collection('users').findOne({ clerkId: userId })
  if (!user) {
    await database.collection('users').insertOne({
      clerkId: userId,
      subscription: { tier: 'free', status: 'active', usageLimit: FREE_REPORT_LIMIT, currentUsage: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return { tier: 'free', limit: FREE_REPORT_LIMIT, used: 0, allowed: true }
  }
  const sub = user.subscription || { tier: 'free', usageLimit: FREE_REPORT_LIMIT, currentUsage: 0 }
  const isFree = !sub.tier || sub.tier === 'free'

  if (isFree) {
    // Free tier: count reports uploaded this calendar month (resets every month).
    // Referral rewards raise the monthly ceiling (+1 per successful invite).
    const freeLimit = FREE_REPORT_LIMIT + (user.bonusReports || 0)
    const monthlyUsed = await database.collection('reports').countDocuments({
      userId,
      createdAt: { $gte: startOfCurrentMonth() },
    })
    return {
      tier: 'free',
      limit: freeLimit,
      used: monthlyUsed,
      allowed: monthlyUsed < freeLimit,
    }
  }

  const effectiveLimit = sub.usageLimit ?? FREE_REPORT_LIMIT
  return {
    tier: sub.tier || 'free',
    limit: effectiveLimit,
    used: sub.currentUsage || 0,
    allowed: (sub.currentUsage || 0) < effectiveLimit
  }
}

async function incrementUsage(userId, database) {
  await database.collection('users').updateOne(
    { clerkId: userId },
    { $inc: { 'subscription.currentUsage': 1 }, $set: { 'subscription.lastUsed': new Date() } }
  )
}

// ============================================================================
// INDIVIDUAL ROUTE HANDLERS
// ============================================================================

async function handleHealthCheck() {
  return handleCORS(NextResponse.json({
    message: 'Medyra API v2.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    features: { ai: true, payments: !!stripe }
  }))
}

async function handleAnalyzeReport(request) {
  const { userId } = await auth()
  if (!userId) {
    return handleCORS(NextResponse.json({ error: 'Authentication required' }, { status: 401 }))
  }

  const database = await connectToMongo()

  // C6: Server-side consent gate (GDPR Art. 9) — modal alone is not sufficient
  const userDoc = await database.collection('users').findOne({ clerkId: userId })
  if (!userDoc?.consentGiven) {
    return handleCORS(NextResponse.json({ error: 'consent_required', message: 'Please provide consent before processing health data' }, { status: 403 }))
  }

  const [usageCheck, admin] = await Promise.all([
    ensureUserExists(userId, database),
    isAdminUser()
  ])

  if (!usageCheck.allowed && !admin) {
    return handleCORS(NextResponse.json({
      error: 'Usage limit reached. Please upgrade your plan.',
      tier: usageCheck.tier,
      usageLimit: usageCheck.limit,
      currentUsage: usageCheck.used
    }, { status: 429 }))
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!file) {
    return handleCORS(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }))
  }

  // M1: Reject files over 10MB before buffering into memory
  const MAX_FILE_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_FILE_SIZE) {
    return handleCORS(NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 }))
  }

  // H5: Log only non-identifying metadata, never filename (may contain patient name)
  console.log(`📎 File received: type=${file.type}, size=${file.size} bytes`)
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileType = file.type || ''

  let extractedText = ''
  try {
    if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
      extractedText = await extractTextFromPDF(buffer)
    } else if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      extractedText = await extractTextFromImage(buffer, fileType)
    } else if (fileType === 'text/plain' || file.name.endsWith('.txt')) {
      extractedText = buffer.toString('utf-8').trim()
    } else {
      return handleCORS(NextResponse.json({
        error: 'Unsupported file. Please upload PDF, JPG, PNG, or TXT.'
      }, { status: 400 }))
    }
  } catch (err) {
    return handleCORS(NextResponse.json({ error: err.message }, { status: 400 }))
  }

  if (!extractedText || extractedText.length < 20) {
    return handleCORS(NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 }))
  }

  const docTypeHint = formData.get('docType') ? String(formData.get('docType')) : null
  const language = formData.get('language') ? String(formData.get('language')) : null

  let explanation
  try {
    explanation = await getAIExplanation(extractedText, { docType: docTypeHint, language })
  } catch (err) {
    console.error('[AI analysis failed]', err.message)
    return handleCORS(NextResponse.json({ error: 'AI analysis failed. Please try again.' }, { status: 500 }))
  }

  const reportId = uuidv4()
  const profileId = formData.get('profileId') ? String(formData.get('profileId')) : null
  const createdAt = new Date()
  // Data retention is the user's choice. 'keep' stores the report indefinitely
  // as an encrypted backup (no expiresAt, so the TTL index never removes it);
  // default 'auto30' keeps the GDPR 30-day auto-deletion.
  const keepForever = userDoc?.dataRetention === 'keep'
  await database.collection('reports').insertOne(encryptReport({
    id: reportId,
    userId,
    fileName: file.name,
    fileType,
    extractedText: extractedText.substring(0, 50000),
    explanation,
    conversations: [],
    ...(profileId ? { profileId } : {}),
    createdAt,
    ...(keepForever ? {} : { expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }),
    status: 'completed'
  }))

  // If the user picked a profile at upload time, record biomarkers for trends right away
  let biomarkersExtracted = 0
  if (profileId) {
    try {
      biomarkersExtracted = await recordBiomarkersToProfile(database, userId, profileId, reportId, explanation, createdAt)
    } catch (err) {
      console.warn('Biomarker recording failed:', err.message)
    }
  }

  await incrementUsage(userId, database)

  return handleCORS(NextResponse.json({
    success: true,
    reportId,
    explanation,
    biomarkersExtracted,
    usage: { current: usageCheck.used + 1, limit: usageCheck.limit, tier: usageCheck.tier }
  }))
}

async function handleGetReports(request) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const url = new URL(request.url)
  const profileId = url.searchParams.get('profileId')
  const query = { userId }
  if (profileId) query.profileId = profileId
  const database = await connectToMongo()
  const raw = await database.collection('reports')
    .find(query)
    .project({ extractedText: 0 })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray()
  const reports = raw.map(r => decryptReport(r))
  return handleCORS(NextResponse.json({ success: true, reports, count: reports.length }))
}

async function handleGetReport(reportId) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const database = await connectToMongo()
  const raw = await database.collection('reports').findOne({ id: reportId, userId })
  if (!raw) return handleCORS(NextResponse.json({ error: 'Report not found' }, { status: 404 }))
  const report = decryptReport(raw)
  return handleCORS(NextResponse.json({ success: true, report }))
}

// Biomarker keyword matcher, maps test name patterns (English + German) to tracked keys.
// Order matters: specific markers (HbA1c, LDL/HDL) must come before generic ones (glucose, cholesterol).
const BIOMARKER_PATTERNS = [
  { key: 'hba1c',         patterns: [/hba1c/i, /hb\s?a1c/i, /glycat/i, /glycosylated/i, /langzeitzucker/i] },
  { key: 'ldl',           patterns: [/\bldl\b/i] },
  { key: 'hdl',           patterns: [/\bhdl\b/i] },
  { key: 'triglycerides', patterns: [/triglycerid/i, /triglyzerid/i] },
  { key: 'cholesterol',   patterns: [/cholesterol/i, /cholesterin/i] },
  { key: 'hemoglobin',    patterns: [/hemoglobin/i, /haemoglobin/i, /hämoglobin/i, /\bhgb\b/i, /\bhb\b/i] },
  { key: 'ferritin',      patterns: [/ferritin/i] },
  { key: 'tsh',           patterns: [/\btsh\b/i, /thyroid.stimulating/i, /thyreoidea.stimulierend/i] },
  { key: 'glucose',       patterns: [/glucose/i, /glukose/i, /blutzucker/i, /nüchternzucker/i] },
  { key: 'vitaminD',      patterns: [/vitamin\s*d3?\b/i, /25.oh/i, /calcifediol/i] },
  { key: 'vitaminB12',    patterns: [/b\s?12/i, /cobalamin/i] },
  { key: 'crp',           patterns: [/\bcrp\b/i, /c.reactive/i, /c.reaktiv/i] },
  { key: 'creatinine',    patterns: [/creatinin/i, /kreatinin/i] },
  { key: 'egfr',          patterns: [/\begfr\b/i, /\bgfr\b/i, /glomerular\s*filtration/i, /glomerulär/i] },
  { key: 'leukocytes',    patterns: [/leukocyte/i, /leukozyt/i, /\bwbc\b/i, /white\s*blood/i] },
  { key: 'platelets',     patterns: [/platelet/i, /thrombozyt/i, /\bplt\b/i] },
]

// Turn any test name into a stable-ish tracking key so unmatched markers are
// tracked too. Known markers keep their canonical key (hba1c, ldl, ...); the
// rest get an "x_" slug derived from the name.
function slugifyMarker(name) {
  const slug = String(name)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/\([^)]*\)/g, ' ')                        // drop parentheticals
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
  return slug ? `x_${slug}` : null
}

// Parse a lab reference range string into { low, high }.
// Handles "12-17.5", "3,5 – 5,0", "< 200", "> 40", "bis 5", "150 - 400".
function parseRefRange(str) {
  if (!str) return { low: null, high: null }
  const s = String(str).replace(/,/g, '.')
  const nums = (s.match(/-?\d+(?:\.\d+)?/g) || []).map(parseFloat)
  if (!nums.length) return { low: null, high: null }
  if (/[<≤]/.test(s) || /\bbis\b/i.test(s)) return { low: null, high: nums[nums.length - 1] }
  if (/[>≥]/.test(s)) return { low: nums[0], high: null }
  if (nums.length >= 2) return { low: Math.min(nums[0], nums[1]), high: Math.max(nums[0], nums[1]) }
  return { low: null, high: null }
}

// Pull the unit out of a value string like "14.5 g/dL" -> "g/dL".
function parseUnit(valueStr) {
  const m = String(valueStr).match(/[\d.,]+\s*([%°]|[a-zA-Zµμ]+(?:\/[a-zA-Zµμ0-9]+)?)/)
  return m ? m[1] : ''
}

// Extract EVERY numeric value from a report, not just a fixed shortlist.
// Known markers keep their canonical key so charts get proper reference bands;
// every other numeric value is tracked under a slug key with the lab's own
// unit and reference range carried through.
function extractBiomarkersFromTests(tests, reportDate) {
  const entries = []
  const seen = new Set()
  for (const test of (tests || [])) {
    const name = test.name || ''
    const raw = test.value ?? ''
    // Parse numeric value from strings like "14.5 g/dL", "143 mg/dL" or German "14,8 g/dL"
    const numMatch = String(raw).replace(/,/g, '.').match(/-?\d+(?:\.\d+)?/)
    if (!numMatch) continue
    const value = parseFloat(numMatch[0])
    if (isNaN(value)) continue

    let key = null
    for (const { key: k, patterns } of BIOMARKER_PATTERNS) {
      if (patterns.some(p => p.test(name))) { key = k; break }
    }
    if (!key) key = slugifyMarker(name)
    if (!key || seen.has(key)) continue // one value per marker per report
    seen.add(key)

    const { low, high } = parseRefRange(test.normalRange)
    entries.push({
      key,
      name: name || key,
      value,
      unit: parseUnit(raw) || '',
      refLow: low,
      refHigh: high,
      category: test.category || 'Other',
      date: reportDate,
      flag: test.flag || 'normal',
    })
  }
  return entries
}

// Extracts biomarkers from a report's tests and stores them on the given profile.
// Always clears previous entries for this report first, so re-assigning never duplicates history.
async function recordBiomarkersToProfile(database, userId, profileId, reportId, explanation, recordedAt) {
  let tests = []
  try {
    const exp = typeof explanation === 'string' ? JSON.parse(explanation) : explanation
    tests = exp?.tests || []
  } catch {}

  const flat = extractBiomarkersFromTests(tests, recordedAt)

  await database.collection('users').updateOne(
    { clerkId: userId },
    { $pull: { 'profiles.$[].biomarkers': { reportId } } }
  )

  if (flat.length === 0) return 0

  const biomarkerEntry = {
    reportId,
    recordedAt,
    values: flat.map(e => ({
      key: e.key,
      name: e.name || e.key,
      value: e.value,
      unit: e.unit || '',
      refLow: e.refLow ?? null,
      refHigh: e.refHigh ?? null,
      category: e.category || 'Other',
      flag: e.flag || 'normal',
    })),
  }
  await database.collection('users').updateOne(
    { clerkId: userId, 'profiles.id': profileId },
    {
      $push: { 'profiles.$.biomarkers': biomarkerEntry },
      $set: { 'profiles.$.updatedAt': new Date() },
    }
  )
  return flat.length
}

async function handleAssignReportToProfile(request, reportId) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const { profileId } = await request.json()
  if (!profileId) return handleCORS(NextResponse.json({ error: 'profileId required' }, { status: 400 }))
  const database = await connectToMongo()

  // Load report to extract biomarkers
  const raw = await database.collection('reports').findOne({ id: reportId, userId })
  if (!raw) return handleCORS(NextResponse.json({ error: 'Report not found' }, { status: 404 }))

  // Assign profileId on report
  await database.collection('reports').updateOne(
    { id: reportId, userId },
    { $set: { profileId, updatedAt: new Date() } }
  )

  // Extract biomarkers and push to profile (clears old entries for this report first)
  const report = decryptReport(raw)
  const extracted = await recordBiomarkersToProfile(
    database, userId, profileId, reportId, report.explanation, report.createdAt || new Date()
  )

  return handleCORS(NextResponse.json({ success: true, biomarkersExtracted: extracted }))
}

// Re-extract biomarkers for every report already assigned to a profile.
// Lets existing users backfill the richer value history (units, reference
// ranges, all markers) without re-uploading anything.
async function handleResyncProfile(request) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const { profileId } = await request.json()
  if (!profileId || typeof profileId !== 'string') {
    return handleCORS(NextResponse.json({ error: 'profileId required' }, { status: 400 }))
  }
  const database = await connectToMongo()
  const rawReports = await database.collection('reports')
    .find({ userId, profileId })
    .sort({ createdAt: 1 })
    .toArray()

  let total = 0
  for (const raw of rawReports) {
    const report = decryptReport(raw)
    try {
      total += await recordBiomarkersToProfile(
        database, userId, profileId, report.id, report.explanation, report.createdAt || new Date()
      )
    } catch (err) {
      console.warn('Resync failed for report', report.id, err.message)
    }
  }
  return handleCORS(NextResponse.json({ success: true, reportsProcessed: rawReports.length, biomarkersExtracted: total }))
}

// Return the user's data & privacy settings.
async function handleGetSettings() {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const database = await connectToMongo()
  const user = await database.collection('users').findOne({ clerkId: userId })
  const retention = user?.dataRetention === 'keep' ? 'keep' : 'auto30'
  const totalReports = await database.collection('reports').countDocuments({ userId })
  return handleCORS(NextResponse.json({ dataRetention: retention, totalReports }))
}

// Change the retention policy and reconcile existing reports.
// 'keep'   -> remove expiresAt so nothing is auto-deleted (encrypted backup).
// 'auto30' -> set expiresAt to createdAt + 30 days on every report.
async function handleUpdateSettings(request) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const body = await request.json()
  const retention = body.dataRetention === 'keep' ? 'keep' : 'auto30'
  const database = await connectToMongo()

  await database.collection('users').updateOne(
    { clerkId: userId },
    { $set: { dataRetention: retention, updatedAt: new Date() } },
    { upsert: true }
  )

  if (retention === 'keep') {
    await database.collection('reports').updateMany(
      { userId },
      { $unset: { expiresAt: '' } }
    )
  } else {
    // Re-arm the 30-day window from each report's own creation date.
    const reports = await database.collection('reports')
      .find({ userId }, { projection: { id: 1, createdAt: 1 } })
      .toArray()
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
    for (const r of reports) {
      const base = r.createdAt ? new Date(r.createdAt).getTime() : Date.now()
      await database.collection('reports').updateOne(
        { userId, id: r.id },
        { $set: { expiresAt: new Date(base + THIRTY_DAYS) } }
      )
    }
  }

  return handleCORS(NextResponse.json({ success: true, dataRetention: retention }))
}

async function handleChat(request, reportId) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const database = await connectToMongo()

  // Fetch current report + all user reports (for history context)
  const [rawReport, rawAllReports, usageInfo, admin] = await Promise.all([
    database.collection('reports').findOne({ id: reportId, userId }),
    database.collection('reports')
      .find({ userId }, { projection: { extractedText: 0 } })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray(),
    ensureUserExists(userId, database),
    isAdminUser(),
  ])
  if (!rawReport) return handleCORS(NextResponse.json({ error: 'Report not found' }, { status: 404 }))
  const report = decryptReport(rawReport)
  const allReports = rawAllReports.map(r => decryptReport(r))

  const body = await request.json()
  const { question } = body
  if (!question?.trim()) return handleCORS(NextResponse.json({ error: 'Question required' }, { status: 400 }))

  // Enforce monthly chat fair-use limit
  const fairUseCheck = admin ? { allowed: true, used: 0, limit: Infinity } : await checkFairUse(userId, 'chat', database)
  if (!fairUseCheck.allowed) {
    return handleCORS(NextResponse.json({
      error: FAIR_USE_MSG,
      chatUsed: fairUseCheck.used,
      chatLimit: fairUseCheck.limit,
      chatRemaining: 0,
      limitReached: true,
    }, { status: 429 }))
  }

  const chatUsed = fairUseCheck.used

  // Build rich context: current report + patient history
  const currentCtx = report.explanation
    ? `\n\n=== CURRENT REPORT (${new Date(report.createdAt).toLocaleDateString()}: ${report.fileName}) ===\n${JSON.stringify(report.explanation, null, 2)}`
    : ''

  const historyCtx = allReports.length > 1
    ? '\n\n=== PATIENT REPORT HISTORY (for trend analysis) ===\n' +
      allReports
        .filter(r => r.id !== reportId && r.explanation)
        .map(r => `--- ${new Date(r.createdAt).toLocaleDateString()} (${r.fileName}) ---\nSummary: ${r.explanation?.summary || 'N/A'}\nTests: ${JSON.stringify(r.explanation?.tests || [], null, 2)}`)
        .join('\n\n')
    : ''

  const chatSystemPrompt = CHAT_PROMPT + currentCtx + historyCtx

  // Messages MUST start with role:'user'
  const messages = []
  if (Array.isArray(report.conversations) && report.conversations.length > 0) {
    report.conversations.slice(-10).forEach(c => {
      messages.push({ role: 'user', content: c.question })
      messages.push({ role: 'assistant', content: c.answer })
    })
  }
  messages.push({ role: 'user', content: question })

  const answer = await generateText({
    task: 'chat',
    system: chatSystemPrompt,
    messages,
    maxTokens: 1024,
  })
  const newChatUsed = chatUsed + 1
  const { limit: chatLimit } = fairUseCheck
  const chatRemaining = chatLimit === Infinity ? null : Math.max(0, chatLimit - newChatUsed)

  await Promise.all([
    database.collection('reports').updateOne(
      { id: reportId },
      { $push: { conversations: { question: encrypt(question), answer: encrypt(answer), timestamp: new Date() } } }
    ),
    admin ? Promise.resolve() : incrementFairUse(userId, 'chat', database),
  ])

  return handleCORS(NextResponse.json({
    success: true,
    answer,
    chatUsed: newChatUsed,
    chatLimit: chatLimit === Infinity ? null : chatLimit,
    chatRemaining,
    limitReached: chatRemaining === 0,
  }))
}

async function handleGetSubscription() {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const database = await connectToMongo()
  const [info, admin] = await Promise.all([
    ensureUserExists(userId, database),
    isAdminUser()
  ])
  const tier = admin ? 'admin' : info.tier
  const usageLimit = admin ? 999999 : info.limit
  const remaining = admin ? 999999 : Math.max(0, info.limit - info.used)
  return handleCORS(NextResponse.json({
    success: true,
    tier,
    status: 'active',
    usageLimit,
    currentUsage: info.used,
    remaining
  }))
}

async function handleCheckout(request) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  if (!stripe) return handleCORS(NextResponse.json({ error: 'Payments not configured' }, { status: 500 }))

  const database = await connectToMongo()
  const { tier, origin } = await request.json()

  const prices = {
    personal: { amount: 4.99,  mode: 'subscription', description: 'Personal Plan, 20 reports/month' },
    family:   { amount: 9.99,  mode: 'subscription', description: 'Family Plan, 50 reports/month, 5 profiles' },
    clinic:   { amount: 199.00, mode: 'subscription', description: 'Clinic, Unlimited everything' },
  }

  const priceInfo = prices[tier]
  if (!priceInfo) return handleCORS(NextResponse.json({ error: 'Invalid plan' }, { status: 400 }))

  const session = await stripe.checkout.sessions.create({
    mode: priceInfo.mode,
    payment_method_types: ['card'],
    allow_promotion_codes: true,
    client_reference_id: userId, // backup: readable even if metadata is stripped
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Medyra ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
          description: priceInfo.description
        },
        unit_amount: Math.round(priceInfo.amount * 100),
        ...(priceInfo.mode === 'subscription' && { recurring: { interval: 'month' } })
      },
      quantity: 1
    }],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
    metadata: { userId, tier }, // primary: used by webhook
  })

  await database.collection('payments').insertOne({
    id: uuidv4(), sessionId: session.id, userId, tier,
    amount: priceInfo.amount, currency: 'eur', status: 'pending', createdAt: new Date()
  })

  return handleCORS(NextResponse.json({ success: true, url: session.url }))
}

async function handleStripeWebhook(request) {
  if (!stripe) return handleCORS(NextResponse.json({ error: 'Not configured' }, { status: 500 }))
  const database = await connectToMongo()
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[Stripe webhook] STRIPE_WEBHOOK_SECRET not set in environment')
    return handleCORS(NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 }))
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed:', err.message)
    return handleCORS(NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 }))
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, tier } = session.metadata
    const limits = { personal: 20, family: 50, clinic: 999999 }
    await database.collection('users').updateOne(
      { clerkId: userId },
      {
        $set: {
          subscription: {
            tier, status: 'active',
            usageLimit: limits[tier] || 1,
            currentUsage: 0, startDate: new Date()
          },
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )
    await database.collection('payments').updateOne(
      { sessionId: session.id },
      { $set: { status: 'completed', completedAt: new Date() } }
    )
  }

  return handleCORS(NextResponse.json({ received: true }))
}

async function handleClerkWebhook(request) {
  // C1: Verify Svix signature before trusting any payload (mirrors Stripe pattern)
  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET
  if (!webhookSecret) {
    console.error('[Clerk webhook] CLERK_WEBHOOK_SIGNING_SECRET not configured')
    return handleCORS(NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 }))
  }

  const body = await request.text()
  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return handleCORS(NextResponse.json({ error: 'Missing webhook signature headers' }, { status: 400 }))
  }

  let event
  try {
    const wh = new Webhook(webhookSecret)
    event = wh.verify(body, { 'svix-id': svixId, 'svix-timestamp': svixTimestamp, 'svix-signature': svixSignature })
  } catch (err) {
    console.error('[Clerk webhook] Signature verification failed:', err.message)
    return handleCORS(NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 }))
  }

  const { type, data } = event
  const database = await connectToMongo()

  if (type === 'user.created') {
    await database.collection('users').insertOne({
      clerkId: data.id,
      email: data.email_addresses?.[0]?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      subscription: { tier: 'free', status: 'active', usageLimit: FREE_REPORT_LIMIT, currentUsage: 0 },
      createdAt: new Date(), updatedAt: new Date()
    })
  }
  if (type === 'user.updated') {
    await database.collection('users').updateOne(
      { clerkId: data.id },
      { $set: { email: data.email_addresses?.[0]?.email_address, firstName: data.first_name, lastName: data.last_name, updatedAt: new Date() } }
    )
  }
  if (type === 'user.deleted') {
    await database.collection('users').deleteOne({ clerkId: data.id })
    await database.collection('reports').deleteMany({ userId: data.id })
  }

  return handleCORS(NextResponse.json({ success: true }))
}

// ============================================================================
// SHARE LINKS - read-only, expiring, revocable
// ============================================================================

const SHARE_TTL_DAYS = 7

// Create (or rotate) a share link for one of the user's reports.
async function handleCreateShare(request, reportId) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const database = await connectToMongo()

  const report = await database.collection('reports').findOne(
    { id: reportId, userId },
    { projection: { id: 1 } }
  )
  if (!report) return handleCORS(NextResponse.json({ error: 'Report not found' }, { status: 404 }))

  // One active link per report: revoke previous tokens, then mint a new one.
  await database.collection('shares').updateMany(
    { reportId, userId, revoked: false },
    { $set: { revoked: true, revokedAt: new Date() } }
  )

  const token = uuidv4().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + SHARE_TTL_DAYS * 24 * 60 * 60 * 1000)
  await database.collection('shares').insertOne({
    token, reportId, userId, revoked: false, views: 0,
    createdAt: new Date(), expiresAt,
  })

  return handleCORS(NextResponse.json({ success: true, token, expiresAt }))
}

// Revoke all active share links for a report.
async function handleRevokeShare(reportId) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const database = await connectToMongo()
  await database.collection('shares').updateMany(
    { reportId, userId, revoked: false },
    { $set: { revoked: true, revokedAt: new Date() } }
  )
  return handleCORS(NextResponse.json({ success: true }))
}

// Current active share link for a report (so the UI can show state on load).
async function handleGetShareStatus(reportId) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const database = await connectToMongo()
  const share = await database.collection('shares').findOne(
    { reportId, userId, revoked: false, expiresAt: { $gt: new Date() } },
    { projection: { token: 1, expiresAt: 1, views: 1 } }
  )
  return handleCORS(NextResponse.json({
    success: true,
    share: share ? { token: share.token, expiresAt: share.expiresAt, views: share.views || 0 } : null,
  }))
}

// PUBLIC: resolve a share token into a sanitized, read-only explanation.
// Never exposes fileName, extractedText, conversations, or any user identity.
async function handleGetSharedReport(token) {
  if (!/^[a-f0-9]{32}$/.test(token)) {
    return handleCORS(NextResponse.json({ error: 'Invalid link' }, { status: 400 }))
  }
  const database = await connectToMongo()
  const share = await database.collection('shares').findOne({ token })
  if (!share || share.revoked || share.expiresAt < new Date()) {
    return handleCORS(NextResponse.json({ error: 'This link has expired or was revoked' }, { status: 404 }))
  }
  const raw = await database.collection('reports').findOne({ id: share.reportId })
  if (!raw) return handleCORS(NextResponse.json({ error: 'This link has expired or was revoked' }, { status: 404 }))

  const report = decryptReport(raw)
  // Owner's referral code powers the "understand your own report" CTA (viral loop)
  const owner = await database.collection('users').findOne(
    { clerkId: share.userId },
    { projection: { 'referral.code': 1 } }
  )
  await database.collection('shares').updateOne({ token }, { $inc: { views: 1 } })

  return handleCORS(NextResponse.json({
    success: true,
    shared: {
      explanation: report.explanation,
      createdAt: report.createdAt,
      expiresAt: share.expiresAt,
      refCode: owner?.referral?.code || null,
    },
  }))
}

// ============================================================================
// REFERRALS - invite a friend, both get a free report
// ============================================================================

const REFERRAL_MAX_CREDITS = 10

async function handleGetReferral() {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const database = await connectToMongo()
  let user = await database.collection('users').findOne({ clerkId: userId })
  if (!user) {
    await ensureUserExists(userId, database)
    user = await database.collection('users').findOne({ clerkId: userId })
  }

  let code = user?.referral?.code
  if (!code) {
    code = uuidv4().replace(/-/g, '').slice(0, 8)
    await database.collection('users').updateOne(
      { clerkId: userId },
      { $set: { 'referral.code': code, 'referral.createdAt': new Date() } }
    )
  }

  return handleCORS(NextResponse.json({
    success: true,
    code,
    referredCount: user?.referral?.count || 0,
    bonusReports: user?.bonusReports || 0,
    maxCredits: REFERRAL_MAX_CREDITS,
  }))
}

// Called on first consent: if the visitor arrived through a referral link
// (medyra_ref cookie), credit both sides with one extra free report per month.
async function claimReferralIfPresent(request, userId, database) {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const match = cookieHeader.match(/(?:^|;\s*)medyra_ref=([a-f0-9]{8})/)
    if (!match) return
    const code = match[1]

    const me = await database.collection('users').findOne({ clerkId: userId })
    if (!me || me.referredBy || me.referral?.code === code) return

    const referrer = await database.collection('users').findOne({ 'referral.code': code })
    if (!referrer || referrer.clerkId === userId) return

    await database.collection('users').updateOne(
      { clerkId: userId },
      { $set: { referredBy: code }, $inc: { bonusReports: 1 } }
    )
    if ((referrer.referral?.count || 0) < REFERRAL_MAX_CREDITS) {
      await database.collection('users').updateOne(
        { clerkId: referrer.clerkId },
        { $inc: { bonusReports: 1, 'referral.count': 1 } }
      )
    } else {
      await database.collection('users').updateOne(
        { clerkId: referrer.clerkId },
        { $inc: { 'referral.count': 1 } }
      )
    }
    console.log('🎁 Referral claimed')
  } catch (err) {
    console.warn('Referral claim failed:', err.message)
  }
}

// ============================================================================
// RECHECK REMINDERS - "kontrollieren in 3 Monaten" -> email nudge
// ============================================================================

const REMINDER_PRESETS = { '4w': 28, '3m': 90, '6m': 180 }
const REMINDER_MAX_ACTIVE = 10

async function sendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY not configured')
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'Medyra <hello@medyra.de>',
      to, subject, html,
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Email send failed (${res.status}): ${body.slice(0, 200)}`)
  }
  return res.json()
}

function reminderEmailHtml({ label, locale }) {
  const de = locale === 'de'
  const title = de ? 'Zeit für Ihre Kontrolluntersuchung' : 'Time for your follow-up check'
  const body = de
    ? 'Sie haben sich bei Medyra eine Erinnerung gesetzt. Vereinbaren Sie einen Termin bei Ihrer Ärztin oder Ihrem Arzt und laden Sie den neuen Befund danach einfach wieder hoch, um Ihre Werte zu vergleichen.'
    : 'You set yourself a reminder on Medyra. Book an appointment with your doctor, and upload the new report afterwards to compare your values over time.'
  const cta = de ? 'Neuen Befund hochladen' : 'Upload your new report'
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F3FAF6;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="background:#040C08;border-radius:16px 16px 0 0;padding:24px 28px;">
      <span style="color:#10B981;font-size:20px;font-weight:800;">Medyra</span>
    </div>
    <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:28px;border:1px solid #E5E7EB;border-top:none;">
      <h1 style="font-size:19px;color:#0B1F17;margin:0 0 8px;">${title}</h1>
      ${label ? `<p style="display:inline-block;background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:bold;margin:0 0 14px;">${label}</p>` : ''}
      <p style="font-size:14px;line-height:1.6;color:#4B5563;margin:0 0 22px;">${body}</p>
      <a href="https://medyra.de/upload" style="display:inline-block;background:#10B981;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:12px;">${cta}</a>
      <p style="font-size:11px;color:#9CA3AF;margin:24px 0 0;line-height:1.5;">${de
        ? 'Diese Erinnerung ist keine medizinische Beratung. Medyra GmbH, medyra.de'
        : 'This reminder is not medical advice. Medyra, medyra.de'}</p>
    </div>
  </div>
</body></html>`
}

async function handleCreateReminder(request) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const body = await request.json()
  const { preset, reportId, label, locale } = body

  const days = REMINDER_PRESETS[preset]
  if (!days) return handleCORS(NextResponse.json({ error: 'Invalid reminder preset' }, { status: 400 }))

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress
  if (!email) return handleCORS(NextResponse.json({ error: 'No email address on account' }, { status: 400 }))

  const database = await connectToMongo()
  const activeCount = await database.collection('reminders').countDocuments({ userId, status: 'scheduled' })
  if (activeCount >= REMINDER_MAX_ACTIVE) {
    return handleCORS(NextResponse.json({ error: 'Too many active reminders' }, { status: 429 }))
  }

  const dueAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  const reminder = {
    id: uuidv4(),
    userId,
    email,
    reportId: reportId || null,
    label: typeof label === 'string' ? label.slice(0, 120) : null,
    locale: locale === 'de' ? 'de' : 'en',
    dueAt,
    status: 'scheduled',
    createdAt: new Date(),
  }
  await database.collection('reminders').insertOne(reminder)
  return handleCORS(NextResponse.json({ success: true, reminder: { id: reminder.id, dueAt, label: reminder.label } }))
}

async function handleGetReminders(request) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const url = new URL(request.url)
  const reportId = url.searchParams.get('reportId')
  const query = { userId, status: 'scheduled' }
  if (reportId) query.reportId = reportId
  const database = await connectToMongo()
  const reminders = await database.collection('reminders')
    .find(query)
    .project({ _id: 0, id: 1, reportId: 1, label: 1, dueAt: 1 })
    .sort({ dueAt: 1 })
    .limit(20)
    .toArray()
  return handleCORS(NextResponse.json({ success: true, reminders }))
}

async function handleDeleteReminder(reminderId) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const database = await connectToMongo()
  await database.collection('reminders').updateOne(
    { id: reminderId, userId },
    { $set: { status: 'cancelled', cancelledAt: new Date() } }
  )
  return handleCORS(NextResponse.json({ success: true }))
}

// Vercel Cron (daily): send all due reminder emails. Protected by CRON_SECRET.
async function handleReminderCron(request) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  }
  const database = await connectToMongo()
  const due = await database.collection('reminders')
    .find({ status: 'scheduled', dueAt: { $lte: new Date() } })
    .limit(100)
    .toArray()

  let sent = 0, failed = 0
  for (const r of due) {
    try {
      await sendEmail({
        to: r.email,
        subject: r.locale === 'de' ? 'Medyra Erinnerung: Kontrolluntersuchung' : 'Medyra reminder: follow-up check',
        html: reminderEmailHtml({ label: r.label, locale: r.locale }),
      })
      await database.collection('reminders').updateOne(
        { id: r.id },
        { $set: { status: 'sent', sentAt: new Date() } }
      )
      sent++
    } catch (err) {
      failed++
      console.error('Reminder send failed:', r.id, err.message)
      await database.collection('reminders').updateOne(
        { id: r.id },
        { $inc: { attempts: 1 }, $set: { lastError: err.message } }
      )
      // After 3 failed daily attempts, stop retrying
      if ((r.attempts || 0) >= 2) {
        await database.collection('reminders').updateOne({ id: r.id }, { $set: { status: 'failed' } })
      }
    }
  }
  return handleCORS(NextResponse.json({ success: true, due: due.length, sent, failed }))
}

// ============================================================================
// MAIN ROUTER - uses URL pathname directly, not params
// ============================================================================

async function handleRoute(request) {
  const url = new URL(request.url)
  // Strip /api prefix to get the route
  const route = url.pathname.replace(/^\/api/, '') || '/'
  const method = request.method

  console.log(`📍 ${method} ${route}`)

  try {
    // Health check
    if ((route === '/' || route === '') && method === 'GET') {
      return handleHealthCheck()
    }

    // Analyze report
    if (route === '/reports/analyze' && method === 'POST') {
      return handleAnalyzeReport(request)
    }

    // Get all reports
    if (route === '/reports' && method === 'GET') {
      return handleGetReports(request)
    }

    // Chat with report
    const chatMatch = route.match(/^\/reports\/([^/]+)\/chat$/)
    if (chatMatch && method === 'POST') {
      return handleChat(request, chatMatch[1])
    }

    // Assign report to profile
    const assignMatch = route.match(/^\/reports\/([^/]+)\/assign$/)
    if (assignMatch && method === 'PATCH') {
      return handleAssignReportToProfile(request, assignMatch[1])
    }

    // Share links (create / status / revoke) for a report
    const shareMatch = route.match(/^\/reports\/([^/]+)\/share$/)
    if (shareMatch && method === 'POST') return handleCreateShare(request, shareMatch[1])
    if (shareMatch && method === 'GET') return handleGetShareStatus(shareMatch[1])
    if (shareMatch && method === 'DELETE') return handleRevokeShare(shareMatch[1])

    // PUBLIC: resolve a share token
    const sharedMatch = route.match(/^\/share\/([^/]+)$/)
    if (sharedMatch && method === 'GET') {
      return handleGetSharedReport(sharedMatch[1])
    }

    // PUBLIC: compact lab-value dataset for the interactive checker
    if (route === '/werte' && method === 'GET') {
      const res = NextResponse.json({ success: true, entries: getCheckerEntries() })
      res.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400')
      return handleCORS(res)
    }

    // Referral program
    if (route === '/referral' && method === 'GET') {
      return handleGetReferral()
    }

    // Recheck reminders
    if (route === '/reminders' && method === 'POST') return handleCreateReminder(request)
    if (route === '/reminders' && method === 'GET') return handleGetReminders(request)
    const reminderMatch = route.match(/^\/reminders\/([^/]+)$/)
    if (reminderMatch && method === 'DELETE') return handleDeleteReminder(reminderMatch[1])

    // Cron: due reminder emails (Vercel Cron, CRON_SECRET protected)
    if (route === '/cron/reminders' && method === 'GET') {
      return handleReminderCron(request)
    }

    // Re-extract biomarkers for all reports in a profile
    if (route === '/profiles/resync' && method === 'POST') {
      return handleResyncProfile(request)
    }

    // Data & privacy settings (retention policy)
    if (route === '/settings' && method === 'GET') {
      return handleGetSettings()
    }
    if (route === '/settings' && method === 'POST') {
      return handleUpdateSettings(request)
    }

    // Get specific report
    const reportMatch = route.match(/^\/reports\/([^/]+)$/)
    if (reportMatch && method === 'GET') {
      return handleGetReport(reportMatch[1])
    }

    // Subscription
    if (route === '/subscription' && method === 'GET') {
      return handleGetSubscription()
    }

    // Checkout
    if (route === '/checkout' && method === 'POST') {
      return handleCheckout(request)
    }

    // Stripe webhook
    if (route === '/webhook/stripe' && method === 'POST') {
      return handleStripeWebhook(request)
    }

    // Clerk webhook
    if (route === '/webhook/clerk' && method === 'POST') {
      return handleClerkWebhook(request)
    }

    // Consent: GET = check, POST = grant
    if (route === '/consent' && method === 'GET') {
      const { userId } = await auth()
      if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const database = await connectToMongo()
      const user = await database.collection('users').findOne({ clerkId: userId })
      return handleCORS(NextResponse.json({ consented: !!(user?.consentGiven), consentDate: user?.consentDate || null }))
    }
    if (route === '/consent' && method === 'POST') {
      const { userId } = await auth()
      if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      const body = await request.json()
      const database = await connectToMongo()
      const existing = await database.collection('users').findOne({ clerkId: userId }, { projection: { consentGiven: 1 } })
      await database.collection('users').updateOne(
        { clerkId: userId },
        { $set: { consentGiven: true, consentDate: new Date(), consentVersion: body.version || '1.0', updatedAt: new Date() } },
        { upsert: true }
      )
      // First consent = account activation: settle any pending referral
      if (!existing?.consentGiven) {
        await claimReferralIfPresent(request, userId, database)
      }
      return handleCORS(NextResponse.json({ success: true }))
    }

    return handleCORS(NextResponse.json({
      error: 'Route not found',
      route,
      method
    }, { status: 404 }))

  } catch (error) {
    // H4: Log full detail server-side only; never expose internal error messages to clients
    console.error('❌ Error:', error)
    return handleCORS(NextResponse.json({ error: 'Internal server error' }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute