import Link from 'next/link'
import AppHeader, { HeaderButton } from '@/components/AppHeader'
import FeatureCluster from '@/components/FeatureCluster'

export const metadata = {
  title: 'Arztbrief verstehen: Befund einfach erklärt in 60 Sekunden | Medyra',
  description:
    'Arztbrief, Entlassungsbericht oder MRT-Befund voller Fachbegriffe? Medyra übersetzt jedes medizinische Dokument in verständliche Sprache. DSGVO-konform, in unter 60 Sekunden.',
  alternates: { canonical: 'https://medyra.de/arztbrief' },
  openGraph: {
    title: 'Arztbrief verstehen: Befund einfach erklärt',
    description: 'Medyra übersetzt Arztbriefe, Entlassungsberichte und Radiologie-Befunde in verständliche Sprache.',
    url: 'https://medyra.de/arztbrief',
  },
}

const DOC_KINDS = [
  {
    icon: '📋',
    title: 'Arztbrief & Entlassungsbericht',
    desc: 'Diagnosen, Therapieempfehlungen und Medikationsänderungen aus dem Krankenhaus oder von der Fachärztin, Absatz für Absatz erklärt.',
  },
  {
    icon: '🩻',
    title: 'Radiologie-Befund (MRT, CT, Röntgen)',
    desc: 'Was bedeutet "unauffällige Raumforderung" oder "degenerative Veränderung"? Jeder Fachbegriff wird übersetzt, ruhig und ohne Panik.',
  },
  {
    icon: '🔬',
    title: 'Pathologie & Laborbefund',
    desc: 'Gewebebefunde und Laborwerte im Zusammenhang: was gemessen wurde, was auffällig ist und welche Fragen Sie stellen sollten.',
  },
]

const JARGON = [
  ['idiopathisch', 'ohne erkennbare Ursache'],
  ['Adhärenz', 'wie zuverlässig Sie die Therapie einhalten'],
  ['unauffällig', 'alles in Ordnung, kein krankhafter Befund'],
  ['Raumforderung', 'etwas, das Platz einnimmt, muss nicht bösartig sein'],
  ['degenerativ', 'verschleißbedingt, meist altersbedingt'],
  ['V. a.', 'Verdacht auf, noch keine gesicherte Diagnose'],
]

const FAQ = [
  {
    q: 'Welche Dokumente kann ich hochladen?',
    a: 'Arztbriefe, Entlassungsberichte, Radiologie-Befunde (MRT, CT, Röntgen, Ultraschall), Pathologie-Befunde, Laborbefunde und Krankenkassen-Schreiben, als PDF, Foto oder Text.',
  },
  {
    q: 'Stellt Medyra Diagnosen?',
    a: 'Nein. Medyra erklärt, was in Ihrem Dokument steht, in verständlicher Sprache. Diagnose und Therapie gehören in ärztliche Hände. Medyra schlägt Ihnen passende Fragen für das Arztgespräch vor.',
  },
  {
    q: 'Was passiert mit meinen Daten?',
    a: 'Ihre Dokumente werden verschlüsselt verarbeitet, DSGVO-konform in Frankfurt gehostet und standardmäßig nach 30 Tagen automatisch gelöscht.',
  },
  {
    q: 'Versteht Medyra auch handschriftliche oder fotografierte Briefe?',
    a: 'Ja. Sie können den Brief einfach mit dem Handy fotografieren. Gedruckter Text wird zuverlässig erkannt; bei Handschrift hängt es von der Lesbarkeit ab.',
  },
]

