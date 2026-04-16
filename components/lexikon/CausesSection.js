import { getLexikonUI } from '@/lib/lexikonUI'

export default function CausesSection({ causesElevated, causesLow, lang = 'de' }) {
  const ui = getLexikonUI(lang)
  const hasElevated = causesElevated && causesElevated.length > 0
  const hasLow = causesLow && causesLow.length > 0
  if (!hasElevated && !hasLow) return null

  return (
    <div className="my-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-xl">🔍</span> {ui.possibleCauses}
      </h2>
      <div className={'grid gap-4 ' + (hasElevated && hasLow ? 'md:grid-cols-2' : 'grid-cols-1')}>
        {hasElevated && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-sm font-black text-red-600">↑</span>
              <h3 className="text-sm font-bold text-red-700">{ui.tooHigh}</h3>
            </div>
            <ul className="space-y-2.5">
              {causesElevated.map((cause, i) => (
                <li key={i} className="flex items-start gap-2.5 bg-white rounded-lg px-3 py-2 border border-red-100 text-sm text-gray-700">
                  <span className="text-red-400 font-bold flex-shrink-0 mt-0.5">·</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasLow && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm font-black text-blue-600">↓</span>
              <h3 className="text-sm font-bold text-blue-700">{ui.tooLow}</h3>
            </div>
            <ul className="space-y-2.5">
              {causesLow.map((cause, i) => (
                <li key={i} className="flex items-start gap-2.5 bg-white rounded-lg px-3 py-2 border border-blue-100 text-sm text-gray-700">
                  <span className="text-blue-400 font-bold flex-shrink-0 mt-0.5">·</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-3 pl-1">{ui.causesDisclaimer}</p>
    </div>
  )
}
