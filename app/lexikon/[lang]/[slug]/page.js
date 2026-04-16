import { notFound } from 'next/navigation'
import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'
import { getAllSlugs, getEntryTranslated, SUPPORTED_LANGS } from '@/lib/lexikon'
import FeaturedSnippet from '@/components/lexikon/FeaturedSnippet'
import RangeTable from '@/components/lexikon/RangeTable'
import CausesSection from '@/components/lexikon/CausesSection'
import DoctorCTA from '@/components/lexikon/DoctorCTA'
import RelatedValues from '@/components/lexikon/RelatedValues'
import JsonLd from '@/components/lexikon/JsonLd'
import MedicalDisclaimer from '@/components/lexikon/MedicalDisclaimer'
import { getRelatedEntries } from '@/lib/lexikon'

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

// Language display names and RTL flags
const LANG_META = {
  en: { name: 'English',    rtl: false },
  tr: { name: 'Türkçe',    rtl: false },
  bn: { name: 'বাংলা',     rtl: false },
  fr: { name: 'Français',  rtl: false },
  ar: { name: 'العربية',   rtl: true  },
  es: { name: 'Español',   rtl: false },
  it: { name: 'Italiano',  rtl: false },
  pt: { name: 'Português', rtl: false },
  nl: { name: 'Nederlands',rtl: false },
  pl: { name: 'Polski',    rtl: false },
  zh: { name: '中文',       rtl: false },
  ja: { name: '日本語',     rtl: false },
  ko: { name: '한국어',     rtl: false },
  hi: { name: 'हिन्दी',   rtl: false },
  ur: { name: 'اردو',      rtl: true  },
  ru: { name: 'Русский',   rtl: false },
}

export async function generateStaticParams() {
  const slugs = getAllSlugs()
  return SUPPORTED_LANGS.flatMap(lang => slugs.map(slug => ({ lang, slug })))
}

export async function generateMetadata({ params }) {
  const { lang, slug } = await params
  if (!SUPPORTED_LANGS.includes(lang)) return {}
  const entry = getEntryTranslated(slug, lang)
  if (!entry) return {}

  const t = entry._translation
  const title = t?.pageTitle || `${entry.acronym} — ${entry.fullName} | Medyra`
  const description = entry.metaDescription

  // Build hreflang alternates
  const languages = {
    'de': `https://medyra.de/lexikon/${slug}`,
    'x-default': `https://medyra.de/lexikon/${slug}`,
  }
  SUPPORTED_LANGS.forEach(l => {
    languages[l] = `https://medyra.de/lexikon/${l}/${slug}`
  })

  return {
    title,
    description,
    alternates: {
      canonical: `https://medyra.de/lexikon/${lang}/${slug}`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `https://medyra.de/lexikon/${lang}/${slug}`,
    },
  }
}

export default async function LexikonLangEntryPage({ params }) {
  const { lang, slug } = await params
  if (!SUPPORTED_LANGS.includes(lang)) notFound()

  const entry = getEntryTranslated(slug, lang)
  if (!entry) notFound()

  const related = getRelatedEntries(entry.relatedValues || [])
  const cat = CATEGORY_COLORS[entry.category] || DEFAULT_COLOR
  const langMeta = LANG_META[lang] || { name: lang.toUpperCase(), rtl: false }
  const t = entry._translation

  // Build range labels with translations if available
  const rangeLabels = t?.rangeLabels || {}

  const translatedRanges = entry.ranges ? Object.fromEntries(
    Object.entries(entry.ranges).map(([key, val]) => [
      key,
      { ...val, label: rangeLabels[key] || val.label }
    ])
  ) : null

  const reviewDate = new Date(entry.lastReviewed).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  // Category label translation
  const categoryDisplay = t?.categoryLabel || entry.category

  return (
    <div className="min-h-screen bg-gray-50" dir={langMeta.rtl ? 'rtl' : 'ltr'}>
      <JsonLd entry={entry} />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <nav className="flex items-center gap-3">
            <Link href="/lexikon" className="text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block">
              ← Lexikon (DE)
            </Link>
            <span className="hidden sm:block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
              {langMeta.name}
            </span>
            <Link href={`/upload?source=lexikon&term=${entry.slug}`}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors">
              Upload Report
            </Link>
          </nav>
        </div>
      </header>

      {/* Language switcher bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs text-gray-400 flex-shrink-0">Also in:</span>
          <Link href={`/lexikon/${slug}`}
            className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full border bg-gray-900 text-white border-gray-900 font-semibold">
            DE
          </Link>
          {SUPPORTED_LANGS.filter(l => l !== lang).map(l => (
            <Link key={l} href={`/lexikon/${l}/${slug}`}
              className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors font-medium">
              {l.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-10 max-w-2xl">

        {/* Category badge + meta */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <Link href="/lexikon"
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border} hover:opacity-80 transition-opacity`}>
            {categoryDisplay}
          </Link>
          <p className="text-xs text-gray-400">
            Reviewed: {reviewDate}
          </p>
        </div>

        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
          {entry.acronym}{' '}
          <span style={{ color: cat.accent }}>{entry.fullName}</span>
        </h1>
        {entry.unit && (
          <p className="text-sm text-gray-400 mb-6">Unit: <span className="font-semibold text-gray-600">{entry.unit}</span></p>
        )}

        {/* Quick answer */}
        <FeaturedSnippet text={entry.shortAnswer} accent={cat.accent} />

        {/* Range table */}
        {translatedRanges && <RangeTable ranges={translatedRanges} unit={entry.unit} />}

        {/* Causes */}
        <CausesSection causesElevated={entry.causesElevated} causesLow={entry.causesLow} />

        {/* Doctor questions */}
        {entry.doctorQuestions?.length > 0 && (
          <div className="my-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🩺</span> Questions for Your Doctor
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

        <DoctorCTA slug={entry.slug} />

        {related.length > 0 && <RelatedValues entries={related} />}

        <MedicalDisclaimer />
      </main>
    </div>
  )
}
