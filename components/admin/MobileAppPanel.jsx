'use client'

import { Smartphone, AlertTriangle } from 'lucide-react'

export default function MobileAppPanel({ data, loading }) {
  if (loading && !data) {
    return <p className="text-sm text-gray-400 p-5">Loading mobile stats…</p>
  }
  if (!data) {
    return <p className="text-sm text-gray-400 p-5">No mobile tracking data yet.</p>
  }

  const maxScreen = data.topScreens[0]?.count || 1
  const maxPlatform = data.platformBreakdown.reduce((m, p) => Math.max(m, p.count), 1)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-sky-50 rounded-xl border border-sky-100">
          <p className="text-2xl font-bold text-sky-700">{data.opensToday.toLocaleString()}</p>
          <p className="text-xs text-sky-600 mt-0.5">Opens today</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">{data.opensThisWeek.toLocaleString()}</p>
          <p className="text-xs text-blue-600 mt-0.5">Opens this week</p>
        </div>
        <div className="text-center p-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <p className="text-2xl font-bold text-indigo-700">{data.uniqueDevices30d.toLocaleString()}</p>
          <p className="text-xs text-indigo-600 mt-0.5">Devices (30d)</p>
        </div>
        <div className={`text-center p-3 rounded-xl border ${data.errorCount7d > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className={`text-2xl font-bold ${data.errorCount7d > 0 ? 'text-red-700' : 'text-emerald-700'}`}>{data.errorCount7d}</p>
          <p className={`text-xs mt-0.5 ${data.errorCount7d > 0 ? 'text-red-600' : 'text-emerald-600'}`}>Errors this week</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Platform breakdown (30d)</p>
          {data.platformBreakdown.length > 0 ? (
            <div className="space-y-2.5">
              {data.platformBreakdown.map(p => (
                <div key={p.platform}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="capitalize text-gray-700">{p.platform}</span>
                    <span className="text-gray-500">{p.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 rounded-full" style={{ width: `${(p.count / maxPlatform) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No opens tracked yet</p>}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Top screens (30d)</p>
          {data.topScreens.length > 0 ? (
            <div className="space-y-2.5">
              {data.topScreens.map(s => (
                <div key={s.screen}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-700 font-mono truncate max-w-[160px]">{s.screen}</span>
                    <span className="text-gray-500">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(s.count / maxScreen) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No screen views tracked yet</p>}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent errors</p>
        {data.recentErrors.length > 0 ? (
          <div className="space-y-2">
            {data.recentErrors.map((e, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-100">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-red-800 font-medium truncate">{e.message}</p>
                  <p className="text-xs text-red-400 mt-0.5">
                    {e.platform} · v{e.appVersion} · {e.fatal ? 'fatal' : 'non-fatal'} · {new Date(e.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
            <Smartphone className="h-4 w-4" /> No errors reported.
          </div>
        )}
      </div>
    </div>
  )
}
