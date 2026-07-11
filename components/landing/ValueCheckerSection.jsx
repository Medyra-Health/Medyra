'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, FlaskConical } from 'lucide-react'
import ValueChecker from '@/components/werte/ValueChecker'

// Landing section: try the product in 10 seconds, no signup.
// Light section wrapping a solid dark product card (design system rule).
export default function ValueCheckerSection() {
  const t = useTranslations()

  return (
    <section className="py-20 md:py-28 bg-[#F3FAF6]">
      <div className="container mx-auto px-4 max-w-3xl">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <FlaskConical className="h-3.5 w-3.5" />
            {t('valueChecker.badge')}
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17] mb-4">
            {t('valueChecker.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-[#10B981]">
              {t('valueChecker.titleHighlight')}
            </span>
          </h2>
          <p className="text-gray-600 text-base max-w-xl mx-auto leading-relaxed">
            {t('valueChecker.subtitle')}
          </p>
        </div>

        {/* Dark product card with the live checker */}
        <div className="rounded-2xl bg-[#08130D] border border-emerald-500/15 p-6 md:p-8 shadow-2xl shadow-emerald-900/15">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              {t('valueChecker.cardLabel')}
            </p>
            <span className="text-[10px] font-semibold text-[#E8F5F0]/35 border border-white/10 rounded-full px-2.5 py-1 whitespace-nowrap">
              {t('valueChecker.noSignup')}
            </span>
          </div>
          <ValueChecker tone="dark" />
        </div>

        <div className="text-center mt-6">
          <Link
            href="/check"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            {t('valueChecker.fullToolLink')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </section>
  )
}
