'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { FileText, Image, File, AlertCircle, CheckCircle, Loader2, ArrowLeft, Shield, Clock, Lock, ChevronRight } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import MedyraLogo from '@/components/MedyraLogo'
import ConsentModal from '@/components/ConsentModal'

const MAX_BYTES = 4 * 1024 * 1024

async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
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

const STEPS = [
  { icon: '📄', label: 'Upload', desc: 'Drop your file' },
  { icon: '🔍', label: 'Extract', desc: 'Text is read by AI' },
  { icon: '✨', label: 'Explain', desc: 'Plain language result' },
]

const FORMATS = [
  { icon: FileText, label: 'PDF', color: 'text-red-500 bg-red-50 border-red-100' },
  { icon: Image, label: 'JPG / PNG', color: 'text-blue-500 bg-blue-50 border-blue-100' },
  { icon: File, label: 'TXT', color: 'text-gray-500 bg-gray-50 border-gray-200' },
]

const PROGRESS_STEPS = [
  { key: 'compress', tKey: 'upload.progressCompress' },
  { key: 'upload', tKey: 'upload.progressUpload' },
  { key: 'extract', tKey: 'upload.progressExtract' },
  { key: 'ai', tKey: 'upload.progressAi' },
  { key: 'done', tKey: 'upload.progressDone' },
]

export default function UploadPage() {
  const { isLoaded } = useUser()
  const router = useRouter()
  const t = useTranslations()
  const [uploading, setUploading] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [sizeError, setSizeError] = useState(false)
  const [consentStatus, setConsentStatus] = useState('loading')
  const [pendingFile, setPendingFile] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    fetch('/api/consent')
      .then(r => r.json())
      .then(d => setConsentStatus(d.consented ? 'consented' : 'needed'))
      .catch(() => setConsentStatus('needed'))
  }, [isLoaded])

  // Animate progress steps while uploading
  useEffect(() => {
    if (!uploading) { setProgressStep(0); return }
    const id = setInterval(() => {
      setProgressStep(p => Math.min(p + 1, PROGRESS_STEPS.length - 1))
    }, 2200)
    return () => clearInterval(id)
  }, [uploading])

  async function processFile(file) {
    setSizeError(false)
    setUploading(true)
    setProgressStep(0)

    try {
      if (file.type.startsWith('image/') && file.size > MAX_BYTES) {
        try { file = await compressImage(file) } catch { /* continue */ }
      }
      if (!file.type.startsWith('image/') && file.size > MAX_BYTES) {
        setSizeError(true)
        throw new Error('FILE_TOO_LARGE')
      }

      const formData = new FormData()
      formData.append('file', file)
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

      const data = await response.json()
      toast.success('Analysis complete!')
      router.push(`/reports/${data.reportId}`)
    } catch (error) {
      if (error.message !== 'FILE_TOO_LARGE') {
        toast.error(error.message || t('errors.analysisFailed'))
      }
    } finally {
      setUploading(false)
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
    disabled: uploading || consentStatus === 'loading',
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    onDropAccepted: () => setIsDragOver(false),
  })

  if (!isLoaded) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">{t('common.loading')}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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

      {consentStatus === 'declined' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-gray-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Upload not available</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              You chose not to consent to health data processing. No data was stored. You can change your mind at any time.
            </p>
            <div className="space-y-2">
              <Button onClick={() => setConsentStatus('needed')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                I changed my mind
              </Button>
              <Link href="/dashboard" className="block">
                <Button variant="ghost" className="w-full text-gray-500">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard"><MedyraLogo size="md" /></Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-600 hover:text-gray-900 hover:bg-gray-50 gap-1.5">
                <ArrowLeft className="h-4 w-4" /> {t('upload.backToDashboard')}
              </Button>
              <Button variant="ghost" size="sm" className="flex sm:hidden text-gray-600 hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-xl">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Upload your medical report</h1>
          <p className="text-gray-500 text-sm">Get a plain language explanation in under 60 seconds</p>
        </div>

        {/* How it works — 3 steps */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center text-center w-24">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-lg mb-1.5">
                  {step.icon}
                </div>
                <p className="text-xs font-semibold text-gray-800">{step.label}</p>
                <p className="text-xs text-gray-400">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-300 mx-1 mb-3 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Size error */}
        {sizeError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 text-sm mb-1">File too large (max 4 MB)</p>
                <p className="text-xs text-red-600 mb-2">Please compress your PDF first — it takes a few seconds:</p>
                <ul className="text-xs text-red-600 space-y-0.5">
                  <li>• <strong>ilovepdf.com/compress_pdf</strong> — free, no sign up</li>
                  <li>• <strong>smallpdf.com/compress-pdf</strong> — free online</li>
                  <li>• Mac: Preview → Export as PDF → Reduce File Size</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Main drop zone */}
        <div
          {...getRootProps()}
          className={`
            relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
            ${isDragActive || isDragOver
              ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
              : uploading
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/30'}
          `}
        >
          <input {...getInputProps()} />

          <div className="p-6 sm:p-10 flex flex-col items-center text-center">
            {uploading ? (
              <div className="w-full">
                {/* Animated progress */}
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                </div>
                <div className="space-y-2 max-w-xs mx-auto">
                  {PROGRESS_STEPS.map((step, i) => (
                    <div
                      key={step.key}
                      className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                        i < progressStep ? 'text-emerald-600' :
                        i === progressStep ? 'text-gray-900 font-medium' :
                        'text-gray-300'
                      }`}
                    >
                      {i < progressStep ? (
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      ) : i === progressStep ? (
                        <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-emerald-500" />
                      ) : (
                        <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-gray-200" />
                      )}
                      {t(step.tKey)}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-5">{t('upload.progressDuration')}</p>
              </div>
            ) : (
              <>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isDragActive ? 'bg-emerald-500' : 'bg-gray-100'}`}>
                  <svg className={`w-8 h-8 ${isDragActive ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>

                {isDragActive ? (
                  <p className="text-base font-semibold text-emerald-700 mb-1">{t('upload.dropActive')}</p>
                ) : (
                  <>
                    <p className="text-base font-semibold text-gray-900 mb-1">{t('upload.dropHere')}</p>
                    <p className="text-sm text-gray-400 mb-5">{t('upload.orBrowse')}</p>
                  </>
                )}

                {!isDragActive && (
                  <div className="flex gap-2 flex-wrap justify-center">
                    {FORMATS.map(({ icon: Icon, label, color }) => (
                      <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </div>
                    ))}
                  </div>
                )}

                {!isDragActive && (
                  <p className="text-xs text-gray-400 mt-4">{t('upload.autoCompressed')}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Trust row */}
        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { icon: Lock, label: t('upload.secureProcessing'), sub: t('upload.secureDesc') },
            { icon: Clock, label: t('upload.aiPowered'), sub: t('upload.aiDesc') },
            { icon: Shield, label: t('upload.gdprCompliant'), sub: t('upload.gdprDesc') },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center p-2 sm:p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
              <Icon className="h-4 w-4 text-emerald-500 mb-1" />
              <p className="text-xs font-semibold text-gray-800 leading-tight">{label}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 leading-tight mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed px-4">
          {t('upload.noticeText')}
        </p>
      </div>
    </div>
  )
}
