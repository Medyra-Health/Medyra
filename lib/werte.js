import { getAllEntries } from '@/lib/lexikon'

// Compact, public-safe projection of the lexikon entries used by the
// interactive Laborwert-Checker (landing page, /check tool, lexikon pages).
// Only entries with usable numeric ranges are included.
export function toCompactEntry(entry) {
  if (!entry?.ranges) return null
  return {
    slug: entry.slug,
    acronym: entry.acronym,
    name: entry.fullName,
    category: entry.category || 'Sonstige',
    unit: entry.unit || '',
    ranges: entry.ranges,
    shortAnswer: entry.shortAnswer || '',
    causesElevated: entry.causesElevated || [],
    causesLow: entry.causesLow || [],
  }
}

export function getCheckerEntries() {
  return getAllEntries().map(toCompactEntry).filter(Boolean)
}
