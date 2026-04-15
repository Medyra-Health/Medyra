import fs from 'fs'
import path from 'path'

const LEXIKON_DIR = path.join(process.cwd(), 'data', 'lexikon')

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
