'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { FileText, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function UploadPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setProgress('Uploading file...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      setProgress('Extracting text...')
      const response = await fetch('/api/reports/analyze', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      setProgress('Analyzing with AI...')
      const data = await response.json()

      toast.success('Report analyzed successfully!')
      router.push(`/reports/${data.reportId}`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to analyze report')
    } finally {
      setUploading(false)
      setProgress('')
    }
  }, [router])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: uploading
  })

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
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

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Important Notice</h3>
              <p className="text-sm text-yellow-800">
                This tool provides educational information only and is not a substitute for professional medical advice.
                Always consult your doctor before making any health decisions.
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Medical Report</CardTitle>
            <CardDescription>
              Upload your lab results in PDF, image (JPG/PNG), or text format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                ${isDragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
                  <p className="text-lg font-medium text-gray-900">{progress}</p>
                  <p className="text-sm text-gray-500">This may take a minute...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                  </div>
                  <div className="flex justify-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">PDF</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">JPG</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">PNG</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">TXT</span>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Secure Processing</p>
                  <p className="text-xs text-gray-500">Encrypted & auto-deleted after 30 days</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">AI-Powered</p>
                  <p className="text-xs text-gray-500">Advanced Claude AI analysis</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">GDPR Compliant</p>
                  <p className="text-xs text-gray-500">EU data protection standards</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

