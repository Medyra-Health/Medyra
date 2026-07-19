'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  Sunrise, Sun, Sunset, Moon, AlarmClock, Users, CalendarCheck2,
  ArrowRight, Check, Sparkles,
} from 'lucide-react'
import AppHeader from '@/components/AppHeader'
import Planner from '@/components/medplan/Planner'

const HERO_SLOTS = [
  { icon: Sunrise, grad: 'from-amber-400 to-orange-500', scheme: '1' },
  { icon: Sun, grad: 'from-sky-400 to-blue-500', scheme: '0' },
  { icon: Sunset, grad: 'from-violet-500 to-purple-600', scheme: '1' },
  { icon: Moon, grad: 'from-indigo-600 to-slate-800', scheme: '0' },
]

function MarketingHero() {
  const t = useTranslations('medplan')

  const features = [
    { icon: CalendarCheck2, title: t('heroFeature1Title'), desc: t('heroFeature1Desc') },
    { icon: AlarmClock, title: t('heroFeature2Title'), desc: t('heroFeature2Desc') },
    { icon: Users, title: t('heroFeature3Title'), desc: t('heroFeature3Desc') },
  ]

  return (
    <div>
      {/* Dark hero */}
      <section className="relative overflow-hidden bg-[#040C08] text-white">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="container mx-auto px-4 py-16 sm:py-24 relative">
          <div className="max-w-2xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 border border-teal-400/20 text-teal-300 text-xs font-bold px-3.5 py-1.5 mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" /> {t('heroBadge')}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="text-4xl sm:text-5xl font-bold leading-[1.12] mb-5"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              {t('heroTitle')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
              className="text-gray-400 text-base sm:text-lg leading-relaxed mb-9 max-w-xl mx-auto"
            >
              {t('heroSub')}
            </motion.p>

            {/* Animated 1-0-1-0 slot strip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.24 }}
              className="flex items-center justify-center gap-3 sm:gap-4 mb-10"
            >
              {HERO_SLOTS.map(({ icon: Icon, grad, scheme }, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.6, delay: i * 0.35, ease: 'easeInOut' }}
                    className="flex flex-col items-center gap-2"
                  >
                    <span className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </span>
                    <span className="text-lg font-extrabold text-teal-300 tabular-nums">{scheme}</span>
                  </motion.div>
                  {i < 3 && <span className="text-gray-600 font-bold text-lg -mt-6">–</span>}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <SignInButton mode="modal" forceRedirectUrl="/medplan">
                <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-900 font-bold text-sm shadow-lg shadow-teal-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  {t('heroCta')}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </SignInButton>
              <span className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-teal-400" /> {t('heroFree')}
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Light feature section */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-14 sm:py-18">
          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-3xl border border-gray-100 bg-gradient-to-b from-gray-50/80 to-white p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="h-11 w-11 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-teal-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/pricing" className="text-sm font-bold text-teal-600 hover:text-teal-700">
              {t('heroPricingLink')} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function MedplanPage() {
  const t = useTranslations('medplan')
  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <SignedIn>
        <AppHeader back={{ href: '/dashboard', label: t('backLabel') }} title={t('title')} tone="teal" user />
        <main className="container mx-auto px-4 py-7 max-w-4xl">
          <div className="mb-6 no-print">
            <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
            <p className="text-sm text-slate-500 mt-1">{t('subtitle')}</p>
          </div>
          <Planner />
        </main>
      </SignedIn>
      <SignedOut>
        <AppHeader title={t('title')} tone="teal" homeHref="/" />
        <MarketingHero />
      </SignedOut>
    </div>
  )
}
