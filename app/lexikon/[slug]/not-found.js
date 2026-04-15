import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <Link href="/lexikon" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">← Lexikon</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto mb-6 text-4xl">🔬</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Laborwert nicht gefunden</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            Dieser Laborwert ist in unserem Lexikon noch nicht vorhanden. Schauen Sie in der Übersicht, welche Werte wir bereits erklärt haben.
          </p>
          <Link
            href="/lexikon"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-7 py-3 rounded-xl text-sm transition-colors"
          >
            Zum Lexikon →
          </Link>
        </div>
      </main>
    </div>
  )
}
