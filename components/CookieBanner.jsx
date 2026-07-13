'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const GA_CONSENT_GRANTED = {
  analytics_storage: 'granted',
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
}

const GA_CONSENT_DENIED = {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
}

function updateGAConsent(update) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('consent', 'update', update)
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const t = useTranslations('cookieBanner')

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (consent === 'accepted') {
      // C4: Restore previously granted consent on every page load
      updateGAConsent(GA_CONSENT_GRANTED)
      setVisible(false)
    } else if (consent === 'declined') {
      setVisible(false)
    } else {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    // C4: Only grant analytics_storage after explicit opt-in (TTDSG §25 compliant)
    updateGAConsent(GA_CONSENT_GRANTED)
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined')
    updateGAConsent(GA_CONSENT_DENIED)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 md:bottom-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-4 shadow-2xl">
      <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-300 flex-1">
          {t('text')}{' '}
          <Link href="/privacy" className="text-emerald-400 hover:underline">{t('privacyPolicy')}</Link>
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {t('decline')}
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
