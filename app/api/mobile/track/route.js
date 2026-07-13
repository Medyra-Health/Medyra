import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { MongoClient } from 'mongodb'

const EVENT_TYPES = ['app_open', 'screen_view', 'error']

let _client = null
let _db = null
async function getDb() {
  if (_db) { try { await _db.admin().ping(); return _db } catch { _client = null; _db = null } }
  _client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 5, serverSelectionTimeoutMS: 5000 })
  await _client.connect()
  _db = _client.db(process.env.DB_NAME || 'medyra')
  return _db
}

// Lightweight, self-hosted mobile telemetry. Intentionally records no health
// data or user content — only app lifecycle/navigation/crash signals, per the
// mobile app's hard rule (no health data in logs/analytics).
export async function POST(request) {
  const body = await request.json().catch(() => null)
  if (!body?.eventType || !EVENT_TYPES.includes(body.eventType)) {
    return NextResponse.json({ error: 'Invalid eventType' }, { status: 400 })
  }

  const { userId } = await auth()

  const doc = {
    eventType: body.eventType,
    deviceId: typeof body.deviceId === 'string' ? body.deviceId.slice(0, 100) : null,
    platform: typeof body.platform === 'string' ? body.platform.slice(0, 20) : 'unknown',
    appVersion: typeof body.appVersion === 'string' ? body.appVersion.slice(0, 20) : 'unknown',
    screen: typeof body.screen === 'string' ? body.screen.slice(0, 200) : null,
    message: typeof body.message === 'string' ? body.message.slice(0, 300) : null,
    fatal: !!body.fatal,
    userId: userId || null,
    createdAt: new Date(),
  }

  try {
    const db = await getDb()
    await db.collection('mobileEvents').insertOne(doc)
  } catch {
    // Telemetry must never surface a hard error back to the app
  }

  return NextResponse.json({ success: true })
}
