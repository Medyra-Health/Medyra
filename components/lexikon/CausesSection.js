export default function CausesSection({ causesElevated, causesLow }) {
  const hasElevated = causesElevated && causesElevated.length > 0
  const hasLow = causesLow && causesLow.length > 0

  if (!hasElevated && !hasLow) return null

  return (
    <div className="my-8">
      <h2 className="text-lg font-bold mb-4" style={{color:'#E8F5F0'}}>Mögliche Ursachen</h2>
      <div className={`grid gap-4 ${hasElevated && hasLow ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {hasElevated && (
          <div className="rounded-xl p-5" style={{background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)'}}>
            <h3 className="text-sm font-semibold mb-3" style={{color:'#EF4444'}}>Mögliche Ursachen (erhöht)</h3>
            <ul className="space-y-2">
              {causesElevated.map((cause, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{color:'rgba(232,245,240,0.8)'}}>
                  <span style={{color:'#EF4444', marginTop:'2px', flexShrink:0}}>↑</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasLow && (
          <div className="rounded-xl p-5" style={{background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.15)'}}>
            <h3 className="text-sm font-semibold mb-3" style={{color:'#3B82F6'}}>Mögliche Ursachen (erniedrigt)</h3>
            <ul className="space-y-2">
              {causesLow.map((cause, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{color:'rgba(232,245,240,0.8)'}}>
                  <span style={{color:'#3B82F6', marginTop:'2px', flexShrink:0}}>↓</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
