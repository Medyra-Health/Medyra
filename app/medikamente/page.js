import Link from 'next/link'
import AppHeader, { HeaderButton } from '@/components/AppHeader'

export const metadata = {
  title: 'Medikationsplan verstehen: Medikamente einfach erklärt | Medyra',
  description:
    'Medikationsplan oder Rezept voller Abkürzungen? Medyra erklärt jedes Medikament: wofür es ist, wie Sie es einnehmen und worauf Sie achten sollten. In unter 60 Sekunden.',
  alternates: { canonical: 'https://medyra.de/medikamente' },
  openGraph: {
    title: 'Medikationsplan verstehen: Medikamente einfach erklärt',
    description: 'Medyra erklärt Medikationspläne und Rezepte in verständlicher Sprache.',
    url: 'https://medyra.de/medikamente',
  },
}

const BENEFITS = [
  {
    icon: '💊',
    title: 'Wofür ist das Medikament?',
    desc: 'Jeder Wirkstoff auf Ihrem Plan wird erklärt: was er bewirkt und warum er Ihnen wahrscheinlich verschrieben wurde.',
  },
  {
    icon: '🕐',
    title: 'Einnahme, verständlich',
    desc: '"1-0-1", "nüchtern", "zu den Mahlzeiten": Medyra übersetzt das Dosierschema in einen klaren Tagesablauf.',
  },
  {
    icon: '⚠️',
    title: 'Worauf Sie achten sollten',
    desc: 'Hinweise aus Ihrem Plan, verständlich zusammengefasst, plus die richtigen Fragen für Ihre Apotheke oder Arztpraxis.',
  },
]

const FAQ = [
  {
    q: 'Was kann ich hochladen?',
    a: 'Ihren bundeseinheitlichen Medikationsplan (BMP), Rezepte, Entlassungs-Medikationslisten oder ein Foto der Packungen mit Einnahmehinweisen, als PDF, Foto oder Text.',
  },
  {
    q: 'Erkennt Medyra Wechselwirkungen?',
    a: 'Medyra erklärt, was auf Ihrem Plan steht, und weist auf Hinweise im Dokument hin. Eine verbindliche Wechselwirkungsprüfung ersetzt das nicht: Die abschließende Prüfung gehört in Ihre Apotheke oder Arztpraxis. Medyra gibt Ihnen die richtigen Fragen dafür mit.',
  },
  {
    q: 'Ändert Medyra meine Dosierung?',
    a: 'Niemals. Medyra gibt keine Dosierungs- oder Therapieempfehlungen. Es erklärt ausschließlich verständlich, was Ihre Ärztin verordnet hat.',
  },
  {
    q: 'Sind meine Gesundheitsdaten sicher?',
    a: 'Ja. Verschlüsselte Verarbeitung, DSGVO-konformes Hosting in Frankfurt, automatische Löschung nach 30 Tagen (auf Wunsch sofort).',
  },
]

const MOCK_MEDS = [
  { name: 'Ramipril 5 mg', schedule: '1-0-0', plain: 'Blutdrucksenker. Morgens eine Tablette, am besten immer zur gleichen Zeit.' },
  { name: 'Metformin 850 mg', schedule: '1-0-1', plain: 'Senkt den Blutzucker. Morgens und abends je eine Tablette zum Essen.' },
  { name: 'Pantoprazol 20 mg', schedule: '1-0-0 nüchtern', plain: 'Magenschutz. Eine Tablette 30 Minuten vor dem Frühstück.' },
]

export default function MedikamentePage() {
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

      <AppHeader back={{ href: '/', label: 'Start' }} title="Medikamente verstehen" tone="indigo">
        <HeaderButton href="/upload?type=medication" tone="indigo">Plan hochladen</HeaderButton>
      </AppHeader>

      {/* Dark hero */}
      <section className="relative bg-[#040C08] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 left-[18%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 68%)' }} />
          <div className="absolute -bottom-32 right-[12%] w-[420px] h-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 68%)' }} />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10 pt-16 pb-24 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-400/30 bg-indigo-400/10 text-indigo-300 text-xs font-semibold tracking-wide mb-6">
                <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse" />
                Medikationsplan · Rezept · BMP
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-[#E8F5F0] leading-[1.12] mb-5">
                Wissen, was Sie{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] to-[#34D399]">
                  einnehmen und warum
                </span>
              </h1>
              <p className="text-[#E8F5F0]/60 text-lg leading-relaxed mb-8 max-w-lg">
                "1-0-1", "nüchtern", Wirkstoffnamen in Latein: Medyra erklärt Ihren Medikationsplan Medikament für Medikament, in klarer Sprache und in unter 60 Sekunden.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/upload?type=medication"
                  className="inline-flex items-center justify-center px-8 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
                >
                  Medikationsplan hochladen
                </Link>
              </div>
            </div>

            {/* Mock med list */}
            <div className="rounded-2xl bg-[#08130D] border border-white/10 p-6 md:p-7 shadow-2xl">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Medyra erklärt Ihren Plan</p>
              <div className="space-y-4">
                {MOCK_MEDS.map(m => (
                  <div key={m.name} className="border-b border-white/5 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between flex-wrap gap-x-2 gap-y-1 mb-1.5">
                      <span className="text-sm font-bold text-[#E8F5F0]">{m.name}</span>
                      <span className="font-mono text-[11px] text-indigo-300 bg-indigo-400/10 border border-indigo-400/20 rounded-full px-2 py-0.5 whitespace-nowrap">{m.schedule}</span>
                    </div>
                    <p className="text-xs text-[#E8F5F0]/60 leading-relaxed">{m.plain}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Was Sie bekommen</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17]">
              Jedes Medikament, klar erklärt
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {BENEFITS.map(b => (
              <div key={b.title} className="rounded-2xl border border-gray-200 bg-white p-7 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl mb-4">
                  {b.icon}
                </div>
                <h3 className="font-bold text-[#0B1F17] mb-2">{b.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Safety note */}
          <div className="mt-10 rounded-2xl bg-[#F3FAF6] border border-emerald-100 p-6 md:p-7 flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">🛡️</span>
            <div>
              <h3 className="font-bold text-[#0B1F17] text-sm mb-1">Sicherheit zuerst</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Medyra ändert niemals Dosierungen und gibt keine Therapieempfehlungen. Es erklärt, was Ihre Ärztin verordnet hat, damit Sie in der Apotheke und im Arztgespräch die richtigen Fragen stellen können. Setzen Sie Medikamente nie ohne ärztliche Rücksprache ab.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-[#F3FAF6]">
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

      {/* CTA band */}
      <section className="py-16 md:py-20 bg-[#040C08]">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#E8F5F0] mb-4">
            Nie wieder raten, wofür die Tablette ist
          </h2>
          <p className="text-[#E8F5F0]/55 mb-8 max-w-lg mx-auto">
            3 Dokumente pro Monat kostenlos. DSGVO-konform, verschlüsselt, automatisch gelöscht.
          </p>
          <Link
            href="/upload?type=medication"
            className="inline-flex items-center justify-center px-9 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
          >
            Medikationsplan erklären lassen
          </Link>
          <p className="text-xs text-[#E8F5F0]/30 mt-6 leading-relaxed max-w-md mx-auto">
            Medyra ersetzt keine ärztliche oder pharmazeutische Beratung.
          </p>
        </div>
      </section>
    </div>
  )
}
