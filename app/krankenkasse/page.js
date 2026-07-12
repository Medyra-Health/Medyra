import Link from 'next/link'
import AppHeader, { HeaderButton } from '@/components/AppHeader'
import FeatureCluster from '@/components/FeatureCluster'

export const metadata = {
  title: 'Krankenkassen-Brief verstehen: Bescheide einfach erklärt | Medyra',
  description:
    'Bescheid, Ablehnung oder Zuzahlungsbrief von der Krankenkasse und nichts verstanden? Medyra übersetzt Amtsdeutsch in klare Sprache: was drinsteht, was es für Sie bedeutet und was Sie jetzt tun müssen.',
  alternates: { canonical: 'https://medyra.de/krankenkasse' },
  openGraph: {
    title: 'Krankenkassen-Brief verstehen: Bescheide einfach erklärt',
    description: 'Medyra erklärt Briefe und Bescheide der Krankenkasse in verständlicher Sprache.',
    url: 'https://medyra.de/krankenkasse',
  },
}

const SECTIONS = [
  {
    icon: '📬',
    title: 'Was der Brief sagt',
    desc: 'Bewilligung, Ablehnung, Beitragsbescheid oder Erstattungsanfrage: Medyra erkennt die Briefart und fasst den Inhalt in zwei Sätzen zusammen.',
  },
  {
    icon: '💶',
    title: 'Was es Sie kostet',
    desc: 'Zuzahlungen, Eigenanteile, Erstattungsbeträge und Beitragsänderungen werden klar aufgeschlüsselt, mit allen Beträgen aus dem Brief.',
  },
  {
    icon: '⏰',
    title: 'Fristen und nächste Schritte',
    desc: 'Widerspruchsfristen, einzureichende Unterlagen und Termine als klare Liste, damit nichts verpasst wird.',
  },
]

const JARGON = [
  ['Bescheid', 'die offizielle Entscheidung der Kasse'],
  ['Zuzahlung', 'der Anteil, den Sie selbst bezahlen'],
  ['Widerspruch', 'Ihr Recht, die Entscheidung anzufechten'],
  ['Bewilligung', 'die Kasse übernimmt die Kosten'],
  ['MD-Gutachten', 'eine Prüfung durch den Medizinischen Dienst'],
  ['Satzungsleistung', 'ein Extra, das nur Ihre Kasse anbietet'],
]

const FAQ = [
  {
    q: 'Welche Briefe kann ich hochladen?',
    a: 'Bescheide, Ablehnungen, Zuzahlungs- und Beitragsbriefe, Schreiben zu Hilfsmitteln, Reha oder Krankengeld, von jeder gesetzlichen oder privaten Krankenversicherung.',
  },
  {
    q: 'Hilft Medyra bei einer Ablehnung?',
    a: 'Medyra erklärt, was abgelehnt wurde, warum und welche Frist für einen Widerspruch gilt. Dazu bekommen Sie passende Fragen für Ihre Kasse. Rechtsberatung ersetzt das nicht.',
  },
  {
    q: 'Versteht Medyra auch private Krankenversicherungen?',
    a: 'Ja. Auch PKV-Briefe, Beihilfe-Bescheide und Rechnungserstattungen werden erkannt und verständlich erklärt.',
  },
  {
    q: 'Sind meine Daten sicher?',
    a: 'Ja. Verschlüsselte Verarbeitung, DSGVO-konformes Hosting in Frankfurt, automatische Löschung nach 30 Tagen (auf Wunsch sofort).',
  },
]

export default function KrankenkassePage() {
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

      <AppHeader back={{ href: '/', label: 'Start' }} title="Krankenkasse verstehen" tone="amber">
        <HeaderButton href="/upload?type=insurance" tone="amber">Brief hochladen</HeaderButton>
      </AppHeader>

      {/* Dark hero */}
      <section className="relative bg-[#040C08] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 left-[18%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 68%)' }} />
          <div className="absolute -bottom-32 right-[12%] w-[420px] h-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 68%)' }} />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10 pt-16 pb-24 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs font-semibold tracking-wide mb-6">
                <span className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-pulse" />
                Bescheid · Ablehnung · Zuzahlung
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-[#E8F5F0] leading-[1.12] mb-5">
                Kassenbriefe ohne{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#34D399]">
                  Amtsdeutsch
                </span>
              </h1>
              <p className="text-[#E8F5F0]/60 text-lg leading-relaxed mb-8 max-w-lg">
                Briefe der Krankenkasse sind Bürokratie in Reinform. Medyra sagt Ihnen in klarer Sprache, was drinsteht, was es kostet und welche Frist Sie nicht verpassen dürfen. In unter 60 Sekunden.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/upload?type=insurance"
                  className="inline-flex items-center justify-center px-8 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
                >
                  Kassenbrief jetzt hochladen
                </Link>
              </div>
            </div>

            {/* Mock: insurance letter explained */}
            <div className="rounded-2xl bg-[#08130D] border border-white/10 p-6 md:p-7 shadow-2xl">
              <p className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-4">Im Brief steht</p>
              <p className="font-mono text-xs text-[#E8F5F0]/50 leading-relaxed bg-white/[0.04] border border-white/5 rounded-xl p-4 mb-5">
                "Ihrem Antrag auf Kostenübernahme kann nach § 33 SGB V nicht in vollem Umfang entsprochen werden. Gegen diesen Bescheid können Sie innerhalb eines Monats Widerspruch einlegen."
              </p>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Medyra erklärt</p>
              <div className="space-y-2.5">
                {[
                  'Die Kasse übernimmt die Kosten nur teilweise, nicht komplett.',
                  'Sie haben genau 1 Monat Zeit, um Widerspruch einzulegen.',
                  'Fragen Sie nach der genauen Begründung, das stärkt Ihren Widerspruch.',
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

      {/* What Medyra explains */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">Was Sie bekommen</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17]">
              Jeder Bescheid, klar erklärt
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {SECTIONS.map(s => (
              <div key={s.title} className="rounded-2xl border border-gray-200 bg-white p-7 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-900/5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl mb-4">
                  {s.icon}
                </div>
                <h3 className="font-bold text-[#0B1F17] mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jargon */}
      <section className="py-16 md:py-24 bg-[#F3FAF6]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">Beispiele</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17] mb-3">
              Amtsdeutsch, übersetzt
            </h2>
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

      <FeatureCluster current="/krankenkasse" pageName="Krankenkasse verstehen" />

      {/* CTA band */}
      <section className="py-16 md:py-20 bg-[#040C08]">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#E8F5F0] mb-4">
            Verpassen Sie keine Frist mehr
          </h2>
          <p className="text-[#E8F5F0]/55 mb-8 max-w-lg mx-auto">
            3 Dokumente pro Monat kostenlos. DSGVO-konform, verschlüsselt, automatisch gelöscht.
          </p>
          <Link
            href="/upload?type=insurance"
            className="inline-flex items-center justify-center px-9 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
          >
            Kassenbrief erklären lassen
          </Link>
          <p className="text-xs text-[#E8F5F0]/30 mt-6 leading-relaxed max-w-md mx-auto">
            Medyra ersetzt keine Rechts- oder Sozialberatung.
          </p>
        </div>
      </section>
    </div>
  )
}
