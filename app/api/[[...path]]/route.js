import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import pdfParse from 'pdf-parse'
import Stripe from 'stripe'

// ============================================================================
// INITIALIZATION & CONFIGURATION
// ============================================================================

let mongoClient = null
let db = null
let isConnecting = false

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Google Vision - lazy loaded only when needed
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
    console.log('✅ Google Vision initialized')
    return visionClient
  } catch (err) {
    console.warn('⚠️ Google Vision skipped:', err.message)
    return null
  }
}

// Stripe - safe init
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

async function connectToMongo() {
  if (db && mongoClient) {
    try {
      await db.admin().ping()
      return db
    } catch {
      console.log('MongoDB connection lost, reconnecting...')
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

    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL environment variable is not set')
    }

    mongoClient = new MongoClient(process.env.MONGO_URL, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
    })

    await mongoClient.connect()
    db = mongoClient.db(process.env.DB_NAME || 'medyra')
    console.log('✅ MongoDB connected')
    return db
  } catch (error) {
    console.error('❌ MongoDB error:', error.message)
    throw new Error(`Database connection failed: ${error.message}`)
  } finally {
    isConnecting = false
  }
}

// ============================================================================
// CORS
// ============================================================================

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// ============================================================================
// MEDICAL AI PROMPT
// ============================================================================

const MEDICAL_PROMPT = `You are a medical report interpreter helping patients understand their lab results in plain language.

CRITICAL RULES:
- Always start with the disclaimer
- Never diagnose conditions or prescribe treatments
- Use simple, non-scary language
- Always recommend consulting their physician for abnormal results

You MUST respond with VALID JSON only (no markdown, no code blocks, no extra text):
{
  "disclaimer": "This is educational information, not medical advice. Consult your doctor for personalized medical guidance.",
  "summary": "Brief 2-3 sentence overview of the report",
  "tests": [
    {
      "name": "Test name",
      "value": "Patient result with units",
      "normalRange": "Normal range with units",
      "explanation": "What this test measures in 1-2 sentences",
      "interpretation": "What the patient result means in plain language",
      "flag": "normal"
    }
  ],
  "questionsForDoctor": ["Question 1", "Question 2", "Question 3"]
}

flag must be one of: "normal", "high", "low", "critical"
Return ONLY valid JSON. No other text before or after.`

// ============================================================================
// FILE PROCESSING
// ============================================================================

async function extractTextFromPDF(buffer) {
  try {
    console.log('📄 Extracting PDF text...')
    const data = await pdfParse(buffer)
    const text = data.text.trim()
    if (!text || text.length < 10) {
      throw new Error('PDF appears empty or has no readable text')
    }
    console.log(`✅ PDF extracted: ${text.length} chars`)
    return text
  } catch (error) {
    throw new Error(`Failed to extract PDF text: ${error.message}`)
  }
}

async function extractTextFromImage(buffer) {
  const client = await getVisionClient()
  if (!client) {
    throw new Error('Image OCR is not configured. Please upload a PDF or text file instead.')
  }
  try {
    console.log('🖼️ Extracting image text via Google Vision...')
    const [result] = await client.documentTextDetection({
      image: { content: buffer.toString('base64') }
    })
    const fullText = result.fullTextAnnotation?.text?.trim() || ''
    if (!fullText || fullText.length < 10) {
      throw new Error('No readable text found in image')
    }
    console.log(`✅ Image extracted: ${fullText.length} chars`)
    return fullText
  } catch (error) {
    throw new Error(`Failed to extract image text: ${error.message}`)
  }
}

// ============================================================================
// AI PROCESSING
// ============================================================================

