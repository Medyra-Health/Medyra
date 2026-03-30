'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { Upload, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import MedyraLogo from '@/components/MedyraLogo'

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
      const response = await fetch('/api/reports/analyze', { method: 'POST', body: formData })
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
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    disabled: uploading
  })

  if (!isLoaded) {
    return <div className="min-h-screen bg-[#040C08] flex items-center justify-center text-[#E8F5F0]/50">{t('common.loading')}</div>
  }

  return (
    <div className="min-h-screen bg-[#040C08]">
      <header className="bg-[#060D0B] border-b border-emerald-900/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <MedyraLogo size="md" />
            </Link>
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hidden sm:flex text-[#E8F5F0]/70 hover:text-[#E8F5F0] hover:bg-emerald-950/50">
                  {t('upload.backToDashboard')}
                </Button>
                <Button variant="ghost" size="sm" className="flex sm:hidden text-[#E8F5F0]/70 hover:bg-emerald-950/50">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-950/30 border border-yellow-900/40 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-400 mb-1 text-sm">{t('upload.notice')}</h3>
              <p className="text-xs text-yellow-400/70">{t('upload.noticeText')}</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('upload.title')}</CardTitle>
            <CardDescription className="text-sm">{t('upload.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 md:p-12 text-center cursor-pointer transition-all
                ${isDragActive ? 'border-emerald-500 bg-emerald-950/30' : 'border-emerald-900/40 hover:border-emerald-600/60'}
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <div className="space-y-3">
                  <Loader2 className="mx-auto h-10 w-10 text-emerald-400 animate-spin" />
                  <p className="text-base font-medium text-[#E8F5F0]">{progress}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="mx-auto h-10 w-10 text-[#E8F5F0]/30" />
                  <div>
                    <p className="text-base font-medium text-[#E8F5F0]">{t('upload.dragDrop')}</p>
                    <p className="text-sm text-[#E8F5F0]/40 mt-1">{t('upload.or')}</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 text-xs text-[#E8F5F0]/40">
                    <span className="px-2 py-1 bg-emerald-950/40 border border-emerald-900/30 rounded">PDF</span>
                    <span className="px-2 py-1 bg-emerald-950/40 border border-emerald-900/30 rounded">JPG</span>
                    <span className="px-2 py-1 bg-emerald-950/40 border border-emerald-900/30 rounded">PNG</span>
                    <span className="px-2 py-1 bg-emerald-950/40 border border-emerald-900/30 rounded">TXT</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex gap-3 items-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-[#E8F5F0]">{t('upload.secureProcessing')}</p>
                  <p className="text-xs text-[#E8F5F0]/40">{t('upload.secureDesc')}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-[#E8F5F0]">{t('upload.aiPowered')}</p>
                  <p className="text-xs text-[#E8F5F0]/40">{t('upload.aiDesc')}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-[#E8F5F0]">{t('upload.gdprCompliant')}</p>
                  <p className="text-xs text-[#E8F5F0]/40">{t('upload.gdprDesc')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
