'use client'

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import MedyraUserButton from '@/components/MedyraUserButton'
import Link from 'next/link'
import { Brain, Shield, Clock, ChevronRight, Menu, X, ArrowRight, AlertTriangle, CheckCircle, AlertCircle, Lock, FileText, Download, ChevronLeft, Volume2 } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import JsonLd from '@/components/JsonLd'
import MedyraLogo from '@/components/MedyraLogo'
import HeroSection from '@/components/landing/HeroSection'
import ValueCheckerSection from '@/components/landing/ValueCheckerSection'
import FeatureShowcase from '@/components/landing/FeatureShowcase'
import ScrollToTop from '@/components/ScrollToTop'

const LANGUAGES = [
  { code: 'DE', name: 'Deutsch' },
  { code: 'GB', name: 'English' },
  { code: 'FR', name: 'Français' },
  { code: 'ES', name: 'Español' },
  { code: 'AE', name: 'العربية' },
  { code: 'CN', name: '中文' },
  { code: 'JP', name: '日本語' },
  { code: 'PT', name: 'Português' },
  { code: 'RU', name: 'Русский' },
  { code: 'TR', name: 'Türkçe' },
  { code: 'IN', name: 'हिन्दी' },
  { code: 'PK', name: 'اردو' },
  { code: 'BD', name: 'বাংলা' },
  { code: 'IT', name: 'Italiano' },
  { code: 'NL', name: 'Dutch' },
  { code: 'PL', name: 'Polski' },
  { code: 'KR', name: '한국어' },
]

