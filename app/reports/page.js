'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import {
  FileText, ArrowLeft, Upload, ChevronRight, Clock,
  AlertCircle, CheckCircle, TrendingUp, Search, Filter,
  Calendar, BarChart2, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import MedyraLogo from '@/components/MedyraLogo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'

const STATUS_META = {
  completed: { label: 'Analyzed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 border-blue-200',    dot: 'bg-blue-500' },
  failed:     { label: 'Failed',     color: 'bg-red-100 text-red-700 border-red-200',       dot: 'bg-red-500' },
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}
function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function groupByMonth(reports) {
  const groups = {}
  reports.forEach(r => {
    const key = new Date(r.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(r)
  })
  return groups
}

export default function ReportsPage() {
  const { user, isLoaded } = useUser()
  const t = useTranslations()
  const [reports, setReports] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isLoaded || !user) return
    Promise.all([
      fetch('/api/reports').then(r => r.json()),
      fetch('/api/subscription').then(r => r.json()),
    ]).then(([rData, sData]) => {
      setReports(rData.reports || [])
      setSubscription(sData)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [isLoaded, user])

  const filtered = reports.filter(r =>
    !search || r.fileName?.toLowerCase().includes(search.toLowerCase())
  )
  const grouped = groupByMonth(filtered)
  const months = Object.keys(grouped)

  const isUnlimited = subscription && (subscription.usageLimit >= 999999 || subscription.tier === 'admin')
  const usedCount = subscription?.currentUsage ?? 0
  const limitCount = subscription?.usageLimit ?? 3
  const remaining = isUnlimited ? null : Math.max(0, limitCount - usedCount)

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard"><MedyraLogo size="md" /></Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-700 hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
              </Button>
              <Button variant="ghost" size="sm" className="flex sm:hidden">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">

        {/* Page title */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
              {reports.length > 0 && (
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">{reports.length}</span>
              )}
            </div>
            <p className="text-sm text-gray-500">All your uploaded medical reports and their AI explanations</p>
          </div>
          <Link href="/upload" className="flex-shrink-0">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200 font-semibold gap-2">
              <Upload className="h-4 w-4" /> Upload New
            </Button>
          </Link>
        </div>

        {/* Usage summary */}
        {subscription && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total reports</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">
                {isUnlimited ? '∞' : remaining}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{isUnlimited ? 'Unlimited' : 'Remaining'}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => {
                  const d = new Date(r.createdAt)
                  const now = new Date()
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                }).length}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">This month</p>
            </div>
          </div>
        )}

        {/* Usage bar for free/limited users */}
        {subscription && !isUnlimited && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">Report usage</span>
              <span className="text-xs text-gray-500">{usedCount} of {limitCount} used</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${usedCount >= limitCount ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (usedCount / limitCount) * 100)}%` }}
              />
            </div>
            {remaining === 0 ? (
              <div className="flex items-center justify-between">
                <p className="text-xs text-red-600 font-medium">Limit reached</p>
                <Link href="/pricing">
                  <Button size="sm" className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                    <TrendingUp className="h-3 w-3 mr-1" /> Upgrade
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-xs text-gray-400">{remaining} report{remaining !== 1 ? 's' : ''} remaining on your plan</p>
            )}
          </div>
        )}

        {/* Search */}
        {reports.length > 3 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by file name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>
        )}

        {/* Reports list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm text-gray-400">Loading your reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-7 w-7 text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-gray-700 mb-1">No reports yet</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
              Upload your first medical report to get an AI-powered plain language explanation.
            </p>
            <Link href="/upload">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold gap-2 shadow-sm shadow-emerald-200">
                <Upload className="h-4 w-4" /> Upload your first report
              </Button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
            <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No reports match your search</p>
          </div>
        ) : (
          <div className="space-y-8">
            {months.map(month => (
              <div key={month}>
                {/* Month header */}
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{month}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">{grouped[month].length} report{grouped[month].length !== 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-3">
                  {grouped[month].map(report => {
                    const status = STATUS_META[report.status] || STATUS_META.completed
                    const abnormals = report.analysis?.findings?.filter(f => f.status === 'high' || f.status === 'low') || []
                    const normals = report.analysis?.findings?.filter(f => f.status === 'normal') || []
                    return (
                      <Link key={report.id} href={`/reports/${report.id}`}>
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group cursor-pointer">
                          <div className="flex items-start gap-3">
                            {/* File icon */}
                            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-blue-500" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                                    {report.fileName || 'Medical Report'}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-xs text-gray-400">{formatDate(report.createdAt)} · {formatTime(report.createdAt)}</span>
                                    {report.fileSize && (
                                      <span className="text-xs text-gray-400">{formatFileSize(report.fileSize)}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Badge className={`text-[10px] px-2 py-0.5 border font-medium ${status.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${status.dot}`} />
                                    {status.label}
                                  </Badge>
                                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                                </div>
                              </div>

                              {/* Summary preview */}
                              {report.analysis?.summary && (
                                <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">
                                  {report.analysis.summary}
                                </p>
                              )}

                              {/* Findings badges */}
                              {(abnormals.length > 0 || normals.length > 0) && (
                                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                  {abnormals.length > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                                      <AlertCircle className="h-3 w-3" /> {abnormals.length} flagged
                                    </span>
                                  )}
                                  {normals.length > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                                      <CheckCircle className="h-3 w-3" /> {normals.length} normal
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upgrade nudge for free users */}
        {subscription && !isUnlimited && remaining !== null && remaining <= 1 && (
          <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">
                {remaining === 0 ? 'You\'ve used all your free reports' : 'Almost out of reports'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Upgrade to Personal or Family for unlimited reports and full history</p>
            </div>
            <Link href="/pricing" className="flex-shrink-0">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm">
                Upgrade
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
