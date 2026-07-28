import { getAllEntries, getTranslation } from '@/lib/lexikon'
import { TERM_NAMES_EN, CATEGORY_NAMES_EN } from '@/lib/lexikonUI'

// Compact, public-safe projection of the lexikon entries used by the
// interactive Laborwert-Checker (landing page, /check tool, lexikon pages).
// Only entries with usable numeric ranges are included.
//
// `lang` applies the same translation overlay the translated lexikon pages use:
// the per-entry translation file wins, then the English name/category maps,
// then the German base entry. German ('de') is the base and needs no overlay.
export function toCompactEntry(entry, lang = 'de') {
  if (!entry?.ranges) return null
  const base = {
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
  if (!lang || lang === 'de') return base

  const t = getTranslation(entry.slug, lang)
  return {
    ...base,
    name: TERM_NAMES_EN[entry.slug] || base.name,
    category: t?.categoryLabel || CATEGORY_NAMES_EN[base.category] || base.category,
    shortAnswer: t?.shortAnswer || base.shortAnswer,
    causesElevated: t?.causesElevated || base.causesElevated,
    causesLow: t?.causesLow || base.causesLow,
  }
}

export function getCheckerEntries(lang = 'de') {
  return getAllEntries().map(e => toCompactEntry(e, lang)).filter(Boolean)
}
