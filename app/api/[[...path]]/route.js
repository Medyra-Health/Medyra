import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import vision from '@google-cloud/vision'
import pdfParse from 'pdf-parse'
import Stripe from 'stripe'

// Initialize clients
let mongoClient
let db
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Initialize Google Vision with base64 credentials
const googleCredentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString()
)
const visionClient = new vision.ImageAnnotatorClient({ credentials: googleCredentials })

const stripe = new Stripe(process.env.STRIPE_API_KEY)

// MongoDB connection
async function connectToMongo() {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGO_URL)
    await mongoClient.connect()
    db = mongoClient.db(process.env.DB_NAME)
  }
  return db
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Medical Explanation System Prompt
const MEDICAL_PROMPT = `You are a medical report interpreter designed to help patients understand their lab results in plain language. Your role is to:

1. Explain each test in simple terms (what it measures, why it matters)
2. Interpret the patient's specific result
3. Compare against normal ranges
4. Highlight any values outside normal range
5. Suggest questions the patient should ask their doctor

CRITICAL RULES:
- Always start responses with a clear disclaimer: "This is educational information, not medical advice. Consult your doctor for personalized medical guidance."
- Never diagnose conditions or prescribe treatments
- Use simple, non-scary language
- Be precise but accessible
- Always recommend consulting their physician for abnormal results
- Structure your response in clear sections

Format your response as JSON with these sections:
{
  "disclaimer": "Full disclaimer text",
  "summary": "Brief overview of the report",
  "tests": [
    {
      "name": "Test name",
      "value": "Patient's result",
      "normalRange": "Normal range",
      "explanation": "What this test measures",
      "interpretation": "What the result means in plain language",
      "flag": "normal|high|low|critical"
    }
  ],
  "questionsForDoctor": ["Question 1", "Question 2", ...]
}
`

// Extract text from PDF
async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

// Extract text from image using Google Vision
async function extractTextFromImage(buffer) {
  try {
    const [result] = await visionClient.documentTextDetection({
      image: { content: buffer }
    })
    const fullText = result.fullTextAnnotation?.text || ''
    if (!fullText) {
      throw new Error('No text found in image')
    }
    return fullText
  } catch (error) {
    console.error('Vision API error:', error)
    throw new Error('Failed to extract text from image')
  }
}

// Get AI explanation from Claude
async function getAIExplanation(extractedText, conversationHistory = []) {
  try {
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: `Here is a medical lab report:\n\n${extractedText}\n\nPlease analyze this report and provide a comprehensive explanation.`
      }
    ]

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: MEDICAL_PROMPT,
      messages
    })

    const textContent = response.content[0].text
    // Try to parse as JSON, fallback to text
    try {
      return JSON.parse(textContent)
    } catch {
      return {
        disclaimer: 'This is educational information, not medical advice. Consult your doctor.',
        summary: textContent,
        tests: [],
        questionsForDoctor: []
      }
    }
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error('Failed to generate explanation')
  }
}

// Check user subscription and usage
async function checkUsageLimit(userId, db) {
  const user = await db.collection('users').findOne({ clerkId: userId })
  if (!user || !user.subscription) {
    // Return free tier limits
    return { tier: 'free', limit: 1, used: 0, allowed: false }
  }

  const subscription = user.subscription
  const now = new Date()
  
  // Check if subscription is active and not expired
  if (subscription.status !== 'active') {
    return { tier: 'free', limit: 1, used: 0, allowed: false }
  }

  // Check usage against limit
  const allowed = subscription.currentUsage < subscription.usageLimit
  
  return {
    tier: subscription.tier,
    limit: subscription.usageLimit,
    used: subscription.currentUsage,
    allowed
  }
}

