import Link from 'next/link'
import AppHeader, { HeaderButton } from '@/components/AppHeader'

export const metadata = {
  title: 'Deutscher Befund, erklärt in Ihrer Sprache: 17 Sprachen | Medyra',
  description:
    'Deutschen Arztbrief oder Laborbefund erhalten, aber die Sprache ist eine Hürde? Medyra erklärt deutsche medizinische Dokumente auf Türkisch, Arabisch, Englisch, Russisch, Polnisch und 12 weiteren Sprachen.',
  alternates: { canonical: 'https://medyra.de/sprachen' },
  openGraph: {
    title: 'Deutscher Befund, erklärt in Ihrer Sprache',
    description: 'Medyra erklärt deutsche medizinische Dokumente in 17 Sprachen.',
    url: 'https://medyra.de/sprachen',
  },
}

// Native-language value proposition, one line each
const LANGS = [
  { label: 'English', line: 'Your German medical report, explained in plain English.', rtl: false },
  { label: 'Türkçe', line: 'Almanca tıbbi raporunuz, anlaşılır Türkçe ile açıklanır.', rtl: false },
  { label: 'العربية', line: 'تقريرك الطبي الألماني، مشروحاً بالعربية بلغة بسيطة.', rtl: true },
  { label: 'Русский', line: 'Ваш немецкий медицинский документ, объяснённый по-русски.', rtl: false },
  { label: 'Polski', line: 'Twój niemiecki wynik badania, wyjaśniony po polsku.', rtl: false },
  { label: 'Español', line: 'Tu informe médico alemán, explicado en español sencillo.', rtl: false },
  { label: 'Français', line: 'Votre compte rendu médical allemand, expliqué en français.', rtl: false },
  { label: 'Italiano', line: 'Il tuo referto medico tedesco, spiegato in italiano.', rtl: false },
  { label: 'Português', line: 'O seu relatório médico alemão, explicado em português.', rtl: false },
  { label: 'Nederlands', line: 'Uw Duitse medische verslag, uitgelegd in het Nederlands.', rtl: false },
  { label: '中文', line: '您的德国医疗报告，用简明中文解释。', rtl: false },
  { label: '日本語', line: 'ドイツの医療報告書を、わかりやすい日本語で説明します。', rtl: false },
  { label: '한국어', line: '독일 의료 보고서를 쉬운 한국어로 설명해 드립니다.', rtl: false },
  { label: 'हिन्दी', line: 'आपकी जर्मन मेडिकल रिपोर्ट, सरल हिन्दी में समझाई गई।', rtl: false },
  { label: 'اردو', line: 'آپ کی جرمن طبی رپورٹ، آسان اردو میں سمجھائی گئی۔', rtl: true },
  { label: 'বাংলা', line: 'আপনার জার্মান মেডিকেল রিপোর্ট, সহজ বাংলায় ব্যাখ্যা করা।', rtl: false },
  { label: 'Deutsch', line: 'Ihr Befund, in einfacher Sprache statt Fachchinesisch.', rtl: false },
]

const STEPS = [
  { n: 1, title: 'Sprache wählen', desc: 'Oben rechts Ihre Sprache einstellen, einmal, dann bleibt sie gespeichert.' },
  { n: 2, title: 'Deutsches Dokument hochladen', desc: 'Laborbefund, Arztbrief, Medikationsplan oder Krankenkassen-Brief, als PDF oder Foto.' },
  { n: 3, title: 'Erklärung in Ihrer Sprache', desc: 'Die komplette Erklärung samt Arztfragen erscheint in Ihrer Sprache. Deutsche Fachbegriffe bleiben erkennbar in Klammern.' },
]

export default function SprachenPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`.font-display { font-family: var(--font-playfair), Georgia, serif; }`}</style>

      <AppHeader back={{ href: '/', label: 'Start' }} title="17 Sprachen" tone="emerald">
        <HeaderButton href="/upload" tone="emerald">Befund hochladen</HeaderButton>
      </AppHeader>

      {/* Dark hero */}
      <section className="relative bg-[#040C08] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 left-[20%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 68%)' }} />
          <div className="absolute -bottom-32 right-[15%] w-[420px] h-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 68%)' }} />
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10 pt-16 pb-24 md:pt-24 md:pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Für alle, die in Deutschland leben
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-[#E8F5F0] leading-[1.1] mb-6">
            Deutscher Befund.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#34D399]">
              Ihre Sprache.
            </span>
          </h1>
          <p className="text-[#E8F5F0]/60 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Millionen Menschen in Deutschland bekommen medizinische Dokumente in einer Sprache, die nicht ihre Muttersprache ist. Medyra erklärt deutsche Befunde in 17 Sprachen, medizinisch präzise und verständlich.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center px-9 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
          >
            Jetzt kostenlos ausprobieren
          </Link>
        </div>
        <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* Language grid with native lines */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">17 Sprachen</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17]">
              In Ihren Worten
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LANGS.map(l => (
              <div
                key={l.label}
                dir={l.rtl ? 'rtl' : 'ltr'}
                className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">{l.label}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{l.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-[#F3FAF6]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">So funktioniert es</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17]">
              Drei Schritte zur Klarheit
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(s => (
              <div key={s.n} className="rounded-2xl bg-white border border-gray-200 p-7 text-center">
                <span className="inline-flex w-10 h-10 rounded-full bg-emerald-500 text-white font-black items-center justify-center mb-4">
                  {s.n}
                </span>
                <h3 className="font-bold text-[#0B1F17] mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-10 max-w-xl mx-auto leading-relaxed">
            Auch der Frage-Chat antwortet in Ihrer Sprache: Stellen Sie Ihre Rückfrage auf Türkisch, Arabisch oder Polnisch und Medyra antwortet genauso.
          </p>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-16 md:py-20 bg-[#040C08]">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#E8F5F0] mb-4">
            Gesundheit sollte keine Sprachbarriere haben
          </h2>
          <p className="text-[#E8F5F0]/55 mb-8 max-w-lg mx-auto">
            3 Dokumente pro Monat kostenlos. DSGVO-konform, verschlüsselt, automatisch gelöscht.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center px-9 h-12 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-base font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
          >
            Befund in meiner Sprache erklären
          </Link>
        </div>
      </section>
    </div>
  )
}
