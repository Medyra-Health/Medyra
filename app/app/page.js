'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Download, ShieldCheck, Smartphone, Apple, Share, SquarePlus, Globe } from 'lucide-react'
import MedyraLogo from '@/components/MedyraLogo'

// Hosted on the public website repo so anonymous visitors can download it.
// The medyra-mobile repo is private; its releases are not publicly reachable.
const APK_URL = 'https://github.com/Medyra-Health/Medyra/releases/latest/download/medyra.apk'

function Steps({ items }) {
  return (
    <ol className="space-y-3 mt-5">
      {items.map(({ icon: Icon, text }, i) => (
        <li key={text} className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
            {i + 1}
          </span>
          <span className="text-gray-700 text-sm leading-relaxed pt-1 flex-1">{text}</span>
          {Icon && <Icon className="h-4 w-4 text-gray-400 mt-1.5 shrink-0" aria-hidden />}
        </li>
      ))}
    </ol>
  )
}

export default function AppDownloadPage() {
  const t = useTranslations('appPage')

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Dark hero */}
      <section className="bg-[#040C08] text-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <header className="flex items-center justify-between py-5">
            <Link href="/" aria-label="Medyra">
              <MedyraLogo size="sm" variant="dark" />
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
            >
              <Globe className="h-4 w-4" aria-hidden />
              medyra.de
            </Link>
          </header>

          <div className="pt-10 pb-24 text-center">
            <span className="inline-block rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
              {t('badge')}
            </span>
            <h1 className="font-display mt-5 text-4xl md:text-5xl font-bold leading-tight">
              {t('title')}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-gray-300 leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Cards overlapping the hero */}
      <section className="flex-1 bg-gradient-to-b from-[#040C08] via-white to-white">
        <div className="container mx-auto px-4 max-w-5xl -mt-12 pb-20">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Android */}
            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <Smartphone className="h-6 w-6 text-emerald-700" aria-hidden />
                </span>
                <h2 className="font-display text-2xl font-bold text-gray-900">{t('androidTitle')}</h2>
              </div>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">{t('androidDesc')}</p>
              <Steps
                items={[
                  { icon: Download, text: t('androidStep1') },
                  { text: t('androidStep2') },
                  { text: t('androidStep3') },
                ]}
              />
              <a
                href={APK_URL}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition-transform hover:scale-[1.02]"
              >
                <Download className="h-5 w-5" aria-hidden />
                {t('androidButton')}
              </a>
              <p className="mt-4 flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                {t('androidNote')}
              </p>
            </div>

            {/* iPhone */}
            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">
                  <Apple className="h-6 w-6 text-white" aria-hidden />
                </span>
                <h2 className="font-display text-2xl font-bold text-gray-900">{t('iosTitle')}</h2>
              </div>
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">{t('iosDesc')}</p>
              <Steps
                items={[
                  { icon: Globe, text: t('iosStep1') },
                  { icon: Share, text: t('iosStep2') },
                  { icon: SquarePlus, text: t('iosStep3') },
                ]}
              />
              <p className="mt-6 flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                {t('iosNote')}
              </p>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-center text-xs text-gray-400 leading-relaxed">
            {t('storesNote')}
          </p>
        </div>
      </section>
    </div>
  )
}
