import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { MongoClient } from 'mongodb'

const ADMIN_EMAILS = ['abralur28@gmail.com', 'philipp.mattar@googlemail.com']

let _client = null
let _db = null
async function getDb() {
  if (_db) { try { await _db.admin().ping(); return _db } catch { _client = null; _db = null } }
  _client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 5, serverSelectionTimeoutMS: 5000 })
  await _client.connect()
  _db = _client.db(process.env.DB_NAME || 'medyra')
  return _db
}

export async function GET() {
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress
  if (!user || !ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const db = await getDb()
  const events = db.collection('mobileEvents')

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    opensToday,
    opensThisWeek,
    opensTotal,
    uniqueDevices30d,
    platformBreakdown,
    topScreens,
    recentErrors,
    errorCount7d,
  ] = await Promise.all([
    events.countDocuments({ eventType: 'app_open', createdAt: { $gte: startOfToday } }),
    events.countDocuments({ eventType: 'app_open', createdAt: { $gte: sevenDaysAgo } }),
    events.countDocuments({ eventType: 'app_open' }),
    events.distinct('deviceId', { createdAt: { $gte: thirtyDaysAgo }, deviceId: { $ne: null } }),
    events.aggregate([
      { $match: { eventType: 'app_open', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$platform', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    events.aggregate([
      { $match: { eventType: 'screen_view', createdAt: { $gte: thirtyDaysAgo }, screen: { $ne: null } } },
      { $group: { _id: '$screen', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]).toArray(),
    events.find({ eventType: 'error' }, { projection: { message: 1, fatal: 1, platform: 1, appVersion: 1, createdAt: 1 } })
      .sort({ createdAt: -1 }).limit(10).toArray(),
    events.countDocuments({ eventType: 'error', createdAt: { $gte: sevenDaysAgo } }),
  ])

  return NextResponse.json({
    opensToday,
    opensThisWeek,
    opensTotal,
    uniqueDevices30d: uniqueDevices30d.length,
    platformBreakdown: platformBreakdown.map(p => ({ platform: p._id || 'unknown', count: p.count })),
    topScreens: topScreens.map(s => ({ screen: s._id, count: s.count })),
    recentErrors: recentErrors.map(e => ({
      message: e.message,
      fatal: e.fatal,
      platform: e.platform,
      appVersion: e.appVersion,
      createdAt: e.createdAt,
    })),
    errorCount7d,
  })
}
