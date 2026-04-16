import { getLexikonUI } from '@/lib/lexikonUI'

export default function FeaturedSnippet({ text, accent = '#10b981', lang = 'de' }) {
  const ui = getLexikonUI(lang)
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8 shadow-sm relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: accent }} />
      <div className="pl-4">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: accent }}>
          {ui.quickExplanation}
        </p>
        <p className="text-base text-gray-700 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
