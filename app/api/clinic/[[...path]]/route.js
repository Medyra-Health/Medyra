import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import pdfParse from 'pdf-parse'
import { encrypt, decrypt } from '@/lib/encryption'
import { generateText, generateVisionText } from '@/lib/aiClient'
import { ANAMNESE_QUESTIONS, questionTextEn, CLINIC_LANGUAGES } from '@/lib/clinicI18n'

// ============================================================================
// CLINIC PACKAGE API — admin-only Praxis workspace (Patientenbrief, Anamnese).
// Public token endpoints (/public/*) serve patients of the Praxis and are the
// only unauthenticated routes here.
// ============================================================================

const ADMIN_EMAILS = ['abralur28@gmail.com', 'philipp.mattar@googlemail.com']

const PRACTICE_ID = 'default' // single-practice mode while admin-only
const BRIEF_TTL_DAYS = 90
const ANAMNESE_TTL_DAYS = 30
const MAX_FILE_SIZE = 10 * 1024 * 1024

let mongoClient = null
let db = null
let isConnecting = false

async function connectToMongo() {
  if (db && mongoClient) {
    try {
      await db.admin().ping()
      return db
    } catch {
      mongoClient = null
      db = null
    }
  }
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 100))
    return connectToMongo()
  }
  try {
    isConnecting = true
    if (!process.env.MONGO_URL) throw new Error('MONGO_URL not set')
    mongoClient = new MongoClient(process.env.MONGO_URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    })
    await mongoClient.connect()
    db = mongoClient.db(process.env.DB_NAME || 'medyra')
    return db
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`)
  } finally {
    isConnecting = false
  }
}

// Server-side admin gate. Returns the admin's email, or null.
async function requireAdmin() {
  try {
    const user = await currentUser()
    const email = user?.emailAddresses?.find(
      e => e.emailAddress && ADMIN_EMAILS.includes(e.emailAddress)
    )?.emailAddress
    return email || null
  } catch {
    return null
  }
}

const json = (body, status = 200) => NextResponse.json(body, { status })
const forbidden = () => json({ error: 'Forbidden' }, 403)

// ============================================================================
// ENCRYPTION HELPERS (per collection)
// ============================================================================

function decryptPatient(p) {
  if (!p) return p
  return {
    id: p.id,
    name: p.name ? decrypt(p.name) : '',
    language: p.language || 'de',
    dob: p.dob ? decrypt(p.dob) : null,
    note: p.note ? decrypt(p.note) : null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

function decryptLetterMeta(l) {
  if (!l) return l
  return {
    id: l.id,
    patientId: l.patientId,
    patientName: l.patientName ? decrypt(l.patientName) : '',
    docType: l.docType,
    language: l.language,
    fileName: l.fileName ? decrypt(l.fileName) : '',
    shareToken: l.shareToken,
    views: l.views || 0,
    createdAt: l.createdAt,
    expiresAt: l.expiresAt,
  }
}

function decryptLetterFull(l) {
  const meta = decryptLetterMeta(l)
  let letter = null
  try { letter = JSON.parse(decrypt(l.letter)) } catch { letter = null }
  return { ...meta, letter }
}

function decryptAnamnesis(a, { includeAnswers = false } = {}) {
  if (!a) return a
  let answers = null
  if (includeAnswers && a.answers) {
    try { answers = JSON.parse(decrypt(a.answers)) } catch { answers = null }
  }
  return {
    id: a.id,
    token: a.token,
    patientId: a.patientId || null,
    patientName: a.patientName ? decrypt(a.patientName) : null,
    language: a.language,
    status: a.status,
    summary: a.summary ? decrypt(a.summary) : null,
    ...(includeAnswers ? { answers } : {}),
    createdAt: a.createdAt,
    completedAt: a.completedAt || null,
    expiresAt: a.expiresAt,
  }
}

// ============================================================================
// AI PROMPTS
// ============================================================================

const LANGUAGE_NAMES = {
  en: 'English', de: 'German', tr: 'Turkish', ar: 'Arabic', fr: 'French',
  es: 'Spanish', it: 'Italian', pt: 'Portuguese', nl: 'Dutch', pl: 'Polish',
  ru: 'Russian', zh: 'Simplified Chinese', ja: 'Japanese', ko: 'Korean',
  hi: 'Hindi', ur: 'Urdu', bn: 'Bengali',
}

const LETTER_DOC_HINTS = {
  lab: 'The document is a lab report (Laborbefund). Fill the "values" array with every measured value.',
  letter: 'The document is a doctor letter or specialist findings (Arztbrief / Befund). Translate every medical term into plain language in the sections.',
  discharge: 'The document is a hospital discharge summary (Entlassungsbericht). Explain what happened in hospital, the diagnoses in plain words, the medication changes, and what the patient must do now.',
  medication: 'The document is a medication plan or prescription (Medikationsplan / Rezept). Create one section per medication: what it is for, how to take it, important notes.',
}

function buildLetterPrompt({ languageName, docType, patientName, practiceName, doctorName }) {
  return `You are writing a "Patientenbrief" on behalf of a German medical practice${practiceName ? ` ("${practiceName}"${doctorName ? `, ${doctorName}` : ''})` : ''}: a warm, plain-language letter that explains a medical document to the patient so they truly understand it.

