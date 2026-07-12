import Link from 'next/link'
import AppHeader, { HeaderButton } from '@/components/AppHeader'
import FeatureCluster from '@/components/FeatureCluster'

export const metadata = {
  title: 'Entlassungsbericht verstehen: Krankenhausbericht einfach erklärt | Medyra',
  description:
    'Entlassungsbericht aus dem Krankenhaus voller Abkürzungen und Fachbegriffe? Medyra erklärt Diagnosen, Therapien und Nachsorge-Anweisungen in verständlicher Sprache. In unter 60 Sekunden.',
  alternates: { canonical: 'https://medyra.de/entlassungsbericht' },
  openGraph: {
    title: 'Entlassungsbericht verstehen: Krankenhausbericht einfach erklärt',
    description: 'Medyra erklärt Krankenhausberichte und Entlassungsbriefe in verständlicher Sprache.',
    url: 'https://medyra.de/entlassungsbericht',
  },
}

const SECTIONS = [
  {
    icon: '🏥',
    title: 'Was im Krankenhaus passiert ist',
    desc: 'Aufnahmegrund, Diagnosen und durchgeführte Eingriffe, Absatz für Absatz in klare Sprache übersetzt, ohne Panik und ohne Fachchinesisch.',
  },
  {
    icon: '💊',
    title: 'Geänderte Medikamente',
    desc: 'Entlassungsberichte ändern oft die Medikation. Medyra zeigt verständlich, was neu ist, was wegfällt und worauf Sie achten sollten.',
  },
  {
    icon: '📅',
    title: 'Was Sie jetzt tun müssen',
    desc: 'Nachsorge-Termine, Kontrollen, Verhaltensregeln: die Anweisungen aus dem Bericht als klare, ruhige Liste mit Fragen für den Hausarzt.',
  },
]

const JARGON = [
  ['Z. n.', 'Zustand nach, eine frühere Erkrankung oder OP'],
  ['Procedere', 'das weitere Vorgehen, Ihr Fahrplan nach der Entlassung'],
  ['kardiopulmonal stabil', 'Herz und Lunge arbeiten normal'],
  ['reizlose Wundverhältnisse', 'die Wunde heilt gut, keine Entzündung'],
  ['Rekompensation', 'der Körper ist wieder im Gleichgewicht'],
  ['AZ und EZ', 'Allgemeinzustand und Ernährungszustand'],
]

const FAQ = [
  {
    q: 'Was kann ich hochladen?',
    a: 'Entlassungsberichte, Entlassungsbriefe, OP-Berichte und vorläufige Arztbriefe aus dem Krankenhaus, als PDF oder einfach abfotografiert mit dem Handy.',
  },
  {
    q: 'Der Bericht ist mehrere Seiten lang. Geht das?',
    a: 'Ja. Medyra fasst den gesamten Bericht zusammen und erklärt ihn Abschnitt für Abschnitt: Diagnosen, Verlauf, Medikation und die empfohlene Nachsorge.',
  },
  {
    q: 'Ersetzt das die Nachsorge beim Hausarzt?',
    a: 'Nein. Medyra hilft Ihnen, den Bericht zu verstehen und vorbereitet ins Gespräch zu gehen. Die medizinische Nachsorge gehört in ärztliche Hände.',
  },
  {
    q: 'Was passiert mit dem Bericht?',
    a: 'Verschlüsselte Verarbeitung, DSGVO-konformes Hosting in Frankfurt, automatische Löschung nach 30 Tagen (auf Wunsch sofort).',
  },
]

export default function EntlassungsberichtPage() {
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

      <AppHeader back={{ href: '/', label: 'Start' }} title="Entlassungsbericht verstehen" tone="blue">
        <HeaderButton href="/upload?type=letter" tone="blue">Bericht hochladen</HeaderButton>
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
                Entlassungsbericht · OP-Bericht · Krankenhausbrief
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-[#E8F5F0] leading-[1.12] mb-5">
                Aus dem Krankenhaus,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#34D399]">
                  aber was jetzt?
                </span>
              </h1>
              <p className="text-[#E8F5F0]/60 text-lg leading-relaxed mb-8 max-w-lg">
                Der Entlassungsbericht entscheidet, wie es nach dem Krankenhaus weitergeht. Medyra übersetzt ihn in klare Sprache: was passiert ist, welche Medikamente sich geändert haben und was Sie jetzt tun sollten.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/upload?type=letter"
                  className="inline-flex items-center justify-center px-8 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
                >
                  Bericht jetzt erklären lassen
                </Link>
              </div>
            </div>

            {/* Mock: discharge summary explained */}
            <div className="rounded-2xl bg-[#08130D] border border-white/10 p-6 md:p-7 shadow-2xl">
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-4">Im Bericht steht</p>
              <p className="font-mono text-xs text-[#E8F5F0]/50 leading-relaxed bg-white/[0.04] border border-white/5 rounded-xl p-4 mb-5">
                "Z. n. Cholezystektomie bei symptomatischer Cholezystolithiasis. Reizlose Wundverhältnisse. Procedere: Fadenzug am 10. postoperativen Tag, körperliche Schonung für 2 Wochen."
              </p>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Medyra erklärt</p>
              <div className="space-y-2.5">
                {[
                  'Ihre Gallenblase wurde wegen Gallensteinen entfernt, die Beschwerden verursacht haben.',
                  'Die Wunde heilt gut, es gibt keine Anzeichen einer Entzündung.',
                  'In etwa 10 Tagen werden die Fäden gezogen, danach 2 Wochen körperlich schonen.',
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
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Was Sie bekommen</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17]">
              Der ganze Bericht, klar erklärt
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {SECTIONS.map(s => (
              <div key={s.title} className="rounded-2xl border border-gray-200 bg-white p-7 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl mb-4">
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
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Beispiele</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17] mb-3">
              Krankenhaus-Deutsch, übersetzt
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

      <FeatureCluster current="/entlassungsbericht" pageName="Entlassungsbericht verstehen" />

      {/* CTA band */}
      <section className="py-16 md:py-20 bg-[#040C08]">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#E8F5F0] mb-4">
            Gehen Sie vorbereitet in die Nachsorge
          </h2>
          <p className="text-[#E8F5F0]/55 mb-8 max-w-lg mx-auto">
            3 Dokumente pro Monat kostenlos. DSGVO-konform, verschlüsselt, automatisch gelöscht.
          </p>
          <Link
            href="/upload?type=letter"
            className="inline-flex items-center justify-center px-9 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
          >
            Entlassungsbericht erklären lassen
          </Link>
          <p className="text-xs text-[#E8F5F0]/30 mt-6 leading-relaxed max-w-md mx-auto">
            Medyra ersetzt keine ärztliche Beratung. Besprechen Sie Ihre Nachsorge immer mit Ihrer Ärztin oder Ihrem Arzt.
          </p>
        </div>
      </section>
    </div>
  )
}
