import Link from 'next/link'
import AppHeader, { HeaderButton } from '@/components/AppHeader'
import FeatureCluster from '@/components/FeatureCluster'

// Shared template for the document understanding pages (arztbrief,
// entlassungsbericht, medikamente, krankenkasse). The page supplies a tone
// and a localized content object; German document quotes stay German on
// purpose (that is what users hold in their hands).
const TONES = {
  blue: {
    badge: 'border-blue-400/30 bg-blue-400/10 text-blue-300',
    dot: 'bg-blue-300',
    glow: 'rgba(59,130,246,0.10)',
    gradient: 'from-[#3B82F6] to-[#34D399]',
    label: 'text-blue-600',
    mockLabel: 'text-blue-300',
    cardHover: 'hover:border-blue-200 hover:shadow-blue-900/5',
    iconBox: 'bg-blue-50 border-blue-100',
  },
  indigo: {
    badge: 'border-indigo-400/30 bg-indigo-400/10 text-indigo-300',
    dot: 'bg-indigo-300',
    glow: 'rgba(99,102,241,0.10)',
    gradient: 'from-[#818CF8] to-[#34D399]',
    label: 'text-indigo-600',
    mockLabel: 'text-indigo-300',
    cardHover: 'hover:border-indigo-200 hover:shadow-indigo-900/5',
    iconBox: 'bg-indigo-50 border-indigo-100',
  },
  amber: {
    badge: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    dot: 'bg-amber-300',
    glow: 'rgba(245,158,11,0.10)',
    gradient: 'from-[#F59E0B] to-[#34D399]',
    label: 'text-amber-600',
    mockLabel: 'text-amber-300',
    cardHover: 'hover:border-amber-200 hover:shadow-amber-900/5',
    iconBox: 'bg-amber-50 border-amber-100',
  },
}

export default function DocumentFeaturePage({ tone = 'blue', uploadHref, current, pageName, locale = 'de', content: c }) {
  const t = TONES[tone] || TONES.blue

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`.font-display { font-family: var(--font-playfair), Georgia, serif; }`}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <AppHeader back={{ href: '/', label: 'Start' }} title={c.headerTitle} tone={tone}>
        <HeaderButton href={uploadHref} tone={tone}>{c.headerCta}</HeaderButton>
      </AppHeader>

      {/* Dark hero */}
      <section className="relative bg-[#040C08] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 left-[18%] w-[500px] h-[500px] rounded-full"
            style={{ background: `radial-gradient(circle, ${t.glow} 0%, transparent 68%)` }} />
          <div className="absolute -bottom-32 right-[12%] w-[420px] h-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 68%)' }} />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10 pt-16 pb-24 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide mb-6 ${t.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${t.dot}`} />
                {c.badge}
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-[#E8F5F0] leading-[1.12] mb-5">
                {c.h1a}{' '}
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${t.gradient}`}>
                  {c.h1b}
                </span>
              </h1>
              <p className="text-[#E8F5F0]/60 text-lg leading-relaxed mb-8 max-w-lg">{c.sub}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={uploadHref}
                  className="inline-flex items-center justify-center px-8 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
                >
                  {c.cta}
                </Link>
              </div>
            </div>

            {/* Mock: document quote or medication list, explained */}
            <div className="rounded-2xl bg-[#08130D] border border-white/10 p-6 md:p-7 shadow-2xl">
              {c.mock.quote ? (
                <>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${t.mockLabel}`}>{c.mock.labelIn}</p>
                  <p className="font-mono text-xs text-[#E8F5F0]/50 leading-relaxed bg-white/[0.04] border border-white/5 rounded-xl p-4 mb-5">
                    {c.mock.quote}
                  </p>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">{c.mock.labelOut}</p>
                  <div className="space-y-2.5">
                    {c.mock.lines.map((line, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-[#E8F5F0]/75 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                        {line}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">{c.mock.labelOut}</p>
                  <div className="space-y-4">
                    {c.mock.meds.map(m => (
                      <div key={m.name} className="border-b border-white/5 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-center justify-between flex-wrap gap-x-2 gap-y-1 mb-1.5">
                          <span className="text-sm font-bold text-[#E8F5F0]">{m.name}</span>
                          <span className={`font-mono text-[11px] rounded-full px-2 py-0.5 whitespace-nowrap border ${t.badge}`}>{m.schedule}</span>
                        </div>
                        <p className="text-xs text-[#E8F5F0]/60 leading-relaxed">{m.plain}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* What Medyra explains */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${t.label}`}>{c.cardsLabel}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17]">{c.cardsTitle}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {c.cards.map(card => (
              <div key={card.title} className={`rounded-2xl border border-gray-200 bg-white p-7 hover:shadow-lg transition-all ${t.cardHover}`}>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl mb-4 ${t.iconBox}`}>
                  {card.icon}
                </div>
                <h3 className="font-bold text-[#0B1F17] mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {c.note && (
            <div className="mt-10 rounded-2xl bg-[#F3FAF6] border border-emerald-100 p-6 md:p-7 flex items-start gap-4">
              <span className="text-2xl flex-shrink-0">{c.note.icon}</span>
              <div>
                <h3 className="font-bold text-[#0B1F17] text-sm mb-1">{c.note.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{c.note.text}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Jargon translator */}
      {c.jargon && (
        <section className="py-16 md:py-24 bg-[#F3FAF6]">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${t.label}`}>{c.jargon.label}</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17] mb-3">{c.jargon.title}</h2>
              {c.jargon.sub && <p className="text-gray-600 max-w-lg mx-auto">{c.jargon.sub}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {c.jargon.pairs.map(([term, plain]) => (
                <div key={term} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 rounded-2xl bg-white border border-gray-200 px-5 py-4 shadow-sm">
                  <span className="font-mono text-sm font-bold text-gray-800 sm:flex-shrink-0">{term}</span>
                  <span className="hidden sm:inline text-gray-300">→</span>
                  <span className="text-sm text-emerald-700 font-medium leading-relaxed">{plain}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className={`py-16 md:py-24 ${c.jargon ? 'bg-white' : 'bg-[#F3FAF6]'}`}>
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
        </div>
      </section>

      <FeatureCluster current={current} pageName={pageName} locale={locale} />

      {/* CTA band */}
      <section className="py-16 md:py-20 bg-[#040C08]">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#E8F5F0] mb-4">{c.ctaTitle}</h2>
          <p className="text-[#E8F5F0]/55 mb-8 max-w-lg mx-auto">{c.ctaSub}</p>
          <Link
            href={uploadHref}
            className="inline-flex items-center justify-center px-9 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
          >
            {c.ctaButton}
          </Link>
          <p className="text-xs text-[#E8F5F0]/30 mt-6 leading-relaxed max-w-md mx-auto">{c.ctaNote}</p>
        </div>
      </section>
    </div>
  )
}