${LETTER_DOC_HINTS[docType] || 'First identify what kind of medical document this is, then explain it.'}

CRITICAL RULES:
- Write EVERYTHING in ${languageName}. If ${languageName} is German, address the patient with the polite "Sie" form.
- Address the patient${patientName ? ` by name ("${patientName}")` : ''} in the greeting.
- Calm, warm, reassuring tone. Never alarming, never dramatic.
- Plain language a 14-year-old would understand. Explain every medical term the document uses.
- NEVER diagnose, NEVER recommend medication changes, NEVER contradict the treating doctor.
- If something in the document needs discussion, phrase it as "please discuss this with your doctor".
- Keep original German terms recognizable in parentheses where useful, e.g. "red blood pigment (Hämoglobin)".

Respond with VALID JSON only (no markdown, no code fences):
{
  "title": "Short letter title, e.g. 'Your lab results explained' in ${languageName}",
  "greeting": "Greeting line with the patient's name",
  "intro": "1-2 sentences saying what document this letter explains and why the practice is sending it",
  "summary": "2-4 sentences with the core message in plain language — the single most important takeaway first",
  "sections": [ { "title": "Plain-language heading", "content": "Explanation paragraph" } ],
  "values": [ { "name": "Test name", "value": "result with unit", "normalRange": "normal range with unit", "flag": "normal|high|low|critical", "meaning": "one plain sentence what this value means for the patient" } ],
  "nextSteps": ["2-4 concrete, calm next steps"],
  "questionsForDoctor": ["2-3 sensible questions the patient could ask at the next visit"],
  "closing": "Warm closing sentence wishing the patient well, signed with the practice name if provided",
  "disclaimer": "One sentence: this letter helps you understand your document and does not replace the conversation with your doctor."
}

"values" is ONLY for measured values (lab results, vitals) — return [] if the document has none.
Return ONLY the JSON object.`
}

const ANAMNESE_SUMMARY_PROMPT = `Du bist ein medizinischer Dokumentationsassistent einer deutschen Arztpraxis. Ein Patient hat vor seinem Termin einen digitalen Anamnese-Fragebogen ausgefüllt — möglicherweise in einer Fremdsprache. Erstelle daraus eine strukturierte Zusammenfassung AUF DEUTSCH für die Ärztin/den Arzt.