async function getAIExplanation(extractedText, conversationHistory = []) {
  try {
    console.log(`🤖 Sending to Claude (${extractedText.length} chars)...`)

    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: `Analyze this medical lab report and return a JSON response:\n\n${extractedText.substring(0, 10000)}`
      }
    ]

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: MEDICAL_PROMPT,
      messages,
      temperature: 0.3
    })

    let textContent = response.content[0].text.trim()
    console.log('✅ Claude responded')

    // Strip markdown code blocks if present
    if (textContent.includes('```json')) {
      textContent = textContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (textContent.includes('```')) {
      textContent = textContent.replace(/```\n?/g, '')
    }
    textContent = textContent.trim()

    try {
      const parsed = JSON.parse(textContent)
      if (!parsed.disclaimer) parsed.disclaimer = 'This is educational information, not medical advice. Consult your doctor.'
      if (!parsed.summary) parsed.summary = 'Report analyzed.'
      if (!Array.isArray(parsed.tests)) parsed.tests = []
      if (!Array.isArray(parsed.questionsForDoctor)) parsed.questionsForDoctor = []
      console.log(`✅ Parsed: ${parsed.tests.length} tests`)
      return parsed
    } catch {
      console.warn('⚠️ JSON parse failed, using fallback')
      return {
        disclaimer: 'This is educational information, not medical advice. Consult your doctor.',
        summary: textContent.substring(0, 500),
        tests: [],
        questionsForDoctor: [
          'What do these results mean for my health?',
          'Do I need any follow-up tests?',
          'Are there any lifestyle changes I should make?'
        ]
      }
    }
  } catch (error) {
    throw new Error(`AI analysis failed: ${error.message}`)
  }
}

// ============================================================================
// USER & SUBSCRIPTION
// ============================================================================

async function ensureUserExists(userId, database) {
  const user = await database.collection('users').findOne({ clerkId: userId })

  if (!user) {
    console.log(`👤 Creating new user: ${userId}`)
    await database.collection('users').insertOne({
      clerkId: userId,
      subscription: {
        tier: 'free',
        status: 'active',
        usageLimit: 1,
        currentUsage: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })
    return { tier: 'free', limit: 1, used: 0, allowed: true }
  }

  const sub = user.subscription || { tier: 'free', status: 'active', usageLimit: 1, currentUsage: 0 }
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
    {
      $inc: { 'subscription.currentUsage': 1 },
      $set: { 'subscription.lastUsed': new Date(), updatedAt: new Date() }
    }
  )
}

// ============================================================================
// MAIN ROUTE HANDLER
// ============================================================================

async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method
  console.log(`📍 ${method} ${route}`)

  try {
    const database = await connectToMongo()

    // HEALTH CHECK
    if ((route === '/root' || route === '/') && method === 'GET') {
      return handleCORS(NextResponse.json({
        message: 'Medyra API v2.0',
        status: 'operational',
        timestamp: new Date().toISOString(),
        features: {
          database: !!database,
          ai: !!anthropic,
          payments: !!stripe
        }
      }))
    }

    // ANALYZE REPORT
    if (route === '/reports/analyze' && method === 'POST') {
      try {
        const { userId } = await auth()
        if (!userId) {
          return handleCORS(NextResponse.json({ error: 'Authentication required. Please sign in.' }, { status: 401 }))
        }

        const usageCheck = await ensureUserExists(userId, database)

        if (!usageCheck.allowed) {
          return handleCORS(NextResponse.json({
            error: 'Usage limit reached for your current plan.',
            tier: usageCheck.tier,
            usageLimit: usageCheck.limit,
            currentUsage: usageCheck.used,
            message: 'Please upgrade your plan to analyze more reports.'
          }, { status: 429 }))
        }

        const formData = await request.formData()
        const file = formData.get('file')

        if (!file) {
          return handleCORS(NextResponse.json({ error: 'No file uploaded.' }, { status: 400 }))
        }

        console.log(`📎 File: ${file.name} (${file.type}, ${file.size} bytes)`)
        const buffer = Buffer.from(await file.arrayBuffer())
        const fileType = file.type || ''

        let extractedText = ''
        try {
          if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
            extractedText = await extractTextFromPDF(buffer)
          } else if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(file.name)) {
            extractedText = await extractTextFromImage(buffer)
          } else if (fileType === 'text/plain' || file.name.endsWith('.txt')) {
            extractedText = buffer.toString('utf-8').trim()
          } else {
            return handleCORS(NextResponse.json({
              error: 'Unsupported file format. Please upload PDF, JPG, PNG, or TXT.'
            }, { status: 400 }))
          }
        } catch (extractError) {
          return handleCORS(NextResponse.json({
            error: 'Failed to read file',
            message: extractError.message
          }, { status: 400 }))
        }

        if (!extractedText || extractedText.length < 20) {
          return handleCORS(NextResponse.json({
            error: 'Could not extract readable text from the document.'
          }, { status: 400 }))
        }

        let explanation
        try {
          explanation = await getAIExplanation(extractedText)
        } catch (aiError) {
          return handleCORS(NextResponse.json({
            error: 'AI analysis failed',
            message: aiError.message
          }, { status: 500 }))
        }

        const reportId = uuidv4()
        const report = {
          id: reportId,
          userId,
          fileName: file.name,
          fileType,
          fileSize: file.size,
          extractedText: extractedText.substring(0, 50000),
          explanation,
          conversations: [],
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'completed'
        }

        try {
          await database.collection('reports').insertOne(report)
          console.log(`💾 Report saved: ${reportId}`)
        } catch (dbError) {
          console.error('Failed to save report:', dbError)
        }

        try {
          await incrementUsage(userId, database)
        } catch (usageError) {
          console.error('Failed to increment usage:', usageError)
        }

        return handleCORS(NextResponse.json({
          success: true,
          reportId,
          explanation,
          usage: {
            current: usageCheck.used + 1,
            limit: usageCheck.limit,
            tier: usageCheck.tier
          }
        }))
      } catch (error) {
        console.error('❌ Analyze error:', error)
        return handleCORS(NextResponse.json({
          error: 'Internal server error',
          message: error.message
        }, { status: 500 }))
      }
    }

    // GET ALL REPORTS
    if (route === '/reports' && method === 'GET') {
      const { userId } = await auth()
      if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const reports = await database.collection('reports')
        .find({ userId })
        .project({ extractedText: 0 })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray()

      return handleCORS(NextResponse.json({ success: true, reports, count: reports.length }))
    }

    // GET SPECIFIC REPORT
    if (route.startsWith('/reports/') && !route.endsWith('/chat') && method === 'GET') {
      const { userId } = await auth()
      if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const reportId = route.split('/')[2]
      const report = await database.collection('reports').findOne({ id: reportId, userId })

      if (!report) return handleCORS(NextResponse.json({ error: 'Report not found' }, { status: 404 }))
      return handleCORS(NextResponse.json({ success: true, report }))
    }

    // FOLLOW-UP CHAT
    if (route.match(/^\/reports\/.+\/chat$/) && method === 'POST') {
      const { userId } = await auth()
      if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const reportId = route.split('/')[2]
      const body = await request.json()
      const { question } = body

      if (!question?.trim()) {
        return handleCORS(NextResponse.json({ error: 'Question is required' }, { status: 400 }))
      }

      const report = await database.collection('reports').findOne({ id: reportId, userId })
      if (!report) return handleCORS(NextResponse.json({ error: 'Report not found' }, { status: 404 }))

      const conversationHistory = []
      if (report.explanation) {
        conversationHistory.push({ role: 'assistant', content: JSON.stringify(report.explanation) })
      }
      if (Array.isArray(report.conversations)) {
        report.conversations.forEach(conv => {
          conversationHistory.push({ role: 'user', content: conv.question })
          conversationHistory.push({ role: 'assistant', content: conv.answer })
        })
      }
      conversationHistory.push({ role: 'user', content: question })

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: MEDICAL_PROMPT,
        messages: conversationHistory
      })

      const answer = response.content[0].text

      await database.collection('reports').updateOne(
        { id: reportId },
        { $push: { conversations: { question, answer, timestamp: new Date() } } }
      )

      return handleCORS(NextResponse.json({ success: true, answer }))
    }

    // GET SUBSCRIPTION
    if (route === '/subscription' && method === 'GET') {
      const { userId } = await auth()
      if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      const usageInfo = await ensureUserExists(userId, database)
      return handleCORS(NextResponse.json({
        success: true,
        subscription: {
          tier: usageInfo.tier,
          status: 'active',
          usageLimit: usageInfo.limit,
          currentUsage: usageInfo.used,
          remaining: usageInfo.limit - usageInfo.used
        }
      }))
    }

    // STRIPE CHECKOUT
    if (route === '/checkout' && method === 'POST') {
      const { userId } = await auth()
      if (!userId) return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))

      if (!stripe) {
        return handleCORS(NextResponse.json({ error: 'Payments not configured' }, { status: 500 }))
      }

      const body = await request.json()
      const { tier, origin } = body

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
        id: uuidv4(),
        sessionId: session.id,
        userId,
        tier,
        amount: priceInfo.amount,
        currency: 'eur',
        status: 'pending',
        createdAt: new Date()
      })

      return handleCORS(NextResponse.json({ success: true, url: session.url, sessionId: session.id }))
    }

    // STRIPE WEBHOOK
    if (route === '/webhook/stripe' && method === 'POST') {
      if (!stripe) return handleCORS(NextResponse.json({ error: 'Payments not configured' }, { status: 500 }))

      const body = await request.text()
      const sig = request.headers.get('stripe-signature')

      let event
      try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test')
      } catch (err) {
        return handleCORS(NextResponse.json({ error: 'Webhook error' }, { status: 400 }))
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const { userId, tier } = session.metadata
        const usageLimits = { onetime: 2, personal: 999999, family: 999999, clinic: 999999 }

        await database.collection('users').updateOne(
          { clerkId: userId },
          {
            $set: {
              subscription: {
                tier,
                status: 'active',
                usageLimit: usageLimits[tier] || 1,
                currentUsage: 0,
                startDate: new Date()
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

    // CLERK WEBHOOK
    if (route === '/webhook/clerk' && method === 'POST') {
      const body = await request.json()
      const { type, data } = body

      if (type === 'user.created') {
        await database.collection('users').insertOne({
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          subscription: { tier: 'free', status: 'active', usageLimit: 1, currentUsage: 0 },
          createdAt: new Date(),
          updatedAt: new Date()
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

    // 404
    return handleCORS(NextResponse.json({ error: 'Route not found', route }, { status: 404 }))

  } catch (error) {
    console.error('❌ Unhandled error:', error)
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