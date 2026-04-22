import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { getEntriesByCategory } from '@/lib/lexikon'
import LexikonIndex from './LexikonIndex'
import LexikonHero from './LexikonHero'

const SUPPORTED_LANGS = ['en','tr','bn','fr','ar','es','it','pt','nl','pl','zh','ja','ko','hi','ur','ru']

export const metadata = {
  title: 'Medizinisches Lexikon, Laborwerte einfach erklärt | Medyra',
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
    title: 'Medizinisches Lexikon, Laborwerte einfach erklärt',
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
        {/* Hero, language-aware client component */}
        <LexikonHero totalCount={totalCount} />

        {/* Client searchable index */}
        <LexikonIndex entriesByCategory={entriesByCategory} />
      </main>

    </div>
  )
}
