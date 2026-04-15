export default function RangeTable({ ranges, unit }) {
  if (!ranges) return null

  const rows = [
    ranges.normal && {
      label: ranges.normal.label || 'Normal',
      min: ranges.normal.min,
      max: ranges.normal.max,
      bg: 'rgba(16,185,129,0.1)',
      border: 'rgba(16,185,129,0.3)',
      color: '#10B981',
      dot: '#10B981',
    },
    ranges.elevated && {
      label: ranges.elevated.label || 'Erhöht',
      min: ranges.elevated.min,
      max: ranges.elevated.max,
      bg: 'rgba(245,158,11,0.1)',
      border: 'rgba(245,158,11,0.3)',
      color: '#F59E0B',
      dot: '#F59E0B',
    },
    ranges.high && {
      label: ranges.high.label || 'Stark erhöht',
      min: ranges.high.min,
      max: ranges.high.max,
      bg: 'rgba(239,68,68,0.1)',
      border: 'rgba(239,68,68,0.3)',
      color: '#EF4444',
      dot: '#EF4444',
    },
    ranges.low && {
      label: ranges.low.label || 'Zu niedrig',
      min: ranges.low.min,
      max: ranges.low.max,
      bg: 'rgba(59,130,246,0.1)',
      border: 'rgba(59,130,246,0.3)',
      color: '#3B82F6',
      dot: '#3B82F6',
    },
  ].filter(Boolean)

  function formatRange(min, max) {
    const u = unit ? ` ${unit}` : ''
    if (min === null && max === null) return '—'
    if (min === null) return `< ${max}${u}`
    if (max === null) return `> ${min}${u}`
    return `${min} – ${max}${u}`
  }

  return (
    <div className="my-8">
      <h2 className="text-lg font-bold mb-4" style={{color:'#E8F5F0'}}>Referenzwerte</h2>
      <div className="rounded-xl overflow-hidden" style={{border:'1px solid rgba(16,185,129,0.15)'}}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{background:'rgba(16,185,129,0.07)', borderBottom:'1px solid rgba(16,185,129,0.15)'}}>
              <th className="text-left px-4 py-3 font-semibold" style={{color:'rgba(232,245,240,0.7)'}}>Bereich</th>
              <th className="text-right px-4 py-3 font-semibold" style={{color:'rgba(232,245,240,0.7)'}}>Wert{unit ? ` (${unit})` : ''}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                style={{
                  background: row.bg,
                  borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span style={{width:8, height:8, borderRadius:'50%', background:row.dot, display:'inline-block', flexShrink:0}} />
                    <span style={{color:row.color, fontWeight:600}}>{row.label}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right" style={{color:'rgba(232,245,240,0.85)', fontFamily:'monospace'}}>
                  {formatRange(row.min, row.max)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs mt-2" style={{color:'rgba(232,245,240,0.35)'}}>
        Referenzwerte können je nach Labor leicht abweichen. Bitte vergleichen Sie Ihren Wert immer mit dem Referenzbereich Ihres Labors.
      </p>
    </div>
  )
}
