'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { FileText, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function UploadPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const t = useTranslations()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploading(true)
    setProgress(t('upload.analyzing'))

    try {
      const formData = new FormData()
      formData.append('file', file)

      setProgress(t('upload.extracting'))
      const response = await fetch('/api/reports/analyze', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t('errors.uploadFailed'))
      }

      setProgress(t('upload.processing'))
      const data = await response.json()

      toast.success(t('common.success'))
      router.push(`/reports/${data.reportId}`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || t('errors.analysisFailed'))
    } finally {
      setUploading(false)
      setProgress('')
    }
  }, [router, t])

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
    return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>
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
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            <Link href="/dashboard">
              <Button variant="ghost">{t('upload.backToDashboard')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">{t('upload.notice')}</h3>
              <p className="text-sm text-yellow-800">{t('upload.noticeText')}</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('upload.title')}</CardTitle>
            <CardDescription>{t('upload.description')}</CardDescription>
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
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {isDragActive ? t('upload.dragDrop') : t('upload.dragDrop')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{t('upload.or')}</p>
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
                  <p className="font-medium text-sm">{t('upload.secureProcessing')}</p>
                  <p className="text-xs text-gray-500">{t('upload.secureDesc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{t('upload.aiPowered')}</p>
                  <p className="text-xs text-gray-500">{t('upload.aiDesc')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{t('upload.gdprCompliant')}</p>
                  <p className="text-xs text-gray-500">{t('upload.gdprDesc')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
