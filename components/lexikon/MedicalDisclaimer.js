import { getLexikonUI } from '@/lib/lexikonUI'

export default function MedicalDisclaimer({ lang = 'de' }) {
  const ui = getLexikonUI(lang)
  return (
    <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">⚠️</span>
        <div>
          <p className="text-xs font-bold text-amber-800 mb-1">{ui.disclaimerTitle}</p>
          <p className="text-xs text-amber-700 leading-relaxed">{ui.disclaimerText}</p>
        </div>
      </div>
    </div>
  )
}
