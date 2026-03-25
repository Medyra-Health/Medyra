import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import vision from '@google-cloud/vision'
import pdfParse from 'pdf-parse'
import Stripe from 'stripe'

// ============================================================================
// INITIALIZATION & CONFIGURATION
// ============================================================================

// Global MongoDB connection (singleton pattern for Vercel)
let mongoClient = null
let db = null
let isConnecting = false

// Initialize API clients
const anthropic = new Anthropic({ 
  apiKey: process.env.ANTHROPIC_API_KEY 
})

// Initialize Google Vision with error handling
let visionClient = null
try {
  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    const googleCredentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString()
    )
    visionClient = new vision.ImageAnnotatorClient({ credentials: googleCredentials })
  } else {
    console.warn('Google Vision credentials not found - OCR will be disabled')
  }
} catch (error) {
  console.error('Failed to initialize Google Vision:', error.message)
}

const stripe = new Stripe(process.env.STRIPE_API_KEY || 'sk_test_default')

// ============================================================================
// DATABASE CONNECTION (Vercel-optimized)
// ============================================================================

async function connectToMongo() {
  // Return existing connection
  if (db && mongoClient) {
    try {
      // Test the connection
      await db.admin().ping()
      return db
    } catch (error) {
      console.log('MongoDB connection lost, reconnecting...')
      mongoClient = null
      db = null
    }
  }

  // Prevent multiple simultaneous connections
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
    
    console.log('✅ MongoDB connected successfully')
    return db
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    throw new Error(`Database connection failed: ${error.message}`)
  } finally {
    isConnecting = false
  }
}

// ============================================================================
// CORS HANDLER
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

const MEDICAL_PROMPT = `You are a medical report interpreter designed to help patients understand their lab results in plain language.

CRITICAL RULES:
- Start with: "This is educational information, not medical advice. Consult your doctor for personalized medical guidance."
- Never diagnose conditions or prescribe treatments
- Use simple, non-scary language
- Be precise but accessible
- Always recommend consulting their physician for abnormal results

You MUST respond with VALID JSON in this EXACT format (no markdown, no code blocks):
{
  "disclaimer": "This is educational information, not medical advice. Consult your doctor for personalized medical guidance.",
  "summary": "Brief 2-3 sentence overview of the report",
  "tests": [
    {
      "name": "Test name",
      "value": "Patient's result with units",
      "normalRange": "Normal range with units",
      "explanation": "What this test measures in 1-2 sentences",
      "interpretation": "What the patient's result means",
      "flag": "normal"
    }
  ],
  "questionsForDoctor": ["Question 1", "Question 2", "Question 3"]
}

flag options: "normal", "high", "low", "critical"
Ensure tests array has AT LEAST one test entry.
Return ONLY valid JSON, no other text.`

// ============================================================================
// FILE PROCESSING FUNCTIONS
// ============================================================================

async function extractTextFromPDF(buffer) {
  try {
    console.log('📄 Extracting text from PDF...')
    const data = await pdfParse(buffer)
    const text = data.text.trim()
    
    if (!text || text.length < 10) {
      throw new Error('PDF appears to be empty or contains no readable text')
    }
    
    console.log(`✅ PDF text extracted: ${text.length} characters`)
    return text
  } catch (error) {
    console.error('❌ PDF extraction error:', error.message)
    throw new Error(`Failed to extract text from PDF: ${error.message}`)
  }
}

async function extractTextFromImage(buffer) {
  if (!visionClient) {
    throw new Error('Google Vision API is not configured. Please set GOOGLE_CREDENTIALS_BASE64 environment variable.')
  }

  try {
    console.log('🖼️  Extracting text from image with Google Vision...')
    
    const [result] = await visionClient.documentTextDetection({
      image: { content: buffer.toString('base64') }
    })
    
    const fullText = result.fullTextAnnotation?.text?.trim() || ''
    
    if (!fullText || fullText.length < 10) {
      throw new Error('No readable text found in image. Please ensure the image is clear and contains text.')
    }
    
    console.log(`✅ Image text extracted: ${fullText.length} characters`)
    return fullText
  } catch (error) {
    console.error('❌ OCR error:', error.message)
    throw new Error(`Failed to extract text from image: ${error.message}`)
  }
}

