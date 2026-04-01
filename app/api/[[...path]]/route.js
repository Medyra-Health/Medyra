import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import pdfParse from 'pdf-parse'
import Stripe from 'stripe'

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

async function ensureUserExists(userId, database) {
  const user = await database.collection('users').findOne({ clerkId: userId })
  if (!user) {
    await database.collection('users').insertOne({
      clerkId: userId,
      subscription: { tier: 'free', status: 'active', usageLimit: 1, currentUsage: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return { tier: 'free', limit: 1, used: 0, allowed: true }
  }
  const sub = user.subscription || { tier: 'free', usageLimit: 1, currentUsage: 0 }
  return {
    tier: sub.tier,
    limit: sub.usageLimit,
    used: sub.currentUsage,
    allowed: sub.currentUsage < sub.usageLimit
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
  await database.collection('reports').insertOne({
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
  })

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
  const database = await connectToMongo()
  const reports = await database.collection('reports')
    .find({ userId })
    .project({ extractedText: 0 })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray()
  return handleCORS(NextResponse.json({ success: true, reports, count: reports.length }))
}

async function handleGetReport(reportId) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const database = await connectToMongo()
  const report = await database.collection('reports').findOne({ id: reportId, userId })
  if (!report) return handleCORS(NextResponse.json({ error: 'Report not found' }, { status: 404 }))
  return handleCORS(NextResponse.json({ success: true, report }))
}

async function handleChat(request, reportId) {
  const { userId } = await auth()
  if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  const database = await connectToMongo()
  const report = await database.collection('reports').findOne({ id: reportId, userId })
  if (!report) return handleCORS(NextResponse.json({ error: 'Report not found' }, { status: 404 }))

  const body = await request.json()
  const { question } = body
  if (!question?.trim()) return handleCORS(NextResponse.json({ error: 'Question required' }, { status: 400 }))

  // Build context-aware system prompt that includes the report data
  const reportContext = report.explanation
    ? `\n\nHere is the patient's medical report analysis you should use to answer questions:\n${JSON.stringify(report.explanation, null, 2)}`
    : ''
  const chatSystemPrompt = MEDICAL_PROMPT + reportContext

  // Messages MUST start with role:'user' — Anthropic rejects assistant-first arrays
  const messages = []
  if (Array.isArray(report.conversations) && report.conversations.length > 0) {
    report.conversations.forEach(c => {
      messages.push({ role: 'user', content: c.question })
      messages.push({ role: 'assistant', content: c.answer })
    })
  }
  messages.push({ role: 'user', content: question })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: chatSystemPrompt,
    messages
  })
  const answer = response.content[0].text

  await database.collection('reports').updateOne(
    { id: reportId },
    { $push: { conversations: { question, answer, timestamp: new Date() } } }
  )

  return handleCORS(NextResponse.json({ success: true, answer }))
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
    onetime: { amount: 4.99, mode: 'payment', description: 'One-time report analysis' },
    personal: { amount: 9.00, mode: 'subscription', description: 'Personal Monthly' },
    family: { amount: 19.00, mode: 'subscription', description: 'Family Monthly' },
    clinic: { amount: 199.00, mode: 'subscription', description: 'Clinic Monthly' }
  }

  const priceInfo = prices[tier]
  if (!priceInfo) return handleCORS(NextResponse.json({ error: 'Invalid plan' }, { status: 400 }))

  const session = await stripe.checkout.sessions.create({
    mode: priceInfo.mode,
    payment_method_types: ['card'],
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
    metadata: { userId, tier }
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
    const limits = { onetime: 2, personal: 999999, family: 999999, clinic: 999999 }
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
      subscription: { tier: 'free', status: 'active', usageLimit: 1, currentUsage: 0 },
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