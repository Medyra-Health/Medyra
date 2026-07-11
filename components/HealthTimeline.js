'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Area, AreaChart,
} from 'recharts'
import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'

// Known markers with curated labels, units, reference ranges and colors.
// Any value not in this list is still tracked and charted using the lab's own
// unit and reference range carried through from the report.
export const TRACKED_BIOMARKERS = [
  { key: 'hemoglobin',    label: 'Hemoglobin',    unit: 'g/dL',   normalMin: 12,  normalMax: 17.5, color: '#ef4444' },
  { key: 'leukocytes',    label: 'Leukocytes',    unit: 'G/L',    normalMin: 4,   normalMax: 10,   color: '#f43f5e' },
  { key: 'platelets',     label: 'Platelets',     unit: 'G/L',    normalMin: 150, normalMax: 400,  color: '#a855f7' },
  { key: 'ferritin',      label: 'Ferritin',      unit: 'µg/L',   normalMin: 15,  normalMax: 300,  color: '#f97316' },
  { key: 'tsh',           label: 'TSH',           unit: 'mIU/L',  normalMin: 0.4, normalMax: 4.0,  color: '#8b5cf6' },
  { key: 'hba1c',         label: 'HbA1c',         unit: '%',      normalMin: 4,   normalMax: 5.6,  color: '#3b82f6' },
  { key: 'glucose',       label: 'Glucose',       unit: 'mg/dL',  normalMin: 70,  normalMax: 99,   color: '#0ea5e9' },
  { key: 'cholesterol',   label: 'Cholesterol',   unit: 'mg/dL',  normalMin: 0,   normalMax: 200,  color: '#14b8a6' },
  { key: 'ldl',           label: 'LDL',           unit: 'mg/dL',  normalMin: 0,   normalMax: 130,  color: '#f59e0b' },
  { key: 'hdl',           label: 'HDL',           unit: 'mg/dL',  normalMin: 40,  normalMax: 100,  color: '#10b981' },
  { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL',  normalMin: 0,   normalMax: 150,  color: '#d946ef' },
  { key: 'creatinine',    label: 'Creatinine',    unit: 'mg/dL',  normalMin: 0.6, normalMax: 1.2,  color: '#64748b' },
  { key: 'vitaminD',      label: 'Vitamin D',     unit: 'nmol/L', normalMin: 50,  normalMax: 200,  color: '#eab308' },
  { key: 'vitaminB12',    label: 'Vitamin B12',   unit: 'pg/mL',  normalMin: 200, normalMax: 900,  color: '#84cc16' },
  { key: 'crp',           label: 'CRP',           unit: 'mg/L',   normalMin: 0,   normalMax: 5,    color: '#ec4899' },
  { key: 'egfr',          label: 'eGFR',          unit: 'mL/min', normalMin: 60,  normalMax: 120,  color: '#22c55e' },
]

const KNOWN = Object.fromEntries(TRACKED_BIOMARKERS.map(b => [b.key, b]))

// Palette used for markers we do not have a curated entry for.
const FALLBACK_COLORS = ['#0ea5e9', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899', '#22c55e', '#f59e0b', '#6366f1']
function fallbackColor(key) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length]
}

// Resolve display metadata for any marker key, preferring the curated entry,
// then the lab's own values stored on the biomarker sample.
export function markerMeta(key, sample = {}) {
  const known = KNOWN[key]
  if (known) return known
  return {
    key,
    label: sample.name || key.replace(/^x_/, '').replace(/_/g, ' '),
    unit: sample.unit || '',
    normalMin: sample.refLow ?? null,
    normalMax: sample.refHigh ?? null,
    color: fallbackColor(key),
  }
}

// Collect every marker that has at least one recorded value in a profile,
// with a representative sample for label/unit/range. Known markers first.
export function collectMarkers(profile) {
  const map = new Map()
  for (const entry of (profile?.biomarkers || [])) {
    for (const v of (entry.values || [])) {
      const key = v.key || v.name
      if (!key || map.has(key)) continue
      map.set(key, markerMeta(key, v))
    }
  }
  const list = [...map.values()]
  list.sort((a, b) => (KNOWN[b.key] ? 1 : 0) - (KNOWN[a.key] ? 1 : 0) || a.label.localeCompare(b.label))
  return list
}

// Latest recorded value for a marker key across a profile's history.
export function latestValue(profile, key) {
  let best = null
  for (const entry of (profile?.biomarkers || [])) {
    const t = new Date(entry.recordedAt || entry.date || 0).getTime()
    for (const v of (entry.values || [])) {
      if ((v.key || v.name) !== key) continue
      if (!best || t > best.t) best = { ...v, t }
    }
  }
  return best
}

