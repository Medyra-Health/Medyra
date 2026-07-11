'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, Languages } from 'lucide-react'

// "Your German medical report, explained in your language."
// Compact strip linking to the /sprachen landing page.
const LANGS = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ar', label: 'العربية' },
  { code: 'ru', label: 'Русский' },
  { code: 'pl', label: 'Polski' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ur', label: 'اردو' },
  { code: 'bn', label: 'বাংলা' },
]

export default function LanguagesSection() {
  const t = useTranslations()

  return (
    <section className="py-20 md:py-24 bg-[#F3FAF6]">
      <div className="container mx-auto px-4 max-w-4xl text-center">

        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
          <Languages className="h-3.5 w-3.5" />
          {t('languagesSection.badge')}
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17] mb-4">
          {t('languagesSection.title')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-[#10B981]">
            {t('languagesSection.titleHighlight')}
          </span>
        </h2>
        <p className="text-gray-600 text-base max-w-xl mx-auto leading-relaxed mb-9">
          {t('languagesSection.subtitle')}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-9 max-w-2xl mx-auto">
          {LANGS.map(l => (
            <span
              key={l.label}
              className="px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-sm text-gray-700 font-medium shadow-sm"
            >
              {l.label}
            </span>
          ))}
        </div>

        <Link
          href="/sprachen"
          className="inline-flex items-center gap-2 px-7 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 transition-colors"
        >
          {t('languagesSection.cta')} <ArrowRight className="h-4 w-4" />
        </Link>

      </div>
    </section>
  )
}
