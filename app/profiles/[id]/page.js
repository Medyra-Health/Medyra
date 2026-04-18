'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useUser } from '@clerk/nextjs'
import {
  ArrowLeft, FileText, ExternalLink, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Activity, User, Baby, Heart, Users,
  Calendar, Loader2, RefreshCw, Minus,
} from 'lucide-react'
import MedyraLogo from '@/components/MedyraLogo'
import { TRACKED_BIOMARKERS } from '@/components/HealthTimeline'

const HealthTimeline = dynamic(() => import('@/components/HealthTimeline'), {
  ssr: false,
  loading: () => <div className="h-48 flex items-center justify-center text-sm text-gray-400">Loading chart…</div>,
})

const COLOR_THEME = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', header: 'bg-emerald-500' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    dot: 'bg-blue-500',    header: 'bg-blue-500' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  dot: 'bg-violet-500',  header: 'bg-violet-500' },
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    dot: 'bg-rose-500',    header: 'bg-rose-500' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-500',   header: 'bg-amber-500' },
  teal:    { bg: 'bg-teal-50',    border: 'border-teal-200',    text: 'text-teal-700',    dot: 'bg-teal-500',    header: 'bg-teal-500' },
}
const REL_ICONS = { self: User, partner: Heart, child: Baby, parent: Users }

