import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { MongoClient } from 'mongodb'

// ── Stripe must have raw body for signature verification ──────────────────
export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })

// ── MongoDB ───────────────────────────────────────────────────────────────
let _client = null
let _db = null
async function getDb() {
  if (_db) { try { await _db.admin().ping(); return _db } catch { _client = null; _db = null } }
  _client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })
  await _client.connect()
  _db = _client.db(process.env.DB_NAME || 'medyra')
  return _db
}

// ── Tier → usage limits (reports per month) ───────────────────────────────
const TIER_LIMITS = {
  free:     3,
  personal: 20,
  family:   50,
  clinic:   999999,
}

// ── Set a user's subscription tier in MongoDB ────────────────────────────
async function activateTier(db, { clerkUserId, tier, stripeCustomerId, stripeSubscriptionId, sessionId }) {
  await db.collection('users').updateOne(
    { clerkId: clerkUserId },
    {
      $set: {
        'subscription.tier': tier,
        'subscription.status': 'active',
        'subscription.usageLimit': TIER_LIMITS[tier] ?? 1,
        'subscription.startDate': new Date(),
        ...(stripeCustomerId && { stripeCustomerId }),
        ...(stripeSubscriptionId && { stripeSubscriptionId }),
        updatedAt: new Date(),
      },
      // Do NOT reset currentUsage — preserve existing report count
    },
    { upsert: true }
  )

  if (sessionId) {
    await db.collection('payments').updateOne(
      { sessionId },
      { $set: { status: 'completed', completedAt: new Date(), tier } }
    )
  }

  console.log(`[Stripe webhook] ✓ Activated tier=${tier} for clerkId=${clerkUserId}`)
}

// ── Downgrade a user back to free when subscription ends ─────────────────
async function deactivateSubscription(db, stripeCustomerId) {
  const result = await db.collection('users').updateOne(
    { stripeCustomerId },
    {
      $set: {
        'subscription.tier': 'free',
        'subscription.status': 'cancelled',
        'subscription.usageLimit': TIER_LIMITS.free,
        updatedAt: new Date(),
      },
    }
  )
  if (result.modifiedCount > 0) {
    console.log(`[Stripe webhook] ↓ Downgraded to free for stripeCustomerId=${stripeCustomerId}`)
  }
}

// ── Main webhook handler ──────────────────────────────────────────────────
export async function POST(request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[Stripe webhook] STRIPE_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  // Verify Stripe signature
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const db = await getDb()
  const obj = event.data.object

  console.log(`[Stripe webhook] Event: ${event.type}`)

  try {
    switch (event.type) {

      // ── Payment / checkout completed ─────────────────────────────────
      case 'checkout.session.completed': {
        const clerkUserId = obj.metadata?.userId || obj.client_reference_id
        const tier = obj.metadata?.tier
        if (!clerkUserId || !tier) {
          console.warn('[Stripe webhook] Missing userId or tier in metadata', obj.metadata)
          break
        }
        await activateTier(db, {
          clerkUserId,
          tier,
          stripeCustomerId: obj.customer,
          stripeSubscriptionId: obj.subscription,
          sessionId: obj.id,
        })
        break
      }

      // ── Subscription renewed or updated ──────────────────────────────
      case 'customer.subscription.updated': {
        const customerId = obj.customer
        const status = obj.status // 'active', 'past_due', 'canceled', etc.

        if (status === 'active') {
          // Look up user by stripeCustomerId to refresh active status
          await db.collection('users').updateOne(
            { stripeCustomerId: customerId },
            { $set: { 'subscription.status': 'active', updatedAt: new Date() } }
          )
          console.log(`[Stripe webhook] ↺ Subscription renewed for customerId=${customerId}`)
        } else if (status === 'past_due' || status === 'unpaid') {
          await db.collection('users').updateOne(
            { stripeCustomerId: customerId },
            { $set: { 'subscription.status': status, updatedAt: new Date() } }
          )
        } else if (status === 'canceled') {
          await deactivateSubscription(db, customerId)
        }
        break
      }

      // ── Subscription cancelled / expired ─────────────────────────────
      case 'customer.subscription.deleted': {
        await deactivateSubscription(db, obj.customer)
        break
      }

      // ── Invoice paid (subscription renewal confirmation) ──────────────
      case 'invoice.payment_succeeded': {
        if (obj.billing_reason === 'subscription_cycle') {
          await db.collection('users').updateOne(
            { stripeCustomerId: obj.customer },
            { $set: { 'subscription.status': 'active', updatedAt: new Date() } }
          )
          // Reset monthly usage on renewal
          await db.collection('users').updateOne(
            { stripeCustomerId: obj.customer },
            { $set: { 'subscription.currentUsage': 0 } }
          )
        }
        break
      }

      // ── Payment failed ────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        await db.collection('users').updateOne(
          { stripeCustomerId: obj.customer },
          { $set: { 'subscription.status': 'past_due', updatedAt: new Date() } }
        )
        console.warn(`[Stripe webhook] ⚠ Payment failed for customerId=${obj.customer}`)
        break
      }

      default:
        // Ignore unhandled events
        break
    }
  } catch (err) {
    console.error('[Stripe webhook] Handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