REGELN:
- Ausschließlich Deutsch, knapp und klinisch-sachlich (Stichpunkte, keine Prosa).
- KEINE Diagnosen, KEINE Therapieempfehlungen — nur strukturierte Wiedergabe der Patientenangaben.
- Übersetze die Angaben des Patienten präzise; erfinde nichts hinzu. Fehlende Angaben als "Keine Angabe" kennzeichnen.
- Wenn der Patient etwas potenziell Dringliches beschreibt (z. B. Brustschmerz, Atemnot, neurologische Ausfälle), liste es unter "Auffällige Angaben" — neutral formuliert, ohne Alarmierung.

FORMAT (Markdown):
**Anamnese-Zusammenfassung** (digital erhoben, Originalsprache: {LANG})

**Hauptbeschwerden**
- …

**Beginn & Verlauf**
- …

**Schweregrad / Alltagsbeeinträchtigung**
- …

**Begleitsymptome**
- …

**Aktuelle Medikation**
- …

**Allergien**
- …

**Vorerkrankungen / Operationen**
- …

**Fragen des Patienten**
- …

**Auffällige Angaben**
- … (nur falls vorhanden, sonst Abschnitt weglassen)

_Hinweis: Vom Patienten selbst berichtete Angaben, automatisch übersetzt und strukturiert. Ersetzt keine ärztliche Anamnese._`

// ============================================================================
// TEXT EXTRACTION (same formats as the consumer analyzer)
// ============================================================================

async function extractText(file) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileType = file.type || ''
  if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
    const data = await pdfParse(buffer)
    const text = data.text.trim()
    if (!text || text.length < 10) throw new Error('PDF has no readable text')
    return text
  }
  if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
    const validMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(fileType)
      ? fileType : 'image/jpeg'
    const text = await generateVisionText({
      imageBuffer: buffer,
      mimeType: validMime,
      prompt: 'Extract all text from this medical document image. Return only the raw extracted text, no commentary.',
    })
    if (!text || text.length < 10) throw new Error('No readable text found in image')
    return text
  }
  if (fileType === 'text/plain' || file.name.endsWith('.txt')) {
    return buffer.toString('utf-8').trim()
  }
  throw new Error('Unsupported file. Please upload PDF, JPG, PNG, or TXT.')
}

function parseModelJson(text) {
  let t = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim()
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start !== -1 && end > start) t = t.substring(start, end + 1)
  return JSON.parse(t)
}

// ============================================================================
// ADMIN HANDLERS
// ============================================================================

async function getPracticeSettings(database) {
  const doc = await database.collection('clinic_settings').findOne({ practiceId: PRACTICE_ID })
  return {
    name: doc?.name || '',
    doctorName: doc?.doctorName || '',
    street: doc?.street || '',
    city: doc?.city || '',
    phone: doc?.phone || '',
  }
}

async function handleGetSettings() {
  const database = await connectToMongo()
  return json({ success: true, settings: await getPracticeSettings(database) })
}

async function handleSaveSettings(request) {
  const body = await request.json()
  const clean = s => (typeof s === 'string' ? s.slice(0, 200).trim() : '')
  const database = await connectToMongo()
  const settings = {
    name: clean(body.name),
    doctorName: clean(body.doctorName),
    street: clean(body.street),
    city: clean(body.city),
    phone: clean(body.phone),
  }
  await database.collection('clinic_settings').updateOne(
    { practiceId: PRACTICE_ID },
    { $set: { ...settings, updatedAt: new Date() } },
    { upsert: true }
  )
  return json({ success: true, settings })
}

async function handleOverview() {
  const database = await connectToMongo()
  const [patients, letters, anamnesis] = await Promise.all([
    database.collection('clinic_patients').find({}).toArray(),
    database.collection('clinic_letters').find({}, { projection: { extractedText: 0, letter: 0 } })
      .sort({ createdAt: -1 }).limit(200).toArray(),
    database.collection('clinic_anamnesis').find({}, { projection: { answers: 0, summary: 0 } })
      .sort({ createdAt: -1 }).limit(200).toArray(),
  ])

  const languages = {}
  for (const p of patients) {
    const lang = p.language || 'de'
    languages[lang] = (languages[lang] || 0) + 1
  }

  const activity = [
    ...letters.slice(0, 10).map(l => ({
      type: 'letter',
      id: l.id,
      patientName: l.patientName ? decrypt(l.patientName) : '',
      language: l.language,
      docType: l.docType,
      date: l.createdAt,
    })),
    ...anamnesis.slice(0, 10).map(a => ({
      type: a.status === 'completed' ? 'anamnese_done' : 'anamnese_sent',
      id: a.id,
      patientName: a.patientName ? decrypt(a.patientName) : null,
      language: a.language,
      date: a.completedAt || a.createdAt,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)

  const totalViews = letters.reduce((sum, l) => sum + (l.views || 0), 0)

  return json({
    success: true,
    stats: {
      patients: patients.length,
      letters: letters.length,
      letterViews: totalViews,
      anamnesisPending: anamnesis.filter(a => a.status === 'pending').length,
      anamnesisCompleted: anamnesis.filter(a => a.status === 'completed').length,
      languages,
    },
    activity,
  })
}

// --- Patients -----------------------------------------------------------

async function handleListPatients() {
  const database = await connectToMongo()
  const raw = await database.collection('clinic_patients').find({}).sort({ createdAt: -1 }).limit(500).toArray()
  return json({ success: true, patients: raw.map(decryptPatient) })
}

function validatePatientBody(body) {
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
  if (!name) return { error: 'Name required' }
  const language = CLINIC_LANGUAGES[body.language] ? body.language : 'de'
  const dob = typeof body.dob === 'string' ? body.dob.trim().slice(0, 20) : ''
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : ''
  return { name, language, dob, note }
}

async function handleCreatePatient(request) {
  const body = await request.json()
  const v = validatePatientBody(body)
  if (v.error) return json({ error: v.error }, 400)
  const database = await connectToMongo()
  const patient = {
    id: uuidv4(),
    name: encrypt(v.name),
    language: v.language,
    ...(v.dob ? { dob: encrypt(v.dob) } : {}),
    ...(v.note ? { note: encrypt(v.note) } : {}),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  await database.collection('clinic_patients').insertOne(patient)
  return json({ success: true, patient: decryptPatient(patient) })
}

async function handleUpdatePatient(request, patientId) {
  const body = await request.json()
  const v = validatePatientBody(body)
  if (v.error) return json({ error: v.error }, 400)
  const database = await connectToMongo()
  const update = {
    name: encrypt(v.name),
    language: v.language,
    updatedAt: new Date(),
  }
  const unset = {}
  if (v.dob) update.dob = encrypt(v.dob); else unset.dob = ''
  if (v.note) update.note = encrypt(v.note); else unset.note = ''
  const res = await database.collection('clinic_patients').updateOne(
    { id: patientId },
    { $set: update, ...(Object.keys(unset).length ? { $unset: unset } : {}) }
  )
  if (!res.matchedCount) return json({ error: 'Patient not found' }, 404)
  return json({ success: true })
}

// GDPR cascade: removing a patient removes their letters and questionnaires too.
async function handleDeletePatient(patientId) {
  const database = await connectToMongo()
  await Promise.all([
    database.collection('clinic_patients').deleteOne({ id: patientId }),
    database.collection('clinic_letters').deleteMany({ patientId }),
    database.collection('clinic_anamnesis').deleteMany({ patientId }),
  ])
  return json({ success: true })
}

// --- Patientenbrief -----------------------------------------------------

async function handleCreateLetter(request) {
  const database = await connectToMongo()
  const formData = await request.formData()

  const file = formData.get('file')
  if (!file) return json({ error: 'No file uploaded' }, 400)
  if (file.size > MAX_FILE_SIZE) return json({ error: 'File too large. Maximum size is 10MB.' }, 400)

  const patientId = String(formData.get('patientId') || '')
  const rawPatient = patientId
    ? await database.collection('clinic_patients').findOne({ id: patientId })
    : null
  if (patientId && !rawPatient) return json({ error: 'Patient not found' }, 404)
  const patient = rawPatient ? decryptPatient(rawPatient) : null

  const docType = ['lab', 'letter', 'discharge', 'medication'].includes(formData.get('docType'))
    ? String(formData.get('docType')) : 'letter'
  // Letter language: explicit override > patient's language > German
  const langParam = String(formData.get('language') || '')
  const language = CLINIC_LANGUAGES[langParam] ? langParam : (patient?.language || 'de')

  let extractedText
  try {
    extractedText = await extractText(file)
  } catch (err) {
    return json({ error: err.message }, 400)
  }
  if (!extractedText || extractedText.length < 20) {
    return json({ error: 'Could not extract text from file' }, 400)
  }

  const practice = await getPracticeSettings(database)
  const system = buildLetterPrompt({
    languageName: LANGUAGE_NAMES[language] || 'English',
    docType,
    patientName: patient?.name || null,
    practiceName: practice.name || null,
    doctorName: practice.doctorName || null,
  })

  let letter
  try {
    const text = await generateText({
      task: 'big',
      system,
      messages: [{
        role: 'user',
        content: `Create the Patientenbrief JSON for this document:\n\n${extractedText.substring(0, 10000)}`,
      }],
      maxTokens: 4096,
      temperature: 0.3,
    })
    letter = parseModelJson(text)
  } catch (err) {
    console.error('[Clinic letter] AI generation failed:', err.message)
    return json({ error: 'AI generation failed. Please try again.' }, 500)
  }

  if (!Array.isArray(letter.sections)) letter.sections = []
  if (!Array.isArray(letter.values)) letter.values = []
  if (!Array.isArray(letter.nextSteps)) letter.nextSteps = []
  if (!Array.isArray(letter.questionsForDoctor)) letter.questionsForDoctor = []

  const id = uuidv4()
  const shareToken = uuidv4().replace(/-/g, '')
  const createdAt = new Date()
  const doc = {
    id,
    patientId: patient?.id || null,
    patientName: patient ? encrypt(patient.name) : null,
    docType,
    language,
    fileName: encrypt(file.name),
    extractedText: encrypt(extractedText.substring(0, 50000)),
    letter: encrypt(JSON.stringify(letter)),
    shareToken,
    views: 0,
    createdAt,
    expiresAt: new Date(Date.now() + BRIEF_TTL_DAYS * 24 * 60 * 60 * 1000),
  }
  await database.collection('clinic_letters').insertOne(doc)

  return json({ success: true, letter: decryptLetterFull(doc) })
}

async function handleListLetters(request) {
  const url = new URL(request.url)
  const patientId = url.searchParams.get('patientId')
  const query = patientId ? { patientId } : {}
  const database = await connectToMongo()
  const raw = await database.collection('clinic_letters')
    .find(query, { projection: { extractedText: 0, letter: 0 } })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray()
  return json({ success: true, letters: raw.map(decryptLetterMeta) })
}

async function handleGetLetter(letterId) {
  const database = await connectToMongo()
  const raw = await database.collection('clinic_letters').findOne({ id: letterId })
  if (!raw) return json({ error: 'Letter not found' }, 404)
  return json({ success: true, letter: decryptLetterFull(raw) })
}

async function handleDeleteLetter(letterId) {
  const database = await connectToMongo()
  await database.collection('clinic_letters').deleteOne({ id: letterId })
  return json({ success: true })
}

// --- Anamnese -----------------------------------------------------------

async function handleCreateAnamnesis(request) {
  const body = await request.json()
  const database = await connectToMongo()

  const patientId = typeof body.patientId === 'string' && body.patientId ? body.patientId : null
  let patient = null
  if (patientId) {
    const raw = await database.collection('clinic_patients').findOne({ id: patientId })
    if (!raw) return json({ error: 'Patient not found' }, 404)
    patient = decryptPatient(raw)
  }
  const language = CLINIC_LANGUAGES[body.language] ? body.language : (patient?.language || 'de')

  const doc = {
    id: uuidv4(),
    token: uuidv4().replace(/-/g, ''),
    patientId,
    patientName: patient ? encrypt(patient.name) : null,
    language,
    status: 'pending',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + ANAMNESE_TTL_DAYS * 24 * 60 * 60 * 1000),
  }
  await database.collection('clinic_anamnesis').insertOne(doc)
  return json({ success: true, anamnesis: decryptAnamnesis(doc) })
}

async function handleListAnamnesis() {
  const database = await connectToMongo()
  const raw = await database.collection('clinic_anamnesis')
    .find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray()
  return json({ success: true, anamnesis: raw.map(a => decryptAnamnesis(a, { includeAnswers: true })) })
}

async function handleDeleteAnamnesis(anamnesisId) {
  const database = await connectToMongo()
  await database.collection('clinic_anamnesis').deleteOne({ id: anamnesisId })
  return json({ success: true })
}

// ============================================================================
// PUBLIC HANDLERS (patient-facing, token-based, no auth)
// ============================================================================

function validToken(token) {
  return /^[a-f0-9]{32}$/.test(token)
}

// Read-only Patientenbrief. Exposes the letter content + practice letterhead,
// never the source document, file name, or internal ids.
async function handlePublicBrief(token) {
  if (!validToken(token)) return json({ error: 'invalid' }, 400)
  const database = await connectToMongo()
  const raw = await database.collection('clinic_letters').findOne({ shareToken: token })
  if (!raw || (raw.expiresAt && raw.expiresAt < new Date())) {
    return json({ error: 'invalid' }, 404)
  }
  let letter = null
  try { letter = JSON.parse(decrypt(raw.letter)) } catch {}
  if (!letter) return json({ error: 'invalid' }, 404)

  await database.collection('clinic_letters').updateOne({ shareToken: token }, { $inc: { views: 1 } })
  const practice = await getPracticeSettings(database)

  return json({
    success: true,
    brief: {
      letter,
      language: raw.language,
      docType: raw.docType,
      createdAt: raw.createdAt,
      expiresAt: raw.expiresAt,
      practice,
    },
  })
}

async function handlePublicAnamnesisStatus(token) {
  if (!validToken(token)) return json({ error: 'invalid' }, 400)
  const database = await connectToMongo()
  const raw = await database.collection('clinic_anamnesis').findOne(
    { token },
    { projection: { status: 1, language: 1, expiresAt: 1 } }
  )
  if (!raw || (raw.expiresAt && raw.expiresAt < new Date())) return json({ error: 'invalid' }, 404)
  const practice = await getPracticeSettings(database)
  return json({
    success: true,
    status: raw.status,
    language: raw.language,
    practiceName: practice.name || null,
  })
}

async function handlePublicAnamnesisSubmit(request, token) {
  if (!validToken(token)) return json({ error: 'invalid' }, 400)
  const database = await connectToMongo()
  const raw = await database.collection('clinic_anamnesis').findOne({ token })
  if (!raw || (raw.expiresAt && raw.expiresAt < new Date())) return json({ error: 'invalid' }, 404)
  if (raw.status !== 'pending') return json({ error: 'already_completed' }, 409)

  const body = await request.json()
  const incoming = body?.answers || {}
  const answers = {}
  let filled = 0
  for (const q of ANAMNESE_QUESTIONS) {
    const val = typeof incoming[q.id] === 'string' ? incoming[q.id].trim().slice(0, 2000) : ''
    answers[q.id] = val
    if (val) filled++
    if (q.required && !val) return json({ error: 'missing_required' }, 400)
  }
  if (filled === 0) return json({ error: 'missing_required' }, 400)

  const langName = LANGUAGE_NAMES[raw.language] || 'English'
  const qaBlock = ANAMNESE_QUESTIONS
    .map(q => `Q (${q.id}): ${questionTextEn(q.id)}\nA: ${answers[q.id] || '(no answer)'}`)
    .join('\n\n')

  let summary
  try {
    summary = await generateText({
      task: 'big',
      system: ANAMNESE_SUMMARY_PROMPT.replace('{LANG}', langName),
      messages: [{
        role: 'user',
        content: `Patientensprache: ${langName}\n\nFragebogen-Antworten:\n\n${qaBlock}\n\nErstelle jetzt die deutsche Anamnese-Zusammenfassung.`,
      }],
      maxTokens: 1800,
      temperature: 0.2,
    })
  } catch (err) {
    console.error('[Clinic anamnesis] AI summary failed:', err.message)
    return json({ error: 'processing_failed' }, 500)
  }

  await database.collection('clinic_anamnesis').updateOne(
    { token },
    {
      $set: {
        status: 'completed',
        answers: encrypt(JSON.stringify(answers)),
        summary: encrypt(summary),
        completedAt: new Date(),
      },
    }
  )
  return json({ success: true })
}

// ============================================================================
// ROUTER
// ============================================================================

async function handleRoute(request) {
  const url = new URL(request.url)
  const route = url.pathname.replace(/^\/api\/clinic/, '') || '/'
  const method = request.method

  try {
    // ---- PUBLIC (no auth) ----
    const briefMatch = route.match(/^\/public\/brief\/([^/]+)$/)
    if (briefMatch && method === 'GET') return handlePublicBrief(briefMatch[1])

    const anamPubMatch = route.match(/^\/public\/anamnese\/([^/]+)$/)
    if (anamPubMatch && method === 'GET') return handlePublicAnamnesisStatus(anamPubMatch[1])
    if (anamPubMatch && method === 'POST') return handlePublicAnamnesisSubmit(request, anamPubMatch[1])

    // ---- ADMIN (Akash + Philipp only) ----
    const { userId } = await auth()
    if (!userId) return json({ error: 'Unauthorized' }, 401)
    const adminEmail = await requireAdmin()
    if (!adminEmail) return forbidden()

    if (route === '/overview' && method === 'GET') return handleOverview()

    if (route === '/patients' && method === 'GET') return handleListPatients()
    if (route === '/patients' && method === 'POST') return handleCreatePatient(request)
    const patientMatch = route.match(/^\/patients\/([^/]+)$/)
    if (patientMatch && method === 'PATCH') return handleUpdatePatient(request, patientMatch[1])
    if (patientMatch && method === 'DELETE') return handleDeletePatient(patientMatch[1])

    if (route === '/letters' && method === 'POST') return handleCreateLetter(request)
    if (route === '/letters' && method === 'GET') return handleListLetters(request)
    const letterMatch = route.match(/^\/letters\/([^/]+)$/)
    if (letterMatch && method === 'GET') return handleGetLetter(letterMatch[1])
    if (letterMatch && method === 'DELETE') return handleDeleteLetter(letterMatch[1])

    if (route === '/anamnesis' && method === 'POST') return handleCreateAnamnesis(request)
    if (route === '/anamnesis' && method === 'GET') return handleListAnamnesis()
    const anamMatch = route.match(/^\/anamnesis\/([^/]+)$/)
    if (anamMatch && method === 'DELETE') return handleDeleteAnamnesis(anamMatch[1])

    if (route === '/settings' && method === 'GET') return handleGetSettings()
    if (route === '/settings' && method === 'POST') return handleSaveSettings(request)

    return json({ error: 'Route not found', route, method }, 404)
  } catch (error) {
    console.error('❌ Clinic API error:', error)
    return json({ error: 'Internal server error' }, 500)
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PATCH = handleRoute
export const DELETE = handleRoute
