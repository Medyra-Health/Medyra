'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import DoctorCTA from '@/components/lexikon/DoctorCTA'

const CATEGORY_ORDER = [
  'Blutbild',
  'Leberwerte',
  'Nierenwerte',
  'Entzündungswerte',
  'Stoffwechsel',
  'Schilddrüse',
  'Elektrolyte',
  'Eisenwerte',
  'Vitamine',
  'Gerinnung',
  'Urinwerte',
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

  const sortedCategories = CATEGORY_ORDER.filter(c => filtered[c]).concat(
    Object.keys(filtered).filter(c => !CATEGORY_ORDER.includes(c))
  )

  const totalEntries = Object.values(filtered).reduce((n, arr) => n + arr.length, 0)

  return (
    <div>
      {/* Search */}
      <div className="mb-10">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg" style={{color:'rgba(16,185,129,0.5)'}}>🔍</span>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Laborwert suchen, z. B. CRP, Hämoglobin, TSH …"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.2)',
              color: '#E8F5F0',
            }}
          />
        </div>
        {query && (
          <p className="text-xs mt-2" style={{color:'rgba(232,245,240,0.4)'}}>
            {totalEntries} Ergebnis{totalEntries !== 1 ? 'se' : ''} für „{query}"
          </p>
        )}
      </div>

      {/* Category groups */}
      {sortedCategories.length === 0 ? (
        <div className="text-center py-16" style={{color:'rgba(232,245,240,0.4)'}}>
          <p className="text-lg mb-2">Kein Laborwert gefunden</p>
          <p className="text-sm">Versuchen Sie einen anderen Suchbegriff.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {sortedCategories.map(category => (
            <section key={category}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest" style={{color:'#10B981'}}>{category}</h2>
                <div className="flex-1 h-px" style={{background:'rgba(16,185,129,0.15)'}} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered[category].map(entry => (
                  <Link
                    key={entry.slug}
                    href={`/lexikon/${entry.slug}`}
                    className="group block rounded-xl p-4 transition-all"
                    style={{
                      background: 'rgba(16,185,129,0.04)',
                      border: '1px solid rgba(16,185,129,0.12)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-base font-bold" style={{color:'#10B981'}}>{entry.acronym}</span>
                      <span className="text-xs mt-0.5 group-hover:translate-x-0.5 transition-transform" style={{color:'rgba(16,185,129,0.5)'}}>→</span>
                    </div>
                    <p className="text-sm font-medium mb-1.5" style={{color:'#E8F5F0'}}>{entry.fullName}</p>
                    {entry.unit && (
                      <p className="text-xs" style={{color:'rgba(232,245,240,0.4)'}}>Einheit: {entry.unit}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-12">
        <DoctorCTA slug="lexikon" />
      </div>
    </div>
  )
}
