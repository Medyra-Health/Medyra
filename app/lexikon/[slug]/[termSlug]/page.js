import { notFound } from 'next/navigation'
import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'
import { getAllSlugs, getEntryTranslated, getRelatedEntries, SUPPORTED_LANGS } from '@/lib/lexikon'
import { getLexikonUI, TERM_NAMES_EN, CATEGORY_NAMES_EN } from '@/lib/lexikonUI'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import FeaturedSnippet from '@/components/lexikon/FeaturedSnippet'
import RangeTable from '@/components/lexikon/RangeTable'
import CausesSection from '@/components/lexikon/CausesSection'
import DoctorCTA from '@/components/lexikon/DoctorCTA'
import RelatedValues from '@/components/lexikon/RelatedValues'
import JsonLd from '@/components/lexikon/JsonLd'
import MedicalDisclaimer from '@/components/lexikon/MedicalDisclaimer'

// NOTE: in this route, params.slug = language code (e.g. "en"), params.termSlug = medical term (e.g. "crp")
// URL pattern: /lexikon/:lang/:slug → /lexikon/en/crp

const CATEGORY_COLORS = {
  'Blutbild':         { bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    accent: '#ef4444' },
  'Leberwerte':       { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  accent: '#f59e0b' },
  'Nierenwerte':      { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   accent: '#3b82f6' },
  'Entzündungswerte': { bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200', accent: '#f97316' },
  'Stoffwechsel':     { bg: 'bg-violet-50',  text: 'text-violet-700', border: 'border-violet-200', accent: '#8b5cf6' },
  'Schilddrüse':      { bg: 'bg-teal-50',    text: 'text-teal-700',   border: 'border-teal-200',   accent: '#14b8a6' },
  'Elektrolyte':      { bg: 'bg-sky-50',     text: 'text-sky-700',    border: 'border-sky-200',    accent: '#0ea5e9' },
  'Eisenwerte':       { bg: 'bg-rose-50',    text: 'text-rose-700',   border: 'border-rose-200',   accent: '#f43f5e' },
  'Vitamine':         { bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200', accent: '#eab308' },
  'Gerinnung':        { bg: 'bg-indigo-50',  text: 'text-indigo-700', border: 'border-indigo-200', accent: '#6366f1' },
  'Urinwerte':        { bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200',accent: '#10b981' },
}
const DEFAULT_COLOR = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', accent: '#10b981' }

const LANG_META = {
  en: { name: 'English',     rtl: false },
  tr: { name: 'Türkçe',     rtl: false },
  bn: { name: 'বাংলা',      rtl: false },
  fr: { name: 'Français',   rtl: false },
  ar: { name: 'العربية',    rtl: true  },
  es: { name: 'Español',    rtl: false },
  it: { name: 'Italiano',   rtl: false },
  pt: { name: 'Português',  rtl: false },
  nl: { name: 'Nederlands', rtl: false },
  pl: { name: 'Polski',     rtl: false },
  zh: { name: '中文',        rtl: false },
  ja: { name: '日本語',      rtl: false },
  ko: { name: '한국어',      rtl: false },
  hi: { name: 'हिन्दी',    rtl: false },
  ur: { name: 'اردو',       rtl: true  },
  ru: { name: 'Русский',    rtl: false },
}

export async function generateStaticParams() {
  const slugs = getAllSlugs()
  // slug param = language code, termSlug param = medical term slug
  return SUPPORTED_LANGS.flatMap(lang =>
    slugs.map(termSlug => ({ slug: lang, termSlug }))
  )
}

export async function generateMetadata({ params }) {
  const { slug: lang, termSlug } = await params
  if (!SUPPORTED_LANGS.includes(lang)) return {}
  const entry = getEntryTranslated(termSlug, lang)
  if (!entry) return {}

  const t = entry._translation
  const title = t?.pageTitle || `${entry.acronym}, ${entry.fullName} | Medyra`
  const description = entry.metaDescription

  const languages = {
    'de': `https://medyra.de/lexikon/${termSlug}`,
    'x-default': `https://medyra.de/lexikon/${termSlug}`,
    ...Object.fromEntries(SUPPORTED_LANGS.map(l => [l, `https://medyra.de/lexikon/${l}/${termSlug}`])),
  }

  return {
    title,
    description,
    alternates: {
      canonical: `https://medyra.de/lexikon/${lang}/${termSlug}`,
      languages,
    },
    openGraph: { title, description, url: `https://medyra.de/lexikon/${lang}/${termSlug}` },
  }
}

export default async function LexikonTranslatedPage({ params }) {
  const { slug: lang, termSlug } = await params
  if (!SUPPORTED_LANGS.includes(lang)) notFound()

  const entry = getEntryTranslated(termSlug, lang)
  if (!entry) notFound()

  const related = getRelatedEntries(entry.relatedValues || [])
  const cat = CATEGORY_COLORS[entry.category] || DEFAULT_COLOR
  const langMeta = LANG_META[lang] || { name: lang.toUpperCase(), rtl: false }
  const t = entry._translation
  const rangeLabels = t?.rangeLabels || {}

  const translatedRanges = entry.ranges
    ? Object.fromEntries(
        Object.entries(entry.ranges).map(([key, val]) => [
          key,
          { ...val, label: rangeLabels[key] || val.label },
        ])
      )
    : null

  const reviewDate = new Date(entry.lastReviewed).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50" dir={langMeta.rtl ? 'rtl' : 'ltr'}>
      <JsonLd entry={entry} />

      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <nav className="flex items-center gap-3">
            <Link href="/lexikon" className="text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block">
              ← Lexikon (DE)
            </Link>
            <LanguageSwitcher />
            <Link href={`/upload?source=lexikon&term=${termSlug}`}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors">
              Upload Report
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <Link href="/lexikon"
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border} hover:opacity-80 transition-opacity`}>
            {t?.categoryLabel || CATEGORY_NAMES_EN[entry.category] || entry.category}
          </Link>
          <p className="text-xs text-gray-400">{getLexikonUI(lang).reviewed || 'Reviewed'}: {reviewDate}</p>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
          {entry.acronym}{' '}
          <span style={{ color: cat.accent }}>{TERM_NAMES_EN[termSlug] || entry.fullName}</span>
        </h1>
        {entry.unit && (
          <p className="text-sm text-gray-400 mb-6">
            {getLexikonUI(lang).unit || 'Unit'}: <span className="font-semibold text-gray-600">{entry.unit}</span>
          </p>
        )}

        <FeaturedSnippet text={entry.shortAnswer} accent={cat.accent} lang={lang} />

        {translatedRanges && <RangeTable ranges={translatedRanges} unit={entry.unit} lang={lang} />}

        <CausesSection causesElevated={entry.causesElevated} causesLow={entry.causesLow} lang={lang} />

        {entry.doctorQuestions?.length > 0 && (
          <div className="my-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🩺</span> {t?.doctorQuestionsLabel || getLexikonUI(lang).doctorQuestions}
            </h2>
            <ul className="space-y-3">
              {entry.doctorQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700">
                  <span className="font-black text-emerald-500 flex-shrink-0 mt-0.5">→</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DoctorCTA slug={termSlug} lang={lang} />
        {related.length > 0 && <RelatedValues entries={related} lang={lang} />}
        <MedicalDisclaimer lang={lang} />
      </main>
    </div>
  )
}
