import fs from 'fs'
import path from 'path'

const LEXIKON_DIR = path.join(process.cwd(), 'data', 'lexikon')
const TRANSLATIONS_DIR = path.join(LEXIKON_DIR, 'translations')

// All supported translation languages (de is the base, no translation file needed)
export const SUPPORTED_LANGS = ['en', 'tr', 'bn', 'fr', 'ar', 'es', 'it', 'pt', 'nl', 'pl', 'zh', 'ja', 'ko', 'hi', 'ur', 'ru']

export function getAllSlugs() {
  return fs.readdirSync(LEXIKON_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))
}

export function getEntry(slug) {
  try {
    const file = path.join(LEXIKON_DIR, `${slug}.json`)
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch { return null }
}

export function getAllEntries() {
  return getAllSlugs().map(s => getEntry(s)).filter(Boolean)
}

export function getEntriesByCategory() {
  const entries = getAllEntries()
  return entries.reduce((acc, entry) => {
    const cat = entry.category || 'Sonstige'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(entry)
    return acc
  }, {})
}

export function getRelatedEntries(slugs) {
  return (slugs || []).map(s => getEntry(s)).filter(Boolean)
}

// Get translation overlay for a specific lang+slug
export function getTranslation(slug, lang) {
  try {
    const file = path.join(TRANSLATIONS_DIR, lang, `${slug}.json`)
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch { return null }
}

// Get entry with translations applied; falls back to German if translation missing
export function getEntryTranslated(slug, lang) {
  const entry = getEntry(slug)
  if (!entry) return null
  if (!lang || lang === 'de') return { ...entry, _lang: 'de' }
  const t = getTranslation(slug, lang)
  if (!t) return { ...entry, _lang: lang, _translation: null }
  return {
    ...entry,
    shortAnswer: t.shortAnswer || entry.shortAnswer,
    metaDescription: t.metaDescription || entry.metaDescription,
    causesElevated: t.causesElevated || entry.causesElevated,
    causesLow: t.causesLow || entry.causesLow,
    doctorQuestions: t.doctorQuestions || entry.doctorQuestions,
    _lang: lang,
    _translation: t,
  }
}
