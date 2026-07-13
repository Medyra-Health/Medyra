import Link from 'next/link'
import AppHeader, { HeaderButton } from '@/components/AppHeader'
import FeatureCluster from '@/components/FeatureCluster'
import ValueChecker from '@/components/werte/ValueChecker'
import { getCheckerEntries } from '@/lib/werte'
import { getPageLocale, pickContent } from '@/lib/pageLocale'
import { CONTENT } from './content'

export const metadata = {
  title: 'Laborwert-Checker: Blutwerte sofort einordnen | Medyra',
  description:
    'Ist Ihr Laborwert normal, erhöht oder zu niedrig? Kostenloser Laborwert-Checker: TSH, HbA1c, Ferritin, LDL, CRP und 120+ weitere Blutwerte sofort einordnen. Ohne Anmeldung.',
  alternates: { canonical: 'https://medyra.de/check' },
  openGraph: {
    title: 'Laborwert-Checker: Blutwerte sofort einordnen',
    description:
      'Kostenloser Laborwert-Checker: Wert eingeben und sofort sehen, ob er im Normalbereich liegt. Ohne Anmeldung.',
    url: 'https://medyra.de/check',
  },
}

// Same accents the lexikon uses per category
const CATEGORY_COLORS = {
  'Blutbild': 'text-red-700 bg-red-50 border-red-200',
  'Leberwerte': 'text-amber-700 bg-amber-50 border-amber-200',
  'Nierenwerte': 'text-blue-700 bg-blue-50 border-blue-200',
  'Entzündungswerte': 'text-orange-700 bg-orange-50 border-orange-200',
  'Stoffwechsel': 'text-violet-700 bg-violet-50 border-violet-200',
  'Schilddrüse': 'text-teal-700 bg-teal-50 border-teal-200',
  'Elektrolyte': 'text-sky-700 bg-sky-50 border-sky-200',
  'Eisenwerte': 'text-rose-700 bg-rose-50 border-rose-200',
  'Vitamine': 'text-yellow-700 bg-yellow-50 border-yellow-200',
  'Gerinnung': 'text-indigo-700 bg-indigo-50 border-indigo-200',
  'Urinwerte': 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'Spurenelemente': 'text-lime-700 bg-lime-50 border-lime-200',
  'Hormone': 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200',
  'Tumormarker': 'text-purple-700 bg-purple-50 border-purple-200',
  'Herzwerte': 'text-pink-700 bg-pink-50 border-pink-200',
  'Immunsystem': 'text-cyan-700 bg-cyan-50 border-cyan-200',
  'Infektionswerte': 'text-red-800 bg-red-50 border-red-200',
  'Pankreaswerte': 'text-orange-800 bg-orange-50 border-orange-200',
  'Blutgruppe': 'text-slate-700 bg-slate-50 border-slate-200',
}

export default async function CheckPage() {
  const entries = getCheckerEntries()
  const locale = await getPageLocale()
  const c = pickContent(CONTENT, locale)

  const byCategory = entries.reduce((acc, e) => {
    ;(acc[e.category] = acc[e.category] || []).push(e)
    return acc
  }, {})

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Medyra Laborwert-Checker',
      url: 'https://medyra.de/check',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      description: metadata.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: c.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ]

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`.font-display { font-family: var(--font-playfair), Georgia, serif; }`}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <AppHeader back={{ href: '/', label: c.back }} title={c.headerTitle} tone="teal">
        <HeaderButton href="/upload" tone="teal">{c.headerCta}</HeaderButton>
      </AppHeader>

      {/* Dark hero with the live tool */}
      <section className="relative bg-[#040C08] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 left-[20%] w-[480px] h-[480px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.10) 0%, transparent 68%)' }} />
          <div className="absolute -bottom-32 right-[15%] w-[420px] h-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 68%)' }} />
        </div>

        <div className="container mx-auto px-4 max-w-3xl relative z-10 pt-14 pb-24 md:pt-20 md:pb-28">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-400/30 bg-teal-400/10 text-teal-300 text-xs font-semibold tracking-wide mb-6">
              <span className="w-1.5 h-1.5 bg-teal-300 rounded-full animate-pulse" />
              {c.badge}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[#E8F5F0] leading-[1.15] mb-4">
              {c.h1a}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14B8A6] to-[#34D399]">{c.h1b}</span>
            </h1>
            <p className="text-[#E8F5F0]/60 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
              {c.sub}
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm p-5 md:p-7">
            <ValueChecker entries={entries} tone="dark" />
          </div>

          <p className="text-center text-xs text-[#E8F5F0]/30 mt-5">{c.privacy}</p>
        </div>

        <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* All values by category */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">{c.valuesLabel}</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#0B1F17]">
              {entries.length}+ {c.valuesTitle}
            </h2>
          </div>

          <div className="space-y-8">
            {Object.entries(byCategory).map(([cat, list]) => (
              <div key={cat}>
                <p className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border mb-3 ${CATEGORY_COLORS[cat] || 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                  {cat}
                </p>
                <div className="flex flex-wrap gap-2">
                  {list.map(e => (
                    <Link
                      key={e.slug}
                      href={`/lexikon/${e.slug}`}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-teal-300 hover:text-teal-700 hover:shadow-sm transition-all"
                    >
                      {e.acronym}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upsell: full report */}
      <section className="py-16 md:py-20 bg-[#F3FAF6]">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#0B1F17] mb-4">{c.upsellTitle}</h2>
          <p className="text-gray-600 text-base leading-relaxed max-w-xl mx-auto mb-8">{c.upsellText}</p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-8 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 transition-colors"
          >
            {c.upsellCta}
          </Link>
          <p className="text-xs text-gray-400 mt-4">{c.upsellNote}</p>
        </div>
      </section>

      <FeatureCluster current="/check" pageName="Laborwert Checker" locale={locale} />

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#0B1F17] text-center mb-10">{c.faqTitle}</h2>
          <div className="space-y-4">
            {c.faq.map((f, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="font-bold text-gray-900 text-sm mb-2">{f.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-8 leading-relaxed">{c.disclaimer}</p>
        </div>
      </section>
    </div>
  )
}
