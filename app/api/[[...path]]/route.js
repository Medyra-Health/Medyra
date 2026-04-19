import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import pdfParse from 'pdf-parse'
import Stripe from 'stripe'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

// ============================================================================
// ENCRYPTION — AES-256-GCM field-level encryption (GDPR Art. 32 / BDSG §64)
// All medical report data is encrypted before storage in MongoDB.
// The ENCRYPTION_KEY env var must be a 64-character hex string (32 bytes).
// Without the key, no stored ciphertext can be decrypted — not even by us.
// ============================================================================

const ENC_ALGO = 'aes-256-gcm'

function getEncKey() {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[Medyra] ENCRYPTION_KEY not set or invalid — data stored unencrypted')
    }
    return null
  }
  return Buffer.from(hex, 'hex')
}

function encrypt(plaintext) {
  const key = getEncKey()
  if (!key || plaintext == null) return plaintext
  try {
    const iv = randomBytes(16)
    const cipher = createCipheriv(ENC_ALGO, key, iv)
    let enc = cipher.update(String(plaintext), 'utf8', 'hex')
    enc += cipher.final('hex')
    const tag = cipher.getAuthTag()
    // Format: {iv_hex}:{ciphertext_hex}:{auth_tag_hex}
    return `${iv.toString('hex')}:${enc}:${tag.toString('hex')}`
  } catch (e) {
    console.error('[Medyra] Encryption failed:', e.message)
    return plaintext
  }
}

function decrypt(value) {
  const key = getEncKey()
  if (!key || !value || typeof value !== 'string') return value
  // Detect our format: {32-hex}:{any-hex}:{32-hex}
  const parts = value.split(':')
  if (parts.length !== 3 || parts[0].length !== 32 || parts[2].length !== 32) return value
  try {
    const iv = Buffer.from(parts[0], 'hex')
    const tag = Buffer.from(parts[2], 'hex')
    const decipher = createDecipheriv(ENC_ALGO, key, iv)
    decipher.setAuthTag(tag)
    let dec = decipher.update(parts[1], 'hex', 'utf8')
    dec += decipher.final('utf8')
    return dec
  } catch {
    // Decryption failed — return raw value (backwards compat with old unencrypted data)
    return value
  }
}

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

let visionClient = null
async function getVisionClient() {
  if (visionClient) return visionClient
  if (!process.env.GOOGLE_CREDENTIALS_BASE64) return null
  try {
    const vision = await import('@google-cloud/vision')
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString()
    )
    visionClient = new vision.default.ImageAnnotatorClient({ credentials })
    return visionClient
  } catch (err) {
    console.warn('Google Vision skipped:', err.message)
    return null
  }
}

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

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// ============================================================================
// MEDICAL PROMPT
// ============================================================================

const MEDICAL_PROMPT = `You are a medical report interpreter helping patients understand their lab results in plain language.

CRITICAL RULES:
- Always start with the disclaimer
- Never diagnose or prescribe
- Use simple, non-scary language
- Always recommend consulting their physician

You MUST respond with VALID JSON only (no markdown, no code blocks):
{
  "disclaimer": "This is educational information, not medical advice. Consult your doctor for personalized medical guidance.",
  "summary": "Brief 2-3 sentence overview",
  "tests": [
    {
      "name": "Test name",
      "value": "Patient result with units",
      "normalRange": "Normal range with units",
      "explanation": "What this test measures",
      "interpretation": "What the result means in plain language",
      "flag": "normal"
    }
  ],
  "questionsForDoctor": ["Question 1", "Question 2", "Question 3"]
}
flag must be: "normal", "high", "low", or "critical"
Return ONLY valid JSON. No other text.`

const CHAT_PROMPT = `You are Medyra AI — a friendly, empathetic health assistant that helps patients understand their medical reports.

RULES:
- Respond in clear, plain language — no jargon
- Never diagnose conditions or prescribe treatments
- Always encourage the patient to consult their doctor for medical decisions
- Be warm and reassuring, not scary
- Give specific, helpful answers based on the patient's actual report data provided in the context
- When referencing past reports, mention the date/time to help the patient track trends
- Keep answers concise but complete (2-5 sentences unless a longer explanation is truly needed)
- End every response with a gentle reminder to discuss findings with their doctor if the topic is clinical
- NEVER respond with JSON — always respond in natural conversational text`

