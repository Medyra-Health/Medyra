import { currentUser } from '@clerk/nextjs/server'
import { MongoClient } from 'mongodb'

const ADMIN_EMAILS = ['abralur28@gmail.com', 'philipp.mattar@googlemail.com']

function looksEncrypted(value) {
  if (typeof value !== 'string') return false
  const parts = value.split(':')
  return parts.length === 3 && parts[0].length === 32 && parts[2].length === 32
}

export async function GET() {
  const user = await currentUser()
  // M4: Use primary verified email for admin check
  const primaryId = user?.primaryEmailAddressId
  const primaryEmailObj = user?.emailAddresses?.find(
    e => e.id === primaryId && e.verification?.status === 'verified'
  )
  if (!primaryEmailObj || !ADMIN_EMAILS.includes(primaryEmailObj.emailAddress)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const client = new MongoClient(process.env.MONGO_URL, { serverSelectionTimeoutMS: 8000 })
  try {
    await client.connect()
    const db = client.db(process.env.DB_NAME || 'medyra')

    const raw = await db.collection('reports')
      .find({}, { projection: { fileName: 1, extractedText: 1, explanation: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    const encryptionKeySet = !!(process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length === 64)

    // M7: Return only encrypted status + field lengths — never raw plaintext content
    const results = raw.map(doc => ({
      id: doc._id.toString(),
      createdAt: doc.createdAt,
      fields: {
        fileName: {
          encrypted: looksEncrypted(doc.fileName),
          length: typeof doc.fileName === 'string' ? doc.fileName.length : 0,
        },
        extractedText: {
          encrypted: looksEncrypted(doc.extractedText),
          length: typeof doc.extractedText === 'string' ? doc.extractedText.length : 0,
        },
        explanation: {
          encrypted: looksEncrypted(doc.explanation),
          length: typeof doc.explanation === 'string' ? doc.explanation.length : 0,
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
