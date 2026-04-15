'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import DoctorCTA from '@/components/lexikon/DoctorCTA'

const CATEGORY_COLORS = {
  'Blutbild':         { bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-400',    pill: 'bg-red-100 text-red-700',    badge: 'bg-red-500'    },
  'Leberwerte':       { bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-400',  pill: 'bg-amber-100 text-amber-700',  badge: 'bg-amber-500'  },
  'Nierenwerte':      { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-400',   pill: 'bg-blue-100 text-blue-700',    badge: 'bg-blue-500'   },
  'Entzündungswerte': { bg: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-400', pill: 'bg-orange-100 text-orange-700', badge: 'bg-orange-500' },
  'Stoffwechsel':     { bg: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-400', pill: 'bg-violet-100 text-violet-700', badge: 'bg-violet-500' },
  'Schilddrüse':      { bg: 'bg-teal-50',    border: 'border-teal-200',   text: 'text-teal-700',   dot: 'bg-teal-400',   pill: 'bg-teal-100 text-teal-700',    badge: 'bg-teal-500'   },
  'Elektrolyte':      { bg: 'bg-sky-50',     border: 'border-sky-200',    text: 'text-sky-700',    dot: 'bg-sky-400',    pill: 'bg-sky-100 text-sky-700',      badge: 'bg-sky-500'    },
  'Eisenwerte':       { bg: 'bg-rose-50',    border: 'border-rose-200',   text: 'text-rose-700',   dot: 'bg-rose-400',   pill: 'bg-rose-100 text-rose-700',    badge: 'bg-rose-500'   },
  'Vitamine':         { bg: 'bg-yellow-50',  border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400', pill: 'bg-yellow-100 text-yellow-700', badge: 'bg-yellow-500' },
  'Gerinnung':        { bg: 'bg-indigo-50',  border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-400', pill: 'bg-indigo-100 text-indigo-700', badge: 'bg-indigo-500' },
  'Urinwerte':        { bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',dot: 'bg-emerald-400',pill: 'bg-emerald-100 text-emerald-700',badge:'bg-emerald-500'},
}
const DEFAULT_COLOR = { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', dot: 'bg-gray-400', pill: 'bg-gray-100 text-gray-700', badge: 'bg-gray-500' }

const CATEGORY_ORDER = [
  'Blutbild','Leberwerte','Nierenwerte','Entzündungswerte',
  'Stoffwechsel','Schilddrüse','Elektrolyte','Eisenwerte',
  'Vitamine','Gerinnung','Urinwerte',
]

export default function LexikonIndex({ entriesByCategory }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return entriesByCategory
    const q = query.toLowerCase()
    const result = {}
    for (const [cat, entries] of Object.entries(entriesByCategory)) {
      const matched = entries.filter(e =>
        e.acronym.toLowerCase().includes(q) ||
        e.fullName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      )
      if (matched.length > 0) result[cat] = matched
    }
    return result
  }, [query, entriesByCategory])

  const sortedCategories = CATEGORY_ORDER.filter(c => filtered[c])
    .concat(Object.keys(filtered).filter(c => !CATEGORY_ORDER.includes(c)))

  const totalEntries = Object.values(filtered).reduce((n, arr) => n + arr.length, 0)

  return (
    <div>
      {/* Search bar */}
      <div className="mb-10">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Laborwert suchen, z. B. CRP, Hämoglobin, TSH …"
            className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm bg-white border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-gray-800 placeholder-gray-400 transition-colors shadow-sm"
          />
        </div>
        {query && (
          <p className="text-sm mt-2.5 text-gray-500 pl-1">
            {totalEntries === 0
              ? 'Kein Laborwert gefunden — versuchen Sie einen anderen Suchbegriff.'
              : <><span className="font-semibold text-emerald-600">{totalEntries}</span> Ergebnis{totalEntries !== 1 ? 'se' : ''} für „{query}"</>}
          </p>
        )}
      </div>

      {/* Category groups */}
      {sortedCategories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-3">🔬</div>
          <p className="text-lg font-semibold text-gray-600 mb-1">Kein Laborwert gefunden</p>
          <p className="text-sm text-gray-400">Versuchen Sie einen anderen Suchbegriff, z. B. CRP, TSH oder Cholesterin.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedCategories.map(category => {
            const c = CATEGORY_COLORS[category] || DEFAULT_COLOR
            return (
              <section key={category} className={`rounded-2xl border-2 ${c.border} ${c.bg} p-5 md:p-6`}>
                {/* Category heading */}
                <div className="flex items-center gap-2.5 mb-5">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${c.dot}`} />
                  <h2 className={`text-sm font-bold uppercase tracking-widest ${c.text}`}>{category}</h2>
                  <span className={`ml-auto text-xs font-bold text-white px-2 py-0.5 rounded-full ${c.badge}`}>
                    {filtered[category].length}
                  </span>
                </div>

                {/* Term cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered[category].map(entry => (
                    <Link
                      key={entry.slug}
                      href={`/lexikon/${entry.slug}`}
                      className="group bg-white rounded-xl p-4 border border-white hover:border-current hover:shadow-md transition-all duration-200 flex flex-col"
                      style={{ borderColor: 'transparent' }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-lg font-black ${c.text}`}>{entry.acronym}</span>
                        <span className={`text-lg group-hover:translate-x-0.5 transition-transform ${c.text} opacity-40 group-hover:opacity-100`}>→</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 leading-snug mb-1.5">{entry.fullName}</p>
                      {entry.unit && (
                        <p className="text-xs text-gray-400 mt-auto">Einheit: {entry.unit}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <div className="mt-12">
        <DoctorCTA slug="lexikon" />
      </div>
    </div>
  )
}
