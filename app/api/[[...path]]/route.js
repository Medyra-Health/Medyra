import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import pdfParse from 'pdf-parse'
import Stripe from 'stripe'
import { Webhook } from 'svix'
import { encrypt, decrypt } from '@/lib/encryption'

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

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
The document may be in German or English. Always answer in English, but keep the original terms recognizable (e.g. "Hämoglobin (Hemoglobin)", "Zuzahlung (copayment)").
If the text is not a medical or health-related document at all, say so politely in the summary, with empty tests and sections.
Return ONLY valid JSON. No other text.`

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
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: validMime, data: buffer.toString('base64') }
        },
        {
          type: 'text',
          text: 'Extract all text from this medical report image. Return only the raw extracted text, no commentary.'
        }
      ]
    }]
  })
  const fullText = response.content[0].text.trim()
  if (!fullText || fullText.length < 10) throw new Error('No readable text found in image')
  return fullText
}

// ============================================================================
// AI
// ============================================================================

async function getAIExplanation(extractedText) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: MEDICAL_PROMPT,
    messages: [{
      role: 'user',
      content: `Analyze this medical document and return JSON:\n\n${extractedText.substring(0, 10000)}`
    }],
    temperature: 0.3
  })

  let text = response.content[0].text.trim()

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
    // Free tier: count reports uploaded this calendar month (resets every month)
    const monthlyUsed = await database.collection('reports').countDocuments({
      userId,
      createdAt: { $gte: startOfCurrentMonth() },
    })
    return {
      tier: 'free',
      limit: FREE_REPORT_LIMIT,
      used: monthlyUsed,
      allowed: monthlyUsed < FREE_REPORT_LIMIT,
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

  let explanation
  try {
    explanation = await getAIExplanation(extractedText)
  } catch (err) {
    console.error('[AI analysis failed]', err.message)
    return handleCORS(NextResponse.json({ error: 'AI analysis failed. Please try again.' }, { status: 500 }))
  }

  const reportId = uuidv4()
  const profileId = formData.get('profileId') ? String(formData.get('profileId')) : null
  const createdAt = new Date()
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
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

function extractBiomarkersFromTests(tests, reportDate) {
  const entries = []
  for (const test of (tests || [])) {
    const name = test.name || ''
    const raw = test.value || ''
    // Parse numeric value from strings like "14.5 g/dL", "143 mg/dL" or German "14,8 g/dL"
    const numMatch = String(raw).replace(/,/g, '.').match(/\d+(?:\.\d+)?/)
    if (!numMatch) continue
    const value = parseFloat(numMatch[0])
    if (isNaN(value)) continue
    for (const { key, patterns } of BIOMARKER_PATTERNS) {
      if (patterns.some(p => p.test(name))) {
        entries.push({ key, value, date: reportDate, flag: test.flag || 'normal' })
        break
      }
    }
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
    values: flat.map(e => ({ key: e.key, name: e.key, value: e.value, flag: e.flag })),
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

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: chatSystemPrompt,
    messages,
  })
  const answer = response.content[0].text
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
      await database.collection('users').updateOne(
        { clerkId: userId },
        { $set: { consentGiven: true, consentDate: new Date(), consentVersion: body.version || '1.0', updatedAt: new Date() } },
        { upsert: true }
      )
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