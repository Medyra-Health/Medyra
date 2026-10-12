import { MongoClient } from 'mongodb'
import { isIP } from 'node:net'

let collectionPromise
export async function accessAttemptsCollection() {
  if (!collectionPromise) collectionPromise = (async () => {
    const client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 5, serverSelectionTimeoutMS: 4000 })
    await client.connect()
    const collection = client.db(process.env.DB_NAME || 'medyra').collection('privateAccessAttempts')
    await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    await collection.createIndex({ createdAt: -1 })
    return collection
  })().catch(error => { collectionPromise = null; throw error })
  return collectionPromise
}

// Accept only hosting-provided location headers, never submitted form fields.
export function attemptMetadata(request, result) {
  const hosted = process.env.VERCEL === '1'
  const ip = hosted ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() : null
  const location = name => {
    if (!hosted) return null
    const value = request.headers.get(name)
    if (!value) return null
    try { return decodeURIComponent(value).slice(0,100) } catch { return null }
  }
  const createdAt = new Date()
  return {
    createdAt, expiresAt: new Date(createdAt.getTime() + 30 * 86400000), result,
    ip: ip && isIP(ip) ? ip : null,
    country: location('x-vercel-ip-country'), region: location('x-vercel-ip-country-region'), city: location('x-vercel-ip-city'),
    userAgent: (request.headers.get('user-agent') || '').slice(0,300),
  }
}
export async function recordAccessAttempt(request, result) {
  // Never persist a password, password hash, session token, or request body.
  try { await (await accessAttemptsCollection()).insertOne(attemptMetadata(request,result)) }
  catch { console.error('Private access audit storage unavailable') }
}
