import { auth } from '@clerk/nextjs/server'
import { MongoClient } from 'mongodb'

// Returns raw ciphertext from DB alongside decrypted values — proof that encryption is working.
// Admin only.

const ADMIN_IDS = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean)

function isAdmin(userId) {
  return ADMIN_IDS.includes(userId)
}

function looksEncrypted(value) {
  if (typeof value !== 'string') return false
  const parts = value.split(':')
  return parts.length === 3 && parts[0].length === 32 && parts[2].length === 32
}

function redact(value) {
  if (typeof value !== 'string') return value
  return value.slice(0, 12) + '…' + value.slice(-8) + ` (${value.length} chars)`
}

export async function GET() {
  const { userId } = await auth()
  if (!userId || !isAdmin(userId)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const client = new MongoClient(process.env.MONGO_URL, { serverSelectionTimeoutMS: 8000 })
  try {
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'medyra')

    // Get the 5 most recent reports, raw from DB
    const raw = await db.collection('reports')
      .find({}, { projection: { fileName: 1, extractedText: 1, explanation: 1, userId: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    const encryptionKeySet = !!(process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length === 64)

    const results = raw.map(doc => ({
      id: doc._id.toString(),
      createdAt: doc.createdAt,
      fields: {
        fileName: {
          encrypted: looksEncrypted(doc.fileName),
          raw: looksEncrypted(doc.fileName) ? redact(doc.fileName) : doc.fileName,
        },
        extractedText: {
          encrypted: looksEncrypted(doc.extractedText),
          raw: looksEncrypted(doc.extractedText) ? redact(doc.extractedText) : String(doc.extractedText || '').slice(0, 60) + '…',
        },
        explanation: {
          encrypted: looksEncrypted(doc.explanation),
          raw: looksEncrypted(doc.explanation) ? redact(doc.explanation) : String(doc.explanation || '').slice(0, 60) + '…',
        },
      },
    }))

    const allEncrypted = results.every(r =>
      r.fields.fileName.encrypted &&
      r.fields.extractedText.encrypted &&
      r.fields.explanation.encrypted
    )

    return Response.json({
      status: allEncrypted ? 'ENCRYPTED' : 'WARNING: some fields are NOT encrypted',
      encryptionKeyConfigured: encryptionKeySet,
      totalChecked: results.length,
      reports: results,
    })
  } finally {
    await client.close()
  }
}