function NavLink({ href, children, className = '' }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
        active
          ? 'text-gray-900 bg-gray-100'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
      } ${className}`}
    >
      {children}
    </Link>
  )
}

export default function LandingPage() {
  const t = useTranslations()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.scroll-fade, .sr, .sr-left, .sr-right, .sr-pop').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white" style={{ WebkitOverflowScrolling: 'touch', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`
        html { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }

        .font-display { font-family: var(--font-playfair), Georgia, serif; }

        /* ── Scroll reveal ── */
        .sr {
          opacity: 0;
          transform: translateY(44px) scale(0.98);
          transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1);
          will-change: opacity, transform;
        }
        .sr.in-view { opacity: 1; transform: translateY(0) scale(1); }
        .sr-left  { opacity: 0; transform: translateX(-36px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .sr-left.in-view { opacity: 1; transform: translateX(0); }
        .sr-right { opacity: 0; transform: translateX(36px);  transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .sr-right.in-view { opacity: 1; transform: translateX(0); }
        .sr-pop { opacity: 0; transform: scale(0.88); transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.34,1.56,0.64,1); }
        .sr-pop.in-view { opacity: 1; transform: scale(1); }

        /* stagger delays */
        .d1 { transition-delay: 80ms; }
        .d2 { transition-delay: 160ms; }
        .d3 { transition-delay: 240ms; }
        .d4 { transition-delay: 320ms; }
        .d5 { transition-delay: 400ms; }

        /* Legacy aliases */
        .scroll-fade { opacity: 0; transform: translateY(36px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .scroll-fade.in-view { opacity: 1; transform: translateY(0); }
        .scroll-fade.delay-1 { transition-delay: 100ms; }
        .scroll-fade.delay-2 { transition-delay: 200ms; }
        .scroll-fade.delay-3 { transition-delay: 300ms; }
        .scroll-fade.delay-4 { transition-delay: 400ms; }

        /* ── Hover glow card ── */
        .glow-card { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
        .glow-card:hover { transform: translateY(-4px) scale(1.015); }

        /* ── Ticker ── */
        @keyframes tickerL { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes tickerR { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .ticker-l { animation: tickerL 28s linear infinite; }
        .ticker-r { animation: tickerR 32s linear infinite; }
        .ticker-wrap { overflow: hidden; mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
        .ticker-wrap:hover .ticker-l,
        .ticker-wrap:hover .ticker-r { animation-play-state: paused; }

        /* ── Vault chart bars: grow from the baseline on reveal ── */
        .vault-bars .vault-bar {
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .vault-bars.in-view .vault-bar { transform: scaleY(1); }
        @media (prefers-reduced-motion: reduce) {
          .vault-bars .vault-bar { transform: none; transition: none; }
        }

        /* ── Floating orbs ── */
        @keyframes orbFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-18px) scale(1.04); } }
        @keyframes orbFloat2 { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(12px) rotate(8deg); } }
      `}</style>
      <JsonLd />

      {/* ── NAVIGATION ── */}
      <nav
        className="border-b border-gray-200/70 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm"
        style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
      >
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex justify-between items-center gap-4">
            <Link href="/" className="flex-shrink-0"><MedyraLogo size="md" /></Link>

            {/* Desktop nav, all right-aligned */}
            <div className="hidden md:flex items-center gap-2 ml-auto">
              <LanguageSwitcher />

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all duration-150">
                    {t('nav.signIn')}
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="px-4 py-1.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-lg transition-all shadow-sm shadow-emerald-200">
                    {t('nav.tryFree')} →
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <Link href="/dashboard">
                  <button className="px-4 py-1.5 text-sm font-semibold bg-gray-900 hover:bg-gray-800 active:scale-95 text-white rounded-lg transition-all shadow-sm">
                    {t('nav.dashboard')}
                  </button>
                </Link>
                <Link href="/upload">
                  <button className="px-4 py-1.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-lg transition-all shadow-sm shadow-emerald-200">
                    {t('nav.upload')}
                  </button>
                </Link>
                <MedyraUserButton />
              </SignedIn>
            </div>

            {/* Mobile toggle */}
            <div className="flex md:hidden items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-3 pb-3 border-t border-gray-100 mt-3">
              <SignedOut>
                <div className="flex gap-2">
                  <SignInButton mode="modal">
                    <button className="flex-1 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors text-center" onClick={() => setMobileMenuOpen(false)}>
                      {t('nav.signIn')}
                    </button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <button className="flex-1 px-4 py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                      {t('nav.tryFree')} →
                    </button>
                  </SignInButton>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex gap-2 mb-2">
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors">
                    {t('nav.dashboard')}
                  </Link>
                  <Link href="/upload" onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors">
                    {t('nav.upload')}
                  </Link>
                </div>
                <div className="flex items-center justify-between px-1 py-1.5">
                  <span className="text-sm text-gray-500">Account</span>
                  <MedyraUserButton />
                </div>
              </SignedIn>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO (incl. stats row) ── */}
      <HeroSection />

      {/* ── BEFORE / AFTER ── */}
      <section id="explore" className="py-16 md:py-24 bg-white relative overflow-hidden scroll-mt-16">
        {/* subtle bg orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-80 h-80 bg-red-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-emerald-100/60 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 max-w-4xl relative">
          <div className="text-center mb-10 sr">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">{t('problem.badge')}</p>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-[#0B1F17] mb-3">{t('problem.heading')}</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">{t('problem.subheading')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 items-stretch">
            {/* Before */}
            <div className="rounded-2xl border border-red-200 bg-white shadow-sm p-5 glow-card hover:border-red-300 hover:shadow-[0_12px_32px_rgba(239,68,68,0.1)] sr-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-600 uppercase tracking-widest">{t('problem.before')}</span>
              </div>
              <div className="font-mono text-xs bg-[#0B1F17] rounded-xl p-4 space-y-2.5">
                {[['TSH','4.2 mIU/L','text-gray-400'],['HbA1c','6.1% ↑','text-orange-400'],['eGFR','58 mL/min ↓','text-orange-400'],['CRP','12.4 mg/L ↑↑','text-red-400'],['Ferritin','11 µg/L ↓','text-orange-400'],['Vitamin D','28 nmol/L','text-gray-400']].map(([k,v,c]) => (
                  <div key={k} className="flex justify-between border-b border-white/10 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-500">{k}</span>
                    <span className={`font-bold ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-red-500 mt-4 text-center italic">{t('problem.beforeNote')}</p>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm p-5 glow-card hover:border-emerald-300 hover:shadow-[0_12px_32px_rgba(16,185,129,0.12)] sr-right">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{t('problem.after')}</span>
              </div>
              <div className="space-y-2">
                {[
                  { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', text: 'Your thyroid (TSH) is within the normal range, no action needed.' },
                  { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100',   text: 'Blood sugar (HbA1c) slightly elevated. Discuss pre-diabetes risk with your doctor.' },
                  { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100',   text: 'Kidney filtration (eGFR) mildly reduced, worth monitoring over time.' },
                  { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 border-red-100',          text: 'Inflammation (CRP) elevated. Your doctor should investigate soon.' },
                  { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100',   text: 'Iron stores (Ferritin) low. This may cause fatigue.' },
                ].map(({ icon: Icon, color, bg, text }, i) => (
                  <div key={i} className={`flex gap-2.5 items-start px-3 py-2.5 rounded-xl border ${bg} transition-colors`}>
                    <Icon className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${color}`} />
                    <span className="text-xs text-gray-700 leading-relaxed">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE VALUE CHECKER ── */}
      <ValueCheckerSection />

      {/* ── WHAT MEDYRA EXPLAINS ── */}
      <FeatureShowcase />

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-emerald-100/60 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 max-w-4xl relative">
          <div className="text-center mb-16 sr">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">{t('landing.howItWorks.badge')}</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17]">{t('howItWorks.title')}</h2>
          </div>

          <div className="relative">
            {/* Horizontal connector on desktop */}
            <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { n: 1, icon: FileText,   title: t('landing.howItWorks.step1Title'), desc: t('landing.howItWorks.step1Desc'), tag: t('landing.howItWorks.step1Detail'), accent: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                { n: 2, icon: Brain,      title: t('landing.howItWorks.step2Title'), desc: t('landing.howItWorks.step2Desc'), tag: t('landing.howItWorks.step2Detail'), accent: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                { n: 3, icon: CheckCircle,title: t('landing.howItWorks.step3Title'), desc: t('landing.howItWorks.step3Desc'), tag: t('landing.howItWorks.step3Detail'), accent: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              ].map(({ n, icon: Icon, title, desc, tag, accent }) => (
                <div key={n} className="sr flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    <div className="w-[56px] h-[56px] rounded-full bg-white border border-emerald-100 shadow-md shadow-emerald-100/60 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">{n}</span>
                  </div>
                  <h3 className="font-bold text-base text-[#0B1F17] mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{desc}</p>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${accent}`}>{tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-14 sr">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 rounded-xl h-12 shadow-lg shadow-emerald-500/25">
                  {t('landing.howItWorks.cta')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/upload">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 rounded-xl h-12 shadow-lg shadow-emerald-500/25">
                  {t('landing.hero.ctaUpload')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* ── DOCTOR VISIT PREP ── */}
      <section className="py-20 md:py-28 bg-[#F3FAF6] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-emerald-100/50 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 max-w-6xl relative">
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* Left: copy + steps */}
            <div className="sr-left">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                <FileText className="h-3 w-3" /> {t('landing.doctorVisit.badge')}
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17] mb-4 leading-tight">
                {t('landing.doctorVisit.title1')}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-[#10B981]">{t('landing.doctorVisit.title2')}</span>
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-8">
                {t('landing.doctorVisit.description')}
              </p>
              <div className="space-y-4 mb-10">
                {[
                  { n: 1, title: t('landing.doctorVisit.step1Title'), desc: t('landing.doctorVisit.step1Desc') },
                  { n: 2, title: t('landing.doctorVisit.step2Title'), desc: t('landing.doctorVisit.step2Desc') },
                  { n: 3, title: t('landing.doctorVisit.step3Title'), desc: t('landing.doctorVisit.step3Desc') },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex gap-4 items-start">
                    <span className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
                    <div>
                      <p className="font-semibold text-[#0B1F17] text-sm">{title}</p>
                      <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <SignedIn>
                  <Link href="/prep">
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] hover:shadow-[0_0_32px_-6px_rgba(16,185,129,0.6)] active:scale-95 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-emerald-900/40">
                      {t('landing.doctorVisit.cta')} <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] hover:shadow-[0_0_32px_-6px_rgba(16,185,129,0.6)] active:scale-95 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-emerald-900/40">
                      {t('nav.tryFree')} <ArrowRight className="h-4 w-4" />
                    </button>
                  </SignInButton>
                </SignedOut>
              </div>
              <p className="text-gray-500 text-xs mt-3">{t('landing.doctorVisit.freePlan')}</p>
            </div>

            {/* Right: sample output card */}
            <div className="sr-right">
              <div className="bg-[#08130D] border border-emerald-900/60 rounded-2xl shadow-2xl shadow-emerald-900/20 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-[#E8F5F0]/80">Beispiel-Ausgabe</span>
                  </div>
                  <span className="text-[10px] text-[#E8F5F0]/50 bg-white/5 border border-white/15 px-2 py-0.5 rounded-full">Deutsch</span>
                </div>
                <div className="p-6 space-y-5">
                  {[
                    { label: 'Hauptbeschwerden', items: ['Kopfschmerzen seit 3 Tagen, morgendliche Verstärkung.', 'Schwindel beim Aufstehen aus liegender Position.'] },
                    { label: 'Relevante Vorgeschichte', items: ['Tägliche Einnahme von Metformin (Dosierung nicht angegeben).'] },
                    { label: 'Fragen an den Arzt', items: ['Könnte der Schwindel mit Metformin zusammenhängen?', 'Welche Untersuchungen sind empfehlenswert?'] },
                  ].map(({ label, items }) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">{label}</p>
                      {items.map(item => (
                        <div key={item} className="flex gap-2 text-[#E8F5F0]/70 text-xs leading-relaxed mb-1">
                          <span className="text-emerald-400 font-bold flex-shrink-0">·</span>{item}
                        </div>
                      ))}
                    </div>
                  ))}
                  <p className="text-[10px] text-[#E8F5F0]/40 italic border-t border-white/10 pt-3">Dieses Dokument stellt keine medizinische Diagnose dar.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── LANGUAGES ── */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="text-center mb-10 px-4">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">{t('landing.languages.badge')}</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#0B1F17] mb-3">{t('landing.languages.title')}</h2>
          <p className="text-gray-600 text-base">{t('landing.languages.subtitle')}</p>
        </div>
        {/* Row 1, scroll left */}
        <div className="ticker-wrap mb-3">
          <div className="ticker-l flex gap-3 w-max">
            {[...LANGUAGES, ...LANGUAGES].map(({ code, name }, i) => (
              <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F3FAF6] border border-emerald-100 text-sm text-gray-700 whitespace-nowrap flex-shrink-0">
                <span className="text-[10px] font-bold text-emerald-600 tracking-widest">{code}</span>
                <span>{name}</span>
              </span>
            ))}
          </div>
        </div>
        {/* Row 2, scroll right (reversed) */}
        <div className="ticker-wrap">
          <div className="ticker-r flex gap-3 w-max">
            {[...LANGUAGES, ...LANGUAGES].reverse().map(({ code, name }, i) => (
              <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 text-sm text-gray-400 whitespace-nowrap flex-shrink-0">
                <span className="text-[10px] font-bold text-gray-300 tracking-widest">{code}</span>
                <span>{name}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HEALTH VAULT ── */}
      <section className="py-20 md:py-28 relative overflow-hidden" style={{background:'linear-gradient(160deg,#F3FAF6 0%,#EAF6F0 50%,#F3FAF6 100%)'}}>
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-200/50 blur-3xl rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl relative">

          {/* Header */}
          <div className="text-center mb-14 scroll-fade">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              <Shield className="h-3 w-3" /> Health Vault
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black text-[#0B1F17] mb-4 leading-tight">
              Your health history.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-[#10B981]">Every person. Every trend.</span>
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              One account for the whole family. Medyra tracks biomarkers across reports over time and surfaces trends before your next appointment.
            </p>
          </div>

          {/* Two-col: chart preview + feature list */}
          <div className="grid md:grid-cols-2 gap-10 items-center mb-16">

            {/* Left: Mock timeline chart */}
            <div className="sr-left bg-[#08130D] border border-emerald-900/60 rounded-2xl p-6 space-y-5 shadow-2xl shadow-emerald-900/20">
              {/* Profile picker mockup */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    {[{c:'bg-emerald-500',n:'Emma'},{c:'bg-teal-400',n:'Luis'},{c:'bg-emerald-300',n:'Oma'},{active:'Emma'}].filter(p=>p.n).map(p=>(
                      <div key={p.n} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${p.n==='Emma' ? 'border-emerald-500/50 bg-emerald-900/40 text-emerald-300' : 'border-white/10 bg-white/5 text-[#E8F5F0]/50'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.c}`} /> {p.n}
                      </div>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Health Vault</span>
              </div>

              {/* Biomarker tabs */}
              <div className="flex gap-2 flex-wrap">
                {['Hemoglobin','Ferritin','TSH','HbA1c'].map((b,i)=>(
                  <span key={b} className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${i===0 ? 'bg-red-900/40 border-red-500/40 text-red-300' : 'bg-white/5 border-white/10 text-[#E8F5F0]/50'}`}>{b}</span>
                ))}
              </div>

              {/* Chart bars: grow up one after another when scrolled into view */}
              <div className="sr vault-bars">
                <div className="flex items-end gap-2 h-24">
                  {[65,72,68,78,74,82,88,76,91,85,94,88].map((h,i)=>(
                    <div key={i} className="vault-bar flex-1 rounded-t-sm" style={{height:`${h}%`,background:`linear-gradient(to top, #10b981, #10b98150)`,transitionDelay:`${i*60}ms`}} />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-[#E8F5F0]/40 mt-1 px-0.5">
                  <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Apr</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {label:'Latest',value:'13.8',unit:'g/dL',ok:true},
                  {label:'Normal range',value:'12–17.5',unit:'g/dL',ok:true},
                  {label:'Change',value:'+7.2%',unit:'since Jan',ok:true},
                ].map(s=>(
                  <div key={s.label} className="bg-white/5 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-[#E8F5F0]/50 mb-1">{s.label}</p>
                    <p className={`text-sm font-black ${s.ok ? 'text-emerald-400' : 'text-red-400'}`}>{s.value}</p>
                    <p className="text-[10px] text-[#E8F5F0]/40">{s.unit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: features */}
            <div className="space-y-5 sr-right">
              {[
                {
                  icon: '👨‍👩‍👧‍👦',
                  title: 'One account, whole family',
                  desc: 'Create separate profiles for each family member, including partner, children, and elderly parents. Each has their own private health timeline.',
                  color: 'text-emerald-700',
                },
                {
                  icon: '📈',
                  title: 'Automatic biomarker tracking',
                  desc: 'Hemoglobin, ferritin, TSH, HbA1c, cholesterol, vitamin D, CRP, eGFR. Medyra reads them from every uploaded report and plots them automatically.',
                  color: 'text-emerald-700',
                },
                {
                  icon: '⚠️',
                  title: 'Trend alerts that matter',
                  desc: 'If a value changes by more than 10% since your first reading, Medyra flags it. A single value means nothing. The trend tells the story.',
                  color: 'text-emerald-700',
                },
                {
                  icon: '🩺',
                  title: 'Doctor prep with full history',
                  desc: 'When you generate a doctor summary, select a profile. Your lab history is automatically pulled in. No typing, no forgetting, no gaps.',
                  color: 'text-emerald-700',
                },
              ].map((f, i) => (
                <div key={i} className={`flex gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-emerald-300 shadow-sm transition-all glow-card d${i+1}`}>
                  <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                  <div>
                    <p className={`font-bold text-sm mb-1 ${f.color}`}>{f.title}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile limit cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 scroll-fade">
            {[
              { plan: 'Free', profiles: '0', desc: 'Stateless analysis', color: 'border-gray-200 bg-white', badge: '' },
              { plan: 'Personal', profiles: '2', desc: 'You + partner', color: 'border-emerald-300 bg-emerald-50', badge: 'Most Popular' },
              { plan: 'Family', profiles: '5', desc: 'Whole household', color: 'border-gray-200 bg-white', badge: '' },
              { plan: 'Clinic', profiles: '∞', desc: 'Unlimited profiles', color: 'border-gray-200 bg-white', badge: '' },
            ].map(p => (
              <div key={p.plan} className={`relative rounded-2xl border p-5 text-center ${p.color}`}>
                {p.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full whitespace-nowrap">{p.badge}</span>
                )}
                <p className="text-3xl font-black text-[#0B1F17] mb-1">{p.profiles}</p>
                <p className="text-xs font-bold text-gray-700 mb-0.5">{p.plan}</p>
                <p className="text-[11px] text-gray-500">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center scroll-fade">
            <Link href="/profiles" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:shadow-[0_0_32px_-6px_rgba(16,185,129,0.6)] text-white font-bold px-8 py-4 rounded-xl transition-all text-sm shadow-lg shadow-emerald-900/40 mr-3">
              Open Health Vault <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/blog/health-vault-profiles-guide" className="inline-flex items-center gap-2 border border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 font-semibold px-6 py-4 rounded-xl transition-colors text-sm">
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Floating back-to-top with scroll progress */}
      <ScrollToTop />

      {/* ── ENCRYPTION / SECURITY ── */}
      <section className="py-20 md:py-28 bg-[#F3FAF6] overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14 scroll-fade">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              <Lock className="h-3 w-3" /> {t('landing.security.badge')}
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F17] mb-4">{t('landing.security.title')}</h2>
            <p className="text-gray-600 text-base max-w-xl mx-auto leading-relaxed">
              {t('landing.security.subtitle')}
            </p>
          </div>

          {/* Data flow: clear step-by-step */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 scroll-fade delay-1">
            {[
              { step: 1, icon: FileText,  label: 'You upload', sub: 'PDF, image, or text', color: 'border-gray-200 bg-white' },
              { step: 2, icon: Lock,      label: 'Encrypted at rest', sub: 'AES-256-GCM, only ciphertext stored', color: 'border-emerald-300 bg-emerald-50', glow: true },
              { step: 3, icon: Brain,     label: 'AI analysis', sub: 'Temp decrypted, sent to Claude, not stored', color: 'border-gray-200 bg-white' },
              { step: 4, icon: CheckCircle, label: 'Answer to you', sub: 'Plain language, on your screen', color: 'border-gray-200 bg-white' },
            ].map(({ step, icon: Icon, label, sub, color, glow }) => (
              <div key={step} className={`rounded-2xl border p-4 text-center relative ${color}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 ${glow ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                  <Icon className={`h-4 w-4 ${glow ? 'text-emerald-600' : 'text-gray-500'}`} />
                </div>
                <span className="absolute top-2 right-2 text-[10px] text-gray-400 font-bold">{step}</span>
                <p className="text-xs font-bold text-[#0B1F17] mb-1">{label}</p>
                <p className="text-[10px] text-gray-500 leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>

          {/* What's safe / what Claude sees */}
          <div className="grid md:grid-cols-2 gap-4 mb-10 scroll-fade delay-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-emerald-700">What's always protected</p>
              </div>
              <ul className="space-y-2">
                {[
                  'Your uploaded reports, encrypted with AES-256-GCM before storage',
                  'We store only ciphertext: even we cannot read your data',
                  'Each value encrypted with a unique random key (IV)',
                  'Data auto-deleted after 30 days',
                ].map(item => (
                  <li key={item} className="flex gap-2 text-xs text-gray-700 leading-relaxed">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5">·</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-3.5 w-3.5 text-teal-600" />
                </div>
                <p className="text-sm font-bold text-teal-700">What Claude sees (temporarily)</p>
              </div>
              <ul className="space-y-2">
                {[
                  'Your report content during AI analysis: not logged or stored by Anthropic',
                  'Your question: processed in-session only',
                  'Never used to train AI models',
                  'Connection is encrypted in transit (TLS)',
                ].map(item => (
                  <li key={item} className="flex gap-2 text-xs text-gray-700 leading-relaxed">
                    <span className="text-teal-500 flex-shrink-0 mt-0.5">·</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 scroll-fade delay-3">
            {[
              { icon: '🔑', title: t('landing.security.feat1Title'), desc: t('landing.security.feat1Desc') },
              { icon: '🇪🇺', title: t('landing.security.feat2Title'), desc: t('landing.security.feat2Desc') },
              { icon: '🎲', title: t('landing.security.feat3Title'), desc: t('landing.security.feat3Desc') },
              { icon: '🚫', title: t('landing.security.feat4Title'), desc: t('landing.security.feat4Desc') },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-lg mb-2">{icon}</div>
                <p className="text-xs font-bold text-[#0B1F17] mb-1">{title}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/blog/how-medyra-protects-your-medical-data" className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              {t('landing.security.deepDive')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FÜR SENIOREN ── */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-teal-100/50 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 max-w-6xl relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: text */}
            <div className="sr">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold tracking-widest uppercase mb-6">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {t('landing.senior.badge')}
              </div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[#0B1F17] leading-tight mb-4">
                {t('landing.senior.headline1')}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-[#10B981]">{t('landing.senior.headline2')}</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-lg">
                {t('landing.senior.desc')}
              </p>
              <ul className="space-y-3 mb-10">
                {[
                  t('landing.senior.f1'),
                  t('landing.senior.f2'),
                  t('landing.senior.f3'),
                  t('landing.senior.f4'),
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/verstehen">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#059669] hover:shadow-[0_0_32px_-6px_rgba(16,185,129,0.6)] active:scale-95 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-900/40">
                  {t('landing.senior.cta')} <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            {/* Right: mock Arztbrief card */}
            <div className="sr-right">
              <div className="relative">
                <div className="absolute -inset-4 bg-emerald-200/40 rounded-3xl blur-xl" />
                <div className="relative bg-[#08130D] rounded-2xl border border-emerald-900/60 shadow-2xl shadow-emerald-900/20 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[#E8F5F0] font-semibold text-sm">Arztbrief · Befund</span>
                    </div>
                    <span className="text-xs text-emerald-300 bg-emerald-400/10 px-2.5 py-1 rounded-full font-medium border border-emerald-400/20">Erklärt</span>
                  </div>
                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4">
                      <p className="text-xs font-semibold text-[#E8F5F0]/50 uppercase tracking-widest mb-1">Original</p>
                      <p className="text-xs text-[#E8F5F0]/60 leading-relaxed font-mono">"Ejektionsfraktion 45%, Sinusrhythmus, kein Anhalt für Perikarderguss."</p>
                    </div>
                    <div className="flex justify-center text-[#E8F5F0]/40">
                      <ArrowRight className="h-4 w-4 rotate-90" />
                    </div>
                    <div className="bg-emerald-950/50 border border-emerald-500/15 rounded-xl p-4">
                      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">Einfache Erklärung</p>
                      <p className="text-xs text-[#E8F5F0]/70 leading-relaxed">Ihr Herz pumpt das Blut gut, aber die Pumpleistung ist leicht eingeschränkt. Kein Flüssigkeitsansammlung um das Herz. Regelmäßiger Herzrhythmus.</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button className="flex-1 flex items-center gap-1.5 justify-center py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 font-medium">
                        <Volume2 className="h-3.5 w-3.5" /> Vorlesen lassen
                      </button>
                      <button className="flex-1 flex items-center gap-1.5 justify-center py-2 rounded-lg bg-white/5 border border-white/15 text-xs text-[#E8F5F0]/60">
                        <Download className="h-3.5 w-3.5" /> PDF teilen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── LEXIKON ── */}
      <section className="py-20 md:py-24 bg-[#F3FAF6] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 max-w-5xl relative">
          <div className="sr text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Kostenloses Lexikon
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-[#0B1F17] mb-3 leading-tight">
              Laborwerte verstehen.<br className="hidden sm:block" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-[#10B981]">Ohne Medizinstudium.</span>
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              46 Blutwerte einfach erklärt: Normwerte, Ursachen, wann zum Arzt. Kostenlos. Keine Anmeldung.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-10">
            {[
              { slug: 'crp',         acronym: 'CRP',   name: 'Entzündungs­wert', color: 'bg-white border-gray-200 text-gray-800 hover:border-emerald-400' },
              { slug: 'hba1c',       acronym: 'HbA1c', name: 'Langzeit­zucker',  color: 'bg-white border-gray-200 text-gray-800 hover:border-emerald-400' },
              { slug: 'tsh',         acronym: 'TSH',   name: 'Schilddrüse',      color: 'bg-white border-gray-200 text-gray-800 hover:border-emerald-400' },
              { slug: 'cholesterin', acronym: 'TC',    name: 'Cholesterin',      color: 'bg-white border-gray-200 text-gray-800 hover:border-emerald-400' },
              { slug: 'haemoglobin', acronym: 'Hb',    name: 'Hämoglobin',       color: 'bg-white border-gray-200 text-gray-800 hover:border-emerald-400' },
              { slug: 'vitamin-d',   acronym: 'Vit.D', name: 'Vitamin D',        color: 'bg-white border-gray-200 text-gray-800 hover:border-emerald-400' },
            ].map((term, i) => (
              <Link key={term.slug} href={`/lexikon/${term.slug}`}
                className={`sr d${i + 1} group flex flex-col items-center text-center border rounded-2xl px-3 py-5 shadow-sm transition-all hover:shadow-lg hover:shadow-emerald-100 hover:-translate-y-0.5 ${term.color}`}>
                <span className="font-black text-xl leading-none mb-1.5 text-emerald-600">{term.acronym}</span>
                <span className="text-xs opacity-70 leading-tight">{term.name}</span>
              </Link>
            ))}
          </div>

          <div className="text-center sr">
            <Link href="/lexikon"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:shadow-[0_0_32px_-6px_rgba(16,185,129,0.6)] text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/40">
              Alle 46 Laborwerte im Lexikon <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-gray-400 text-xs mt-3">Kostenlos · Keine Anmeldung erforderlich · Auf Deutsch</p>
          </div>
        </div>
      </section>

      {/* ── PRICING CTA ── */}
      <section className="relative py-24 bg-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{background:'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(16,185,129,0.07) 0%, transparent 70%)'}} />
        </div>
        <div className="container mx-auto px-4 max-w-4xl relative sr">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Free to start
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black text-[#0B1F17] mb-4 leading-tight">{t('pricingCta.title')}</h2>
            <p className="text-gray-600 mb-10 text-lg max-w-xl mx-auto">{t('pricingCta.subtitle')}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
            {[
              { label: 'Free forever', sub: '3 reports/month', icon: CheckCircle, color: 'text-emerald-600' },
              { label: 'No credit card', sub: 'Start instantly', icon: Shield, color: 'text-emerald-600' },
              { label: 'Cancel anytime', sub: 'No lock-in', icon: Lock, color: 'text-emerald-600' },
            ].map(({ label, sub, icon: Icon, color }) => (
              <div key={label} className="text-center bg-[#F3FAF6] border border-emerald-100 rounded-2xl p-4">
                <Icon className={`h-5 w-5 mx-auto mb-2 ${color}`} />
                <p className="text-sm font-bold text-[#0B1F17]">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/pricing">
              <Button size="lg" className="bg-gradient-to-r from-[#10B981] to-[#059669] hover:shadow-[0_0_36px_-6px_rgba(16,185,129,0.65)] active:scale-95 text-white font-bold px-12 rounded-xl h-14 text-base shadow-xl shadow-emerald-900/40 transition-all">
                {t('pricingCta.cta')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-gray-500 text-sm mt-4">{t('landing.pricingCta.note')}</p>
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      <section className="py-20 md:py-24 bg-[#F3FAF6] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 max-w-5xl relative">
          <div className="flex items-center justify-between mb-10 sr">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">{t('landing.blog.badge')}</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#0B1F17]">{t('landing.blog.title')}</h2>
            </div>
            <Link href="/blog" className="hidden sm:flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
              {t('landing.blog.allArticles')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { href: '/blog/doctor-visit-prep-germany',           tag: 'Doctor Visit · New', accent: 'border-l-emerald-500', tagColor: 'text-emerald-600', title: "How to Prepare for a Doctor's Appointment in Germany",         desc: 'Describe symptoms in any language. Medyra generates a structured German summary for your doctor.', time: '6 min' },
              { href: '/blog/arztbrief-verstehen-fur-senioren',    tag: 'Für Senioren · Neu', accent: 'border-l-emerald-500', tagColor: 'text-emerald-600', title: 'Ihren Arztbrief einfach verstehen, Medyra für Senioren',       desc: 'Befund erhalten und nicht verstanden? Medyra erklärt alles auf Deutsch, zum Lesen oder Vorlesen lassen.', time: '5 Min.' },
              { href: '/blog/how-to-read-lab-results-germany-expat', tag: 'Germany · Expat',  accent: 'border-l-emerald-500', tagColor: 'text-emerald-600', title: 'How to Read Your Lab Results in Germany as an Expat',           desc: 'Decode your Laborbefund. Abbreviations, reference ranges, and what flagged values actually mean.', time: '7 min' },
            ].map((post, i) => (
              <Link key={post.href} href={post.href} className={`block group sr d${i+1}`}>
                <div className={`bg-white rounded-2xl border border-gray-100 border-l-2 ${post.accent} p-5 h-full shadow-sm glow-card hover:border-l-2 hover:shadow-xl hover:shadow-emerald-900/5`}>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-3 ${post.tagColor}`}>{post.tag}</p>
                  <h3 className="font-bold text-[#0B1F17] text-sm leading-snug mb-2 group-hover:text-emerald-600 transition-colors">{post.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{post.desc}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {post.time} {t('landing.blog.minRead')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6 sm:hidden">
            <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-emerald-600 font-semibold">
              {t('landing.blog.allArticles')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── LEGAL NOTICE ── */}
      <section className="bg-white border-t border-gray-200/70 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#F3FAF6] border border-emerald-100 rounded-2xl px-6 py-5">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white border border-emerald-100 flex items-center justify-center">
              <Shield className="h-4 w-4 text-emerald-600/80" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">{t('legal.title')}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{t('legal.text')}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