// ============================================================================
// AI PROCESSING
// ============================================================================

async function getAIExplanation(extractedText, conversationHistory = []) {
  try {
    console.log('🤖 Sending to Claude AI for analysis...')
    console.log(`📝 Text length: ${extractedText.length} characters`)
    
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
      temperature: 0.3 // Lower temperature for more consistent output
    })

    const textContent = response.content[0].text.trim()
    console.log('✅ Claude response received')
    console.log('📤 Response preview:', textContent.substring(0, 200))
    
    // Try to parse JSON
    try {
      // Remove markdown code blocks if present
      let jsonText = textContent
      if (jsonText.includes('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```\n?/g, '')
      }
      
      const parsed = JSON.parse(jsonText)
      
      // Validate structure
      if (!parsed.disclaimer || !parsed.summary) {
        throw new Error('Invalid response structure')
      }
      
      // Ensure tests array exists
      if (!Array.isArray(parsed.tests)) {
        parsed.tests = []
      }
      
      // Ensure questionsForDoctor exists
      if (!Array.isArray(parsed.questionsForDoctor)) {
        parsed.questionsForDoctor = []
      }
      
      console.log(`✅ Parsed explanation: ${parsed.tests.length} tests found`)
      return parsed
    } catch (parseError) {
      console.warn('⚠️  Failed to parse JSON, using fallback format')
      console.log('Parse error:', parseError.message)
      
      // Fallback structure
      return {
        disclaimer: 'This is educational information, not medical advice. Consult your doctor for personalized medical guidance.',
        summary: textContent.substring(0, 500),
        tests: [],
        questionsForDoctor: [
          'What do these results mean for my health?',
          'Do I need any follow-up tests?',
          'Are there any lifestyle changes I should make?'
        ],
        rawResponse: textContent // Include raw response for debugging
      }
    }
  } catch (error) {
    console.error('❌ Claude API error:', error)
    throw new Error(`AI analysis failed: ${error.message}`)
  }
}

// ============================================================================
// USER & SUBSCRIPTION MANAGEMENT
// ============================================================================