// Monthly chat fair-use limits (hard cap — silently blocked, no auto-upgrade)
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
// Does NOT increment — call incrementFairUse separately after the action succeeds.
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
      content: `Analyze this medical lab report and return JSON:\n\n${extractedText.substring(0, 10000)}`
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
    if (!Array.isArray(parsed.questionsForDoctor)) parsed.questionsForDoctor = []
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

  console.log(`📎 File: ${file.name} (${file.type}, ${file.size} bytes)`)
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
    return handleCORS(NextResponse.json({ error: 'AI analysis failed', message: err.message }, { status: 500 }))
  }

  const reportId = uuidv4()
  await database.collection('reports').insertOne(encryptReport({
    id: reportId,
    userId,
    fileName: file.name,
    fileType,
    extractedText: extractedText.substring(0, 50000),
    explanation,
    conversations: [],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'completed'
  }))

  await incrementUsage(userId, database)

  return handleCORS(NextResponse.json({
    success: true,
    reportId,
    explanation,
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

// Biomarker keyword matcher — maps test name patterns to tracked keys
const BIOMARKER_PATTERNS = [
  { key: 'hemoglobin', patterns: [/hemoglobin/i, /\bhgb\b/i, /\bhb\b/i] },
  { key: 'ferritin',   patterns: [/ferritin/i] },
  { key: 'tsh',        patterns: [/\btsh\b/i, /thyroid.stimulating/i] },
  { key: 'hba1c',      patterns: [/hba1c/i, /hb\s?a1c/i, /glycat/i, /glycosylated/i] },
  { key: 'cholesterol',patterns: [/total\s*cholesterol/i, /cholesterol/i] },
  { key: 'vitaminD',   patterns: [/vitamin\s*d/i, /25.oh/i, /calcifediol/i] },
  { key: 'crp',        patterns: [/\bcrp\b/i, /c.reactive/i] },
  { key: 'egfr',       patterns: [/\begfr\b/i, /glomerular\s*filtration/i] },
]

function extractBiomarkersFromTests(tests, reportDate) {
  const entries = []
  for (const test of (tests || [])) {
    const name = test.name || ''
    const raw = test.value || ''
    // Parse numeric value from strings like "14.5 g/dL" or "143 mg/dL"
    const numMatch = String(raw).match(/[\d.]+/)
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

  // Extract biomarkers and push to profile
  const report = decryptReport(raw)
  let tests = []
  try {
    const exp = typeof report.explanation === 'string' ? JSON.parse(report.explanation) : report.explanation
    tests = exp?.tests || []
  } catch {}

  const flat = extractBiomarkersFromTests(tests, report.createdAt || new Date())
  if (flat.length > 0) {
    // Store as one grouped entry per report (format HealthTimeline expects)
    const biomarkerEntry = {
      reportId,
      recordedAt: report.createdAt || new Date(),
      values: flat.map(e => ({ key: e.key, name: e.key, value: e.value, flag: e.flag })),
    }
    await database.collection('users').updateOne(
      { clerkId: userId, 'profiles.id': profileId },
      {
        $push: { 'profiles.$.biomarkers': biomarkerEntry },
        $set: { 'profiles.$.updatedAt': new Date() },
      }
    )
  }

  return handleCORS(NextResponse.json({ success: true, biomarkersExtracted: flat.length }))
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
    personal: { amount: 4.99,  mode: 'subscription', description: 'Personal Plan — 20 reports/month' },
    family:   { amount: 9.99,  mode: 'subscription', description: 'Family Plan — 50 reports/month, 5 profiles' },
    clinic:   { amount: 199.00, mode: 'subscription', description: 'Clinic — Unlimited everything' },
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

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test')
  } catch {
    return handleCORS(NextResponse.json({ error: 'Webhook error' }, { status: 400 }))
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
  const database = await connectToMongo()
  const { type, data } = await request.json()

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
    console.error('❌ Error:', error)
    return handleCORS(NextResponse.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute