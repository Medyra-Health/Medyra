import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'
import AppHeader, { HeaderButton } from '@/components/AppHeader'
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
    <div className="min-h-screen bg-[#F7FBFC] relative" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-cyan-100/50 rounded-full blur-3xl pointer-events-none" />
      {/* Header */}
      <AppHeader back={{ href: '/', label: 'Startseite' }} title="Laborwerte Lexikon" tone="teal">
        <HeaderButton href="/upload" tone="teal">Befund hochladen</HeaderButton>
      </AppHeader>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero, language-aware client component */}
        <LexikonHero totalCount={totalCount} />

        {/* Client searchable index */}
        <LexikonIndex entriesByCategory={entriesByCategory} />
      </main>

    </div>
  )
}
