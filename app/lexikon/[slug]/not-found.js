import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'

export default function NotFound() {
  return (
    <div style={{background:'#040C08', minHeight:'100vh', color:'#E8F5F0'}} className="flex flex-col">
      <header style={{borderBottom:'1px solid rgba(16,185,129,0.15)', background:'rgba(4,12,8,0.95)'}} className="sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <Link href="/lexikon" style={{color:'rgba(232,245,240,0.6)'}} className="text-sm hover:text-emerald-400 transition-colors">← Lexikon</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <div className="text-6xl font-bold mb-4" style={{color:'rgba(16,185,129,0.3)'}}>404</div>
          <h1 className="text-2xl font-bold mb-3" style={{color:'#E8F5F0'}}>Laborwert nicht gefunden</h1>
          <p className="text-sm mb-8" style={{color:'rgba(232,245,240,0.6)'}}>
            Dieser Laborwert ist in unserem Lexikon noch nicht vorhanden. Schauen Sie in der Übersicht, welche Werte wir bereits erklärt haben.
          </p>
          <Link
            href="/lexikon"
            className="inline-block font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            style={{background:'#10B981', color:'#040C08'}}
          >
            Zum Lexikon
          </Link>
        </div>
      </main>
    </div>
  )
}