function getFlagColor(flag) {
  if (flag === 'critical') return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' }
  if (flag === 'high')     return { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' }
  if (flag === 'low')      return { text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500' }
  return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' }
}

export default function ProfileDetailPage({ params }) {
  const { id: profileId } = use(params)
  const { user, isLoaded } = useUser()

  const [profile, setProfile] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) load()
  }, [isLoaded, user, profileId])

  async function load() {
    setLoading(true)
    try {
      const [profilesRes, reportsRes] = await Promise.all([
        fetch('/api/profiles'),
        fetch(`/api/reports?profileId=${profileId}`),
      ])
      const pd = await profilesRes.json()
      const rd = await reportsRes.json()
      const found = (pd.profiles || []).find(p => p.id === profileId)
      setProfile(found || null)
      setReports(rd.reports || [])
    } catch {}
    finally { setLoading(false) }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500">Profile not found.</p>
        <Link href="/profiles" className="text-emerald-600 text-sm font-semibold hover:underline">← Back to profiles</Link>
      </div>
    )
  }

  const theme = COLOR_THEME[profile.color] || COLOR_THEME.emerald
  const RelIcon = REL_ICONS[profile.relationship] || User

  // Aggregate latest biomarker values from profile.biomarkers
  const latestBiomarkers = {}
  for (const entry of (profile.biomarkers || [])) {
    for (const v of (entry.values || [])) {
      const key = v.key || v.name
      if (!latestBiomarkers[key] || new Date(entry.recordedAt) > new Date(latestBiomarkers[key].recordedAt)) {
        latestBiomarkers[key] = { ...v, recordedAt: entry.recordedAt }
      }
    }
  }

  // Health summary: count flags across all reports
  const allTests = reports.flatMap(r => {
    try {
      const exp = typeof r.explanation === 'object' ? r.explanation : JSON.parse(r.explanation || '{}')
      return exp.tests || []
    } catch { return [] }
  })
  const flagCounts = { critical: 0, high: 0, low: 0, normal: 0 }
  allTests.forEach(t => { if (flagCounts[t.flag] !== undefined) flagCounts[t.flag]++ })

  const recentReport = reports[0]
  const recentTests = (() => {
    try {
      const exp = typeof recentReport?.explanation === 'object' ? recentReport.explanation : JSON.parse(recentReport?.explanation || '{}')
      return exp.tests || []
    } catch { return [] }
  })()
  const recentAbnormal = recentTests.filter(t => t.flag !== 'normal')

  const biomarkerKeys = TRACKED_BIOMARKERS.map(b => b.key).filter(k => latestBiomarkers[k])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profiles" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
              <ArrowLeft className="h-4 w-4" /> Profiles
            </Link>
            <div className="w-px h-4 bg-gray-200" />
            <MedyraLogo size="sm" />
          </div>
          <button onClick={load} className="text-gray-400 hover:text-gray-600 p-1">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* Profile header card */}
        <div className={`rounded-2xl border-2 ${theme.border} ${theme.bg} p-5`}>
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-white border ${theme.border} flex items-center justify-center flex-shrink-0`}>
              <RelIcon className={`h-7 w-7 ${theme.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className={`text-xl font-black ${theme.text}`}>{profile.name}</h1>
              <p className="text-sm text-gray-500 capitalize">{profile.relationship} · {profile.gender?.replace('_', ' ')}</p>
              {profile.dob && (
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  DOB: {new Date(profile.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Reports', value: reports.length },
                  { label: 'Biomarkers', value: Object.keys(latestBiomarkers).length },
                  { label: 'Flagged (all time)', value: flagCounts.critical + flagCounts.high + flagCounts.low },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white rounded-xl px-3 py-2 border border-gray-100">
                    <p className={`text-lg font-black ${theme.text}`}>{value}</p>
                    <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Latest biomarker snapshot */}
        {biomarkerKeys.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" /> Latest Biomarker Snapshot
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRACKED_BIOMARKERS.filter(b => latestBiomarkers[b.key]).map(bm => {
                const entry = latestBiomarkers[bm.key]
                const val = parseFloat(entry.value)
                const isHigh = val > bm.normalMax
                const isLow = val < bm.normalMin
                const fc = isHigh ? 'text-orange-600 bg-orange-50 border-orange-200' : isLow ? 'text-yellow-700 bg-yellow-50 border-yellow-200' : 'text-emerald-600 bg-emerald-50 border-emerald-200'
                return (
                  <div key={bm.key} className={`rounded-xl border p-3 ${fc}`}>
                    <p className="text-xs font-semibold mb-1">{bm.label}</p>
                    <p className="text-lg font-black">{val.toFixed(1)}</p>
                    <p className="text-xs opacity-70">{bm.unit}</p>
                    <p className="text-xs opacity-60 mt-0.5">{new Date(entry.recordedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Biomarker timeline */}
        {profile.biomarkers?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-600" /> Biomarker Timeline
            </h2>
            <HealthTimeline profile={profile} />
          </div>
        )}

        {/* Most recent report summary */}
        {recentReport && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" /> Most Recent Report
              </h2>
              <Link href={`/reports/${recentReport.id}`} className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                View full <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              {recentReport.fileName} · {new Date(recentReport.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            {recentAbnormal.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl px-4 py-3">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm font-medium">All values within normal range</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentAbnormal.slice(0, 5).map((t, i) => {
                  const fc = getFlagColor(t.flag)
                  return (
                    <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl border ${fc.bg} ${fc.border}`}>
                      {t.flag === 'critical' ? <AlertTriangle className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${fc.text}`} /> : <TrendingUp className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${fc.text}`} />}
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold ${fc.text}`}>{t.name}</p>
                        <p className="text-xs text-gray-500">{t.value}{t.normalRange ? ` · normal: ${t.normalRange}` : ''}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${fc.bg} ${fc.text} border ${fc.border}`}>{t.flag}</span>
                    </div>
                  )
                })}
                {recentAbnormal.length > 5 && <p className="text-xs text-gray-400 text-center">+{recentAbnormal.length - 5} more</p>}
              </div>
            )}
          </div>
        )}

        {/* All reports list */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-600" /> All Reports ({reports.length})
          </h2>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No reports assigned yet. Upload a report and assign it to this profile.
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map(r => {
                let tests = []
                try {
                  const exp = typeof r.explanation === 'object' ? r.explanation : JSON.parse(r.explanation || '{}')
                  tests = exp.tests || []
                } catch {}
                const criticals = tests.filter(t => t.flag === 'critical').length
                const highs = tests.filter(t => t.flag === 'high' || t.flag === 'low').length
                const normals = tests.filter(t => t.flag === 'normal').length
                return (
                  <Link key={r.id} href={`/reports/${r.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center flex-shrink-0 transition-colors">
                      <FileText className="h-4 w-4 text-gray-500 group-hover:text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{r.fileName || 'Report'}</p>
                      <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {criticals > 0 && <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">{criticals} critical</span>}
                      {!criticals && highs > 0 && <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">{highs} flagged</span>}
                      {!criticals && !highs && normals > 0 && <span className="text-xs bg-emerald-100 text-emerald-600 font-semibold px-2 py-0.5 rounded-full">All normal</span>}
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-emerald-500 flex-shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
