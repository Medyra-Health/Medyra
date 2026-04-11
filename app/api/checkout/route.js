import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })

// ── MongoDB ────────────────────────────────────────────────────────────────
let _client = null
let _db = null
async function getDb() {
  if (_db) { try { await _db.admin().ping(); return _db } catch { _client = null; _db = null } }
  _client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })
  await _client.connect()
  _db = _client.db(process.env.DB_NAME || 'medyra')
  return _db
}

// Plan config — use price_data (dynamic) so no Stripe Price IDs needed.
// LAUNCH50 coupon must exist in Stripe dashboard:
//   - Coupon ID: LAUNCH50
//   - Discount: 50% off
//   - Duration: forever
//   - Applies to: Personal and Family subscriptions
const PLANS = {
  onetime:  { amount: 299,  mode: 'payment',      label: 'Medyra One-Time Report', coupon: null },
  personal: { amount: 900,  mode: 'subscription', label: 'Medyra Personal',         coupon: 'LAUNCH50' },
  family:   { amount: 1800, mode: 'subscription', label: 'Medyra Family',            coupon: 'LAUNCH50' },
}

export async function POST(request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Payments not configured' }, { status: 500 })
  }

  let tier, origin
  try {
    const body = await request.json()
    tier = body.tier
    origin = body.origin || 'https://medyra.de'
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const plan = PLANS[tier]
  if (!plan) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  let session
  try {
    const sessionConfig = {
      mode: plan.mode,
      payment_method_types: ['card'],
      client_reference_id: userId,
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: plan.label },
          unit_amount: plan.amount,
          ...(plan.mode === 'subscription' && { recurring: { interval: 'month' } }),
        },
        quantity: 1,
      }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        userId,
        tier,
      },
    }

    // Apply LAUNCH50 coupon for Personal and Family — mutually exclusive with allow_promotion_codes
    if (plan.coupon) {
      sessionConfig.discounts = [{ coupon: plan.coupon }]
    } else {
      sessionConfig.allow_promotion_codes = true
    }

    session = await stripe.checkout.sessions.create(sessionConfig)
  } catch (err) {
    console.error('[Checkout] Stripe error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }

  // Log pending payment
  try {
    const db = await getDb()
    await db.collection('payments').insertOne({
      id: uuidv4(),
      sessionId: session.id,
      userId,
      tier,
      amount: plan.amount / 100,
      currency: 'eur',
      status: 'pending',
      createdAt: new Date(),
    })
  } catch (err) {
    console.error('[Checkout] DB log error (non-fatal):', err)
  }

  return NextResponse.json({ success: true, url: session.url })
}
