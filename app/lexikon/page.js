import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'
import { getEntriesByCategory } from '@/lib/lexikon'
import LexikonIndex from './LexikonIndex'

export const metadata = {
  title: 'Medizinisches Lexikon — Laborwerte einfach erklärt | Medyra',
  description: 'Verstehen Sie Ihre Laborwerte: CRP, HbA1c, TSH, Cholesterin und 40+ weitere Blutwerte einfach erklärt auf Deutsch. Mit Normwerten, Ursachen und Fragen für Ihren Arzt.',
  alternates: {
    canonical: 'https://medyra.de/lexikon',
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
    <div style={{background:'#040C08', minHeight:'100vh', color:'#E8F5F0'}}>
      {/* Header */}
      <header style={{borderBottom:'1px solid rgba(16,185,129,0.15)', background:'rgba(4,12,8,0.95)'}} className="sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" style={{color:'rgba(232,245,240,0.6)'}} className="hover:text-emerald-400 transition-colors">← Startseite</Link>
            <Link href="/upload" style={{background:'#10B981', color:'#040C08'}} className="font-bold px-4 py-1.5 rounded-lg text-xs">Befund hochladen</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4" style={{background:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.2)'}}>
            {totalCount} Laborwerte erklärt
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight" style={{color:'#E8F5F0'}}>
            Medizinisches Lexikon —<br />
            <span style={{color:'#10B981'}}>Laborwerte</span> einfach erklärt
          </h1>
          <p className="text-base max-w-2xl mx-auto" style={{color:'rgba(232,245,240,0.65)'}}>
            Was bedeutet mein CRP-Wert? Warum ist TSH erhöht? Dieses Lexikon erklärt Ihre Laborwerte in verständlichem Deutsch — mit Normwerten, möglichen Ursachen und Fragen für Ihren nächsten Arzttermin.
          </p>
        </div>

        {/* Client searchable index */}
        <LexikonIndex entriesByCategory={entriesByCategory} />
      </main>

      <footer
        style={{borderTop:'1px solid rgba(16,185,129,0.1)', color:'rgba(232,245,240,0.3)'}}
        className="py-6 text-center text-xs mt-8"
      >
        © 2026 Medyra ·{' '}
        <Link href="/privacy" className="hover:text-emerald-400">Datenschutz</Link>
        {' · '}
        <Link href="/terms" className="hover:text-emerald-400">AGB</Link>
      </footer>
    </div>
  )
}
