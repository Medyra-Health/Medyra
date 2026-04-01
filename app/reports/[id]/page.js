'use client'

import { use, useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { AlertTriangle, CheckCircle, MessageSquare, Send, ArrowLeft, X, Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react'
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
      setReport(data.report)
      setChatHistory(data.report.conversations || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error(t('errors.uploadFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function sendQuestion() {
    if (!question.trim()) return
    const q = question.trim()
    setQuestion('')
    setSending(true)
    try {
      const response = await fetch(`/api/reports/${reportId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      })
      if (!response.ok) throw new Error('Failed')
      const data = await response.json()
      setChatHistory(prev => [...prev, { question: q, answer: data.answer, timestamp: new Date() }])
    } catch {
      toast.error(t('errors.analysisFailed'))
      setQuestion(q)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/dashboard"><MedyraLogo size="md" /></Link>
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
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
      <div className="fixed bottom-6 right-4 z-50">
        {chatOpen ? (
          <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col" style={{ height: '440px' }}>
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-emerald-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-sm text-gray-800">Ask AI about your results</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatHistory.length === 0 && (
                <div className="text-center py-6">
                  <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Ask anything about your results</p>
                  <div className="mt-3 space-y-1">
                    {['What should I do about my critical values?', 'Which results need urgent attention?', 'What lifestyle changes could help?'].map(q => (
                      <button key={q} onClick={() => setQuestion(q)} className="w-full text-left text-xs text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-3 py-1.5 transition-colors border border-emerald-100">
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

            {/* Input */}
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <Input
                placeholder="Ask about your results…"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendQuestion()}
                disabled={sending}
                className="text-xs h-8"
              />
              <Button onClick={sendQuestion} disabled={sending || !question.trim()} size="sm" className="h-8 w-8 p-0 bg-emerald-500 hover:bg-emerald-600 flex-shrink-0">
                <Send className="h-3 w-3" />
              </Button>
            </div>
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
