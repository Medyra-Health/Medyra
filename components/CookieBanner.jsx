'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined')
    // Disable GA if declined
    window['ga-disable-G-Q8Y2GQCSSS'] = true
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 md:bottom-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-4 shadow-2xl">
      <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-300 flex-1">
          We use cookies for authentication and — with your consent — Google Analytics to improve the service.{' '}
          <Link href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</Link>
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm text-gray-400 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Decline analytics
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
