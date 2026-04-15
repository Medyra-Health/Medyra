import { notFound } from 'next/navigation'
import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'
import { getAllSlugs, getEntry, getRelatedEntries } from '@/lib/lexikon'
import FeaturedSnippet from '@/components/lexikon/FeaturedSnippet'
import RangeTable from '@/components/lexikon/RangeTable'
import CausesSection from '@/components/lexikon/CausesSection'
import DoctorCTA from '@/components/lexikon/DoctorCTA'
import RelatedValues from '@/components/lexikon/RelatedValues'
import JsonLd from '@/components/lexikon/JsonLd'
import MedicalDisclaimer from '@/components/lexikon/MedicalDisclaimer'

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
      languages: { 'de-DE': `https://medyra.de/lexikon/${entry.slug}` },
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
  const reviewDate = new Date(entry.lastReviewed).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div style={{background:'#040C08', minHeight:'100vh', color:'#E8F5F0'}}>
      <JsonLd entry={entry} />

      {/* Header */}
      <header style={{borderBottom:'1px solid rgba(16,185,129,0.15)', background:'rgba(4,12,8,0.95)'}} className="sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/lexikon" style={{color:'rgba(232,245,240,0.6)'}} className="hover:text-emerald-400 transition-colors">← Lexikon</Link>
            <Link href="/upload" style={{background:'#10B981', color:'#040C08'}} className="font-bold px-4 py-1.5 rounded-lg text-xs">Befund hochladen</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Category + reviewed */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{background:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.2)'}}>{entry.category}</span>
          <p className="text-xs" style={{color:'rgba(232,245,240,0.4)'}}>
            Zuletzt überprüft: {reviewDate}
            {entry.medicallyReviewedBy ? ` · Medizinisch geprüft von ${entry.medicallyReviewedBy}` : ''}
          </p>
        </div>

        {/* H1 */}
        <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight" style={{color:'#E8F5F0'}}>
          {entry.acronym} Wert zu hoch? {entry.fullName} einfach erklärt
        </h1>
        {entry.unit && (
          <p className="text-sm mb-6" style={{color:'rgba(232,245,240,0.5)'}}>Einheit: {entry.unit}</p>
        )}

        {/* Featured snippet */}
        <FeaturedSnippet text={entry.shortAnswer} />

        {/* Range table */}
        {entry.ranges && <RangeTable ranges={entry.ranges} unit={entry.unit} />}

        {/* Causes */}
        <CausesSection causesElevated={entry.causesElevated} causesLow={entry.causesLow} />

        {/* Doctor questions */}
        {entry.doctorQuestions?.length > 0 && (
          <div className="my-8">
            <h2 className="text-lg font-bold mb-4" style={{color:'#E8F5F0'}}>Fragen für Ihren Arzt</h2>
            <ul className="space-y-3">
              {entry.doctorQuestions.map((q, i) => (
                <li key={i} className="flex gap-3 text-sm" style={{color:'rgba(232,245,240,0.8)'}}>
                  <span style={{color:'#10B981', flexShrink:0}}>→</span>
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

      <footer
        style={{borderTop:'1px solid rgba(16,185,129,0.1)', color:'rgba(232,245,240,0.3)'}}
        className="py-6 text-center text-xs mt-8"
      >
        © 2026 Medyra ·{' '}
        <Link href="/privacy" className="hover:text-emerald-400">Datenschutz</Link>
        {' · '}
        <Link href="/terms" className="hover:text-emerald-400">AGB</Link>
      </footer>
    </div>
  )
}
