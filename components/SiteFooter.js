'use client'

import Link from 'next/link'
import Image from 'next/image'
import MedyraLogo from '@/components/MedyraLogo'
import { useTranslations } from 'next-intl'

// Anett Lommatzsch's consultancy, credited with her permission. Set the URL to
// link the logo out; while it is empty the logo renders unlinked.
const MANUS_ORDINANS_URL = ''

// Fixed height so logos of differing aspect ratios still line their labels up
const LOGO_BOX = 'inline-flex items-center justify-center bg-white rounded-lg px-5 h-[68px]'

function SupporterLogo({ href, label, children }) {
  if (!href) return <span className={LOGO_BOX} aria-label={label}>{children}</span>
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${LOGO_BOX} transition-transform hover:scale-[1.02]`}
      aria-label={label}
    >
      {children}
    </a>
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

        {/* Partner + supporters */}
        <div className="border-t border-gray-800 pt-8 mb-2 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-14 text-center">
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('partner')}</p>
            <SupporterLogo
              href="https://www.potsdam-transfer.de"
              label="Potsdam Transfer – Startup Service (Universität Potsdam)"
            >
              <Image
                src="/partners/potsdam-transfer.png"
                alt="Potsdam Transfer – Startup Service, Universität Potsdam"
                width={1258}
                height={429}
                className="h-12 w-auto"
              />
            </SupporterLogo>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('supportedBy')}</p>
            <SupporterLogo href={MANUS_ORDINANS_URL} label="manus ordinans Unternehmensberatung">
              <Image
                src="/partners/manus-ordinans.png"
                alt="manus ordinans Unternehmensberatung"
                width={293}
                height={65}
                className="h-9 w-auto"
              />
            </SupporterLogo>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">{t('copyright')}</p>
          <p className="text-gray-700 text-xs">{t('disclaimer')}</p>
        </div>
      </div>
    </footer>
  )
}
