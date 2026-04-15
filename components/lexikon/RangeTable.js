export default function RangeTable({ ranges, unit }) {
  if (!ranges) return null

  const rows = [
    ranges.low && {
      label: ranges.low.label || 'Zu niedrig',
      min: ranges.low.min,
      max: ranges.low.max,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      textColor: 'text-blue-700',
      dotColor: 'bg-blue-400',
      icon: '↓',
    },
    ranges.normal && {
      label: ranges.normal.label || 'Normal',
      min: ranges.normal.min,
      max: ranges.normal.max,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      textColor: 'text-emerald-700',
      dotColor: 'bg-emerald-400',
      icon: '✓',
    },
    ranges.elevated && {
      label: ranges.elevated.label || 'Leicht erhöht',
      min: ranges.elevated.min,
      max: ranges.elevated.max,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      textColor: 'text-amber-700',
      dotColor: 'bg-amber-400',
      icon: '↑',
    },
    ranges.high && {
      label: ranges.high.label || 'Stark erhöht',
      min: ranges.high.min,
      max: ranges.high.max,
      bg: 'bg-red-50',
      border: 'border-red-200',
      textColor: 'text-red-700',
      dotColor: 'bg-red-400',
      icon: '↑↑',
    },
  ].filter(Boolean)

  function formatRange(min, max) {
    const u = unit ? ` ${unit}` : ''
    if (min === null && max === null) return '—'
    if (min === null) return `unter ${max}${u}`
    if (max === null) return `über ${min}${u}`
    return `${min} – ${max}${u}`
  }

  return (
    <div className="my-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-xl">📊</span> Referenzwerte
      </h2>

      {/* Card-style rows instead of a table — easier to read on mobile */}
      <div className="space-y-2.5">
        {rows.map((row, i) => (
          <div key={i} className={`flex items-center justify-between px-4 py-3.5 rounded-xl border ${row.bg} ${row.border}`}>
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${row.dotColor}`} />
              <span className={`font-semibold text-sm ${row.textColor}`}>{row.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black ${row.textColor} opacity-60`}>{row.icon}</span>
              <span className="font-mono text-sm font-bold text-gray-700">{formatRange(row.min, row.max)}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 pl-1">
        ℹ️ Referenzwerte können je nach Labor leicht abweichen. Vergleichen Sie Ihren Wert immer mit dem Referenzbereich Ihres Labors.
      </p>
    </div>
  )
}
