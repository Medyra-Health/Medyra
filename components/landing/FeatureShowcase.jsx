'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

// "What Medyra explains": auto advancing, animated showcase of every real
// feature. Tab titles reuse the footer's short labels (translated in all 17
// locales); each panel shows an authentic German document mock plus a one
// line description and a deep link to the feature page.
const ROTATE_MS = 5000

const FEATURES = [
  {
    id: 'lab',
    titleKey: 'siteFooter.understandCheck',
    descKey: 'featureShow.descLab',
    href: '/check',
    icon: '🧪',
    accent: '#14B8A6',
    mock: {
      kind: 'rows',
      title: 'Laborbefund',
      rows: [
        ['TSH', '2.1 mU/l', 'ok'],
        ['Ferritin', '8 µg/L ↓', 'warn'],
        ['HbA1c', '5.4 %', 'ok'],
        ['CRP', '11.2 mg/L ↑', 'bad'],
      ],
      badge: '2 Werte außerhalb des Normalbereichs',
    },
  },
  {
    id: 'letter',
    titleKey: 'siteFooter.understandArztbrief',
    descKey: 'featureShow.descLetter',
    href: '/arztbrief',
    icon: '📋',
    accent: '#3B82F6',
    mock: {
      kind: 'quote',
      title: 'Arztbrief',
      quote: '"V. a. degenerative Veränderungen der LWS ohne höhergradige Spinalkanalstenose."',
      lines: ['LWS = Lendenwirbelsäule', 'V. a. = Verdacht auf', 'Keine starke Einengung: gute Nachricht'],
    },
  },
  {
    id: 'hospital',
    titleKey: 'siteFooter.understandHospital',
    descKey: 'featureShow.descHospital',
    href: '/entlassungsbericht',
    icon: '🏥',
    accent: '#6366F1',
    mock: {
      kind: 'quote',
      title: 'Entlassungsbericht',
      quote: '"Procedere: Fadenzug am 10. postoperativen Tag, körperliche Schonung für 2 Wochen."',
      lines: ['Fäden ziehen: in 10 Tagen', 'Schonung: 2 Wochen', 'Nachsorge beim Hausarzt'],
    },
  },
  {
    id: 'meds',
    titleKey: 'siteFooter.understandMedication',
    descKey: 'featureShow.descMeds',
    href: '/medikamente',
    icon: '💊',
    accent: '#8B5CF6',
    mock: {
      kind: 'rows',
      title: 'Medikationsplan',
      rows: [
        ['Ramipril 5 mg', '1-0-0', 'ok'],
        ['Metformin 850 mg', '1-0-1', 'ok'],
        ['Pantoprazol 20 mg', 'nüchtern', 'warn'],
      ],
      badge: 'Einnahme als klarer Tagesablauf erklärt',
    },
  },
  {
    id: 'insurance',
    titleKey: 'siteFooter.understandInsurance',
    descKey: 'featureShow.descInsurance',
    href: '/krankenkasse',
    icon: '📬',
    accent: '#F59E0B',
    mock: {
      kind: 'quote',
      title: 'Krankenkassen-Bescheid',
      quote: '"...kann nach § 33 SGB V nicht in vollem Umfang entsprochen werden. Widerspruch innerhalb eines Monats."',
      lines: ['Nur teilweise bewilligt', 'Widerspruchsfrist: 1 Monat', 'Begründung anfordern'],
    },
  },
  {
    id: 'languages',
    titleKey: 'siteFooter.understandLanguages',
    descKey: 'featureShow.descLanguages',
    href: '/sprachen',
    icon: '🌍',
    accent: '#10B981',
    mock: {
      kind: 'rows',
      title: 'Hämoglobin 11.8 g/dL ↓',
      rows: [
        ['Türkçe', 'Hemoglobin değeriniz hafif düşük.', 'ok'],
        ['English', 'Your hemoglobin is slightly low.', 'ok'],
        ['العربية', 'الهيموغلوبين لديك منخفض قليلاً.', 'ok'],
      ],
      badge: 'Eine Erklärung, 17 Sprachen',
    },
  },
]

const DOT = { ok: '#10B981', warn: '#F59E0B', bad: '#EF4444' }

