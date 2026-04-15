'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Area, AreaChart,
} from 'recharts'
import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'

// Common biomarkers to track with their normal ranges and units
export const TRACKED_BIOMARKERS = [
  { key: 'hemoglobin',   label: 'Hemoglobin',  unit: 'g/dL',    normalMin: 12,  normalMax: 17.5, color: '#ef4444' },
  { key: 'ferritin',     label: 'Ferritin',    unit: 'µg/L',    normalMin: 15,  normalMax: 150,  color: '#f97316' },
  { key: 'tsh',          label: 'TSH',         unit: 'mIU/L',   normalMin: 0.4, normalMax: 4.0,  color: '#8b5cf6' },
  { key: 'hba1c',        label: 'HbA1c',       unit: '%',       normalMin: 0,   normalMax: 5.6,  color: '#3b82f6' },
  { key: 'cholesterol',  label: 'Cholesterol', unit: 'mg/dL',   normalMin: 0,   normalMax: 200,  color: '#14b8a6' },
  { key: 'vitaminD',     label: 'Vitamin D',   unit: 'nmol/L',  normalMin: 50,  normalMax: 200,  color: '#eab308' },
  { key: 'crp',          label: 'CRP',         unit: 'mg/L',    normalMin: 0,   normalMax: 5,    color: '#ec4899' },
  { key: 'egfr',         label: 'eGFR',        unit: 'mL/min',  normalMin: 60,  normalMax: 120,  color: '#22c55e' },
]

function DeltaBadge({ delta }) {
  if (delta === null || delta === undefined || isNaN(delta)) return null
  const abs = Math.abs(delta)
  const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  if (abs < 1) return null
  const colors = { up: 'text-red-500 bg-red-50', down: 'text-emerald-500 bg-emerald-50', flat: 'text-gray-400 bg-gray-50' }
  const Icon = dir === 'up' ? TrendingUp : dir === 'down' ? TrendingDown : Minus
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${colors[dir]}`}>
      <Icon className="h-3 w-3" />
      {abs.toFixed(1)}%
    </span>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
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
          <span className="font-bold text-white">{p.value?.toFixed(1)} {p.unit}</span>
        </div>
      ))}
    </div>
  )
}

export default function HealthTimeline({ profile, reports = [] }) {
  const [activeBiomarker, setActiveBiomarker] = useState(TRACKED_BIOMARKERS[0].key)

  const bm = TRACKED_BIOMARKERS.find(b => b.key === activeBiomarker) || TRACKED_BIOMARKERS[0]

  // Build chart data from profile biomarker history
  const chartData = (profile?.biomarkers || [])
    .filter(entry => entry.values?.some(v => v.name?.toLowerCase().includes(activeBiomarker.toLowerCase()) || v.key === activeBiomarker))
    .map(entry => {
      const match = entry.values?.find(v => v.name?.toLowerCase().includes(activeBiomarker.toLowerCase()) || v.key === activeBiomarker)
      return {
        date: new Date(entry.recordedAt || entry.date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
        value: parseFloat(match?.value) || null,
        status: match?.status,
      }
    })
    .filter(d => d.value !== null)

  // If no real data yet, show placeholder
  const hasData = chartData.length > 0

  // Compute delta between first and last
  let delta = null
  if (chartData.length >= 2) {
    const first = chartData[0].value
    const last = chartData[chartData.length - 1].value
    delta = ((last - first) / first) * 100
  }

  const latestValue = chartData[chartData.length - 1]?.value
  const isOutOfRange = latestValue !== null && latestValue !== undefined
    ? (latestValue < bm.normalMin || latestValue > bm.normalMax)
    : false

  return (
    <div className="space-y-4">
      {/* Biomarker selector pills */}
      <div className="flex flex-wrap gap-2">
        {TRACKED_BIOMARKERS.map(b => (
          <button
            key={b.key}
            onClick={() => setActiveBiomarker(b.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeBiomarker === b.key
                ? 'text-white border-transparent shadow-sm'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            style={activeBiomarker === b.key ? { backgroundColor: b.color, borderColor: b.color } : {}}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Chart header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-800">{bm.label}</p>
          <p className="text-xs text-gray-400">Normal range: {bm.normalMin}–{bm.normalMax} {bm.unit}</p>
        </div>
        <div className="flex items-center gap-2">
          {latestValue && (
            <span className={`text-lg font-black ${isOutOfRange ? 'text-red-500' : 'text-gray-800'}`}>
              {latestValue.toFixed(1)} <span className="text-xs font-normal text-gray-400">{bm.unit}</span>
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
                <linearGradient id={`grad-${bm.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={bm.color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={bm.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={bm.normalMin} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: 'min', fontSize: 9, fill: '#10b981' }} />
              <ReferenceLine y={bm.normalMax} stroke="#f97316" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: 'max', fontSize: 9, fill: '#f97316' }} />
              <Area
                type="monotone" dataKey="value" name={bm.label}
                stroke={bm.color} strokeWidth={2.5} fill={`url(#grad-${bm.key})`}
                dot={{ fill: bm.color, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <TrendingUp className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-400">No {bm.label} data yet</p>
            <p className="text-xs text-gray-300 mt-1">Upload a report and assign it to this profile to start tracking</p>
          </div>
        )}
      </div>

      {/* Delta insight */}
      {hasData && delta !== null && (
        <div className={`flex items-start gap-3 p-3 rounded-xl text-xs ${Math.abs(delta) > 10 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'}`}>
          {Math.abs(delta) > 10 ? <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" /> : <TrendingUp className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />}
          <p className={Math.abs(delta) > 10 ? 'text-amber-700' : 'text-gray-500'}>
            {Math.abs(delta) > 10
              ? `${bm.label} has changed by ${Math.abs(delta).toFixed(1)}% since your first recorded value. Consider discussing this trend with your doctor.`
              : `${bm.label} has been relatively stable (${Math.abs(delta).toFixed(1)}% change since first reading).`}
          </p>
        </div>
      )}
    </div>
  )
}
