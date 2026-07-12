import { cookies } from 'next/headers'

const SUPPORTED = ['en', 'de', 'bn', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'tr', 'ar', 'zh', 'ja', 'ko', 'hi', 'ur', 'ru']

/**
 * Locale for server rendered marketing pages, read from the same `locale`
 * cookie the LanguageSwitcher sets. No cookie (first visit, search bots)
 * means German: these pages target German search and German is their
 * canonical content.
 */
export async function getPageLocale() {
  const raw = (await cookies()).get('locale')?.value
  return SUPPORTED.includes(raw) ? raw : 'de'
}

/** Pick a language variant from a content dictionary, English as fallback. */
export function pickContent(dict, locale) {
  return dict[locale] || dict.en || dict.de
}
