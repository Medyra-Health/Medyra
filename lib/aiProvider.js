import { MongoClient } from 'mongodb'

// Supported upstream AI providers. Add a new one here + in aiClient.js to onboard it.
export const AI_PROVIDERS = ['anthropic', 'openai', 'deepseek']

// Providers whose chat-completions endpoint can accept an image (used for OCR).
export const VISION_CAPABLE_PROVIDERS = ['anthropic', 'openai']

export const DEFAULT_AI_SETTINGS = {
  tasks: {
    chat:   { provider: 'anthropic', model: 'claude-haiku-4-5-20251001' },
    big:    { provider: 'anthropic', model: 'claude-sonnet-4-6' },
    vision: { provider: 'anthropic', model: 'claude-haiku-4-5-20251001' },
  },
}

const SETTINGS_ID = 'ai_settings'
const CACHE_TTL_MS = 60 * 1000

let _client = null
let _db = null
async function getDb() {
  if (_db) {
    try { await _db.admin().ping(); return _db } catch { _client = null; _db = null }
  }
  if (!process.env.MONGO_URL) return null
  _client = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 5, serverSelectionTimeoutMS: 5000 })
  await _client.connect()
  _db = _client.db(process.env.DB_NAME || 'medyra')
  return _db
}

let _cache = null
let _cacheAt = 0

function mergeWithDefaults(stored) {
  const merged = { tasks: { ...DEFAULT_AI_SETTINGS.tasks } }
  for (const task of Object.keys(DEFAULT_AI_SETTINGS.tasks)) {
    if (stored?.tasks?.[task]?.provider && stored?.tasks?.[task]?.model) {
      merged.tasks[task] = { provider: stored.tasks[task].provider, model: stored.tasks[task].model }
    }
  }
  return merged
}

// Reads the current AI provider/model config. Falls back to defaults if no
// override has been saved, or if Mongo is unreachable — AI calls must never
// hard-fail just because the settings store is down.
export async function getAISettings() {
  const now = Date.now()
  if (_cache && now - _cacheAt < CACHE_TTL_MS) return _cache

  try {
    const db = await getDb()
    if (!db) return mergeWithDefaults(null)
    const doc = await db.collection('settings').findOne({ _id: SETTINGS_ID })
    const merged = mergeWithDefaults(doc)
    _cache = merged
    _cacheAt = now
    return merged
  } catch {
    return _cache || mergeWithDefaults(null)
  }
}

export function validateAISettings(tasks) {
  const errors = []
  for (const task of Object.keys(DEFAULT_AI_SETTINGS.tasks)) {
    const entry = tasks?.[task]
    if (!entry?.provider || !entry?.model) {
      errors.push(`${task}: provider and model are required`)
      continue
    }
    if (!AI_PROVIDERS.includes(entry.provider)) {
      errors.push(`${task}: unknown provider "${entry.provider}"`)
    }
    if (task === 'vision' && !VISION_CAPABLE_PROVIDERS.includes(entry.provider)) {
      errors.push(`vision: "${entry.provider}" cannot process images — use ${VISION_CAPABLE_PROVIDERS.join(' or ')}`)
    }
  }
  return errors
}

// Upserts the settings doc and refreshes the in-memory cache immediately so
// the admin panel reflects the change without waiting out the TTL.
export async function saveAISettings(tasks, updatedBy) {
  const errors = validateAISettings(tasks)
  if (errors.length > 0) throw new Error(errors.join('; '))

  const db = await getDb()
  if (!db) throw new Error('Database unavailable')

  const cleaned = {}
  for (const task of Object.keys(DEFAULT_AI_SETTINGS.tasks)) {
    cleaned[task] = { provider: tasks[task].provider, model: tasks[task].model }
  }

  await db.collection('settings').updateOne(
    { _id: SETTINGS_ID },
    { $set: { tasks: cleaned, updatedAt: new Date(), updatedBy: updatedBy || null } },
    { upsert: true }
  )

  const merged = mergeWithDefaults({ tasks: cleaned })
  _cache = merged
  _cacheAt = Date.now()
  return merged
}
