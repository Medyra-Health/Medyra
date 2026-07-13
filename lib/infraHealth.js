import { MongoClient } from 'mongodb'
import Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs/server'
import { google } from 'googleapis'
import { createHash } from 'crypto'

// ── MongoDB (data cluster you already connect to) ──────────────────────────
export async function checkMongoHealth() {
  if (!process.env.MONGO_URL) return { configured: false }
  let client = null
  try {
    const start = Date.now()
    client = new MongoClient(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 })
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'medyra')
    await db.admin().ping()
    const pingMs = Date.now() - start
    const collections = await db.listCollections().toArray()
    return { configured: true, status: 'ok', pingMs, collectionCount: collections.length }
  } catch (err) {
    return { configured: true, status: 'error', error: err.message }
  } finally {
    if (client) await client.close().catch(() => {})
  }
}

// ── Stripe (payments) ────────────────────────────────────────────────────────
export async function checkStripeHealth() {
  if (!process.env.STRIPE_SECRET_KEY) return { configured: false }
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
    const since = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
    const [balance, charges] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.charges.list({ created: { gte: since }, limit: 100 }),
    ])
    const volume30d = charges.data.reduce((sum, c) => sum + (c.paid ? c.amount : 0), 0)
    return {
      configured: true,
      status: 'ok',
      availableBalance: balance.available.map(b => ({ amount: b.amount / 100, currency: b.currency })),
      chargesLast30d: charges.data.length,
      volumeLast30d: (volume30d / 100).toFixed(2),
    }
  } catch (err) {
    return { configured: true, status: 'error', error: err.message }
  }
}

// ── Clerk (auth) ──────────────────────────────────────────────────────────────
export async function checkClerkHealth() {
  if (!process.env.CLERK_SECRET_KEY) return { configured: false }
  try {
    const clerk = await clerkClient()
    const { totalCount } = await clerk.users.getUserList({ limit: 1 })
    return { configured: true, status: 'ok', totalUsers: totalCount }
  } catch (err) {
    return { configured: true, status: 'error', error: err.message }
  }
}

// ── Vercel (deployments) ──────────────────────────────────────────────────────
export async function checkVercelHealth() {
  const token = process.env.VERCEL_API_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!token || !projectId) return { configured: false }
  try {
    const teamQuery = process.env.VERCEL_TEAM_ID ? `&teamId=${process.env.VERCEL_TEAM_ID}` : ''
    const res = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1${teamQuery}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Vercel API returned ${res.status}`)
    const data = await res.json()
    const latest = data.deployments?.[0]
    return {
      configured: true,
      status: 'ok',
      latestDeployment: latest ? {
        state: latest.state,
        url: latest.url,
        createdAt: latest.createdAt,
        target: latest.target,
      } : null,
    }
  } catch (err) {
    return { configured: true, status: 'error', error: err.message }
  }
}

// ── Google Search Console (SEO) ──────────────────────────────────────────────
export async function checkSearchConsoleHealth() {
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL
  if (!credsJson || !siteUrl) return { configured: false }
  try {
    const credentials = JSON.parse(credsJson)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    })
    const searchconsole = google.searchconsole({ version: 'v1', auth })

    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - 28)
    const fmt = d => d.toISOString().slice(0, 10)

    const { data } = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: fmt(startDate),
        endDate: fmt(endDate),
        dimensions: ['query'],
        rowLimit: 5,
      },
    })

    const totals = (data.rows || []).reduce(
      (acc, row) => ({
        clicks: acc.clicks + (row.clicks || 0),
        impressions: acc.impressions + (row.impressions || 0),
      }),
      { clicks: 0, impressions: 0 }
    )

    return {
      configured: true,
      status: 'ok',
      last28d: totals,
      topQueries: (data.rows || []).map(r => ({
        query: r.keys?.[0],
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.position ? Number(r.position.toFixed(1)) : null,
      })),
    }
  } catch (err) {
    return { configured: true, status: 'error', error: err.message }
  }
}

// ── MongoDB Atlas (cluster infra, separate from the DB connection string) ────
// Atlas Admin API uses HTTP Digest auth — no first-party npm client, so this
// hand-rolls the two-request digest handshake with Node's built-in crypto.
async function digestFetch(url, publicKey, privateKey) {
  const first = await fetch(url)
  if (first.status !== 401) return first
  const authHeader = first.headers.get('www-authenticate')
  if (!authHeader) throw new Error('Atlas API did not return a digest challenge')

  const params = {}
  authHeader.replace(/(\w+)="?([^",]+)"?/g, (_, k, v) => { params[k] = v; return '' })

  const method = 'GET'
  const uri = new URL(url).pathname + new URL(url).search
  const ha1 = createHash('md5').update(`${publicKey}:${params.realm}:${privateKey}`).digest('hex')
  const ha2 = createHash('md5').update(`${method}:${uri}`).digest('hex')
  const nc = '00000001'
  const cnonce = createHash('md5').update(String(Date.now())).digest('hex').slice(0, 8)
  const response = createHash('md5')
    .update(`${ha1}:${params.nonce}:${nc}:${cnonce}:${params.qop || 'auth'}:${ha2}`)
    .digest('hex')

  const digestAuth = `Digest username="${publicKey}", realm="${params.realm}", nonce="${params.nonce}", uri="${uri}", qop=${params.qop || 'auth'}, nc=${nc}, cnonce="${cnonce}", response="${response}"`
  return fetch(url, { headers: { Authorization: digestAuth } })
}

export async function checkAtlasHealth() {
  const publicKey = process.env.MONGODB_ATLAS_PUBLIC_KEY
  const privateKey = process.env.MONGODB_ATLAS_PRIVATE_KEY
  const groupId = process.env.MONGODB_ATLAS_PROJECT_ID
  const clusterName = process.env.MONGODB_ATLAS_CLUSTER_NAME
  if (!publicKey || !privateKey || !groupId || !clusterName) return { configured: false }

  try {
    const url = `https://cloud.mongodb.com/api/atlas/v2/groups/${groupId}/clusters/${clusterName}`
    const res = await digestFetch(url, publicKey, privateKey)
    if (!res.ok) throw new Error(`Atlas API returned ${res.status}`)
    const data = await res.json()
    return {
      configured: true,
      status: 'ok',
      clusterState: data.stateName,
      mongoDBVersion: data.mongoDBVersion,
      tier: data.replicationSpecs?.[0]?.regionConfigs?.[0]?.electableSpecs?.instanceSize,
    }
  } catch (err) {
    return { configured: true, status: 'error', error: err.message }
  }
}
