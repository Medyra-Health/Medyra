import { notFound } from 'next/navigation'
import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'
import { getAllSlugs, getEntry, getRelatedEntries, SUPPORTED_LANGS } from '@/lib/lexikon'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import FeaturedSnippet from '@/components/lexikon/FeaturedSnippet'
import RangeTable from '@/components/lexikon/RangeTable'
import CausesSection from '@/components/lexikon/CausesSection'
import DoctorCTA from '@/components/lexikon/DoctorCTA'
import RelatedValues from '@/components/lexikon/RelatedValues'
import JsonLd from '@/components/lexikon/JsonLd'
import MedicalDisclaimer from '@/components/lexikon/MedicalDisclaimer'
import LexikonAutoRedirect from '@/components/lexikon/LexikonAutoRedirect'

// Per-category accent colours (light theme)
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

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const entry = getEntry(slug)
  if (!entry) return {}
  return {
    title: `${entry.acronym} Wert — ${entry.fullName} einfach erklärt | Medyra`,
    description: entry.metaDescription,
    alternates: {
      canonical: `https://medyra.de/lexikon/${entry.slug}`,
      languages: {
        'de': `https://medyra.de/lexikon/${entry.slug}`,
        'x-default': `https://medyra.de/lexikon/${entry.slug}`,
        ...Object.fromEntries(SUPPORTED_LANGS.map(l => [l, `https://medyra.de/lexikon/${l}/${entry.slug}`])),
      },
    },
    openGraph: {
      title: `${entry.acronym} Wert — ${entry.fullName} einfach erklärt`,
      description: entry.metaDescription,
      url: `https://medyra.de/lexikon/${entry.slug}`,
    },
  }
}

export default async function LexikonEntryPage({ params }) {
  const { slug } = await params
  const entry = getEntry(slug)
  if (!entry) notFound()

  const related = getRelatedEntries(entry.relatedValues || [])
  const cat = CATEGORY_COLORS[entry.category] || DEFAULT_COLOR
  const reviewDate = new Date(entry.lastReviewed).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd entry={entry} />
      {/* Auto-redirect to translated version if user's saved language is not DE */}
      <LexikonAutoRedirect termSlug={slug} />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <nav className="flex items-center gap-3">
            <Link href="/lexikon" className="text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block">
              ← Lexikon
            </Link>
            <LanguageSwitcher />
            <Link href={`/upload?source=lexikon&term=${entry.slug}`}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors">
              Befund hochladen
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">

        {/* Category badge + meta */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <Link href="/lexikon"
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border} hover:opacity-80 transition-opacity`}>
            {entry.category}
          </Link>
          <p className="text-xs text-gray-400">
            Zuletzt überprüft: {reviewDate}
            {entry.medicallyReviewedBy && ` · Medizinisch geprüft von ${entry.medicallyReviewedBy}`}
          </p>
        </div>

        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
          {entry.acronym} Wert zu hoch?{' '}
          <span style={{ color: cat.accent }}>{entry.fullName}</span> einfach erklärt
        </h1>
        {entry.unit && (
          <p className="text-sm text-gray-400 mb-6">Einheit: <span className="font-semibold text-gray-600">{entry.unit}</span></p>
        )}

        <FeaturedSnippet text={entry.shortAnswer} accent={cat.accent} lang="de" />
        {entry.ranges && <RangeTable ranges={entry.ranges} unit={entry.unit} lang="de" />}
        <CausesSection causesElevated={entry.causesElevated} causesLow={entry.causesLow} lang="de" />

        {entry.doctorQuestions?.length > 0 && (
          <div className="my-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🩺</span> Fragen für Ihren Arzt
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

        <DoctorCTA slug={entry.slug} lang="de" />
        {related.length > 0 && <RelatedValues entries={related} lang="de" />}
        <MedicalDisclaimer lang="de" />
      </main>

    </div>
  )
}