export default function ArztbriefPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`.font-display { font-family: var(--font-playfair), Georgia, serif; }`}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <AppHeader back={{ href: '/', label: 'Start' }} title="Arztbrief verstehen" tone="blue">
        <HeaderButton href="/upload?type=letter" tone="blue">Arztbrief hochladen</HeaderButton>
      </AppHeader>

      {/* Dark hero */}
      <section className="relative bg-[#040C08] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 left-[18%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 68%)' }} />
          <div className="absolute -bottom-32 right-[12%] w-[420px] h-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 68%)' }} />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10 pt-16 pb-24 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-300 text-xs font-semibold tracking-wide mb-6">
                <span className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse" />
                Arztbrief · Entlassungsbericht · MRT-Befund
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-[#E8F5F0] leading-[1.12] mb-5">
                Ihr Arztbrief,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#34D399]">
                  endlich verständlich
                </span>
              </h1>
              <p className="text-[#E8F5F0]/60 text-lg leading-relaxed mb-8 max-w-lg">
                Fachbegriffe, Abkürzungen, lateinische Diagnosen: Medyra übersetzt jeden Satz Ihres Befundes in klare Sprache und sagt Ihnen, welche Fragen Sie Ihrer Ärztin stellen sollten. In unter 60 Sekunden.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/upload?type=letter"
                  className="inline-flex items-center justify-center px-8 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
                >
                  Jetzt Arztbrief hochladen
                </Link>
                <Link
                  href="#beispiele"
                  className="inline-flex items-center justify-center px-8 h-12 rounded-xl border border-blue-400/40 text-[#E8F5F0]/80 text-base font-semibold hover:border-blue-300 hover:bg-blue-500/10 transition-colors"
                >
                  Beispiele ansehen
                </Link>
              </div>
            </div>

            {/* Before/after mock */}
            <div className="rounded-2xl bg-[#08130D] border border-white/10 p-6 md:p-7 shadow-2xl">
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-4">Im Befund steht</p>
              <p className="font-mono text-xs text-[#E8F5F0]/50 leading-relaxed bg-white/[0.04] border border-white/5 rounded-xl p-4 mb-5">
                "V. a. degenerative Veränderungen der LWS mit medialer Diskusprotrusion L4/5 ohne Nachweis einer höhergradigen Spinalkanalstenose."
              </p>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Medyra erklärt</p>
              <div className="space-y-2.5">
                {[
                  'Verdacht auf Verschleiß an der Lendenwirbelsäule, das ist ab dem mittleren Alter sehr häufig.',
                  'Eine Bandscheibe zwischen dem 4. und 5. Lendenwirbel wölbt sich leicht vor.',
                  'Der Nervenkanal ist nicht stark eingeengt, das ist eine gute Nachricht.',
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-[#E8F5F0]/75 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* Document kinds */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Für jedes Dokument</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17]">
              Mehr als nur Laborwerte
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {DOC_KINDS.map(d => (
              <div key={d.title} className="rounded-2xl border border-gray-200 bg-white p-7 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl mb-4">
                  {d.icon}
                </div>
                <h3 className="font-bold text-[#0B1F17] mb-2">{d.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jargon translator */}
      <section id="beispiele" className="py-16 md:py-24 bg-[#F3FAF6]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Beispiele</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17] mb-3">
              Arzt-Deutsch, übersetzt
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">So klingt Ihr Befund, nachdem Medyra ihn erklärt hat.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {JARGON.map(([term, plain]) => (
              <div key={term} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 rounded-2xl bg-white border border-gray-200 px-5 py-4 shadow-sm">
                <span className="font-mono text-sm font-bold text-gray-800 sm:flex-shrink-0">{term}</span>
                <span className="hidden sm:inline text-gray-300">→</span>
                <span className="text-sm text-emerald-700 font-medium leading-relaxed">{plain}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#0B1F17] text-center mb-10">Häufige Fragen</h2>
          <div className="space-y-4">
            {FAQ.map((f, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="font-bold text-gray-900 text-sm mb-2">{f.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeatureCluster current="/arztbrief" pageName="Arztbrief verstehen" />

      {/* CTA band */}
      <section className="py-16 md:py-20 bg-[#040C08]">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#E8F5F0] mb-4">
            Verstehen Sie, was Ihre Ärzte schreiben
          </h2>
          <p className="text-[#E8F5F0]/55 mb-8 max-w-lg mx-auto">
            3 Dokumente pro Monat kostenlos. Keine Kreditkarte nötig, DSGVO-konform, Daten werden automatisch gelöscht.
          </p>
          <Link
            href="/upload?type=letter"
            className="inline-flex items-center justify-center px-9 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
          >
            Arztbrief jetzt erklären lassen
          </Link>
          <p className="text-xs text-[#E8F5F0]/30 mt-6 leading-relaxed max-w-md mx-auto">
            Medyra ersetzt keine ärztliche Beratung. Besprechen Sie Ihre Befunde immer mit Ihrer Ärztin oder Ihrem Arzt.
          </p>
        </div>
      </section>
    </div>
  )
}
