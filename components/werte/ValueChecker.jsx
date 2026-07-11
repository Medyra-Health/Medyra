'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Search, ArrowRight, ChevronDown, X } from 'lucide-react'

// Status resolution against the lexikon range model:
// ranges = { low?, normal, elevated?, high? } each with { min, max, label }
export function resolveStatus(ranges, value) {
  if (!ranges?.normal) return null
  const n = ranges.normal
  if (n.min != null && value < n.min) return 'low'
  if (n.max != null && value <= n.max) return 'normal'
  if (ranges.elevated) {
    const eMax = ranges.elevated.max
    if (eMax == null || value <= eMax) return 'elevated'
  }
  if (ranges.high) return 'high'
  return 'elevated'
}

const STATUS_STYLES = {
  low: {
    text: 'text-blue-600', darkText: 'text-blue-400', dot: 'bg-blue-500',
    chip: 'bg-blue-50 text-blue-700 border-blue-200',
    darkChip: 'bg-blue-500/10 text-blue-300 border-blue-400/30',
    bar: '#3b82f6', icon: '↓',
  },
  normal: {
    text: 'text-emerald-600', darkText: 'text-emerald-400', dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    darkChip: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30',
    bar: '#10b981', icon: '✓',
  },
  elevated: {
    text: 'text-amber-600', darkText: 'text-amber-400', dot: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
    darkChip: 'bg-amber-500/10 text-amber-300 border-amber-400/30',
    bar: '#f59e0b', icon: '↑',
  },
  high: {
    text: 'text-red-600', darkText: 'text-red-400', dot: 'bg-red-500',
    chip: 'bg-red-50 text-red-700 border-red-200',
    darkChip: 'bg-red-500/10 text-red-300 border-red-400/30',
    bar: '#ef4444', icon: '↑↑',
  },
}

