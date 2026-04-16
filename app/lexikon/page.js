import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { getEntriesByCategory } from '@/lib/lexikon'
import LexikonIndex from './LexikonIndex'

const SUPPORTED_LANGS = ['en','tr','bn','fr','ar','es','it','pt','nl','pl','zh','ja','ko','hi','ur','ru']

export const metadata = {
  title: 'Medizinisches Lexikon — Laborwerte einfach erklärt | Medyra',
  description: 'Verstehen Sie Ihre Laborwerte: CRP, HbA1c, TSH, Cholesterin und 40+ weitere Blutwerte einfach erklärt auf Deutsch. Mit Normwerten, Ursachen und Fragen für Ihren Arzt.',
  alternates: {
    canonical: 'https://medyra.de/lexikon',
    languages: {
      'de': 'https://medyra.de/lexikon',
      'x-default': 'https://medyra.de/lexikon',
      ...Object.fromEntries(SUPPORTED_LANGS.map(l => [l, `https://medyra.de/lexikon?lang=${l}`])),
    },
  },
  openGraph: {
    title: 'Medizinisches Lexikon — Laborwerte einfach erklärt',
    description: 'Verstehen Sie Ihre Laborwerte: CRP, HbA1c, TSH, Cholesterin und 40+ weitere Blutwerte einfach erklärt auf Deutsch.',
    url: 'https://medyra.de/lexikon',
  },
}

export default function LexikonPage() {
  const entriesByCategory = getEntriesByCategory()
  const totalCount = Object.values(entriesByCategory).reduce((n, arr) => n + arr.length, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <nav className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block">← Startseite</Link>
            <LanguageSwitcher />
            <Link href="/upload" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors">
              Befund hochladen
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {totalCount} Laborwerte erklärt — kostenlos & ohne Anmeldung
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Medizinisches Lexikon<br />
            <span className="text-emerald-600">Laborwerte</span> einfach erklärt
          </h1>
          <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Was bedeutet mein CRP-Wert? Warum ist TSH erhöht? Dieses Lexikon erklärt Ihre Laborwerte
            in verständlichem Deutsch — mit Normwerten, möglichen Ursachen und Fragen für Ihren nächsten Arzttermin.
          </p>
        </div>

        {/* Client searchable index */}
        <LexikonIndex entriesByCategory={entriesByCategory} />
      </main>

    </div>
  )
}
