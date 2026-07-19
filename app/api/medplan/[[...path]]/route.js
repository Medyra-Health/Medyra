import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { encrypt, decrypt, decryptProfile } from '@/lib/encryption'

// ============================================================================
// MEDIKATIONSPLAN API — free medication tracker (self), profile-based on paid
// tiers. Slots follow the German 1-0-1-0 scheme: morning/noon/evening/night.
// ============================================================================

const ADMIN_EMAILS = ['abralur28@gmail.com', 'philipp.mattar@googlemail.com']

// Who may attach meds to extra profiles (self = profileId null is free for all)
const PROFILE_TIERS = ['personal', 'family', 'clinic', 'admin']
const MAX_MEDS_PER_PROFILE = 20
const INTAKE_RETENTION_DAYS = 400

export const SLOTS = ['morning', 'noon', 'evening', 'night']
const DEFAULT_TIMES = { morning: '08:00', noon: '13:00', evening: '19:00', night: '22:00' }

let _client = null, _db = null
async function getDb() {
  if (_db) { try { await _db.admin().ping(); return _db } catch { _client = null; _db = null } }
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL not set')
  _client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })
  await _client.connect()
  _db = _client.db(process.env.DB_NAME || 'medyra')
  _db.collection('med_intakes').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true }).catch(() => {})
  return _db
}

const json = (body, status = 200) => NextResponse.json(body, { status })

async function getEffectiveTier(userId, db) {
  try {
    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress
    if (email && ADMIN_EMAILS.includes(email)) return 'admin'
  } catch {}
  const doc = await db.collection('users').findOne({ clerkId: userId })
  return doc?.subscription?.tier || 'free'
}

// A profileId of null means "myself" and is allowed on every tier. Any other
// profileId must belong to the user AND requires a paid tier.
async function resolveProfileAccess(userId, profileId, db) {
  if (!profileId) return { ok: true, profile: null }
  const tier = await getEffectiveTier(userId, db)
  if (!PROFILE_TIERS.includes(tier)) return { ok: false, error: 'profiles_paid_only', tier }
  const user = await db.collection('users').findOne({ clerkId: userId })
  const raw = (user?.profiles || []).find(p => p.id === profileId)
  if (!raw) return { ok: false, error: 'profile_not_found', tier }
  return { ok: true, profile: decryptProfile(raw), tier }
}

function decryptMed(m) {
  if (!m) return m
  return {
    id: m.id,
    profileId: m.profileId || null,
    name: m.name ? decrypt(m.name) : '',
    dose: m.dose ? decrypt(m.dose) : '',
    notes: m.notes ? decrypt(m.notes) : '',
    form: m.form || 'tablet',
    color: m.color || 'emerald',
    slots: m.slots || {},
    times: m.times || DEFAULT_TIMES,
    days: Array.isArray(m.days) ? m.days : [],
    active: m.active !== false,
    createdAt: m.createdAt,
  }
}

function todayKey(d = new Date()) {
  // Store dates in Europe/Berlin so "today" matches the user's day in Germany
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' })
  return fmt.format(d) // YYYY-MM-DD
}

function berlinWeekday(d = new Date()) {
  // 0 = Sunday … 6 = Saturday, evaluated in Berlin time
  const name = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Berlin', weekday: 'short' }).format(d)
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(name)
}

function validateMedBody(body) {
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
  if (!name) return { error: 'name_required' }
  const dose = typeof body.dose === 'string' ? body.dose.trim().slice(0, 80) : ''
  const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 300) : ''
  const form = ['tablet', 'capsule', 'drops', 'injection', 'spray', 'ointment', 'other'].includes(body.form) ? body.form : 'tablet'
  const color = ['emerald', 'sky', 'violet', 'amber', 'rose', 'indigo'].includes(body.color) ? body.color : 'emerald'
  const slots = {}
  for (const s of SLOTS) slots[s] = !!body.slots?.[s]
  if (!SLOTS.some(s => slots[s])) return { error: 'slot_required' }
  const times = {}
  for (const s of SLOTS) {
    const v = body.times?.[s]
    times[s] = typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : DEFAULT_TIMES[s]
  }
  const days = Array.isArray(body.days)
    ? [...new Set(body.days.filter(d => Number.isInteger(d) && d >= 0 && d <= 6))]
    : []
  return { name, dose, notes, form, color, slots, times, days }
}

// ============================================================================
// HANDLERS
// ============================================================================

