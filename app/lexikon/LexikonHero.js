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
    <div className="text-center mb-12 relative">
      <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
        <span className="w-2 h-2 rounded-full bg-cyan-500" />
        {totalCount} {ui.badge}
      </div>
      <h1 className="text-3xl md:text-5xl font-bold text-[#0B1F17] mb-4 leading-tight" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
        {ui.title1}<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-cyan-400">{ui.title2}</span>{' '}{ui.title3}
      </h1>
      <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
        {ui.subtitle}
      </p>
    </div>
  )
}
