'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import HeroReportCard from './HeroReportCard'

// ECG paths: full detail on desktop, simplified (fewer points, lighter stroke) on mobile
const ECG_DESKTOP = 'M0 80 H120 L138 66 L156 80 H290 L306 90 L326 16 L346 140 L366 80 H540 L558 70 L576 80 H720 L736 74 L752 80 H800'
const ECG_MOBILE = 'M0 80 H80 L98 90 L118 24 L138 132 L158 80 H360'

const STATS = [
  { value: '3/mo', labelKey: 'landing.trust.stat1Label' },
  { value: '18', labelKey: 'landing.trust.stat3Label' },
  { value: '<60s', labelKey: 'landing.trust.stat2Label' },
]

export default function HeroSection() {
  const t = useTranslations()
  const reduced = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 767px)').matches)
    setMounted(true)
  }, [])

  // Entrance sequence: badge → headline → subheadline → CTAs → card → stats.
  // Desktop completes in ~1.05s, mobile in ~0.8s.
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: reduced ? 0 : isMobile ? 0.07 : 0.1, delayChildren: 0.05 } },
  }
  const item = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }
    : {
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { duration: isMobile ? 0.4 : 0.5, ease: [0.16, 1, 0.3, 1] } },
      }

  return (
    <section className="hero-root relative flex items-center overflow-hidden bg-[#040C08]" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`
        .hero-root { min-height: 92vh; }
        @supports (height: 100dvh) { .hero-root { min-height: 92dvh; } }

        /* Ambient emerald glows: felt, not seen. Transform-only drift. */
        @keyframes heroDriftA {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(60px, 30px, 0); }
        }
        @keyframes heroDriftB {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-50px, -24px, 0); }
        }
        .hero-glow-a { animation: heroDriftA 26s ease-in-out infinite; }
        .hero-glow-b { animation: heroDriftB 32s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hero-glow-a, .hero-glow-b { animation: none; }
        }

        /* Stats: lift + glow on hover (precise pointers), glow on tap (touch) */
        .hero-stat { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
        @media (hover: hover) and (pointer: fine) {
          .hero-stat:hover { transform: translateY(-3px); border-color: rgba(16,185,129,0.4); box-shadow: 0 0 24px -6px rgba(16,185,129,0.35); }
        }
        .hero-stat:active { border-color: rgba(16,185,129,0.4); box-shadow: 0 0 24px -6px rgba(16,185,129,0.35); }
        @media (prefers-reduced-motion: reduce) {
          .hero-stat, .hero-stat:hover { transform: none; }
        }

        /* CTA glow intensifies on hover / press, box-shadow only */
        .hero-cta-primary { box-shadow: 0 0 28px -8px rgba(16,185,129,0.5); transition: box-shadow 0.25s ease; }
        .hero-cta-primary:hover, .hero-cta-primary:active { box-shadow: 0 0 44px -6px rgba(16,185,129,0.75); }
      `}</style>

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="hero-glow-a absolute -top-32 left-[15%] w-[560px] h-[560px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 68%)' }}
        />
        <div
          className="hero-glow-b absolute -bottom-40 right-[12%] w-[480px] h-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 68%)' }}
        />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate={mounted ? 'visible' : 'hidden'}
        className="container mx-auto px-4 max-w-6xl relative z-10 py-14 md:py-16 lg:py-20"
      >
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: text */}
          <div className="relative">
            {/* ECG line behind the headline, low opacity, draws once then pulses slowly */}
            <div className="absolute left-0 right-0 top-[18%] h-40 pointer-events-none select-none" aria-hidden="true">
              {/* Desktop */}
              <svg viewBox="0 0 800 160" fill="none" className="hidden md:block w-full h-full opacity-[0.16]" preserveAspectRatio="xMidYMid meet">
                <motion.g
                  animate={reduced ? undefined : { opacity: [1, 0.65, 1] }}
                  transition={reduced ? undefined : { repeat: Infinity, duration: 5, delay: 2.2, ease: 'easeInOut' }}
                >
                  <motion.path
                    d={ECG_DESKTOP}
                    stroke="#10B981"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={reduced ? { duration: 0 } : { duration: 1.6, ease: 'easeInOut', delay: 0.3 }}
                  />
                </motion.g>
              </svg>
              {/* Mobile: simplified path, lighter stroke, static after the initial draw */}
              <svg viewBox="0 0 360 160" fill="none" className="md:hidden w-full h-full opacity-[0.14]" preserveAspectRatio="xMidYMid meet">
                <motion.path
                  d={ECG_MOBILE}
                  stroke="#10B981"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={reduced ? { duration: 0 } : { duration: 1.4, ease: 'easeInOut', delay: 0.3 }}
                />
              </svg>
            </div>

            <motion.div variants={item} className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide mb-7">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {t('landing.hero.badge')}
            </motion.div>

            <motion.h1
              variants={item}
              className="relative text-4xl sm:text-5xl lg:text-6xl font-bold text-[#E8F5F0] leading-[1.12] mb-6"
              style={{ fontFamily: 'var(--font-playfair), serif' }}
            >
              {t('landing.hero.title1')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#34D399]">
                {t('landing.hero.title2')}
              </span>
            </motion.h1>

            <motion.p variants={item} className="relative text-[#E8F5F0]/60 text-lg leading-relaxed mb-8 max-w-lg">
              {t('landing.hero.description')}
            </motion.p>

            <motion.div variants={item} className="relative flex flex-col sm:flex-row gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="lg" className="hero-cta-primary text-base px-8 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#10B981] hover:to-[#059669] text-white font-bold rounded-xl h-12 w-full sm:w-auto">
                    {t('landing.hero.ctaAnalyse')} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </SignInButton>
                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="text-base h-12 w-full bg-transparent border-emerald-500/40 text-[#E8F5F0]/80 hover:border-emerald-400 hover:text-[#E8F5F0] hover:bg-emerald-500/10 rounded-xl transition-colors duration-200">
                    {t('landing.hero.ctaHowItWorks')}
                  </Button>
                </a>
              </SignedOut>
              <SignedIn>
                <Link href="/upload" className="w-full sm:w-auto">
                  <Button size="lg" className="hero-cta-primary text-base px-8 w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#10B981] hover:to-[#059669] text-white font-bold rounded-xl h-12">
                    {t('landing.hero.ctaUpload')} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </SignedIn>
            </motion.div>
          </div>

          {/* Right: glass report card */}
          <HeroReportCard />
        </div>

        {/* Stats row */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3 md:gap-6 mt-14 md:mt-20 max-w-3xl mx-auto">
          {STATS.map(({ value, labelKey }) => (
            <div key={labelKey} className="hero-stat flex flex-col items-center text-center p-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06]">
              <p className="text-2xl md:text-3xl font-black text-emerald-400 mb-1">{value}</p>
              <p className="text-xs text-[#E8F5F0]/50 leading-snug">{t(labelKey)}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
