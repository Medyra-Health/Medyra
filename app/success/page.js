'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      // Poll for payment verification
      const checkPayment = async () => {
        try {
          // In a real implementation, you'd verify the session
          // For now, just simulate a delay
          await new Promise(resolve => setTimeout(resolve, 2000))
          setVerified(true)
        } catch (error) {
          console.error('Verification error:', error)
        } finally {
          setLoading(false)
        }
      }

      checkPayment()
    } else {
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className=\"min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white\">
        <Card className=\"w-full max-w-md\">
          <CardHeader className=\"text-center\">
            <Loader2 className=\"h-16 w-16 text-blue-600 animate-spin mx-auto mb-4\" />
            <CardTitle>Verifying Payment...</CardTitle>
            <CardDescription>Please wait while we confirm your subscription</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className=\"min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white\">
      <Card className=\"w-full max-w-md\">
        <CardHeader className=\"text-center\">
          <CheckCircle className=\"h-16 w-16 text-green-600 mx-auto mb-4\" />
          <CardTitle className=\"text-2xl\">Payment Successful!</CardTitle>
          <CardDescription>Your subscription is now active</CardDescription>
        </CardHeader>
        <CardContent className=\"text-center space-y-4\">
          <p className=\"text-gray-600\">
            Thank you for subscribing to Medyra. You can now start uploading and analyzing your medical reports.
          </p>
          <div className=\"flex flex-col gap-2\">
            <Link href=\"/upload\" className=\"w-full\">
              <Button className=\"w-full\">
                <FileText className=\"mr-2 h-4 w-4\" />
                Upload Your First Report
              </Button>
            </Link>
            <Link href=\"/dashboard\" className=\"w-full\">
              <Button variant=\"outline\" className=\"w-full\">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