async function handleGetPlan(request) {
  const { userId } = await auth()
  if (!userId) return json({ error: 'Unauthorized' }, 401)
  const db = await getDb()
  const url = new URL(request.url)
  const profileId = url.searchParams.get('profileId') || null

  const access = await resolveProfileAccess(userId, profileId, db)
  if (!access.ok) return json({ error: access.error, tier: access.tier }, 403)

  const tier = access.tier || await getEffectiveTier(userId, db)
  const [rawMeds, userDoc] = await Promise.all([
    db.collection('medications').find({ userId, profileId }).sort({ createdAt: 1 }).toArray(),
    db.collection('users').findOne({ clerkId: userId }),
  ])
  const medications = rawMeds.map(decryptMed)

  const today = todayKey()
  const medIds = medications.map(m => m.id)

  // Today's intakes + last 28 days for stats
  const since = new Date(Date.now() - 28 * 24 * 3600 * 1000)
  const sinceKey = todayKey(since)
  const intakes = medIds.length
    ? await db.collection('med_intakes')
        .find({ userId, medicationId: { $in: medIds }, date: { $gte: sinceKey } })
        .project({ _id: 0, medicationId: 1, date: 1, slot: 1, status: 1 })
        .toArray()
    : []

  const todayIntakes = intakes.filter(i => i.date === today)

  // Adherence per day: taken / due (due = active meds scheduled that weekday)
  const dayStats = {}
  for (let d = 0; d < 28; d++) {
    const dt = new Date(Date.now() - d * 24 * 3600 * 1000)
    const key = todayKey(dt)
    const wd = berlinWeekday(dt)
    let due = 0
    for (const m of medications) {
      if (!m.active) continue
      if (m.days.length && !m.days.includes(wd)) continue
      if (new Date(m.createdAt) > dt && key !== todayKey(new Date(m.createdAt))) {
        // med didn't exist yet that day
        if (todayKey(new Date(m.createdAt)) > key) continue
      }
      due += SLOTS.filter(s => m.slots[s]).length
    }
    const taken = intakes.filter(i => i.date === key && i.status === 'taken').length
    dayStats[key] = { due, taken }
  }

  // Streak: consecutive days (ending today or yesterday) where taken >= due > 0
  let streak = 0
  for (let d = 0; d < 28; d++) {
    const key = todayKey(new Date(Date.now() - d * 24 * 3600 * 1000))
    const s = dayStats[key]
    if (!s || s.due === 0) { if (d === 0) continue; else break }
    if (s.taken >= s.due) streak++
    else if (d === 0) continue // today not finished yet doesn't break the streak
    else break
  }

  const last7 = Object.entries(dayStats).slice(0, 7)
  const due7 = last7.reduce((a, [, s]) => a + s.due, 0)
  const taken7 = last7.reduce((a, [, s]) => a + s.taken, 0)

  return json({
    success: true,
    medications,
    todayIntakes,
    today,
    weekday: berlinWeekday(),
    stats: {
      streak,
      adherence7: due7 ? Math.min(100, Math.round((taken7 / due7) * 100)) : null,
      dayStats,
    },
    tier,
    profilesAllowed: PROFILE_TIERS.includes(tier),
    emailReminders: !!userDoc?.medplanEmail,
    maxMeds: MAX_MEDS_PER_PROFILE,
  })
}

