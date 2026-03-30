'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { AlertTriangle, CheckCircle, MessageSquare, Send, ArrowLeft } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import MedyraLogo from '@/components/MedyraLogo'

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

  useEffect(() => {
    if (isLoaded && user) fetchReport()
  }, [isLoaded, user, reportId])

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
    setSending(true)
    try {
      const response = await fetch(`/api/reports/${reportId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })
      if (!response.ok) throw new Error('Failed to send question')
      const data = await response.json()
      setChatHistory([...chatHistory, { question, answer: data.answer, timestamp: new Date() }])
      setQuestion('')
      toast.success(t('common.success'))
    } catch (error) {
      console.error('Error:', error)
      toast.error(t('errors.analysisFailed'))
    } finally {
      setSending(false)
    }
  }

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  const explanation = report.explanation

  const getFlagColor = (flag) => {
    switch (flag) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'low': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'normal': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getFlagIcon = (flag) => {
    switch (flag) {
      case 'critical': case 'high': case 'low': return <AlertTriangle className="h-4 w-4" />
      case 'normal': return <CheckCircle className="h-4 w-4" />
      default: return null
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <div className="bg-[#060D0B] rounded-xl px-3 py-2">
                <MedyraLogo size="sm" variant="dark" showTagline />
              </div>
            </Link>
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

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-700 mb-1">{t('report.disclaimer')}</h3>
              <p className="text-yellow-800 text-sm">{explanation.disclaimer || t('report.disclaimerText')}</p>
            </div>
          </div>
        </div>

        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="min-w-0">
                <CardTitle className="text-base truncate">{report.fileName}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {t('report.uploadedOn')} {new Date(report.createdAt).toLocaleString()}
                </CardDescription>
              </div>
              <Button onClick={() => setChatOpen(!chatOpen)} variant="outline" size="sm" className="flex-shrink-0 w-full sm:w-auto">
                <MessageSquare className="mr-2 h-4 w-4" />
                {t('report.askQuestions')}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {explanation.summary && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('report.summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed text-sm">{explanation.summary}</p>
            </CardContent>
          </Card>
        )}

        {explanation.tests && explanation.tests.length > 0 && (
          <div className="space-y-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900">{t('report.testResults')}</h2>
            {explanation.tests.map((test, index) => (
              <Card key={index} className={`border-l-4 ${getFlagColor(test.flag)}`}>
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="min-w-0">
                      <CardTitle className="flex items-center gap-2 text-base">
                        {test.name}
                        {getFlagIcon(test.flag)}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {t('report.yourResult')}: <span className="font-semibold">{test.value}</span>
                        {test.normalRange && <span className="ml-1">({t('report.normalRange')}: {test.normalRange})</span>}
                      </CardDescription>
                    </div>
                    <Badge variant={test.flag === 'normal' ? 'default' : 'destructive'} className="self-start flex-shrink-0">
                      {getFlagLabel(test.flag)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div>
                    <h4 className="font-semibold text-xs text-gray-500 mb-1">{t('report.whatThisTests')}:</h4>
                    <p className="text-xs text-gray-700">{test.explanation}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-gray-500 mb-1">{t('report.whatThisMeans')}:</h4>
                    <p className="text-xs text-gray-700">{test.interpretation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {explanation.questionsForDoctor && explanation.questionsForDoctor.length > 0 && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('report.questionsForDoctor')}</CardTitle>
              <CardDescription className="text-xs">{t('report.discussWithPhysician')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {explanation.questionsForDoctor.map((q, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-emerald-600 font-semibold text-sm flex-shrink-0">{index + 1}.</span>
                    <span className="text-gray-700 text-sm">{q}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {chatOpen && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('report.askQuestion')}</CardTitle>
              <CardDescription className="text-xs">{t('report.moreInfo')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chatHistory.map((chat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                      <p className="font-semibold text-xs text-emerald-700">{t('report.you')}:</p>
                      <p className="text-sm text-gray-700">{chat.question}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                      <p className="font-semibold text-xs text-gray-400">{t('report.ai')}:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{chat.answer}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder={t('report.askPlaceholder')}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendQuestion()}
                    disabled={sending}
                    className="text-sm"
                  />
                  <Button onClick={sendQuestion} disabled={sending || !question.trim()} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    {sending ? t('report.sending') : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
