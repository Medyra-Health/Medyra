'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, FileText, RefreshCw,
  Crown, Shield, AlertCircle, MessageSquare, Zap, ExternalLink, Euro, Stethoscope, CreditCard, CheckCircle, Clock, XCircle,
  Globe, MonitorSmartphone, BarChart2, Cpu, Smartphone
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import InfraStatusRow from '@/components/admin/InfraStatusRow'
import MobileAppPanel from '@/components/admin/MobileAppPanel'
import SearchConsolePanel from '@/components/admin/SearchConsolePanel'
import AdvancedTools from '@/components/admin/AdvancedTools'

const AdminChart = dynamic(() => import('@/components/AdminChart'), {
  ssr: false,
  loading: () => <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">Loading chart…</div>,
})

const GAChart = dynamic(() => import('@/components/GAChart'), {
  ssr: false,
  loading: () => <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">Loading chart…</div>,
})

const ADMIN_EMAILS = ['abralur28@gmail.com', 'philipp.mattar@googlemail.com']
const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

const TIER_COLORS = {
  free: 'bg-gray-100 text-gray-700',
  onetime: 'bg-blue-100 text-blue-700',
  personal: 'bg-indigo-100 text-indigo-700',
  family: 'bg-purple-100 text-purple-700',
  clinic: 'bg-green-100 text-green-700',
}