async function ensureUserExists(userId, db) {
  try {
    const user = await db.collection('users').findOne({ clerkId: userId })
    
    if (!user) {
      console.log(`👤 Creating new user: ${userId}`)
      await db.collection('users').insertOne({
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
      
      return {
        tier: 'free',
        limit: 1,
        used: 0,
        allowed: true
      }
    }
    
    const subscription = user.subscription || {
      tier: 'free',
      status: 'active',
      usageLimit: 1,
      currentUsage: 0
    }
    
    const allowed = subscription.currentUsage < subscription.usageLimit
    
    return {
      tier: subscription.tier,
      limit: subscription.usageLimit,
      used: subscription.currentUsage,
      allowed
    }
  } catch (error) {
    console.error('Error checking user:', error)
    throw error
  }
}

async function incrementUsage(userId, db) {
  await db.collection('users').updateOne(
    { clerkId: userId },
    { 
      $inc: { 'subscription.currentUsage': 1 },
      $set: { 
        'subscription.lastUsed': new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: false }
  )
  console.log(`📊 Usage incremented for user: ${userId}`)
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
    const db = await connectToMongo()

    // ========================================================================
    // HEALTH CHECK
    // ========================================================================
    if ((route === '/root' || route === '/') && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: "Medyra API v2.0",
        status: "operational",
        timestamp: new Date().toISOString(),
        features: {
          database: !!db,
          ai: !!anthropic,
          ocr: !!visionClient,
          payments: !!stripe
        }
      }))
    }

    // ========================================================================
    // UPLOAD & ANALYZE REPORT
    // ========================================================================
    if (route === '/reports/analyze' && method === 'POST') {
      try {
        const { userId } = await auth()
        if (!userId) {
          return handleCORS(NextResponse.json({ 
            error: 'Authentication required. Please sign in.' 
          }, { status: 401 }))
        }

        console.log(`👤 Processing request for user: ${userId}`)

        // Check/create user and verify usage limits
        const usageCheck = await ensureUserExists(userId, db)
        
        if (!usageCheck.allowed) {
          console.log(`⛔ Usage limit reached for user: ${userId}`)
          return handleCORS(NextResponse.json({ 
            error: 'Usage limit reached for your current plan.',
            tier: usageCheck.tier,
            usageLimit: usageCheck.limit,
            currentUsage: usageCheck.used,
            message: 'Please upgrade your plan to analyze more reports.'
          }, { status: 429 }))
        }

        // Get file from form data
        const formData = await request.formData()
        const file = formData.get('file')
        
        if (!file) {
          return handleCORS(NextResponse.json({ 
            error: 'No file uploaded. Please select a file to analyze.' 
          }, { status: 400 }))
        }

        console.log(`📎 File received: ${file.name} (${file.type}, ${file.size} bytes)`)

        // Convert to buffer
        const buffer = Buffer.from(await file.arrayBuffer())
        const fileType = file.type || 'application/octet-stream'

        let extractedText = ''

        // Extract text based on file type
        try {
          if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
            extractedText = await extractTextFromPDF(buffer)
          } else if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(file.name)) {
            extractedText = await extractTextFromImage(buffer)
          } else if (fileType === 'text/plain' || file.name.endsWith('.txt')) {
            extractedText = buffer.toString('utf-8').trim()
          } else {
            return handleCORS(NextResponse.json({ 
              error: 'Unsupported file format',
              message: 'Please upload a PDF, image (JPG/PNG), or text file.',
              supportedFormats: ['PDF', 'JPG', 'PNG', 'TXT']
            }, { status: 400 }))
          }
        } catch (extractError) {
          console.error('Text extraction failed:', extractError)
          return handleCORS(NextResponse.json({ 
            error: 'Failed to extract text from file',
            message: extractError.message,
            suggestion: 'Please ensure your file is readable and not corrupted.'
          }, { status: 400 }))
        }

        // Validate extracted text
        if (!extractedText || extractedText.length < 20) {
          return handleCORS(NextResponse.json({ 
            error: 'Could not extract meaningful text from the document',
            message: 'The file appears to be empty or does not contain readable text.',
            extractedLength: extractedText?.length || 0
          }, { status: 400 }))
        }

        console.log(`✅ Text extracted successfully: ${extractedText.length} characters`)

        // Get AI explanation
        let explanation
        try {
          explanation = await getAIExplanation(extractedText)
        } catch (aiError) {
          console.error('AI processing failed:', aiError)
          return handleCORS(NextResponse.json({ 
            error: 'AI analysis failed',
            message: aiError.message,
            suggestion: 'Please try again or contact support if the problem persists.'
          }, { status: 500 }))
        }

        // Save report to database
        const reportId = uuidv4()
        const report = {
          id: reportId,
          userId,
          fileName: file.name,
          fileType,
          fileSize: file.size,
          extractedText: extractedText.substring(0, 50000), // Limit stored text
          explanation,
          conversations: [],
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'completed'
        }

        try {
          await db.collection('reports').insertOne(report)
          console.log(`💾 Report saved: ${reportId}`)
        } catch (dbError) {
          console.error('Failed to save report:', dbError)
          // Continue anyway - user still gets the explanation
        }

        // Increment usage counter
        try {
          await incrementUsage(userId, db)
        } catch (usageError) {
          console.error('Failed to increment usage:', usageError)
          // Continue anyway
        }

        // Return success response
        return handleCORS(NextResponse.json({
          success: true,
          reportId,
          explanation,
          usage: {
            current: usageCheck.used + 1,
            limit: usageCheck.limit,
            tier: usageCheck.tier
          },
          message: 'Report analyzed successfully'
        }))

      } catch (error) {
        console.error('❌ Report analysis error:', error)
        return handleCORS(NextResponse.json({ 
          error: 'Internal server error',
          message: error.message || 'An unexpected error occurred',
          suggestion: 'Please try again or contact support'
        }, { status: 500 }))
      }
    }

    // ========================================================================
    // GET USER'S REPORTS
    // ========================================================================
    if (route === '/reports' && method === 'GET') {
      const { userId } = await auth()
      if (!userId) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      try {
        const reports = await db.collection('reports')
          .find({ userId })
          .project({ extractedText: 0 }) // Exclude large text field
          .sort({ createdAt: -1 })
          .limit(100)
          .toArray()

        return handleCORS(NextResponse.json({ 
          success: true,
          reports,
          count: reports.length
        }))
      } catch (error) {
        console.error('Failed to fetch reports:', error)
        return handleCORS(NextResponse.json({ 
          error: 'Failed to fetch reports',
          message: error.message
        }, { status: 500 }))
      }
    }

    // ========================================================================
    // GET SPECIFIC REPORT
    // ========================================================================
    if (route.startsWith('/reports/') && method === 'GET' && route.split('/').length === 3) {
      const { userId } = await auth()
      if (!userId) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const reportId = route.split('/')[2]
      
      try {
        const report = await db.collection('reports').findOne({ 
          id: reportId, 
          userId 
        })

        if (!report) {
          return handleCORS(NextResponse.json({ 
            error: 'Report not found',
            message: 'This report does not exist or you do not have access to it.'
          }, { status: 404 }))
        }

        return handleCORS(NextResponse.json({ 
          success: true,
          report 
        }))
      } catch (error) {
        console.error('Failed to fetch report:', error)
        return handleCORS(NextResponse.json({ 
          error: 'Failed to fetch report',
          message: error.message
        }, { status: 500 }))
      }
    }

    // ========================================================================
    // FOLLOW-UP CHAT
    // ========================================================================
    if (route.match(/^\/reports\/.+\/chat$/) && method === 'POST') {
      const { userId } = await auth()
      if (!userId) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      const reportId = route.split('/')[2]
      const body = await request.json()
      const { question } = body

      if (!question || question.trim().length === 0) {
        return handleCORS(NextResponse.json({ 
          error: 'Question is required' 
        }, { status: 400 }))
      }

      try {
        const report = await db.collection('reports').findOne({ 
          id: reportId, 
          userId 
        })
        
        if (!report) {
          return handleCORS(NextResponse.json({ 
            error: 'Report not found' 
          }, { status: 404 }))
        }

        // Build conversation history
        const conversationHistory = []
        if (report.explanation) {
          conversationHistory.push({
            role: 'assistant',
            content: JSON.stringify(report.explanation)
          })
        }

        // Add previous conversations
        if (report.conversations && Array.isArray(report.conversations)) {
          report.conversations.forEach(conv => {
            conversationHistory.push({
              role: 'user',
              content: conv.question
            })
            conversationHistory.push({
              role: 'assistant',
              content: conv.answer
            })
          })
        }

        conversationHistory.push({
          role: 'user',
          content: question
        })

        // Get AI response
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          system: MEDICAL_PROMPT,
          messages: conversationHistory
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

        return handleCORS(NextResponse.json({ 
          success: true,
          answer 
        }))
      } catch (error) {
        console.error('Chat error:', error)
        return handleCORS(NextResponse.json({ 
          error: 'Failed to process question',
          message: error.message
        }, { status: 500 }))
      }
    }

    // ========================================================================
    // GET USER SUBSCRIPTION
    // ========================================================================
    if (route === '/subscription' && method === 'GET') {
      const { userId } = await auth()
      if (!userId) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      try {
        const usageInfo = await ensureUserExists(userId, db)
        
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
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
        return handleCORS(NextResponse.json({ 
          error: 'Failed to fetch subscription',
          message: error.message
        }, { status: 500 }))
      }
    }

    // ========================================================================
    // CREATE STRIPE CHECKOUT
    // ========================================================================
    if (route === '/checkout' && method === 'POST') {
      const { userId } = await auth()
      if (!userId) {
        return handleCORS(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
      }

      try {
        const body = await request.json()
        const { tier, origin } = body

        const prices = {
          onetime: { amount: 4.99, mode: 'payment', description: 'One-time report analysis' },
          personal: { amount: 9.00, mode: 'subscription', description: 'Personal Monthly Subscription' },
          family: { amount: 19.00, mode: 'subscription', description: 'Family Monthly Subscription' },
          clinic: { amount: 199.00, mode: 'subscription', description: 'Clinic Monthly Subscription' }
        }

        const priceInfo = prices[tier]
        if (!priceInfo) {
          return handleCORS(NextResponse.json({ 
            error: 'Invalid plan selected' 
          }, { status: 400 }))
        }

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

        // Save payment intent
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

        return handleCORS(NextResponse.json({ 
          success: true,
          url: session.url, 
          sessionId: session.id 
        }))
      } catch (error) {
        console.error('Checkout error:', error)
        return handleCORS(NextResponse.json({ 
          error: 'Failed to create checkout session',
          message: error.message
        }, { status: 500 }))
      }
    }

    // ========================================================================
    // STRIPE WEBHOOK
    // ========================================================================
    if (route === '/webhook/stripe' && method === 'POST') {
      const body = await request.text()
      const sig = request.headers.get('stripe-signature')

      try {
        const event = stripe.webhooks.constructEvent(
          body, 
          sig, 
          process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
        )

        if (event.type === 'checkout.session.completed') {
          const session = event.data.object
          const { userId, tier } = session.metadata

          // Update user subscription
          const usageLimits = {
            onetime: 2, // One-time gives 2 reports
            personal: 999999,
            family: 999999,
            clinic: 999999
          }

          await db.collection('users').updateOne(
            { clerkId: userId },
            { 
              $set: { 
                subscription: {
                  tier,
                  status: 'active',
                  usageLimit: usageLimits[tier] || 1,
                  currentUsage: 0,
                  startDate: new Date(),
                  lastUsed: null
                },
                updatedAt: new Date()
              }
            },
            { upsert: true }
          )

          // Update payment status
          await db.collection('payments').updateOne(
            { sessionId: session.id },
            { 
              $set: { 
                status: 'completed', 
                completedAt: new Date() 
              } 
            }
          )

          console.log(`✅ Subscription updated for user ${userId}: ${tier}`)
        }

        return handleCORS(NextResponse.json({ received: true }))
      } catch (error) {
        console.error('Webhook error:', error)
        return handleCORS(NextResponse.json({ 
          error: 'Webhook error' 
        }, { status: 400 }))
      }
    }

    // ========================================================================
    // CLERK WEBHOOK
    // ========================================================================
    if (route === '/webhook/clerk' && method === 'POST') {
      try {
        const body = await request.json()
        const { type, data } = body

        if (type === 'user.created') {
          await db.collection('users').insertOne({
            clerkId: data.id,
            email: data.email_addresses?.[0]?.email_address,
            firstName: data.first_name,
            lastName: data.last_name,
            subscription: {
              tier: 'free',
              status: 'active',
              usageLimit: 1,
              currentUsage: 0
            },
            createdAt: new Date(),
            updatedAt: new Date()
          })
          console.log(`✅ User created: ${data.id}`)
        }

        if (type === 'user.updated') {
          await db.collection('users').updateOne(
            { clerkId: data.id },
            {
              $set: {
                email: data.email_addresses?.[0]?.email_address,
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
          console.log(`✅ User deleted: ${data.id}`)
        }

        return handleCORS(NextResponse.json({ success: true }))
      } catch (error) {
        console.error('Clerk webhook error:', error)
        return handleCORS(NextResponse.json({ 
          error: 'Webhook processing failed' 
        }, { status: 400 }))
      }
    }

    // ========================================================================
    // ROUTE NOT FOUND
    // ========================================================================
    return handleCORS(NextResponse.json({ 
      error: 'Not found',
      message: `Route ${route} does not exist`,
      availableRoutes: [
        'GET /',
        'POST /reports/analyze',
        'GET /reports',
        'GET /reports/:id',
        'POST /reports/:id/chat',
        'GET /subscription',
        'POST /checkout'
      ]
    }, { status: 404 }))

  } catch (error) {
    console.error('❌ Unhandled error:', error)
    return handleCORS(NextResponse.json({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 }))
  }
}

// Export HTTP method handlers
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
