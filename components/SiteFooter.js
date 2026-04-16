import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <MedyraLogo size="sm" variant="dark" />
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              Laborwerte verstehen — in Ihrer Sprache, in 60 Sekunden.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Produkt</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/upload" className="text-gray-400 hover:text-emerald-400 transition-colors">Befund hochladen</Link></li>
              <li><Link href="/prep" className="text-gray-400 hover:text-emerald-400 transition-colors">Arzttermin vorbereiten</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-emerald-400 transition-colors">Health Vault</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-emerald-400 transition-colors">Preise</Link></li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Wissen</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/lexikon" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  Medizinisches Lexikon
                </Link>
              </li>
              <li><Link href="/blog" className="text-gray-400 hover:text-emerald-400 transition-colors">Blog</Link></li>
              <li><Link href="/verstehen" className="text-gray-400 hover:text-emerald-400 transition-colors">Arztbrief verstehen</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Unternehmen</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-gray-400 hover:text-emerald-400 transition-colors">Datenschutz</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-emerald-400 transition-colors">AGB</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors">Kontakt</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Medyra. Alle Rechte vorbehalten. Made in Germany.</p>
          <p className="text-gray-700 text-xs">Kein Ersatz für ärztliche Beratung · DSGVO-konform</p>
        </div>
      </div>
    </footer>
  )
}
