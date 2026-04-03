'use client'

import { use, useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { AlertTriangle, CheckCircle, MessageSquare, Send, ArrowLeft, X, Zap, TrendingUp, TrendingDown, Activity, Download } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import MedyraLogo from '@/components/MedyraLogo'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function ReportDetailPage({ params }) {
  const unwrappedParams = use(params)
  const reportId = unwrappedParams.id
  const { user, isLoaded } = useUser()
  const t = useTranslations()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [sending, setSending] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [chatUsed, setChatUsed] = useState(0)
  const pdfRef = useRef(null)
  const [chatLimit, setChatLimit] = useState(null) // null = unlimited
  const [chatLimitReached, setChatLimitReached] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (isLoaded && user) fetchReport()
  }, [isLoaded, user, reportId])

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  async function fetchReport() {
    try {
      const response = await fetch(`/api/reports/${reportId}`)
      if (!response.ok) throw new Error('Failed to load report')
      const data = await response.json()
      const r = data.report
      if (r && typeof r.explanation === 'string') {
        try { r.explanation = JSON.parse(r.explanation) } catch { r.explanation = { summary: r.explanation, tests: [], questionsForDoctor: [] } }
      }
      setReport(r)
      const convs = r.conversations || []
      setChatHistory(convs)
      setChatUsed(convs.length)
      setTimeout(() => setChatOpen(true), 1800)
    } catch (error) {
      console.error('Error:', error)
      toast.error(t('errors.uploadFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function sendQuestion(overrideQ) {
    const q = (overrideQ || question).trim()
    if (!q || chatLimitReached) return
    setQuestion('')
    setSending(true)
    try {
      const response = await fetch(`/api/reports/${reportId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      })
      const data = await response.json()
      if (!response.ok) {
        if (data.limitReached) {
          setChatLimitReached(true)
          setChatUsed(data.chatUsed)
          setChatLimit(data.chatLimit)
        }
        throw new Error(data.error || 'Failed')
      }
      setChatHistory(prev => [...prev, { question: q, answer: data.answer, timestamp: new Date() }])
      setChatUsed(data.chatUsed)
      setChatLimit(data.chatLimit)
      if (data.limitReached) setChatLimitReached(true)
    } catch (err) {
      if (!chatLimitReached) {
        toast.error(err.message || t('errors.analysisFailed'))
        if (!overrideQ) setQuestion(q)
      }
    } finally {
      setSending(false)
    }
  }

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  const explanation = report.explanation
  const tests = explanation.tests || []

  // --- Stats
  const counts = { critical: 0, high: 0, low: 0, normal: 0 }
  tests.forEach(t => { if (counts[t.flag] !== undefined) counts[t.flag]++ })
  const abnormal = counts.critical + counts.high + counts.low
  const total = tests.length

  const pieData = [
    { name: 'Normal', value: counts.normal, color: '#10B981' },
    { name: 'Low', value: counts.low, color: '#EAB308' },
    { name: 'High', value: counts.high, color: '#F97316' },
    { name: 'Critical', value: counts.critical, color: '#EF4444' },
  ].filter(d => d.value > 0)

  // Key action items — abnormal tests sorted by severity
  const severityOrder = { critical: 0, high: 1, low: 2, normal: 3 }
  const actionItems = tests
    .filter(t => t.flag !== 'normal')
    .sort((a, b) => severityOrder[a.flag] - severityOrder[b.flag])
    .slice(0, 4)

  // --- Helpers
  const getFlagColor = (flag) => {
    switch (flag) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'low': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'normal': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }
  const getFlagBorderColor = (flag) => {
    switch (flag) {
      case 'critical': return 'border-l-red-500'
      case 'high': return 'border-l-orange-500'
      case 'low': return 'border-l-yellow-500'
      case 'normal': return 'border-l-emerald-500'
      default: return 'border-l-gray-300'
    }
  }
  const getBarColor = (flag) => {
    switch (flag) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'low': return 'bg-yellow-500'
      case 'normal': return 'bg-emerald-500'
      default: return 'bg-gray-400'
    }
  }
  const getBarWidth = (flag) => {
    switch (flag) {
      case 'critical': return 'w-11/12'
      case 'high': return 'w-4/5'
      case 'low': return 'w-1/5'
      case 'normal': return 'w-1/2'
      default: return 'w-1/2'
    }
  }
  const getFlagLabel = (flag) => {
    switch (flag) {
      case 'critical': return t('report.critical')
      case 'high': return t('report.high')
      case 'low': return t('report.low')
      case 'normal': return t('report.normal')
      default: return flag?.toUpperCase() || 'N/A'
    }
  }
  const getFlagIcon = (flag) => {
    switch (flag) {
      case 'critical': return <AlertTriangle className="h-3.5 w-3.5" />
      case 'high': return <TrendingUp className="h-3.5 w-3.5" />
      case 'low': return <TrendingDown className="h-3.5 w-3.5" />
      case 'normal': return <CheckCircle className="h-3.5 w-3.5" />
      default: return null
    }
  }

  async function handleExportPDF() {
    setExporting(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = pdfRef.current
      await html2pdf().set({
        margin: 0,
        filename: `medyra-${(report.fileName || 'report').replace(/\.[^.]+$/, '')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(element).save()
    } catch (err) {
      console.error('PDF export error:', err)
      toast.error('Failed to export PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hidden PDF template — captured by html2pdf */}
      <div ref={pdfRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', background: '#ffffff', fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', padding: '32px 40px 24px', color: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>
                <span style={{ color: '#10B981' }}>M</span>edyra
              </div>
              <div style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 500 }}>Medical Report Analysis</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#a7f3d0' }}>{report.fileName}</div>
              <div style={{ fontSize: 11, color: '#a7f3d0', marginTop: 2 }}>{new Date(report.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
          <div style={{ marginTop: 20, padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: 10, color: '#d1fae5', borderLeft: '3px solid #10B981' }}>
            Educational information only — not medical advice. Always consult a qualified healthcare professional.
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb' }}>
          {[
            { label: 'Normal', count: counts.normal, bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', dot: '#10B981' },
            { label: 'Low', count: counts.low, bg: '#fefce8', border: '#fde68a', text: '#854d0e', dot: '#EAB308' },
            { label: 'High', count: counts.high, bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', dot: '#F97316' },
            { label: 'Critical', count: counts.critical, bg: '#fef2f2', border: '#fecaca', text: '#991b1b', dot: '#EF4444' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '16px 20px', background: s.bg, borderRight: i < 3 ? `1px solid ${s.border}` : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, marginBottom: 8 }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: s.text, lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: 11, color: s.text, fontWeight: 600, marginTop: 4, opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '28px 40px' }}>
          {/* Summary */}
          {explanation.summary && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Summary</div>
              <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.7, margin: 0 }}>{explanation.summary}</p>
            </div>
          )}

          {/* Tests */}
          {tests.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Test Results</div>
              {tests.map((test, i) => {
                const flagColors = {
                  critical: { bg: '#fef2f2', border: '#ef4444', badge: '#ef4444', text: '#991b1b' },
                  high: { bg: '#fff7ed', border: '#f97316', badge: '#f97316', text: '#9a3412' },
                  low: { bg: '#fefce8', border: '#eab308', badge: '#eab308', text: '#854d0e' },
                  normal: { bg: '#f0fdf4', border: '#10b981', badge: '#10b981', text: '#166534' },
                }
                const fc = flagColors[test.flag] || flagColors.normal
                return (
                  <div key={i} style={{ marginBottom: 10, borderLeft: `4px solid ${fc.border}`, background: fc.bg, borderRadius: '0 8px 8px 0', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{test.name}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: fc.badge, padding: '2px 8px', borderRadius: 4 }}>{test.flag?.toUpperCase()}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>
                      Value: <span style={{ fontWeight: 600, color: '#111827' }}>{test.value}</span>
                      {test.normalRange && <span> · Normal range: {test.normalRange}</span>}
                    </div>
                    {test.explanation && <p style={{ fontSize: 11, color: '#374151', margin: '0 0 4px', lineHeight: 1.5 }}>{test.explanation}</p>}
                    {test.interpretation && <p style={{ fontSize: 11, color: fc.text, margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>{test.interpretation}</p>}
                  </div>
                )
              })}
            </div>
          )}

          {/* Questions for doctor */}
          {explanation.questionsForDoctor && explanation.questionsForDoctor.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Questions to Ask Your Doctor</div>
              {explanation.questionsForDoctor.map((q, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 20, height: 20, background: '#10B981', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <p style={{ fontSize: 11, color: '#374151', margin: 0, lineHeight: 1.6 }}>{q}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ background: '#064e3b', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, color: '#6ee7b7' }}>Generated by <span style={{ fontWeight: 700 }}>Medyra</span> · medyra.de</div>
          <div style={{ fontSize: 10, color: '#6ee7b7' }}>Not a substitute for professional medical advice</div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 no-print">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/dashboard"><MedyraLogo size="md" /></Link>
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={exporting}
                className="hidden sm:flex text-gray-700 hover:text-gray-900 gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> {exporting ? 'Saving...' : 'Save as PDF'}
              </Button>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  {t('report.backToDashboard')}
                </Button>
                <Button variant="ghost" size="sm" className="flex sm:hidden text-gray-700 hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl pb-32">

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-5 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800"><span className="font-bold">{t('report.disclaimer')}: </span>{explanation.disclaimer || t('report.disclaimerText')}</p>
        </div>

        {/* File name + date */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-semibold text-gray-900 text-sm truncate max-w-xs">{report.fileName}</p>
            <p className="text-xs text-gray-400">{t('report.uploadedOn')} {new Date(report.createdAt).toLocaleString()}</p>
          </div>
          <Link href="/reports">
            <Button variant="outline" size="sm" className="text-xs hidden sm:flex gap-1">
              <Activity className="h-3 w-3" /> All Reports
            </Button>
          </Link>
        </div>

        {/* ── HEALTH OVERVIEW ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Normal', count: counts.normal, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
            { label: 'Low', count: counts.low, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' },
            { label: 'High', count: counts.high, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
            { label: 'Critical', count: counts.critical, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-3 ${s.bg} ${s.border}`}>
              <div className={`w-2 h-2 rounded-full ${s.dot} mb-2`} />
              <p className={`text-2xl font-bold ${s.text}`}>{s.count}</p>
              <p className={`text-xs font-medium ${s.text} opacity-80`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── VISUAL ANALYSIS ── */}
        {total > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-5">
            {/* Pie chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Results Distribution</CardTitle>
                <CardDescription className="text-xs">{total} tests · {abnormal > 0 ? `${abnormal} need attention` : 'All values normal'}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={2} dataKey="value">
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [`${v} tests`, n]} contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-1">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-gray-500">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key action items */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5"><Zap className="h-4 w-4 text-orange-500" /> Key Takeaways</CardTitle>
                <CardDescription className="text-xs">Values that need your attention</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                {actionItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-28 text-center">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                    <p className="text-sm font-semibold text-emerald-700">All values normal</p>
                    <p className="text-xs text-gray-400">Great results — discuss with your doctor</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {actionItems.map((test, i) => (
                      <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border ${getFlagColor(test.flag)}`}>
                        <div className="flex-shrink-0 mt-0.5">{getFlagIcon(test.flag)}</div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{test.name}</p>
                          <p className="text-xs opacity-80 truncate">{test.value}{test.normalRange ? ` · normal: ${test.normalRange}` : ''}</p>
                        </div>
                        <Badge variant="outline" className={`text-xs flex-shrink-0 border-current ${getFlagColor(test.flag)}`}>{getFlagLabel(test.flag)}</Badge>
                      </div>
                    ))}
                    {abnormal > 4 && (
                      <p className="text-xs text-gray-400 text-center">+{abnormal - 4} more below</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Summary */}
        {explanation.summary && (
          <Card className="mb-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('report.summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-sm">{explanation.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* ── TEST RESULTS ── */}
        {tests.length > 0 && (
          <div className="space-y-3 mb-5">
            <h2 className="text-base font-bold text-gray-900">{t('report.testResults')}</h2>
            {tests.map((test, index) => (
              <Card key={index} className={`border-l-4 ${getFlagBorderColor(test.flag)}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {getFlagIcon(test.flag)}
                      <CardTitle className="text-sm truncate">{test.name}</CardTitle>
                    </div>
                    <Badge variant={test.flag === 'normal' ? 'default' : 'destructive'} className="flex-shrink-0 text-xs">
                      {getFlagLabel(test.flag)}
                    </Badge>
                  </div>
                  {/* Value + visual bar */}
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span><span className="font-semibold text-gray-800">{test.value}</span>{test.normalRange && <span className="ml-1 opacity-70">· normal: {test.normalRange}</span>}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${getBarColor(test.flag)} ${getBarWidth(test.flag)}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-0.5">{t('report.whatThisTests')}</p>
                    <p className="text-xs text-gray-700">{test.explanation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-0.5">{t('report.whatThisMeans')}</p>
                    <p className="text-xs text-gray-700">{test.interpretation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Questions for Doctor */}
        {explanation.questionsForDoctor && explanation.questionsForDoctor.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('report.questionsForDoctor')}</CardTitle>
              <CardDescription className="text-xs">{t('report.discussWithPhysician')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {explanation.questionsForDoctor.map((q, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-emerald-600 font-semibold text-sm flex-shrink-0">{i + 1}.</span>
                    <span className="text-gray-700 text-sm">{q}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── FLOATING CHAT ── */}
      <div className="fixed bottom-6 right-4 z-50 no-print">
        {chatOpen ? (
          <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col" style={{ height: '440px' }}>
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-emerald-50 rounded-t-2xl">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${chatLimitReached ? 'bg-red-400' : 'bg-emerald-500 animate-pulse'}`} />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 leading-none">Medyra AI</p>
                  <p className="text-xs text-gray-400 leading-none mt-0.5">Powered by Claude · Educational only</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Usage counter */}
                {chatLimit !== null ? (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    chatLimitReached ? 'bg-red-100 text-red-600' :
                    chatUsed >= chatLimit * 0.8 ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {chatUsed}/{chatLimit} questions
                  </span>
                ) : (
                  <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">∞ unlimited</span>
                )}
                <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatHistory.length === 0 && (
                <div className="py-4">
                  <p className="text-xs text-gray-400 text-center mb-3">Hi! I've read your report. Ask me anything:</p>
                  <div className="space-y-1.5">
                    {[
                      'Summarise the most important findings for me',
                      'Which results need urgent attention?',
                      'What should I ask my doctor?',
                      'How do my results compare to last time?',
                    ].map(q => (
                      <button
                        key={q}
                        disabled={sending}
                        onClick={() => sendQuestion(q)}
                        className="w-full text-left text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-3 py-2 transition-colors border border-emerald-100 disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatHistory.map((chat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="bg-emerald-500 text-white text-xs rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                      {chat.question}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 text-xs rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%] whitespace-pre-wrap">
                      {chat.answer}
                    </div>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-400 text-xs rounded-2xl rounded-tl-sm px-3 py-2">
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce" style={{animationDelay:'0ms'}}>·</span>
                      <span className="animate-bounce" style={{animationDelay:'150ms'}}>·</span>
                      <span className="animate-bounce" style={{animationDelay:'300ms'}}>·</span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input / limit reached */}
            {chatLimitReached ? (
              <div className="p-3 border-t border-gray-100 text-center">
                <p className="text-xs text-red-600 font-medium mb-1.5">Question limit reached for this report</p>
                <p className="text-xs text-gray-400 mb-2">
                  Free plan: 5 questions/report · One-Time: 15 · Personal/Family: unlimited
                </p>
                <a href="/pricing" className="inline-block text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-1.5 rounded-full transition-colors">
                  Upgrade for unlimited chat →
                </a>
              </div>
            ) : (
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <Input
                  placeholder="Ask about your results…"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendQuestion()}
                  disabled={sending}
                  className="text-xs h-8"
                />
                <Button onClick={() => sendQuestion()} disabled={sending || !question.trim()} size="sm" className="h-8 w-8 p-0 bg-emerald-500 hover:bg-emerald-600 flex-shrink-0">
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            title="Ask AI about your results"
          >
            <MessageSquare className="h-6 w-6" />
            {chatHistory.length === 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-white text-xs flex items-center justify-center font-bold">!</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
