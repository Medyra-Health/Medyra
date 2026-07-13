'use client'

import { Search, ExternalLink } from 'lucide-react'

export default function SearchConsolePanel({ data, loading }) {
  if (loading && !data) {
    return <p className="text-sm text-gray-400 p-5">Loading Search Console data…</p>
  }

  if (!data?.configured) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <Search className="h-5 w-5 text-amber-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800">Search Console not connected</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Set <code className="bg-amber-100 px-1 rounded">SEARCH_CONSOLE_SITE_URL</code> and enable the Search Console API for the
            GA service account (see <code className="bg-amber-100 px-1 rounded">.env.example</code>).
          </p>
        </div>
      </div>
    )
  }

  if (data.status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-red-800">Search Console error</p>
        <p className="text-xs text-red-600 mt-0.5">{data.error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          <h2 className="text-sm font-semibold text-gray-700">Search Console — last 28 days</h2>
        </div>
        <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
          Open Search Console <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">{data.last28d.clicks.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-0.5">Clicks</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-2xl font-bold text-purple-700">{data.last28d.impressions.toLocaleString()}</p>
          <p className="text-xs text-purple-600 mt-0.5">Impressions</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Top queries</p>
        {data.topQueries?.length > 0 ? (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 text-left">
                <th className="pb-2 font-medium">Query</th>
                <th className="pb-2 font-medium text-right">Clicks</th>
                <th className="pb-2 font-medium text-right">Impressions</th>
                <th className="pb-2 font-medium text-right">Avg. position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.topQueries.map(q => (
                <tr key={q.query}>
                  <td className="py-1.5 text-gray-700 truncate max-w-[200px]">{q.query}</td>
                  <td className="py-1.5 text-right text-gray-800 font-semibold">{q.clicks}</td>
                  <td className="py-1.5 text-right text-gray-500">{q.impressions}</td>
                  <td className="py-1.5 text-right text-gray-500">{q.position ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-gray-400">No query data for this period</p>}
      </div>
    </div>
  )
}