export default function FeatureShowcase() {
  const t = useTranslations()
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progressKey, setProgressKey] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    if (paused || reduced) return
    timer.current = setTimeout(() => {
      setActive(a => (a + 1) % FEATURES.length)
      setProgressKey(k => k + 1)
    }, ROTATE_MS)
    return () => clearTimeout(timer.current)
  }, [active, paused, reduced, progressKey])

  function select(i) {
    setActive(i)
    setProgressKey(k => k + 1)
  }

  const f = FEATURES[active]

  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-12 sr">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            {t('featureShow.badge')}
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17] mb-4">
            {t('featureShow.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-[#10B981]">
              {t('featureShow.titleHighlight')}
            </span>
          </h2>
          <p className="text-gray-600 text-base max-w-xl mx-auto leading-relaxed">
            {t('featureShow.subtitle')}
          </p>
        </div>

        <div
          className="grid lg:grid-cols-[1fr,1.2fr] gap-6 lg:gap-10 items-stretch sr"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Tab list */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
            {FEATURES.map((feat, i) => {
              const isActive = i === active
              return (
                <button
                  key={feat.id}
                  onClick={() => select(i)}
                  className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 flex-shrink-0 lg:flex-shrink ${
                    isActive
                      ? 'border-emerald-300 bg-emerald-50/60 shadow-md shadow-emerald-900/5'
                      : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
                  }`}
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-transform duration-300"
                    style={{ background: `${feat.accent}14`, transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
                  >
                    {feat.icon}
                  </span>
                  <span className={`text-sm font-semibold whitespace-nowrap lg:whitespace-normal ${isActive ? 'text-[#0B1F17]' : 'text-gray-500'}`}>
                    {t(feat.titleKey)}
                  </span>
                  {/* Auto-advance progress line */}
                  {isActive && !reduced && (
                    <span className="absolute left-4 right-4 bottom-1.5 h-0.5 rounded-full bg-emerald-100 overflow-hidden hidden lg:block" aria-hidden="true">
                      <span
                        key={progressKey}
                        className="block h-full bg-emerald-400 origin-left"
                        style={{ animation: paused ? 'none' : `fsProgress ${ROTATE_MS}ms linear both` }}
                      />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Animated panel */}
          <div className="relative min-h-[340px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={f.id}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.99 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 rounded-2xl bg-[#08130D] border border-white/10 p-6 md:p-8 shadow-2xl shadow-emerald-900/10 flex flex-col"
              >
                <div className="flex items-center justify-between gap-2 mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: f.accent }}>
                    {f.mock.title}
                  </p>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: f.accent }} />
                </div>

                {f.mock.kind === 'rows' ? (
                  <div className="space-y-3 flex-1">
                    {f.mock.rows.map(([label, value, tone], i) => (
                      <motion.div
                        key={label}
                        initial={reduced ? false : { opacity: 0, x: 14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 + i * 0.09, duration: 0.35 }}
                        className="flex items-center justify-between gap-3 py-2.5 border-b border-white/5 last:border-0"
                      >
                        <span className="text-sm text-[#E8F5F0]/60 min-w-0">{label}</span>
                        <span className="text-sm font-semibold text-[#E8F5F0] flex items-center gap-1.5 text-right">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: DOT[tone] }} />
                          {value}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1">
                    <motion.p
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.35 }}
                      className="font-mono text-xs text-[#E8F5F0]/50 leading-relaxed bg-white/[0.04] border border-white/5 rounded-xl p-4 mb-4"
                    >
                      {f.mock.quote}
                    </motion.p>
                    <div className="space-y-2.5">
                      {f.mock.lines.map((line, i) => (
                        <motion.div
                          key={line}
                          initial={reduced ? false : { opacity: 0, x: 14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.1, duration: 0.35 }}
                          className="flex items-start gap-2.5 text-sm text-[#E8F5F0]/75 leading-relaxed"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                          {line}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {f.mock.badge && (
                  <motion.p
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.3 }}
                    className="inline-flex self-start items-center gap-1.5 mt-4 text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-400/25 rounded-full px-3 py-1.5"
                  >
                    {f.mock.badge}
                  </motion.p>
                )}

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs text-[#E8F5F0]/50 leading-relaxed max-w-sm">{t(f.descKey)}</p>
                  <Link
                    href={f.href}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap"
                  >
                    {t('featureShow.more')} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fsProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>
    </section>
  )
}
