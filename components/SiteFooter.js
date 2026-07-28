'use client'

import Link from 'next/link'
import Image from 'next/image'
import MedyraLogo from '@/components/MedyraLogo'
import { useTranslations } from 'next-intl'
import { ArrowUpRight } from 'lucide-react'

// Contractual partners. Potsdam Transfer's placement is required by clause 2g.
const PARTNERS = [
  {
    name: 'Potsdam Transfer – Startup Service, Universität Potsdam',
    href: 'https://www.potsdam-transfer.de',
    src: '/partners/potsdam-transfer.png',
    width: 1258,
    height: 429,
  },
]

// Organisations that support Medyra without a partnership. Kept visually
// smaller than PARTNERS so the two tiers stay distinguishable.
const SUPPORTERS = [
  {
    name: 'manus ordinans Unternehmensberatung',
    href: 'https://www.manus-ordinans.de',
    src: '/partners/manus-ordinans.png',
    width: 293,
    height: 65,
  },
]

const PLATE = {
  partner: { box: 'h-[76px] px-6', logo: 'h-11 w-auto' },
  supporter: { box: 'h-[62px] px-5', logo: 'h-7 w-auto' },
}

/**
 * One credited organisation. The white plate keeps dark logos legible against
 * the dark footer and is a fixed height, so logos of differing aspect ratios
 * still sit on a shared baseline.
 */
function CreditLogo({ item, tier }) {
  const s = PLATE[tier]
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.name} (opens in a new tab)`}
      className="group relative rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
    >
      <span
        className={`inline-flex items-center justify-center rounded-xl bg-white ring-1 ring-white/10 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-black/30 group-hover:ring-emerald-400/40 ${s.box}`}
      >
        <Image src={item.src} alt={item.name} width={item.width} height={item.height} className={s.logo} />
      </span>
      <ArrowUpRight
        aria-hidden="true"
        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 p-0.5 text-white opacity-0 scale-75 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100"
      />
    </a>
  )
}

/** One labelled tier: a caption with hairlines, then that tier's logos. */
function CreditRow({ label, items, tier }) {
  if (!items.length) return null
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3 w-full max-w-xs">
        <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-700" />
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap">{label}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-700" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {items.map(item => <CreditLogo key={item.href} item={item} tier={tier} />)}
      </div>
    </div>
  )
}

export default function SiteFooter() {
  const t = useTranslations('siteFooter')

  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <MedyraLogo size="sm" variant="dark" />
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('product')}</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/upload" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('upload')}</Link></li>
              <li><Link href="/prep" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('prep')}</Link></li>
              <li><Link href="/medplan" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('medplan')}</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('healthVault')}</Link></li>
              <li><Link href="/verstehen" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('verstehen')}</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('pricing')}</Link></li>
              <li><Link href="/app" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('app')}</Link></li>
            </ul>
          </div>

          {/* Understand: features + knowledge, one merged column */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('understand')}</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/check" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('understandCheck')}</Link></li>
              <li><Link href="/arztbrief" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('understandArztbrief')}</Link></li>
              <li><Link href="/entlassungsbericht" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('understandHospital')}</Link></li>
              <li><Link href="/medikamente" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('understandMedication')}</Link></li>
              <li><Link href="/krankenkasse" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('understandInsurance')}</Link></li>
              <li><Link href="/sprachen" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('understandLanguages')}</Link></li>
              <li><Link href="/lexikon" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('lexikon')}</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('blog')}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('company')}</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('privacy')}</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('terms')}</Link></li>
              <li><Link href="/impressum" className="text-gray-400 hover:text-emerald-400 transition-colors">Impressum</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('contact')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Credits, one labelled row per tier so each can grow independently */}
        <div className="border-t border-gray-800 pt-9 mb-2 flex flex-col gap-7">
          <CreditRow label={t('partner')} items={PARTNERS} tier="partner" />
          <CreditRow label={t('supportedBy')} items={SUPPORTERS} tier="supporter" />
        </div>

        <div className="border-t border-gray-800 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">{t('copyright')}</p>
          <p className="text-gray-700 text-xs">{t('disclaimer')}</p>
        </div>
      </div>
    </footer>
  )
}
