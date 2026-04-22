'use client'

import { use, useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { AlertTriangle, CheckCircle, MessageSquare, Send, ArrowLeft, X, Zap, TrendingUp, TrendingDown, Activity, Download, UserCircle, Check, ChevronDown, ChevronUp } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import MedyraLogo from '@/components/MedyraLogo'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

// Renders AI markdown to JSX: **bold**, *italic*, numbered lists, bullet points, ⚠️ warnings
function MarkdownAnswer({ text }) {
  if (!text) return null

  // Split into blocks by double newline
  const blocks = text.split(/\n{2,}/)

  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-gray-800">
      {blocks.map((block, bi) => {
        const trimmed = block.trim()
        if (!trimmed) return null

        // Ordered list block: lines starting with "1." "2." etc.
        const isOrderedList = trimmed.split('\n').every(l => /^\d+[\.\)]\s/.test(l.trim()))
        if (isOrderedList) {
          return (
            <ol key={bi} className="space-y-2 pl-1">
              {trimmed.split('\n').map((line, li) => {
                const content = line.replace(/^\d+[\.\)]\s*/, '').trim()
                return (
                  <li key={li} className="flex gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">
                      {li + 1}
                    </span>
                    <span>{inlineMarkdown(content)}</span>
                  </li>
                )
              })}
            </ol>
          )
        }

        // Unordered list block: lines starting with "- " or "• " or "* "
        const listLines = trimmed.split('\n').filter(l => /^[-•*]\s/.test(l.trim()))
        if (listLines.length > 0 && listLines.length === trimmed.split('\n').filter(l => l.trim()).length) {
          return (
            <ul key={bi} className="space-y-1.5 pl-1">
              {listLines.map((line, li) => {
                const content = line.replace(/^[-•*]\s*/, '').trim()
                return (
                  <li key={li} className="flex gap-2">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2" />
                    <span>{inlineMarkdown(content)}</span>
                  </li>
                )
              })}
            </ul>
          )
        }

        // Warning block: starts with ⚠️
        if (trimmed.startsWith('⚠️') || trimmed.startsWith('⚠')) {
          return (
            <div key={bi} className="flex gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
              <span className="flex-shrink-0 text-base">⚠️</span>
              <span className="text-orange-800">{inlineMarkdown(trimmed.replace(/^⚠️?\s*/, ''))}</span>
            </div>
          )
        }

        // Regular paragraph (may span multiple lines with single \n)
        return <p key={bi}>{inlineMarkdown(trimmed)}</p>
      })}
    </div>
  )
}

