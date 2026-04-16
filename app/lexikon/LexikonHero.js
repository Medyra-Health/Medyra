'use client'

import { useEffect, useState } from 'react'
import { getIndexUI } from '@/lib/lexikonUI'

export default function LexikonHero({ totalCount }) {
  const [lang, setLang] = useState('de')

  useEffect(() => {
    const cookieLang = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('locale='))?.split('=')[1]
    const detected = cookieLang || localStorage.getItem('preferredLanguage') || 'de'
    setLang(detected)
  }, [])

  const ui = getIndexUI(lang)

  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        {totalCount} {ui.badge}
      </div>
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
        {ui.title1}<br />
        <span className="text-emerald-600">{ui.title2}</span>{' '}{ui.title3}
      </h1>
      <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
        {ui.subtitle}
      </p>
    </div>
  )
}
