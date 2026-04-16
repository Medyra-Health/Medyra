import Link from 'next/link'
import { getLexikonUI } from '@/lib/lexikonUI'

export default function DoctorCTA({ slug, lang = 'de' }) {
  const ui = getLexikonUI(lang)
  return (
    <div className="my-10 rounded-2xl overflow-hidden border border-emerald-200 shadow-sm">
      <div className="bg-emerald-500 px-6 py-4">
        <p className="text-white font-bold text-base">{ui.ctaHeading}</p>
      </div>
      <div className="bg-emerald-50 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-emerald-800 leading-relaxed flex-1">{ui.ctaBody}</p>
        <Link href={'/upload?source=lexikon&term=' + slug}
          className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap shadow-sm">
          {ui.ctaButton}
        </Link>
      </div>
    </div>
  )
}
