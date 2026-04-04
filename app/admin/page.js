'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import {
  Users, FileText, DollarSign, TrendingUp, RefreshCw,
  Crown, Shield, AlertCircle, MessageSquare, Zap, ExternalLink
} from 'lucide-react'
import dynamic from 'next/dynamic'

const AdminChart = dynamic(() => import('@/components/AdminChart'), {
  ssr: false,
  loading: () => <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">Loading chart…</div>,
})

const ADMIN_EMAIL = 'abralur28@gmail.com'
const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

const TIER_COLORS = {
  free: 'bg-gray-100 text-gray-700',
  onetime: 'bg-blue-100 text-blue-700',
  personal: 'bg-indigo-100 text-indigo-700',
  family: 'bg-purple-100 text-purple-700',
  clinic: 'bg-green-100 text-green-700',
}

function StatCard({ title, value, sub, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function TierBadge({ tier }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${TIER_COLORS[tier] || TIER_COLORS.free}`}>
      {tier || 'free'}
    </span>
  )
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}


export default function AdminPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [encVerify, setEncVerify] = useState(null)
  const [encLoading, setEncLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/admin/stats')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const json = await res.json()
      setData(json)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auth guard
  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.replace('/'); return }
    const email = user.emailAddresses?.[0]?.emailAddress
    if (email !== ADMIN_EMAIL) { router.replace('/'); return }
    fetchStats()
  }, [isLoaded, user, router, fetchStats])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchStats, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchStats])


  if (!isLoaded || (loading && !data)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading admin dashboard…</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-gray-800 font-medium mb-1">Failed to load stats</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { users, reports, revenue, subscriptionBreakdown, recentUsers, recentReports, chartData, chatStats } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">Medyra · {user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-xs text-gray-400 hidden sm:block">
                Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => { setLoading(true); fetchStats() }}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={users.total.toLocaleString()}
            sub={`+${users.today} today · +${users.thisWeek} this week`}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Reports Analyzed"
            value={reports.total.toLocaleString()}
            sub={`+${reports.today} today · avg ${reports.avgPerUser}/user`}
            icon={FileText}
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={`€${revenue.total}`}
            sub={`€${revenue.thisMonth} this month`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Paid Users"
            value={revenue.paidUsers.toLocaleString()}
            sub={`${revenue.freeUsers} on free plan`}
            icon={Crown}
            color="orange"
          />
        </div>

        {/* AI Usage panel */}
        {chatStats && (
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Stats */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-sm font-semibold text-gray-700">Medyra AI — Chat Usage</h2>
                </div>
                <a
                  href="https://console.anthropic.com/settings/usage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                >
                  Anthropic Console <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-700">{chatStats.total.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Total questions</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-2xl font-bold text-blue-700">{chatStats.thisMonth.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-0.5">This month</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-2xl font-bold text-purple-700">{chatStats.today.toLocaleString()}</p>
                  <p className="text-xs text-purple-600 mt-0.5">Today</p>
                </div>
              </div>
              {/* Estimated cost */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-orange-800">
                      Estimated AI cost: <span className="text-orange-600">${chatStats.estimatedCostUSD} USD</span>
                    </p>
                    <p className="text-xs text-orange-600 mt-0.5">
                      Based on ~1,200 input + 350 output tokens/message at claude-sonnet-4-6 pricing ($3/M input · $15/M output).
                      Actual cost may vary. Check your{' '}
                      <a href="https://console.anthropic.com/settings/billing" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                        Anthropic billing
                      </a>{' '}
                      for exact figures.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top chatters */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Most Active AI Users</h2>
              {chatStats.topChatters && chatStats.topChatters.length > 0 ? (
                <div className="space-y-3">
                  {chatStats.topChatters.map((u, i) => (
                    <div key={u.email} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 font-medium truncate">{u.email}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${Math.min(100, (u.count / (chatStats.topChatters[0]?.count || 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">{u.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No chat activity yet</p>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Free: 5 · One-Time: 15 · Personal: 50 · Family/Clinic: 100
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chart + Subscription breakdown */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Line chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Activity — Last 30 Days</h2>
            <AdminChart data={chartData} />
          </div>

          {/* Subscription breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Plan Breakdown</h2>
            <div className="space-y-3">
              {subscriptionBreakdown.length > 0 ? subscriptionBreakdown.map(s => (
                <div key={s.tier} className="flex items-center justify-between">
                  <TierBadge tier={s.tier} />
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, (s.count / users.total) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 w-6 text-right">{s.count}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-400">No data</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
              <span>Active subscriptions</span>
              <span className="font-semibold text-gray-800">{revenue.activeSubscriptions}</span>
            </div>
          </div>
        </div>

        {/* Recent users table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Recent Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Plan</th>
                  <th className="px-5 py-3 text-left">Reports</th>
                  <th className="px-5 py-3 text-left">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentUsers.length > 0 ? recentUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-800 font-medium max-w-[200px] truncate">{u.email}</td>
                    <td className="px-5 py-3"><TierBadge tier={u.tier} /></td>
                    <td className="px-5 py-3 text-gray-600">{u.reportCount}</td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400">No users yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent reports table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Recent Reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">File</th>
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentReports.length > 0 ? recentReports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-800 font-medium max-w-[200px] truncate">{r.fileName}</td>
                    <td className="px-5 py-3 text-gray-500 max-w-[180px] truncate">{r.userEmail}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        r.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : r.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400">No reports yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ENCRYPTION VERIFICATION ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <h2 className="font-semibold text-gray-800">Encryption Verification</h2>
              <span className="text-xs text-gray-400">— proves what MongoDB actually stores</span>
            </div>
            <button
              onClick={async () => {
                setEncLoading(true)
                try {
                  const res = await fetch('/api/admin/verify-encryption')
                  const json = await res.json()
                  setEncVerify(json)
                } catch { setEncVerify({ error: 'Failed to fetch' }) }
                finally { setEncLoading(false) }
              }}
              disabled={encLoading}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
            >
              {encLoading ? 'Checking…' : 'Run Verification'}
            </button>
          </div>

          {!encVerify && !encLoading && (
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              Click "Run Verification" to inspect raw MongoDB documents and confirm all fields are ciphertext.
            </div>
          )}

          {encVerify && !encVerify.error && (
            <div className="p-6 space-y-4">
              {/* Summary */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${encVerify.status === 'ENCRYPTED' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`text-2xl`}>{encVerify.status === 'ENCRYPTED' ? '✅' : '⚠️'}</div>
                <div>
                  <p className={`font-bold text-sm ${encVerify.status === 'ENCRYPTED' ? 'text-emerald-700' : 'text-red-700'}`}>{encVerify.status}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Encryption key configured: <strong>{encVerify.encryptionKeyConfigured ? 'Yes' : 'NO — add ENCRYPTION_KEY to Vercel env vars!'}</strong>
                    {' · '}{encVerify.totalChecked} reports checked
                  </p>
                </div>
              </div>

              {/* Per-report breakdown */}
              <div className="space-y-3">
                {encVerify.reports?.map((r, i) => (
                  <div key={r.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-3">Report {i + 1} · {new Date(r.createdAt).toLocaleDateString()}</p>
                    <div className="space-y-2">
                      {Object.entries(r.fields).map(([field, info]) => (
                        <div key={field} className="flex items-start gap-3">
                          <span className={`text-xs font-bold mt-0.5 ${info.encrypted ? 'text-emerald-600' : 'text-red-600'}`}>
                            {info.encrypted ? '🔒' : '⚠️'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-gray-600">{field}: </span>
                            <span className="text-xs text-gray-400 font-mono break-all">{info.raw}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {encVerify?.error && (
            <div className="px-6 py-4 text-sm text-red-600">{encVerify.error}</div>
          )}
        </div>

        <p className="text-xs text-gray-300 text-center pb-4">
          Auto-refreshes every 5 minutes · Admin access only
        </p>
      </main>
    </div>
  )
}
