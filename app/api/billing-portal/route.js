import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { MongoClient } from 'mongodb'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })

let _client = null
let _db = null
async function getDb() {
  if (_db) { try { await _db.admin().ping(); return _db } catch { _client = null; _db = null } }
  _client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })
  await _client.connect()
  _db = _client.db(process.env.DB_NAME || 'medyra')
  return _db
}

export async function POST(request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { origin } = await request.json().catch(() => ({}))
  const returnUrl = origin ? `${origin}/dashboard` : 'https://medyra.de/dashboard'

  const db = await getDb()
  const user = await db.collection('users').findOne({ clerkId: userId })

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
  })

  return NextResponse.json({ url: portalSession.url })
}