// Horizontal gauge: colored segments for each defined range + animated marker.
function RangeGauge({ ranges, value, dark }) {
  const segments = useMemo(() => {
    const defs = [
      ranges.low && { key: 'low', ...ranges.low },
      ranges.normal && { key: 'normal', ...ranges.normal },
      ranges.elevated && { key: 'elevated', ...ranges.elevated },
      ranges.high && { key: 'high', ...ranges.high },
    ].filter(Boolean)
    if (!defs.length) return null

    const span = (ranges.normal?.max ?? 1) - (ranges.normal?.min ?? 0) || 1
    const firstMin = defs[0].min ?? Math.max(0, (defs[0].max ?? 0) - span)
    const lastDef = defs[defs.length - 1]
    const lastMax = lastDef.max ?? (lastDef.min ?? 0) + span
    const total = lastMax - firstMin || 1

    let cursor = firstMin
    return {
      firstMin, lastMax, total,
      parts: defs.map(d => {
        const from = d.min ?? cursor
        const to = d.max ?? lastMax
        cursor = to
        return { key: d.key, from, to, width: Math.max(2, ((to - from) / total) * 100) }
      }),
    }
  }, [ranges])

  if (!segments) return null
  const pos = value == null
    ? null
    : Math.min(99, Math.max(1, ((value - segments.firstMin) / segments.total) * 100))

  return (
    <div className="relative pt-4 pb-1" aria-hidden="true">
      <div className="flex h-2.5 rounded-full overflow-hidden gap-[2px]">
        {segments.parts.map(p => (
          <div
            key={p.key}
            style={{ width: `${p.width}%`, background: STATUS_STYLES[p.key].bar, opacity: dark ? 0.55 : 0.35 }}
            className="h-full first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>
      {pos != null && (
        <div
          className="absolute top-0 -translate-x-1/2 transition-all duration-500 ease-out"
          style={{ left: `${pos}%` }}
        >
          <div className={`w-3.5 h-3.5 rounded-full border-2 shadow-md ${dark ? 'border-[#040C08] bg-white' : 'border-white bg-gray-900'}`} />
          <div className={`w-px h-3 mx-auto ${dark ? 'bg-white/50' : 'bg-gray-400'}`} />
        </div>
      )}
    </div>
  )
}

// Interactive lab value checker. `entries` = compact lexikon entries; when not
// provided they are fetched once from /api/werte. `preselect` pins one value
// (used on lexikon pages), `tone` switches dark (landing hero) / light styling.
export default function ValueChecker({ entries: entriesProp, preselect, tone = 'light', compact = false }) {
  const t = useTranslations()
  const dark = tone === 'dark'
  const [entries, setEntries] = useState(entriesProp || null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [rawValue, setRawValue] = useState('')
  const boxRef = useRef(null)

  useEffect(() => {
    if (entriesProp) return
    let alive = true
    fetch('/api/werte')
      .then(r => r.json())
      .then(d => { if (alive && d.entries) setEntries(d.entries) })
      .catch(() => {})
    return () => { alive = false }
  }, [entriesProp])

  useEffect(() => {
    if (preselect && entries) {
      const hit = entries.find(e => e.slug === preselect)
      if (hit) setSelected(hit)
    }
  }, [preselect, entries])

  // Close the suggestion dropdown on outside click
  useEffect(() => {
    function onDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const suggestions = useMemo(() => {
    if (!entries) return []
    const q = query.trim().toLowerCase()
    const list = q
      ? entries.filter(e =>
          e.acronym.toLowerCase().includes(q) ||
          e.name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q))
      : entries
    return list.slice(0, 8)
  }, [entries, query])

  const value = useMemo(() => {
    const v = parseFloat(rawValue.replace(',', '.'))
    return Number.isFinite(v) ? v : null
  }, [rawValue])

  const status = selected && value != null ? resolveStatus(selected.ranges, value) : null
  const s = status ? STATUS_STYLES[status] : null
  const statusLabel = status ? t(`valueChecker.status.${status}`) : null
  const causes = status === 'low'
    ? selected?.causesLow
    : (status === 'elevated' || status === 'high') ? selected?.causesElevated : null

  const inputBase = dark
    ? 'bg-white/[0.06] border-white/15 text-[#E8F5F0] placeholder-[#E8F5F0]/35 focus:border-emerald-400/60'
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-400'
  const popular = ['tsh', 'hba1c', 'ferritin', 'ldl', 'crp', 'haemoglobin']

  return (
    <div ref={boxRef} className="w-full">
      {/* Pickers */}
      <div className="grid sm:grid-cols-[1.4fr,1fr] gap-3">
        {/* Value selector */}
        <div className="relative">
          {selected && !open ? (
            <button
              type="button"
              onClick={() => { if (!preselect) { setOpen(true); setQuery('') } }}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-4 h-12 text-left transition-colors ${inputBase} ${preselect ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className="flex items-baseline gap-2 min-w-0">
                <span className="font-bold text-sm">{selected.acronym}</span>
                <span className={`text-xs truncate ${dark ? 'text-[#E8F5F0]/45' : 'text-gray-400'}`}>{selected.name}</span>
              </span>
              {!preselect && <ChevronDown className={`h-4 w-4 flex-shrink-0 ${dark ? 'text-[#E8F5F0]/40' : 'text-gray-400'}`} />}
            </button>
          ) : (
            <div className={`flex items-center rounded-xl border px-4 h-12 transition-colors ${inputBase}`}>
              <Search className={`h-4 w-4 mr-2 flex-shrink-0 ${dark ? 'text-[#E8F5F0]/40' : 'text-gray-400'}`} />
              <input
                value={query}
                onFocus={() => setOpen(true)}
                onChange={e => { setQuery(e.target.value); setOpen(true) }}
                placeholder={t('valueChecker.searchPlaceholder')}
                className="w-full bg-transparent outline-none text-sm"
                aria-label={t('valueChecker.searchPlaceholder')}
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Clear">
                  <X className={`h-3.5 w-3.5 ${dark ? 'text-[#E8F5F0]/40' : 'text-gray-400'}`} />
                </button>
              )}
            </div>
          )}

          {open && (
            <div className={`absolute z-30 mt-2 w-full rounded-xl border shadow-xl overflow-hidden ${
              dark ? 'bg-[#0B1F17] border-white/10 shadow-black/40' : 'bg-white border-gray-200 shadow-gray-200/60'
            }`}>
              {!entries ? (
                <p className={`px-4 py-3 text-sm ${dark ? 'text-[#E8F5F0]/50' : 'text-gray-400'}`}>…</p>
              ) : suggestions.length === 0 ? (
                <p className={`px-4 py-3 text-sm ${dark ? 'text-[#E8F5F0]/50' : 'text-gray-400'}`}>{t('valueChecker.noResults')}</p>
              ) : suggestions.map(e => (
                <button
                  key={e.slug}
                  type="button"
                  onClick={() => { setSelected(e); setOpen(false); setQuery('') }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    dark ? 'hover:bg-emerald-500/10 text-[#E8F5F0]' : 'hover:bg-emerald-50 text-gray-800'
                  }`}
                >
                  <span className="flex items-baseline gap-2 min-w-0">
                    <span className="font-semibold">{e.acronym}</span>
                    <span className={`text-xs truncate ${dark ? 'text-[#E8F5F0]/40' : 'text-gray-400'}`}>{e.name}</span>
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                    dark ? 'bg-white/5 text-[#E8F5F0]/40' : 'bg-gray-100 text-gray-400'
                  }`}>{e.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Numeric input with unit suffix */}
        <div className={`flex items-center rounded-xl border px-4 h-12 transition-colors ${inputBase}`}>
          <input
            inputMode="decimal"
            value={rawValue}
            onChange={e => setRawValue(e.target.value.replace(/[^\d.,]/g, ''))}
            placeholder={t('valueChecker.valuePlaceholder')}
            className="w-full bg-transparent outline-none text-sm font-semibold"
            aria-label={t('valueChecker.valuePlaceholder')}
          />
          {selected?.unit && (
            <span className={`text-xs font-medium flex-shrink-0 ml-2 ${dark ? 'text-[#E8F5F0]/40' : 'text-gray-400'}`}>
              {selected.unit}
            </span>
          )}
        </div>
      </div>

      {/* Popular quick picks (only before a selection, only in full mode) */}
      {!selected && !compact && entries && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className={`text-xs mr-1 ${dark ? 'text-[#E8F5F0]/40' : 'text-gray-400'}`}>{t('valueChecker.popular')}</span>
          {popular.map(slug => {
            const e = entries.find(x => x.slug === slug)
            if (!e) return null
            return (
              <button
                key={slug}
                type="button"
                onClick={() => setSelected(e)}
                className={`px-2.5 py-1 rounded-full border text-xs font-semibold transition-colors ${
                  dark
                    ? 'border-white/15 text-[#E8F5F0]/60 hover:border-emerald-400/50 hover:text-emerald-300'
                    : 'border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {e.acronym}
              </button>
            )
          })}
        </div>
      )}

      {/* Result */}
      {selected && (
        <div
          key={`${selected.slug}-${status || 'empty'}`}
          className={`mt-4 rounded-2xl border p-5 transition-all ${
            dark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-gray-200 shadow-sm'
          }`}
          style={{ animation: 'vcFadeIn 0.35s ease both' }}
          role="status"
        >
          {status ? (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${dark ? s.darkChip : s.chip}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  {s.icon} {statusLabel}
                </span>
                <span className={`text-xs whitespace-nowrap ${dark ? 'text-[#E8F5F0]/40' : 'text-gray-400'}`}>
                  {t('valueChecker.normalRange')}: {selected.ranges.normal.min ?? '<'}–{selected.ranges.normal.max ?? '>'} {selected.unit}
                </span>
              </div>

              <RangeGauge ranges={selected.ranges} value={value} dark={dark} />

              <p className={`text-sm leading-relaxed mt-3 ${dark ? 'text-[#E8F5F0]/70' : 'text-gray-600'}`}>
                {selected.shortAnswer}
              </p>

              {causes?.length > 0 && (
                <div className="mt-4">
                  <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${dark ? s.darkText : s.text}`}>
                    {status === 'low' ? t('valueChecker.causesLow') : t('valueChecker.causesElevated')}
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-1.5">
                    {causes.slice(0, 4).map((c, i) => (
                      <li key={i} className={`flex items-start gap-2 text-xs leading-relaxed ${dark ? 'text-[#E8F5F0]/60' : 'text-gray-500'}`}>
                        <span className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${s.dot}`} />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 mt-5">
                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center gap-1.5 px-5 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors"
                >
                  {t('valueChecker.uploadCta')} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/lexikon/${selected.slug}`}
                  className={`inline-flex items-center justify-center px-5 h-10 rounded-xl border text-sm font-semibold transition-colors ${
                    dark
                      ? 'border-white/15 text-[#E8F5F0]/70 hover:border-emerald-400/50 hover:text-emerald-300'
                      : 'border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  {t('valueChecker.learnMore', { value: selected.acronym })}
                </Link>
              </div>

              <p className={`text-[11px] leading-relaxed mt-4 ${dark ? 'text-[#E8F5F0]/30' : 'text-gray-400'}`}>
                {t('valueChecker.disclaimer')}
              </p>
            </>
          ) : (
            <p className={`text-sm ${dark ? 'text-[#E8F5F0]/50' : 'text-gray-400'}`}>
              {t('valueChecker.enterValue', { value: selected.acronym, unit: selected.unit })}
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes vcFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