// Increment usage counter
async function incrementUsage(userId, db) {
  await db.collection('users').updateOne(
    { clerkId: userId },
    { 
      $inc: { 'subscription.currentUsage': 1 },
      $set: { 'subscription.lastUsed': new Date() }
    }
  )
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Root endpoint
    if ((route === '/root' || route === '/') && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: "Medyra API v1.0",
        status: "operational"
      }))
    }

    // Upload and analyze report - POST /api/reports/analyze
    if (route === '/reports/analyze' && method === 'POST') {
      const { userId } = await auth()
      if (!userId) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      // Check usage limit
      const usageCheck = await checkUsageLimit(userId, db)
      if (!usageCheck.allowed && usageCheck.tier === 'free') {
        return handleCORS(NextResponse.json({ 
          error: 'Usage limit reached. Please upgrade your plan.',
          usageLimit: usageCheck.limit,
          currentUsage: usageCheck.used
        }, { status: 429 }))
      }

      const formData = await request.formData()
      const file = formData.get('file')
      
      if (!file) {
        return handleCORS(NextResponse.json({ error: 'No file provided' }, { status: 400 }))
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const fileType = file.type

      let extractedText = ''

      // Extract text based on file type
      if (fileType === 'application/pdf') {
        extractedText = await extractTextFromPDF(buffer)
      } else if (fileType.startsWith('image/')) {
        extractedText = await extractTextFromImage(buffer)
      } else if (fileType === 'text/plain') {
        extractedText = buffer.toString('utf-8')
      } else {
        return handleCORS(NextResponse.json({ 
          error: 'Unsupported file type. Please upload PDF, image, or text file.' 
        }, { status: 400 }))
      }

      if (!extractedText || extractedText.trim().length < 10) {
        return handleCORS(NextResponse.json({ 
          error: 'Could not extract meaningful text from the document' 
        }, { status: 400 }))
      }

      // Get AI explanation
      const explanation = await getAIExplanation(extractedText)

      // Save report to database
      const reportId = uuidv4()
      const report = {
        id: reportId,
        userId,
        fileName: file.name,
        fileType,
        extractedText,
        explanation,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }

      await db.collection('reports').insertOne(report)
      
      // Increment usage counter
      await incrementUsage(userId, db)

      return handleCORS(NextResponse.json({
        reportId,
        explanation,
        extractedText: extractedText.substring(0, 500) // First 500 chars for preview
      }))
    }

    // Get user's reports - GET /api/reports
    if (route === '/reports' && method === 'GET') {
      const { userId } = await auth()
      if (!userId) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const reports = await db.collection('reports')
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray()

      return handleCORS(NextResponse.json({ reports }))
    }

    // Get specific report - GET /api/reports/:id
    if (route.startsWith('/reports/') && method === 'GET') {
      const { userId } = await auth()
      if (!userId) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const reportId = route.split('/').pop()
      const report = await db.collection('reports').findOne({ id: reportId, userId })

      if (!report) {
        return handleCORS(NextResponse.json({ error: 'Report not found' }, { status: 404 }))
      }

      return handleCORS(NextResponse.json({ report }))
    }

    // Follow-up question - POST /api/reports/:id/chat
    if (route.match(/^\/reports\/.+\/chat$/) && method === 'POST') {
      const { userId } = await auth()
      if (!userId) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const reportId = route.split('/')[2]
      const body = await request.json()
      const { question, conversationHistory = [] } = body

      const report = await db.collection('reports').findOne({ id: reportId, userId })
      if (!report) {
        return handleCORS(NextResponse.json({ error: 'Report not found' }, { status: 404 }))
      }

      // Add the original report context and new question
      const messages = [
        {
          role: 'assistant',
          content: JSON.stringify(report.explanation)
        },
        ...conversationHistory,
        {
          role: 'user',
          content: question
        }
      ]

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: MEDICAL_PROMPT,
        messages
      })

      const answer = response.content[0].text

      // Save conversation
      await db.collection('reports').updateOne(
        { id: reportId },
        { 
          $push: { 
            conversations: {
              question,
              answer,
              timestamp: new Date()
            }
          }
        }
      )

      return handleCORS(NextResponse.json({ answer }))
    }

    // Get user subscription - GET /api/subscription
    if (route === '/subscription' && method === 'GET') {
      const { userId } = await auth()
      if (!userId) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const user = await db.collection('users').findOne({ clerkId: userId })
      
      if (!user || !user.subscription) {
        return handleCORS(NextResponse.json({
          tier: 'free',
          status: 'active',
          usageLimit: 1,
          currentUsage: 0
        }))
      }

      return handleCORS(NextResponse.json(user.subscription))
    }

    // Create Stripe checkout session - POST /api/checkout
    if (route === '/checkout' && method === 'POST') {
      const { userId } = await auth()
      if (!userId) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const body = await request.json()
      const { tier, origin } = body

      const prices = {
        onetime: { amount: 4.99, mode: 'payment' },
        personal: { amount: 9.00, mode: 'subscription' },
        family: { amount: 19.00, mode: 'subscription' },
        clinic: { amount: 199.00, mode: 'subscription' }
      }

      const priceInfo = prices[tier]
      if (!priceInfo) {
        return handleCORS(NextResponse.json({ error: 'Invalid tier' }, { status: 400 }))
      }

      const session = await stripe.checkout.sessions.create({
        mode: priceInfo.mode,
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Medyra ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
              description: tier === 'onetime' ? 'One-time report analysis' : `${tier} subscription`
            },
            unit_amount: Math.round(priceInfo.amount * 100),
            ...(priceInfo.mode === 'subscription' && {
              recurring: { interval: 'month' }
            })
          },
          quantity: 1
        }],
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        metadata: {
          userId,
          tier
        }
      })

      // Create pending payment record
      await db.collection('payments').insertOne({
        id: uuidv4(),
        sessionId: session.id,
        userId,
        tier,
        amount: priceInfo.amount,
        currency: 'eur',
        status: 'pending',
        createdAt: new Date()
      })

      return handleCORS(NextResponse.json({ url: session.url, sessionId: session.id }))
    }

    // Stripe webhook handler - POST /api/webhook/stripe
    if (route === '/webhook/stripe' && method === 'POST') {
      const body = await request.text()
      const sig = request.headers.get('stripe-signature')

      let event
      try {
        // In production, set up webhook secret
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test')
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message)
        return handleCORS(NextResponse.json({ error: 'Webhook error' }, { status: 400 }))
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const { userId, tier } = session.metadata

        // Update user subscription
        const subscriptionData = {
          tier,
          status: 'active',
          usageLimit: tier === 'personal' ? 999999 : tier === 'family' ? 999999 : tier === 'clinic' ? 999999 : 1,
          currentUsage: 0,
          startDate: new Date(),
          lastUsed: null
        }

        await db.collection('users').updateOne(
          { clerkId: userId },
          { 
            $set: { subscription: subscriptionData },
            $setOnInsert: { clerkId: userId, createdAt: new Date() }
          },
          { upsert: true }
        )

        // Update payment status
        await db.collection('payments').updateOne(
          { sessionId: session.id },
          { $set: { status: 'completed', completedAt: new Date() } }
        )
      }

      return handleCORS(NextResponse.json({ received: true }))
    }

    // Clerk webhook handler - POST /api/webhook/clerk
    if (route === '/webhook/clerk' && method === 'POST') {
      const body = await request.json()
      const { type, data } = body

      if (type === 'user.created') {
        await db.collection('users').insertOne({
          clerkId: data.id,
          email: data.email_addresses[0]?.email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          subscription: {
            tier: 'free',
            status: 'active',
            usageLimit: 1,
            currentUsage: 0
          },
          createdAt: new Date()
        })
      }

      if (type === 'user.updated') {
        await db.collection('users').updateOne(
          { clerkId: data.id },
          {
            $set: {
              email: data.email_addresses[0]?.email_address,
              firstName: data.first_name,
              lastName: data.last_name,
              updatedAt: new Date()
            }
          }
        )
      }

      if (type === 'user.deleted') {
        await db.collection('users').deleteOne({ clerkId: data.id })
        await db.collection('reports').deleteMany({ userId: data.id })
      }

      return handleCORS(NextResponse.json({ success: true }))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` }, 
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: error.message || 'Internal server error' }, 
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
