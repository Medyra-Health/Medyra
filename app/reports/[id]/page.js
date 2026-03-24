'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { FileText, AlertTriangle, CheckCircle, XCircle, MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ReportDetailPage({ params }) {
  const unwrappedParams = use(params)
  const reportId = unwrappedParams.id
  const { user, isLoaded } = useUser()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      fetchReport()
    }
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
      toast.error('Failed to load report')
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
      toast.success('Answer received!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to send question')
    } finally {
      setSending(false)
    }
  }

  if (loading || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const explanation = report.explanation

  const getFlagColor = (flag) => {
    switch (flag) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'normal': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getFlagIcon = (flag) => {
    switch (flag) {
      case 'critical':
      case 'high':
      case 'low':
        return <AlertTriangle className="h-5 w-5" />
      case 'normal':
        return <CheckCircle className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Medyra</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Disclaimer Alert */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-8">
          <div className="flex gap-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-900 text-lg mb-2">Medical Disclaimer</h3>
              <p className="text-yellow-800">
                {explanation.disclaimer || 'This is educational information, not medical advice. Always consult your doctor for personalized medical guidance.'}
              </p>
            </div>
          </div>
        </div>

        {/* Report Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{report.fileName}</CardTitle>
                <CardDescription>Uploaded on {new Date(report.createdAt).toLocaleString()}</CardDescription>
              </div>
              <Button onClick={() => setChatOpen(!chatOpen)} variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask Questions
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Summary */}
        {explanation.summary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{explanation.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {explanation.tests && explanation.tests.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-2xl font-bold">Test Results</h2>
            {explanation.tests.map((test, index) => (
              <Card key={index} className={`border-l-4 ${getFlagColor(test.flag)}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {test.name}
                        {getFlagIcon(test.flag)}
                      </CardTitle>
                      <CardDescription>
                        Your result: <span className="font-semibold">{test.value}</span>
                        {test.normalRange && (
                          <span className="ml-2">(Normal: {test.normalRange})</span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant={test.flag === 'normal' ? 'default' : 'destructive'}>
                      {test.flag?.toUpperCase() || 'N/A'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">What this test measures:</h4>
                    <p className="text-sm text-gray-600">{test.explanation}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-1">What your result means:</h4>
                    <p className="text-sm text-gray-600">{test.interpretation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Questions for Doctor */}
        {explanation.questionsForDoctor && explanation.questionsForDoctor.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Questions to Ask Your Doctor</CardTitle>
              <CardDescription>These questions can help you discuss this report with your physician</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {explanation.questionsForDoctor.map((q, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-blue-600 font-semibold">{index + 1}.</span>
                    <span className="text-gray-700">{q}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Follow-up Chat */}
        {chatOpen && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Ask Follow-up Questions</CardTitle>
              <CardDescription>Get more information about your results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chatHistory.map((chat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="font-semibold text-sm text-blue-900">You:</p>
                      <p className="text-sm text-gray-700">{chat.question}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-semibold text-sm text-gray-900">AI:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{chat.answer}</p>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question about your results..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendQuestion()}
                    disabled={sending}
                  />
                  <Button onClick={sendQuestion} disabled={sending || !question.trim()}>
                    {sending ? 'Sending...' : <Send className="h-4 w-4" />}
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
