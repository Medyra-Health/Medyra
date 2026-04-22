'use client'

import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'
import { useTranslations } from 'next-intl'

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
              <li><Link href="/dashboard" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('healthVault')}</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('pricing')}</Link></li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('learn')}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/lexikon" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  {t('lexikon')}
                </Link>
              </li>
              <li><Link href="/blog" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('blog')}</Link></li>
              <li><Link href="/verstehen" className="text-gray-400 hover:text-emerald-400 transition-colors">{t('verstehen')}</Link></li>
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

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">{t('copyright')}</p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-gray-700 text-xs">{t('disclaimer')}</p>
            <span className="hidden sm:block text-gray-700 text-xs">·</span>
            <p className="text-gray-600 text-xs">Powered by <a href="https://www.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-400 transition-colors">Claude AI</a></p>
          </div>
        </div>
      </div>
    </footer>
  )
}