function inlineMarkdown(text) {
  // Split on bold (**text**) and italic (*text*)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

export default function ReportDetailPage({ params }) {
  const unwrappedParams = use(params)
  const reportId = unwrappedParams.id
  const { user, isLoaded } = useUser()
  const t = useTranslations()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [sending, setSending] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [chatUsed, setChatUsed] = useState(0)
  const [chatLimit, setChatLimit] = useState(null) // null = unlimited
  const [chatLimitReached, setChatLimitReached] = useState(false)
  const [profiles, setProfiles] = useState([])
  const [showAssignBanner, setShowAssignBanner] = useState(false)
  const [assigningProfile, setAssigningProfile] = useState(null)
  const [chatCollapsed, setChatCollapsed] = useState(false)
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)

  useEffect(() => {
    if (isLoaded && user) fetchReport()
  }, [isLoaded, user, reportId])

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  async function fetchReport() {
    try {
      const [reportRes, profilesRes] = await Promise.all([
        fetch(`/api/reports/${reportId}`),
        fetch('/api/profiles'),
      ])
      if (!reportRes.ok) throw new Error('Failed to load report')
      const data = await reportRes.json()
      const r = data.report
      if (r && typeof r.explanation === 'string') {
        try { r.explanation = JSON.parse(r.explanation) } catch { r.explanation = { summary: r.explanation, tests: [], questionsForDoctor: [] } }
      }
      setReport(r)
      const convs = r.conversations || []
      setChatHistory(convs)
      setChatUsed(convs.length)

      if (profilesRes.ok) {
        const pd = await profilesRes.json()
        const profileList = pd.profiles || []
        const isPaid = pd.tier && pd.tier !== 'free' && pd.tier !== 'onetime'
        setProfiles(profileList)
        if (profileList.length > 0 && !r.profileId && isPaid) setShowAssignBanner(true)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(t('errors.uploadFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function assignToProfile(profileId) {
    setAssigningProfile(profileId)
    try {
      const res = await fetch(`/api/reports/${reportId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      })
      if (res.ok) {
        const data = await res.json()
        setReport(prev => ({ ...prev, profileId }))
        setShowAssignBanner(false)
        const profile = profiles.find(p => p.id === profileId)
        const bioMsg = data.biomarkersExtracted > 0 ? ` · ${data.biomarkersExtracted} biomarkers recorded` : ''
        toast.success(`Saved to ${profile?.name || 'profile'}${bioMsg}`)
      }
    } catch {}
    finally { setAssigningProfile(null) }
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

  // Key action items, abnormal tests sorted by severity
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
      doc.text('Educational information only, not medical advice. Always consult a qualified healthcare professional.', W / 2, 36.5, { align: 'center' })

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

      <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-6 max-w-4xl pb-8">

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

        {/* ── PROFILE ASSIGNMENT BANNER ── */}
        {showAssignBanner && profiles.length > 0 && (
          <div className="bg-white border border-emerald-200 rounded-xl p-4 mb-5 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-gray-800">Save this report to a profile</p>
              </div>
              <button onClick={() => setShowAssignBanner(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => assignToProfile(p.id)}
                  disabled={assigningProfile !== null}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                    assigningProfile === p.id
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full bg-${p.color || 'emerald'}-500`} />
                  {assigningProfile === p.id ? 'Saving…' : p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Show assigned profile badge */}
        {report.profileId && profiles.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {(() => {
              const p = profiles.find(pr => pr.id === report.profileId)
              if (!p) return null
              return (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  <span className={`w-2 h-2 rounded-full bg-${p.color || 'emerald'}-500`} />
                  {p.name}
                </span>
              )
            })()}
          </div>
        )}

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
          <Card className="mb-5">
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

        {/* ── INLINE AI CHAT ── */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          {/* Chat header */}
          <button
            onClick={() => setChatCollapsed(c => !c)}
            className="w-full flex items-center justify-between px-4 py-3 bg-emerald-50 border-b border-emerald-100 hover:bg-emerald-100 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${chatLimitReached ? 'bg-red-400' : 'bg-emerald-500 animate-pulse'}`} />
              <div className="text-left">
                <p className="font-semibold text-sm text-gray-800 leading-none">Medyra AI</p>
                <p className="text-xs text-gray-500 leading-none mt-0.5">{t('report.chatPoweredBy')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {chatLimit !== null ? (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  chatLimitReached ? 'bg-red-100 text-red-600' :
                  chatUsed >= chatLimit * 0.8 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {chatUsed}/{chatLimit}
                </span>
              ) : (
                <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">∞ unlimited</span>
              )}
              {chatCollapsed ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronUp className="h-4 w-4 text-gray-400" />}
            </div>
          </button>

          {!chatCollapsed && (
            <>
              {/* Messages area */}
              <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: '420px', minHeight: chatHistory.length === 0 ? '200px' : '280px' }}>
                {chatHistory.length === 0 && (
                  <div>
                    <p className="text-sm text-gray-400 text-center mb-4">{t('report.chatGreeting')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                          className="text-left text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl px-4 py-3 transition-colors border border-emerald-200 disabled:opacity-50 leading-relaxed"
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
                      <div className="bg-emerald-500 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] leading-relaxed">
                        {chat.question}
                      </div>
                    </div>
                    <div className="flex justify-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                        <MarkdownAnswer text={chat.answer} />
                      </div>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <div className="bg-gray-100 text-gray-400 text-sm rounded-2xl rounded-tl-sm px-4 py-2.5">
                      <span className="inline-flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input row */}
              {chatLimitReached ? (
                <div className="px-4 py-4 border-t border-gray-100 text-center bg-gray-50">
                  <p className="text-sm text-red-600 font-medium mb-1">{t('report.chatLimitReached')}</p>
                  <p className="text-xs text-gray-400 mb-3">{t('report.chatLimitInfo')}</p>
                  <a href="/pricing" className="inline-block text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-2 rounded-full transition-colors">
                    {t('report.chatUpgrade')} →
                  </a>
                </div>
              ) : (
                <div className="px-4 py-3 border-t border-gray-100 flex gap-2 items-end bg-white">
                  <textarea
                    ref={chatInputRef}
                    placeholder={t('report.chatPlaceholder')}
                    value={question}
                    onChange={e => {
                      setQuestion(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendQuestion() }
                    }}
                    disabled={sending}
                    rows={1}
                    className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 disabled:opacity-50 bg-gray-50 overflow-hidden leading-relaxed"
                    style={{ minHeight: '42px', maxHeight: '120px' }}
                  />
                  <Button
                    onClick={() => sendQuestion()}
                    disabled={sending || !question.trim()}
                    size="sm"
                    className="h-[42px] w-[42px] p-0 bg-emerald-500 hover:bg-emerald-600 rounded-xl flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