async function handleCreateMed(request) {
  const { userId } = await auth()
  if (!userId) return json({ error: 'Unauthorized' }, 401)
  const body = await request.json()
  const db = await getDb()

  const profileId = body.profileId || null
  const access = await resolveProfileAccess(userId, profileId, db)
  if (!access.ok) return json({ error: access.error, tier: access.tier }, 403)

  const v = validateMedBody(body)
  if (v.error) return json({ error: v.error }, 400)

  const count = await db.collection('medications').countDocuments({ userId, profileId })
  if (count >= MAX_MEDS_PER_PROFILE) return json({ error: 'med_limit_reached', limit: MAX_MEDS_PER_PROFILE }, 429)

  const med = {
    id: uuidv4(),
    userId,
    profileId,
    name: encrypt(v.name),
    dose: v.dose ? encrypt(v.dose) : null,
    notes: v.notes ? encrypt(v.notes) : null,
    form: v.form,
    color: v.color,
    slots: v.slots,
    times: v.times,
    days: v.days,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  await db.collection('medications').insertOne(med)
  return json({ success: true, medication: decryptMed(med) })
}

async function handleUpdateMed(request, medId) {
  const { userId } = await auth()
  if (!userId) return json({ error: 'Unauthorized' }, 401)
  const body = await request.json()
  const db = await getDb()

  // Pause/resume without full payload
  if (typeof body.active === 'boolean' && !body.name) {
    const res = await db.collection('medications').updateOne(
      { id: medId, userId },
      { $set: { active: body.active, updatedAt: new Date() } }
    )
    if (!res.matchedCount) return json({ error: 'not_found' }, 404)
    return json({ success: true })
  }

  const v = validateMedBody(body)
  if (v.error) return json({ error: v.error }, 400)
  const res = await db.collection('medications').updateOne(
    { id: medId, userId },
    {
      $set: {
        name: encrypt(v.name),
        dose: v.dose ? encrypt(v.dose) : null,
        notes: v.notes ? encrypt(v.notes) : null,
        form: v.form, color: v.color, slots: v.slots, times: v.times, days: v.days,
        updatedAt: new Date(),
      },
    }
  )
  if (!res.matchedCount) return json({ error: 'not_found' }, 404)
  return json({ success: true })
}

async function handleDeleteMed(medId) {
  const { userId } = await auth()
  if (!userId) return json({ error: 'Unauthorized' }, 401)
  const db = await getDb()
  await Promise.all([
    db.collection('medications').deleteOne({ id: medId, userId }),
    db.collection('med_intakes').deleteMany({ medicationId: medId, userId }),
  ])
  return json({ success: true })
}

// Toggle an intake: taken -> skipped -> cleared -> taken …, or set explicitly.
async function handleIntake(request) {
  const { userId } = await auth()
  if (!userId) return json({ error: 'Unauthorized' }, 401)
  const { medicationId, slot, status, date } = await request.json()
  if (!medicationId || !SLOTS.includes(slot)) return json({ error: 'invalid' }, 400)
  const db = await getDb()

  const med = await db.collection('medications').findOne({ id: medicationId, userId })
  if (!med) return json({ error: 'not_found' }, 404)

  const dateKey = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayKey()
  const filter = { userId, medicationId, date: dateKey, slot }

  if (status === null || status === 'clear') {
    await db.collection('med_intakes').deleteOne(filter)
    return json({ success: true, status: null })
  }
  const newStatus = status === 'skipped' ? 'skipped' : 'taken'
  await db.collection('med_intakes').updateOne(
    filter,
    {
      $set: {
        status: newStatus,
        at: new Date(),
        profileId: med.profileId || null,
        expiresAt: new Date(Date.now() + INTAKE_RETENTION_DAYS * 24 * 3600 * 1000),
      },
      $setOnInsert: { id: uuidv4() },
    },
    { upsert: true }
  )
  return json({ success: true, status: newStatus })
}

// ============================================================================
// ICS EXPORT — recurring calendar events with alarms = real phone reminders
// without any push infrastructure. Import once, the phone rings at dose time.
// ============================================================================

const ICS_DAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

function icsEscape(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

async function handleIcs(request) {
  const { userId } = await auth()
  if (!userId) return json({ error: 'Unauthorized' }, 401)
  const db = await getDb()
  const url = new URL(request.url)
  const profileId = url.searchParams.get('profileId') || null
  const access = await resolveProfileAccess(userId, profileId, db)
  if (!access.ok) return json({ error: access.error }, 403)

  const meds = (await db.collection('medications').find({ userId, profileId, active: { $ne: false } }).toArray()).map(decryptMed)
  if (!meds.length) return json({ error: 'no_medications' }, 404)

  const now = new Date()
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const startDate = todayKey().replace(/-/g, '')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Medyra//Medikationsplan//DE',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Medyra Medikationsplan',
    'X-WR-TIMEZONE:Europe/Berlin',
  ]

  for (const med of meds) {
    for (const slot of SLOTS) {
      if (!med.slots[slot]) continue
      const time = (med.times[slot] || DEFAULT_TIMES[slot]).replace(':', '') + '00'
      const byday = med.days.length ? `;BYDAY=${med.days.map(d => ICS_DAY[d]).join(',')}` : ''
      const summary = `💊 ${med.name}${med.dose ? ` (${med.dose})` : ''}`
      lines.push(
        'BEGIN:VEVENT',
        `UID:medyra-${med.id}-${slot}@medyra.de`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=Europe/Berlin:${startDate}T${time}`,
        `RRULE:FREQ=${med.days.length ? 'WEEKLY' : 'DAILY'}${byday}`,
        `SUMMARY:${icsEscape(summary)}`,
        `DESCRIPTION:${icsEscape('Medyra Medikationsplan — medyra.de/medplan')}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${icsEscape(summary)}`,
        'TRIGGER:PT0M',
        'END:VALARM',
        'END:VEVENT',
      )
    }
  }
  lines.push('END:VCALENDAR')

  return new NextResponse(lines.join('\r\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="medyra-medikationsplan.ics"',
    },
  })
}

// ============================================================================
// EMAIL SETTINGS + DAILY DIGEST CRON
// ============================================================================

async function handleSettings(request) {
  const { userId } = await auth()
  if (!userId) return json({ error: 'Unauthorized' }, 401)
  const body = await request.json()
  const db = await getDb()
  await db.collection('users').updateOne(
    { clerkId: userId },
    { $set: { medplanEmail: !!body.emailReminders, updatedAt: new Date() } },
    { upsert: true }
  )
  return json({ success: true, emailReminders: !!body.emailReminders })
}

function digestHtml(meds, locale) {
  const de = locale !== 'en'
  const slotNames = de
    ? { morning: 'Morgens', noon: 'Mittags', evening: 'Abends', night: 'Nachts' }
    : { morning: 'Morning', noon: 'Noon', evening: 'Evening', night: 'Night' }
  const rows = SLOTS.map(slot => {
    const list = meds.filter(m => m.slots[slot])
    if (!list.length) return ''
    return `<tr><td style="padding:8px 12px;font-weight:bold;color:#065f46;white-space:nowrap;vertical-align:top;">${slotNames[slot]}<br><span style="font-weight:normal;color:#9ca3af;font-size:11px;">${(list[0].times || {})[slot] || ''}</span></td>
      <td style="padding:8px 12px;color:#374151;">${list.map(m => `💊 <b>${m.name}</b>${m.dose ? ` — ${m.dose}` : ''}`).join('<br>')}</td></tr>`
  }).join('')
  const title = de ? 'Ihr Medikationsplan für heute' : 'Your medication plan for today'
  const cta = de ? 'Plan öffnen & abhaken' : 'Open plan & check off'
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F3FAF6;font-family:Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="background:#040C08;border-radius:16px 16px 0 0;padding:24px 28px;"><span style="color:#10B981;font-size:20px;font-weight:800;">Medyra</span></div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px;border:1px solid #E5E7EB;border-top:none;">
      <h1 style="font-size:19px;color:#0B1F17;margin:0 0 16px;">${title}</h1>
      <table style="border-collapse:collapse;width:100%;background:#F9FAFB;border-radius:12px;">${rows}</table>
      <a href="https://medyra.de/medplan" style="display:inline-block;background:#10B981;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:12px;margin-top:20px;">${cta}</a>
      <p style="font-size:11px;color:#9CA3AF;margin:24px 0 0;">${de ? 'Keine medizinische Beratung. Abbestellen: medyra.de/medplan → Einstellungen.' : 'Not medical advice. Unsubscribe: medyra.de/medplan → settings.'}</p>
    </div>
  </div></body></html>`
}

// Daily digest (Vercel Cron, CRON_SECRET protected): one morning email listing
// today's medications for every opted-in user.
async function handleDigestCron(request) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (!secret || authHeader !== `Bearer ${secret}`) return json({ error: 'Unauthorized' }, 401)

  const key = process.env.RESEND_API_KEY
  if (!key) return json({ error: 'RESEND_API_KEY not configured' }, 500)

  const db = await getDb()
  const users = await db.collection('users')
    .find({ medplanEmail: true, email: { $exists: true, $ne: null } })
    .project({ clerkId: 1, email: 1 })
    .limit(500)
    .toArray()

  const wd = berlinWeekday()
  let sent = 0, skipped = 0
  for (const u of users) {
    try {
      const meds = (await db.collection('medications')
        .find({ userId: u.clerkId, profileId: null, active: { $ne: false } })
        .toArray())
        .map(decryptMed)
        .filter(m => !m.days.length || m.days.includes(wd))
      if (!meds.length) { skipped++; continue }
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Medyra <hello@medyra.de>',
          to: u.email,
          subject: '💊 Medyra: Ihr Medikationsplan für heute',
          html: digestHtml(meds, 'de'),
        }),
      })
      if (res.ok) sent++
    } catch (err) {
      console.error('[medplan digest] failed for user', err.message)
    }
  }
  return json({ success: true, users: users.length, sent, skipped })
}

// ============================================================================
// ROUTER
// ============================================================================

async function handleRoute(request) {
  const url = new URL(request.url)
  const route = url.pathname.replace(/^\/api\/medplan/, '') || '/'
  const method = request.method

  try {
    if ((route === '/' || route === '') && method === 'GET') return handleGetPlan(request)
    if (route === '/medications' && method === 'POST') return handleCreateMed(request)
    const medMatch = route.match(/^\/medications\/([^/]+)$/)
    if (medMatch && method === 'PATCH') return handleUpdateMed(request, medMatch[1])
    if (medMatch && method === 'DELETE') return handleDeleteMed(medMatch[1])
    if (route === '/intakes' && method === 'POST') return handleIntake(request)
    if (route === '/ics' && method === 'GET') return handleIcs(request)
    if (route === '/settings' && method === 'POST') return handleSettings(request)
    if (route === '/cron' && method === 'GET') return handleDigestCron(request)
    return json({ error: 'Route not found' }, 404)
  } catch (error) {
    console.error('❌ Medplan API error:', error)
    return json({ error: 'Internal server error' }, 500)
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PATCH = handleRoute
export const DELETE = handleRoute
