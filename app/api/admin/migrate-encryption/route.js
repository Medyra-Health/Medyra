import { currentUser } from '@clerk/nextjs/server'
import { MongoClient } from 'mongodb'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ADMIN_EMAIL = 'abralur28@gmail.com'
const ENC_ALGO = 'aes-256-gcm'

function getEncKey() {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) return null
  return Buffer.from(hex, 'hex')
}

function looksEncrypted(value) {
  if (typeof value !== 'string') return false
  const parts = value.split(':')
  return parts.length === 3 && parts[0].length === 32 && parts[2].length === 32
}

function encrypt(plaintext) {
  const key = getEncKey()
  if (!key || plaintext == null) return plaintext
  const str = typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext)
  const iv = randomBytes(16)
  const cipher = createCipheriv(ENC_ALGO, key, iv)
  let enc = cipher.update(str, 'utf8', 'hex')
  enc += cipher.final('hex')
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${enc}:${tag.toString('hex')}`
}

export async function POST() {
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress
  if (!email || email !== ADMIN_EMAIL) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const key = getEncKey()
  if (!key) {
    return Response.json({ error: 'ENCRYPTION_KEY not configured' }, { status: 500 })
  }

  const client = new MongoClient(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 })
  try {
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'medyra')
    const col = db.collection('reports')

    const allReports = await col.find({}).toArray()

    let migrated = 0
    let skipped = 0
    let failed = 0

    for (const doc of allReports) {
      // Skip if all 3 main fields are already encrypted
      if (
        looksEncrypted(doc.fileName) &&
        looksEncrypted(doc.extractedText) &&
        looksEncrypted(doc.explanation)
      ) {
        skipped++
        continue
      }

      try {
        const update = {}

        if (!looksEncrypted(doc.fileName) && doc.fileName != null) {
          update.fileName = encrypt(doc.fileName)
        }
        if (!looksEncrypted(doc.extractedText) && doc.extractedText != null) {
          update.extractedText = encrypt(doc.extractedText)
        }
        if (!looksEncrypted(doc.explanation) && doc.explanation != null) {
          update.explanation = encrypt(doc.explanation)
        }

        // Encrypt conversations array entries if present
        if (Array.isArray(doc.conversations) && doc.conversations.length > 0) {
          const encConvs = doc.conversations.map(c => ({
            ...c,
            question: looksEncrypted(c.question) ? c.question : encrypt(c.question),
            answer: looksEncrypted(c.answer) ? c.answer : encrypt(c.answer),
          }))
          update.conversations = encConvs
        }

        if (Object.keys(update).length > 0) {
          await col.updateOne({ _id: doc._id }, { $set: update })
          migrated++
        } else {
          skipped++
        }
      } catch (err) {
        console.error(`Failed to migrate doc ${doc._id}:`, err.message)
        failed++
      }
    }

    return Response.json({
      success: true,
      total: allReports.length,
      migrated,
      skipped,
      failed,
      message: `Migration complete. ${migrated} records encrypted, ${skipped} already encrypted, ${failed} failed.`,
    })
  } finally {
    await client.close()
  }
}
