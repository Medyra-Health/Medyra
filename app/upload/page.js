'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useCallback, useEffect } from 'react'
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
import ConsentModal from '@/components/ConsentModal'

const MAX_BYTES = 4 * 1024 * 1024 // 4 MB

// Compress an image file to JPEG, targeting < MAX_BYTES
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      // Scale down if very large
      const MAX_DIM = 2000
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Try progressively lower quality until under limit
      const tryQuality = (q) => {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Image compression failed'))
          if (blob.size <= MAX_BYTES || q <= 0.3) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
          } else {
            tryQuality(Math.round((q - 0.1) * 10) / 10)
          }
        }, 'image/jpeg', q)
      }
      tryQuality(0.85)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')) }
    img.src = url
  })
}

export default function UploadPage() {
  const { isLoaded } = useUser()
  const router = useRouter()
  const t = useTranslations()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [sizeError, setSizeError] = useState(false)
  const [consentStatus, setConsentStatus] = useState('loading') // 'loading' | 'consented' | 'needed' | 'declined'
  const [pendingFile, setPendingFile] = useState(null)

  useEffect(() => {
    if (!isLoaded) return
    fetch('/api/consent')
      .then(r => r.json())
      .then(d => setConsentStatus(d.consented ? 'consented' : 'needed'))
      .catch(() => setConsentStatus('needed'))
  }, [isLoaded])

  async function processFile(file) {
    setSizeError(false)
    setUploading(true)
    setProgress(t('upload.analyzing'))

    try {
      // Auto-compress images that are too large
      if (file.type.startsWith('image/') && file.size > MAX_BYTES) {
        setProgress('Compressing image…')
        try {
          file = await compressImage(file)
        } catch {
          // If compression fails, continue anyway — server will reject if still too large
        }
      }

      // Check PDF/TXT size before uploading — can't compress in browser
      if (!file.type.startsWith('image/') && file.size > MAX_BYTES) {
        setSizeError(true)
        throw new Error('FILE_TOO_LARGE')
      }

      const formData = new FormData()
      formData.append('file', file)
      setProgress(t('upload.extracting'))

      const response = await fetch('/api/reports/analyze', { method: 'POST', body: formData })
      if (!response.ok) {
        let errorMsg = t('errors.uploadFailed')
        try {
          const error = await response.json()
          errorMsg = error.error || errorMsg
        } catch {
          if (response.status === 413) { setSizeError(true); errorMsg = 'FILE_TOO_LARGE' }
          else if (response.status === 401) errorMsg = t('errors.unauthorized')
          else if (response.status === 429) errorMsg = t('errors.limitReached')
          else errorMsg = response.statusText || errorMsg
        }
        throw new Error(errorMsg)
      }

      setProgress(t('upload.processing'))
      const data = await response.json()
      toast.success(t('common.success'))
      router.push(`/reports/${data.reportId}`)
    } catch (error) {
      console.error('Upload error:', error)
      if (error.message !== 'FILE_TOO_LARGE') {
        toast.error(error.message || t('errors.analysisFailed'))
      }
    } finally {
      setUploading(false)
      setProgress('')
    }
  }

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    if (consentStatus === 'consented') {
      processFile(file)
    } else {
      setPendingFile(file)
      setConsentStatus('needed')
    }
  }, [consentStatus])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    disabled: uploading || consentStatus === 'loading'
  })

  if (!isLoaded) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">{t('common.loading')}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Consent modal — shown when user tries to upload without consent */}
      {consentStatus === 'needed' && pendingFile && (
        <ConsentModal
          onAccept={() => {
            setConsentStatus('consented')
            const f = pendingFile
            setPendingFile(null)
            processFile(f)
          }}
          onDecline={() => {
            setPendingFile(null)
            setConsentStatus('declined')
          }}
        />
      )}

      {/* Declined state */}
      {consentStatus === 'declined' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-gray-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Upload not available</h2>
            <p className="text-sm text-gray-500 mb-1 leading-relaxed">
              You chose not to consent to health data processing. No data was stored.
            </p>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              You can change your mind at any time — just click "Upload Report" again and we will ask again.
            </p>
            <div className="space-y-2">
              <Button onClick={() => setConsentStatus('needed')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                I changed my mind — show consent again
              </Button>
              <Link href="/dashboard" className="block">
                <Button variant="ghost" className="w-full text-gray-500">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <MedyraLogo size="md" />
            </Link>
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  {t('upload.backToDashboard')}
                </Button>
                <Button variant="ghost" size="sm" className="flex sm:hidden text-gray-700 hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-700 mb-1 text-sm">{t('upload.notice')}</h3>
              <p className="text-xs text-yellow-800">{t('upload.noticeText')}</p>
            </div>
          </div>
        </div>

        {/* Size error help box */}
        {sizeError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-700 mb-1 text-sm">File too large (max 4 MB)</h3>
                <p className="text-xs text-red-700 mb-2">
                  Your PDF is over 4 MB. Please compress it first — it only takes a few seconds:
                </p>
                <ul className="text-xs text-red-700 space-y-1 list-none">
                  <li>• <strong>ilovepdf.com/compress_pdf</strong> — free, no sign-up</li>
                  <li>• <strong>smallpdf.com/compress-pdf</strong> — free online</li>
                  <li>• On Mac: open in Preview → Export as PDF → choose "Reduce File Size"</li>
                  <li>• On Windows: print to PDF with "Microsoft Print to PDF" at lower quality</li>
                </ul>
              </div>
            </div>
          </div>
        )}

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
                ${isDragActive ? 'border-emerald-600 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'}
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <div className="space-y-3">
                  <Loader2 className="mx-auto h-10 w-10 text-emerald-600 animate-spin" />
                  <p className="text-base font-medium text-gray-900">{progress}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="mx-auto h-10 w-10 text-gray-400" />
                  <div>
                    <p className="text-base font-medium text-gray-900">{t('upload.dragDrop')}</p>
                    <p className="text-sm text-gray-400 mt-1">{t('upload.or')}</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">PDF</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">JPG</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">PNG</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">TXT</span>
                  </div>
                  <p className="text-xs text-gray-400">Max 4 MB · Images auto-compressed</p>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex gap-3 items-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-gray-900">{t('upload.secureProcessing')}</p>
                  <p className="text-xs text-gray-400">{t('upload.secureDesc')}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-gray-900">{t('upload.aiPowered')}</p>
                  <p className="text-xs text-gray-400">{t('upload.aiDesc')}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-gray-900">{t('upload.gdprCompliant')}</p>
                  <p className="text-xs text-gray-400">{t('upload.gdprDesc')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