function DeltaBadge({ delta }) {
  if (delta === null || delta === undefined || isNaN(delta)) return null
  const abs = Math.abs(delta)
  if (abs < 1) return null
  const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const colors = { up: 'text-red-500 bg-red-50', down: 'text-emerald-500 bg-emerald-50', flat: 'text-gray-400 bg-gray-50' }
  const Icon = dir === 'up' ? TrendingUp : dir === 'down' ? TrendingDown : Minus
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${colors[dir]}`}>
      <Icon className="h-3 w-3" />
      {abs.toFixed(1)}%
    </span>
  )
}

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-300">{p.name}</span>
          </span>
          <span className="font-bold text-white">{p.value?.toFixed(2)} {unit}</span>
        </div>
      ))}
    </div>
  )
}

export default function HealthTimeline({ profile }) {
  const markers = useMemo(() => collectMarkers(profile), [profile])

  const [activeKey, setActiveKey] = useState(() => markers[0]?.key || null)
  const active = markers.find(m => m.key === activeKey) || markers[0]

  // Build chart data for the active marker in chronological order.
  const chartData = useMemo(() => {
    if (!active) return []
    return (profile?.biomarkers || [])
      .map(entry => {
        const match = (entry.values || []).find(v => (v.key || v.name) === active.key)
        if (!match) return null
        const value = parseFloat(match.value)
        if (isNaN(value)) return null
        return {
          date: new Date(entry.recordedAt || entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
          t: new Date(entry.recordedAt || entry.date).getTime(),
          value,
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.t - b.t)
  }, [profile, active])

  if (!active) {
    return (
      <div className="h-40 flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center px-4">
        <TrendingUp className="h-8 w-8 text-gray-300 mb-2" />
        <p className="text-sm font-semibold text-gray-400">No tracked values yet</p>
        <p className="text-xs text-gray-300 mt-1">Assign a report with lab values to this profile to start tracking</p>
      </div>
    )
  }

  const hasData = chartData.length > 0
  const hasRange = active.normalMin != null && active.normalMax != null

  let delta = null
  if (chartData.length >= 2) {
    const first = chartData[0].value
    const last = chartData[chartData.length - 1].value
    if (first) delta = ((last - first) / first) * 100
  }

  const latest = chartData[chartData.length - 1]?.value
  const isOutOfRange = hasRange && latest != null && (latest < active.normalMin || latest > active.normalMax)

  return (
    <div className="space-y-4">
      {/* Marker selector — every marker with recorded data */}
      <div className="flex flex-wrap gap-2">
        {markers.map(m => (
          <button
            key={m.key}
            onClick={() => setActiveKey(m.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeKey === m.key
                ? 'text-white border-transparent shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800'
            }`}
            style={activeKey === m.key ? { backgroundColor: m.color, borderColor: m.color } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-800 capitalize">{active.label}</p>
          <p className="text-xs text-gray-400">
            {hasRange ? `Normal range: ${active.normalMin}–${active.normalMax} ${active.unit}` : `Tracking over time${active.unit ? ` · ${active.unit}` : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {latest != null && (
            <span className={`text-lg font-black ${isOutOfRange ? 'text-red-500' : 'text-gray-800'}`}>
              {latest.toFixed(2)} <span className="text-xs font-normal text-gray-400">{active.unit}</span>
            </span>
          )}
          {delta !== null && <DeltaBadge delta={delta} />}
          {isOutOfRange && <AlertCircle className="h-4 w-4 text-red-500" />}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id={`grad-${active.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={active.color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={active.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip unit={active.unit} />} />
              {hasRange && active.normalMin > 0 && (
                <ReferenceLine y={active.normalMin} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: 'min', fontSize: 9, fill: '#10b981' }} />
              )}
              {hasRange && (
                <ReferenceLine y={active.normalMax} stroke="#f97316" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: 'max', fontSize: 9, fill: '#f97316' }} />
              )}
              <Area
                type="monotone" dataKey="value" name={active.label}
                stroke={active.color} strokeWidth={2.5} fill={`url(#grad-${active.key})`}
                dot={{ fill: active.color, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <TrendingUp className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-400">No {active.label} data yet</p>
          </div>
        )}
      </div>

      {/* Delta insight */}
      {hasData && delta !== null && (
        <div className={`flex items-start gap-3 p-3 rounded-xl text-xs ${Math.abs(delta) > 10 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'}`}>
          {Math.abs(delta) > 10 ? <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" /> : <TrendingUp className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />}
          <p className={Math.abs(delta) > 10 ? 'text-amber-700' : 'text-gray-500'}>
            {Math.abs(delta) > 10
              ? `${active.label} has changed by ${Math.abs(delta).toFixed(1)}% since your first recorded value. Consider discussing this trend with your doctor.`
              : `${active.label} has been relatively stable (${Math.abs(delta).toFixed(1)}% change since first reading).`}
          </p>
        </div>
      )}
    </div>
  )
}
