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
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const W = 210, H = 297, M = 14, CW = W - M * 2
      let y = 0

      const newPage = () => { doc.addPage(); y = M }
      const check = (need) => { if (y + need > H - 18) newPage() }

      // ── HEADER ──
      doc.setFillColor(4, 78, 59)
      doc.rect(0, 0, W, 40, 'F')
      // Logo
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(24)
      doc.setTextColor(16, 185, 129)
      doc.text('M', M, 17)
      doc.setTextColor(255, 255, 255)
      doc.text('edyra', M + 9, 17)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(110, 231, 183)
      doc.text('Medical Report Analysis', M, 23)
      // File + date (right)
      const dateStr = new Date(report.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
      doc.setFontSize(8)
      doc.setTextColor(167, 243, 208)
      doc.text(report.fileName || 'Report', W - M, 15, { align: 'right' })
      doc.text(dateStr, W - M, 21, { align: 'right' })
      // Disclaimer bar
      doc.setFillColor(0, 0, 0)
      doc.setGState && doc.setGState(new doc.GState({ opacity: 0.2 }))
      doc.rect(0, 30, W, 10, 'F')
      doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }))
      doc.setFontSize(7)
      doc.setTextColor(209, 250, 229)
      doc.text('Educational information only — not medical advice. Always consult a qualified healthcare professional.', W / 2, 36.5, { align: 'center' })

      y = 48

      // ── STATS ROW ──
      const statW = CW / 4
      const statData = [
        { label: 'Normal', count: counts.normal, bg: [240,253,244], bd: [187,247,208], tx: [22,101,52] },
        { label: 'Low',    count: counts.low,    bg: [254,252,232], bd: [253,230,138], tx: [133,77,14] },
        { label: 'High',   count: counts.high,   bg: [255,247,237], bd: [254,215,170], tx: [154,52,18] },
        { label: 'Critical', count: counts.critical, bg: [254,242,242], bd: [254,202,202], tx: [153,27,27] },
      ]
      statData.forEach((s, i) => {
        const sx = M + i * statW
        doc.setFillColor(...s.bg); doc.setDrawColor(...s.bd)
        doc.roundedRect(sx, y, statW - 1, 20, 1, 1, 'FD')
        doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...s.tx)
        doc.text(String(s.count), sx + statW / 2 - 0.5, y + 13, { align: 'center' })
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5)
        doc.text(s.label, sx + statW / 2 - 0.5, y + 18.5, { align: 'center' })
      })
      y += 26

      // ── SUMMARY ──
      if (explanation.summary) {
        check(16)
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(17, 24, 39)
        doc.text('SUMMARY', M, y)
        doc.setDrawColor(209, 213, 219); doc.line(M + 25, y - 0.5, W - M, y - 0.5)
        y += 5
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(55, 65, 81)
        const sumLines = doc.splitTextToSize(explanation.summary, CW)
        sumLines.forEach(line => { check(5); doc.text(line, M, y); y += 4.5 })
        y += 5
      }

      // ── TEST RESULTS ──
      if (tests.length > 0) {
        check(14)
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(17, 24, 39)
        doc.text('TEST RESULTS', M, y)
        doc.setDrawColor(209, 213, 219); doc.line(M + 36, y - 0.5, W - M, y - 0.5)
        y += 6

        const flagPalette = {
          critical: { bg: [254,242,242], bd: [239,68,68], bx: [239,68,68], tx: [153,27,27] },
          high:     { bg: [255,247,237], bd: [249,115,22], bx: [249,115,22], tx: [154,52,18] },
          low:      { bg: [254,252,232], bd: [234,179,8],  bx: [234,179,8],  tx: [133,77,14] },
          normal:   { bg: [240,253,244], bd: [16,185,129], bx: [16,185,129], tx: [22,101,52] },
        }

        tests.forEach(test => {
          const fc = flagPalette[test.flag] || flagPalette.normal
          // Pre-measure text lines
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
          const expLines = test.explanation ? doc.splitTextToSize(test.explanation, CW - 9) : []
          const intLines = test.interpretation ? doc.splitTextToSize(test.interpretation, CW - 9) : []
          const cardH = 14 + expLines.length * 3.8 + intLines.length * 3.8
          check(cardH + 3)

          // Card bg + border
          doc.setFillColor(...fc.bg); doc.setDrawColor(...fc.bd)
          doc.roundedRect(M, y, CW, cardH, 1.5, 1.5, 'FD')
          // Left accent
          doc.setFillColor(...fc.bd)
          doc.rect(M, y, 3, cardH, 'F')

          const cx = M + 6
          // Name
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(17, 24, 39)
          doc.text(test.name || '', cx, y + 6.5)
          // Flag badge
          const fLabel = (test.flag || '').toUpperCase()
          const bw = fLabel.length * 2.2 + 4
          doc.setFillColor(...fc.bx)
          doc.roundedRect(W - M - bw - 1, y + 2.5, bw + 1, 5, 1, 1, 'F')
          doc.setFont('helvetica', 'bold'); doc.setFontSize(6); doc.setTextColor(255, 255, 255)
          doc.text(fLabel, W - M - bw / 2 - 0.5, y + 6, { align: 'center' })
          // Value line
          let valText = `Value: ${test.value || ''}`
          if (test.normalRange) valText += `  ·  Normal: ${test.normalRange}`
          doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...fc.tx)
          doc.text(valText, cx, y + 11.5)

          let iy = y + 15
          // Explanation
          if (expLines.length) {
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(75, 85, 99)
            expLines.forEach(l => { doc.text(l, cx, iy); iy += 3.8 })
          }
          // Interpretation italic
          if (intLines.length) {
            doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(...fc.tx)
            intLines.forEach(l => { doc.text(l, cx, iy); iy += 3.8 })
          }
          y += cardH + 3
        })
      }

      // ── QUESTIONS FOR DOCTOR ──
      if (explanation.questionsForDoctor?.length > 0) {
        y += 2; check(16)
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(17, 24, 39)
        doc.text('QUESTIONS TO ASK YOUR DOCTOR', M, y)
        doc.setDrawColor(209, 213, 219); doc.line(M + 79, y - 0.5, W - M, y - 0.5)
        y += 6

        explanation.questionsForDoctor.forEach((q, i) => {
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5)
          const qLines = doc.splitTextToSize(q, CW - 10)
          check(qLines.length * 4 + 4)
          // Circle
          doc.setFillColor(16, 185, 129)
          doc.circle(M + 3, y + 0.5, 3, 'F')
          doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(255, 255, 255)
          doc.text(String(i + 1), M + 3, y + 2.3, { align: 'center' })
          // Text
          doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(55, 65, 81)
          qLines.forEach((l, li) => { doc.text(l, M + 9, y + 2.5 + li * 4); })
          y += qLines.length * 4 + 4
        })
      }

      // ── FOOTER on every page ──
      const totalPages = doc.internal.getNumberOfPages()
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p)
        doc.setFillColor(4, 78, 59)
        doc.rect(0, H - 12, W, 12, 'F')
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(110, 231, 183)
        doc.text('Generated by Medyra · medyra.de', M, H - 5)
        doc.text('Not a substitute for professional medical advice', W - M, H - 5, { align: 'right' })
        if (totalPages > 1) {
          doc.setTextColor(167, 243, 208)
          doc.text(`${p} / ${totalPages}`, W / 2, H - 5, { align: 'center' })
        }
      }

      doc.save(`medyra-${(report.fileName || 'report').replace(/\.[^.]+$/, '')}.pdf`)
    } catch (err) {
      console.error('PDF export error:', err)
      toast.error('Failed to export PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

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
                className="flex text-gray-700 hover:text-gray-900 gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden xs:inline sm:inline">{exporting ? t('common.loading') : t('report.saveAsPdf')}</span>
                <span className="sm:hidden">{exporting ? '...' : 'PDF'}</span>
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

      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-6 max-w-4xl pb-28 sm:pb-32">

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-5 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800"><span className="font-bold">{t('report.disclaimer')}: </span>{explanation.disclaimer || t('report.disclaimerText')}</p>
        </div>

        {/* File name + date */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-semibold text-gray-900 text-sm truncate max-w-[160px] sm:max-w-xs">{report.fileName}</p>
            <p className="text-xs text-gray-400">{t('report.uploadedOn')} {new Date(report.createdAt).toLocaleString()}</p>
          </div>
          <Link href="/reports">
            <Button variant="outline" size="sm" className="text-xs hidden sm:flex gap-1">
              <Activity className="h-3 w-3" /> {t('report.allReports')}
            </Button>
          </Link>
        </div>

        {/* ── HEALTH OVERVIEW ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { flag: 'normal', count: counts.normal, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
            { flag: 'low', count: counts.low, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' },
            { flag: 'high', count: counts.high, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
            { flag: 'critical', count: counts.critical, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
          ].map(s => (
            <div key={s.flag} className={`rounded-xl border p-3 ${s.bg} ${s.border}`}>
              <div className={`w-2 h-2 rounded-full ${s.dot} mb-2`} />
              <p className={`text-xl sm:text-2xl font-bold ${s.text}`}>{s.count}</p>
              <p className={`text-xs font-medium ${s.text} opacity-80`}>{getFlagLabel(s.flag)}</p>
            </div>
          ))}
        </div>

        {/* ── VISUAL ANALYSIS ── */}
        {total > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-5">
            {/* Pie chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('report.resultsDistribution')}</CardTitle>
                <CardDescription className="text-xs">{total} tests · {abnormal > 0 ? `${abnormal} ${t('report.needAttention')}` : t('report.allValuesNormal')}</CardDescription>
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
                <CardTitle className="text-sm flex items-center gap-1.5"><Zap className="h-4 w-4 text-orange-500" /> {t('report.keyTakeaways')}</CardTitle>
                <CardDescription className="text-xs">{t('report.valuesNeedingAttention')}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                {actionItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-28 text-center">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                    <p className="text-sm font-semibold text-emerald-700">{t('report.allValuesNormal')}</p>
                    <p className="text-xs text-gray-400">{t('report.greatResults')}</p>
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
      {/* Mobile overlay backdrop */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 sm:hidden" onClick={() => setChatOpen(false)} />
      )}
      <div className={`fixed z-50 no-print transition-all duration-300 ${
        chatOpen
          ? 'inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:right-4'
          : 'bottom-6 right-4'
      }`}>
        {chatOpen ? (
          <div className="bg-white shadow-2xl border border-gray-200 flex flex-col rounded-t-3xl sm:rounded-2xl w-full sm:w-96" style={{ height: 'min(70vh, 520px)' }}>
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-2 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-emerald-50 rounded-t-3xl sm:rounded-t-2xl">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${chatLimitReached ? 'bg-red-400' : 'bg-emerald-500 animate-pulse'}`} />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 leading-none">Medyra AI</p>
                  <p className="text-xs text-gray-400 leading-none mt-0.5">{t('report.chatPoweredBy')}</p>
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
                  <p className="text-xs text-gray-400 text-center mb-3">{t('report.chatGreeting')}</p>
                  <div className="space-y-1.5">
                    {[
                      t('report.chatQ1'),
                      t('report.chatQ2'),
                      t('report.chatQ3'),
                      t('report.chatQ4'),
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
                <p className="text-xs text-red-600 font-medium mb-1.5">{t('report.chatLimitReached')}</p>
                <p className="text-xs text-gray-400 mb-2">
                  {t('report.chatLimitInfo')}
                </p>
                <a href="/pricing" className="inline-block text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-1.5 rounded-full transition-colors">
                  {t('report.chatUpgrade')} →
                </a>
              </div>
            ) : (
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <Input
                  placeholder={t('report.chatPlaceholder')}
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