function StatCard({ title, value, sub, icon: Icon, color = 'blue', index = 0 }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
    >
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
    </motion.div>
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
  const [gaData, setGaData] = useState(null)
  const [gaLoading, setGaLoading] = useState(false)
  const [aiSettings, setAiSettings] = useState(null)
  const [aiLoading, setAiLoading] = useState(true)
  const [aiSaving, setAiSaving] = useState(false)
  const [aiSaveMsg, setAiSaveMsg] = useState(null)
  const [infraData, setInfraData] = useState(null)
  const [infraLoading, setInfraLoading] = useState(true)
  const [mobileStats, setMobileStats] = useState(null)
  const [mobileLoading, setMobileLoading] = useState(true)

  const fetchGA = useCallback(async () => {
    setGaLoading(true)
    try {
      const res = await fetch('/api/admin/analytics')
      if (res.ok) setGaData(await res.json())
    } catch { /* silently fail */ }
    finally { setGaLoading(false) }
  }, [])

  const fetchAiSettings = useCallback(async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/admin/ai-settings')
      if (res.ok) setAiSettings(await res.json())
    } catch { /* silently fail */ }
    finally { setAiLoading(false) }
  }, [])

  const fetchInfra = useCallback(async () => {
    setInfraLoading(true)
    try {
      const res = await fetch('/api/admin/infra')
      if (res.ok) setInfraData(await res.json())
    } catch { /* silently fail */ }
    finally { setInfraLoading(false) }
  }, [])

  const fetchMobile = useCallback(async () => {
    setMobileLoading(true)
    try {
      const res = await fetch('/api/admin/mobile-stats')
      if (res.ok) setMobileStats(await res.json())
    } catch { /* silently fail */ }
    finally { setMobileLoading(false) }
  }, [])

  function updateAiTask(task, field, value) {
    setAiSettings(prev => ({
      ...prev,
      tasks: { ...prev.tasks, [task]: { ...prev.tasks[task], [field]: value } },
    }))
  }

  async function saveAiSettings() {
    setAiSaving(true)
    setAiSaveMsg(null)
    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: aiSettings.tasks }),
      })
      const body = await res.json()
      if (res.ok) {
        setAiSaveMsg({ ok: true, text: 'Saved — takes effect on the next request (cache refreshes within 60s).' })
      } else {
        setAiSaveMsg({ ok: false, text: body.error || 'Failed to save' })
      }
    } catch (e) {
      setAiSaveMsg({ ok: false, text: e.message })
    } finally {
      setAiSaving(false)
    }
  }

  const fetchStats = useCallback(async () => {
    try {
      setError(null)
      const [res] = await Promise.all([
        fetch('/api/admin/stats'),
        fetchGA(),
        fetchAiSettings(),
        fetchInfra(),
        fetchMobile(),
      ])
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
  }, [fetchGA, fetchAiSettings, fetchInfra, fetchMobile])

  // Auth guard
  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.replace('/'); return }
    const email = user.emailAddresses?.[0]?.emailAddress
    if (!ADMIN_EMAILS.includes(email)) { router.replace('/'); return }
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

  const { users, reports, revenue, subscriptionBreakdown, recentUsers, recentReports, recentPayments, chartData, chatStats, prepStats } = data

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

        {/* Infrastructure Health — the "is anything broken" strip */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Infrastructure Health</p>
          <InfraStatusRow infra={infraData} mobile={mobileStats} loading={infraLoading} />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard index={0} title="Total Members" value={users.total.toLocaleString()} sub={`+${users.today} today · +${users.thisWeek} this week`} icon={Users} color="blue" />
          <StatCard index={1} title="Reports Analyzed" value={reports.total.toLocaleString()} sub={`+${reports.today} today · avg ${reports.avgPerUser}/member`} icon={FileText} color="purple" />
          <StatCard index={2} title="Total Revenue" value={`€${revenue.total}`} sub={`€${revenue.thisMonth} this month`} icon={Euro} color="green" />
          <StatCard index={3} title="Paid Members" value={revenue.paidUsers.toLocaleString()} sub={`${revenue.freeUsers} on free plan`} icon={Crown} color="orange" />
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="flex-wrap h-auto gap-1 bg-gray-100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="seo">Traffic & SEO</TabsTrigger>
            <TabsTrigger value="mobile">
              <span className="flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" /> Mobile App</span>
            </TabsTrigger>
            <TabsTrigger value="ai">AI Settings</TabsTrigger>
            <TabsTrigger value="users">Users & Payments</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* AI Usage panel */}
            {chatStats && (
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-emerald-600" />
                      <h2 className="text-sm font-semibold text-gray-700">Medyra AI, Chat Usage</h2>
                    </div>
                    <a href="https://console.anthropic.com/settings/usage" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
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
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-orange-800">
                          Estimated AI cost (chat): <span className="text-orange-600">≈€{(chatStats.estimatedCostUSD * 0.92).toFixed(4)}</span>
                          <span className="text-orange-400 font-normal ml-1">(${chatStats.estimatedCostUSD} USD)</span>
                        </p>
                        <p className="text-xs text-orange-600 mt-0.5">
                          Rough estimate at ~1,200 input + 350 output tokens/message. Actual model/provider is set in AI Settings.
                          Check your <a href="https://console.anthropic.com/settings/billing" target="_blank" rel="noopener noreferrer" className="underline font-medium">Anthropic billing</a> for exact figures.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Most Active AI Users</h2>
                  {chatStats.topChatters && chatStats.topChatters.length > 0 ? (
                    <div className="space-y-3">
                      {chatStats.topChatters.map((u, i) => (
                        <div key={u.email} className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 font-medium truncate">{u.email}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, (u.count / (chatStats.topChatters[0]?.count || 1)) * 100)}%` }} />
                              </div>
                              <span className="text-xs text-gray-400 flex-shrink-0">{u.count}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-400">No chat activity yet</p>}
                </div>
              </div>
            )}

            {/* Doctor Visit Prep stats */}
            {prepStats && (
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Stethoscope className="h-5 w-5 text-violet-600" />
                    <h2 className="text-sm font-semibold text-gray-700">Doctor Visit Prep, AI Summaries</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-violet-50 rounded-xl border border-violet-100">
                      <p className="text-2xl font-bold text-violet-700">{prepStats.total.toLocaleString()}</p>
                      <p className="text-xs text-violet-600 mt-0.5">Total summaries generated</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-2xl font-bold text-blue-700">{prepStats.thisMonth.toLocaleString()}</p>
                      <p className="text-xs text-blue-600 mt-0.5">This month</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Most Active, Prep Users</h2>
                  {prepStats.topUsers && prepStats.topUsers.length > 0 ? (
                    <div className="space-y-3">
                      {prepStats.topUsers.map((u, i) => (
                        <div key={u.email} className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-700 font-medium truncate">{u.email}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-400 rounded-full" style={{ width: `${Math.min(100, (u.total / (prepStats.topUsers[0]?.total || 1)) * 100)}%` }} />
                              </div>
                              <span className="text-xs text-gray-400 flex-shrink-0">{u.total}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-400">No prep activity yet</p>}
                </div>
              </div>
            )}

            {/* Chart + Subscription breakdown */}
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Activity, Last 30 Days</h2>
                <AdminChart data={chartData} />
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">Plan Breakdown</h2>
                <div className="space-y-3">
                  {subscriptionBreakdown.length > 0 ? subscriptionBreakdown.map(s => (
                    <div key={s.tier} className="flex items-center justify-between">
                      <TierBadge tier={s.tier} />
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (s.count / users.total) * 100)}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 w-6 text-right">{s.count}</span>
                      </div>
                    </div>
                  )) : <p className="text-sm text-gray-400">No data</p>}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                  <span>Active subscriptions</span>
                  <span className="font-semibold text-gray-800">{revenue.activeSubscriptions}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── TRAFFIC & SEO ── */}
          <TabsContent value="seo" className="space-y-6 mt-4">
            {gaData && !gaData.configured && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <Globe className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">Google Analytics not connected</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Add <code className="bg-amber-100 px-1 rounded">GOOGLE_APPLICATION_CREDENTIALS_JSON</code> and <code className="bg-amber-100 px-1 rounded">GA4_PROPERTY_ID</code> to Vercel env vars.
                  </p>
                </div>
              </div>
            )}

            {gaData?.configured && gaData?.summary && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-blue-500" />
                    <h2 className="text-sm font-semibold text-gray-700">Website Traffic — Google Analytics</h2>
                    <span className="text-xs text-gray-400">last 30 days</span>
                  </div>
                  <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                    Open GA4 <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Sessions', value: gaData.summary.last30.sessions.toLocaleString(), sub: `${gaData.summary.today.sessions} today` },
                    { label: 'Visitors', value: gaData.summary.last30.users.toLocaleString(), sub: `${gaData.summary.last7.users} this week` },
                    { label: 'New Users', value: gaData.summary.last30.newUsers.toLocaleString(), sub: `${gaData.summary.last7.newUsers} this week` },
                    { label: 'Page Views', value: gaData.summary.last30.pageViews.toLocaleString(), sub: '30 days' },
                    { label: 'Avg Session', value: `${Math.floor(gaData.summary.last30.avgSessionDuration / 60)}m ${gaData.summary.last30.avgSessionDuration % 60}s`, sub: 'duration' },
                    { label: 'Bounce Rate', value: `${gaData.summary.last30.bounceRate}%`, sub: '30 days' },
                  ].map(c => (
                    <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm text-center">
                      <p className="text-xs text-gray-500 mb-1">{c.label}</p>
                      <p className="text-xl font-bold text-gray-900">{c.value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Daily Visitors — Last 30 Days</p>
                    {gaData.dailyChart?.length > 0 ? <GAChart data={gaData.dailyChart} /> : <p className="text-sm text-gray-400">No data</p>}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Traffic Sources</p>
                    <div className="space-y-2.5">
                      {(gaData.trafficSources || []).map(s => (
                        <div key={s.channel} className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-xs text-gray-700 truncate">{s.channel}</span>
                              <span className="text-xs font-semibold text-gray-800 ml-2">{s.sessions}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(100, (s.sessions / (gaData.trafficSources[0]?.sessions || 1)) * 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100"><p className="text-sm font-semibold text-gray-700">Top Pages</p></div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                          <th className="px-5 py-2 text-left">Page</th>
                          <th className="px-5 py-2 text-right">Views</th>
                          <th className="px-5 py-2 text-right">Users</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(gaData.topPages || []).map(p => (
                          <tr key={p.path} className="hover:bg-gray-50">
                            <td className="px-5 py-2 text-gray-700 font-mono truncate max-w-[200px]">{p.path}</td>
                            <td className="px-5 py-2 text-right text-gray-800 font-semibold">{p.views.toLocaleString()}</td>
                            <td className="px-5 py-2 text-right text-gray-500">{p.users.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3"><Globe className="h-4 w-4 text-emerald-500" /><p className="text-sm font-semibold text-gray-700">Top Countries</p></div>
                      <div className="space-y-2">
                        {(gaData.countries || []).slice(0, 5).map(c => (
                          <div key={c.country} className="flex items-center justify-between">
                            <span className="text-xs text-gray-700">{c.country}</span>
                            <span className="text-xs font-semibold text-gray-800">{c.users}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3"><MonitorSmartphone className="h-4 w-4 text-purple-500" /><p className="text-sm font-semibold text-gray-700">Devices</p></div>
                      <div className="space-y-2">
                        {(gaData.devices || []).map(d => {
                          const total = gaData.devices.reduce((s, x) => s + x.users, 0)
                          const pct = total ? Math.round((d.users / total) * 100) : 0
                          return (
                            <div key={d.device}>
                              <div className="flex justify-between text-xs mb-0.5"><span className="capitalize text-gray-700">{d.device}</span><span className="text-gray-500">{pct}%</span></div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-purple-400 rounded-full" style={{ width: `${pct}%` }} /></div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <SearchConsolePanel data={infraData?.searchConsole} loading={infraLoading} />
            </div>
          </TabsContent>

          {/* ── MOBILE APP ── */}
          <TabsContent value="mobile" className="mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="h-5 w-5 text-sky-600" />
                <h2 className="text-sm font-semibold text-gray-700">Mobile App Tracking</h2>
              </div>
              <MobileAppPanel data={mobileStats} loading={mobileLoading} />
            </div>
          </TabsContent>

          {/* ── AI SETTINGS ── */}
          <TabsContent value="ai" className="mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="h-4 w-4 text-indigo-600" />
                <h2 className="text-sm font-semibold text-gray-700">AI Provider Settings</h2>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Switch which AI provider and model handles each kind of call — no code deploy needed. Requires the matching API key
                (ANTHROPIC_API_KEY / OPENAI_API_KEY / DEEPSEEK_API_KEY) to be set in Vercel.
              </p>

              {aiLoading && !aiSettings ? (
                <p className="text-sm text-gray-400">Loading…</p>
              ) : aiSettings ? (
                <div className="space-y-3">
                  {[
                    { key: 'chat', label: 'Chat', hint: 'Prep intake & report follow-up conversations — high volume, low stakes' },
                    { key: 'big', label: 'Big Task', hint: 'Structured summary & report analysis generation — low volume, quality-critical' },
                    { key: 'vision', label: 'Vision / OCR', hint: 'Extracting text from photographed report images' },
                  ].map(({ key, label, hint }) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-gray-100 bg-gray-50">
                      <div className="sm:w-40 flex-shrink-0">
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{hint}</p>
                      </div>
                      <select
                        value={aiSettings.tasks[key]?.provider || 'anthropic'}
                        onChange={e => updateAiTask(key, 'provider', e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                      >
                        {(aiSettings.providers || ['anthropic', 'openai', 'deepseek']).map(p => (
                          <option key={p} value={p} disabled={key === 'vision' && !(aiSettings.visionCapableProviders || []).includes(p)}>
                            {p}{key === 'vision' && !(aiSettings.visionCapableProviders || []).includes(p) ? ' (no vision support)' : ''}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={aiSettings.tasks[key]?.model || ''}
                        onChange={e => updateAiTask(key, 'model', e.target.value)}
                        placeholder="model id, e.g. claude-haiku-4-5-20251001"
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 flex-1 min-w-0 font-mono"
                      />
                    </div>
                  ))}

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={saveAiSettings}
                      disabled={aiSaving}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {aiSaving ? 'Saving…' : 'Save AI Settings'}
                    </button>
                    {aiSaveMsg && (
                      <span className={`text-xs font-medium ${aiSaveMsg.ok ? 'text-emerald-700' : 'text-red-600'}`}>{aiSaveMsg.text}</span>
                    )}
                  </div>
                </div>
              ) : <p className="text-sm text-red-500">Failed to load AI settings.</p>}
            </div>
          </TabsContent>

          {/* ── USERS & PAYMENTS ── */}
          <TabsContent value="users" className="space-y-6 mt-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-700">Recent Users</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-5 py-3 text-left">Member</th>
                      <th className="px-5 py-3 text-left">Plan</th>
                      <th className="px-5 py-3 text-left">Reports</th>
                      <th className="px-5 py-3 text-left">Prep Docs</th>
                      <th className="px-5 py-3 text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentUsers.length > 0 ? recentUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 max-w-[220px]">
                          {u.name && <p className="text-gray-800 font-medium truncate text-sm">{u.name}</p>}
                          <p className="text-gray-400 truncate text-xs">{u.email}</p>
                        </td>
                        <td className="px-5 py-3"><TierBadge tier={u.tier} /></td>
                        <td className="px-5 py-3 text-gray-600">{u.reportCount}</td>
                        <td className="px-5 py-3">{u.prepCount > 0 ? <span className="text-violet-600 font-semibold">{u.prepCount}</span> : <span className="text-gray-300">—</span>}</td>
                        <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                      </tr>
                    )) : <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No members yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-700">Recent Reports</h2></div>
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
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'completed' ? 'bg-green-100 text-green-700' : r.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                      </tr>
                    )) : <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No reports yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-semibold text-gray-700">Recent Payments</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-5 py-3 text-left">User ID</th>
                      <th className="px-5 py-3 text-left">Plan</th>
                      <th className="px-5 py-3 text-left">Amount</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-left">Created</th>
                      <th className="px-5 py-3 text-left">Completed</th>
                      <th className="px-5 py-3 text-left">Session</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(recentPayments || []).length > 0 ? (recentPayments || []).map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 text-gray-500 font-mono text-xs max-w-[120px] truncate">{p.userId}</td>
                        <td className="px-5 py-3"><TierBadge tier={p.tier} /></td>
                        <td className="px-5 py-3 text-gray-800 font-semibold">€{p.amount?.toFixed(2)}</td>
                        <td className="px-5 py-3">
                          {p.status === 'completed' ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit"><CheckCircle className="h-3 w-3" /> completed</span>
                          ) : p.status === 'pending' ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full w-fit"><Clock className="h-3 w-3" /> pending</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full w-fit"><XCircle className="h-3 w-3" /> {p.status}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                        <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formatDate(p.completedAt)}</td>
                        <td className="px-5 py-3 text-gray-300 font-mono text-xs max-w-[120px] truncate">{p.sessionId}</td>
                      </tr>
                    )) : <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">No payments yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ── ADVANCED ── */}
          <TabsContent value="advanced" className="mt-4">
            <AdvancedTools />
          </TabsContent>
        </Tabs>

        <p className="text-xs text-gray-300 text-center pb-4">
          Auto-refreshes every 5 minutes · Admin access only
        </p>
      </main>
    </div>
  )
}
