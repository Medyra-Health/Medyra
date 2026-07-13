'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { CheckCircle, Loader2, FileText, LayoutDashboard, ArrowRight, Shield, RefreshCw, Mail } from 'lucide-react'

function SuccessContent() {
  const t = useTranslations('success')
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">{t('activating')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('momentNote')}</p>
        </div>
      </div>
    )
  }

  const features = [
    { icon: FileText, text: t('feature1') },
    { icon: Shield, text: t('feature2') },
    { icon: RefreshCw, text: t('feature3') },
    { icon: Mail, text: t('feature4') },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-lg">

        {/* Header card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Green top bar */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2" />

          <div className="px-8 pt-10 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-emerald-600 font-semibold text-lg mb-1">{t('subtitle')}</p>
            <p className="text-gray-500 text-sm">
              {t('receiptNote')}
            </p>
          </div>

          {/* What you get */}
          <div className="mx-8 mb-6 bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3">{t('includedLabel')}</p>
            <div className="space-y-2.5">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-gray-700">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="px-8 pb-8 space-y-3">
            <Link href="/upload" className="block">
              <button className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-sm shadow-emerald-200 text-sm">
                <FileText className="h-4 w-4" />
                {t('uploadCta')}
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </Link>
            <Link href="/dashboard" className="block">
              <button className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-2xl transition-colors text-sm">
                <LayoutDashboard className="h-4 w-4" />
                {t('dashboardCta')}
              </button>
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          {t('questionsNote')}{' '}
          <a href="mailto:hello@medyra.de" className="text-emerald-600 hover:underline font-medium">
            hello@medyra.de
          </a>
          {' '}{t('replyNote')}
        </p>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
