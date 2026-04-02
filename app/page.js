'use client'

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import MedyraUserButton from '@/components/MedyraUserButton'
import Link from 'next/link'
import { Brain, Shield, Clock, ChevronRight, Menu, X, ArrowRight, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useCallback } from 'react'
import JsonLd from '@/components/JsonLd'
import MedyraLogo from '@/components/MedyraLogo'

export default function LandingPage() {
  const t = useTranslations()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [slide, setSlide] = useState(0)
  const SLIDE_COUNT = 4

  const nextSlide = useCallback(() => setSlide(s => (s + 1) % SLIDE_COUNT), [])
  const prevSlide = useCallback(() => setSlide(s => (s - 1 + SLIDE_COUNT) % SLIDE_COUNT), [])

  useEffect(() => {
    const id = setInterval(nextSlide, 4500)
    return () => clearInterval(id)
  }, [nextSlide])

  const howItWorksSteps = ['step1', 'step2', 'step3', 'step4'].map((step, i) => ({
    step: String(i + 1),
    title: t(`howItWorks.${step}.title`),
    desc: t(`howItWorks.${step}.desc`)
  }))

  return (
    <div className="min-h-screen bg-white">
      <JsonLd />

      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <MedyraLogo size="md" />

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              <Link href="/pricing">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">{t('nav.pricing')}</Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">Blog</Button>
              </Link>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <LanguageSwitcher />
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('nav.signIn')}</Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">{t('hero.cta')}</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/upload">
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">{t('nav.upload')}</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('nav.dashboard')}</Button>
                </Link>
                <MedyraUserButton />
              </SignedIn>
            </div>

            {/* Mobile nav toggle */}
            <div className="flex md:hidden items-center space-x-2">
              <LanguageSwitcher />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pt-3 pb-2 border-t border-gray-200 mt-3 space-y-1">
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">{t('nav.pricing')}</Button>
              </Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">Blog</Button>
              </Link>
              <div className="border-t border-gray-100 my-1" />
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.signIn')}
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button className="w-full mt-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold" onClick={() => setMobileMenuOpen(false)}>
                    {t('hero.cta')}
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/upload" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">{t('nav.upload')}</Button>
                </Link>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">{t('nav.dashboard')}</Button>
                </Link>
                <div className="px-2 py-1"><MedyraUserButton /></div>
              </SignedIn>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.08)_0%,transparent_60%)]" />
        <div className="container mx-auto px-4 text-center max-w-4xl relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 text-xs tracking-wide mb-5">
            {t('hero.trusted')}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-5 leading-tight">
            {t('hero.title')}
            <span className="block text-emerald-600">{t('hero.subtitle')}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="text-base px-8 w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                  {t('hero.cta')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/upload" className="w-full sm:w-auto">
                <Button size="lg" className="text-base px-8 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                  {t('nav.upload')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
          </div>
          <p className="text-xs text-gray-400 mt-5">⚠️ {t('hero.disclaimer')}</p>
        </div>
      </section>

      {/* Problem Showcase — Before / After */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{t('problem.heading')}</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">{t('problem.subheading')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-8 items-center">
            {/* Before */}
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-gray-500">{t('problem.before')}</span>
              </div>
              <div className="font-mono text-sm bg-white border border-red-200 rounded-lg p-4 space-y-1.5 text-gray-700">
                <div className="flex justify-between"><span>TSH</span><span className="font-semibold">4.2 mIU/L</span></div>
                <div className="flex justify-between text-orange-600"><span>HbA1c</span><span className="font-semibold">6.1% ↑</span></div>
                <div className="flex justify-between text-orange-600"><span>eGFR</span><span className="font-semibold">58 mL/min ↓</span></div>
                <div className="flex justify-between text-red-600"><span>CRP</span><span className="font-semibold">12.4 mg/L ↑↑</span></div>
                <div className="flex justify-between text-orange-600"><span>Ferritin</span><span className="font-semibold">11 µg/L ↓</span></div>
                <div className="flex justify-between"><span>Vitamin D</span><span className="font-semibold">28 nmol/L</span></div>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center italic">What does any of this mean?</p>
            </div>

            {/* Arrow mobile */}
            <div className="flex md:hidden justify-center">
              <ChevronRight className="h-6 w-6 text-emerald-500 rotate-90" />
            </div>

            {/* After */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-gray-500">{t('problem.after')}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2 items-start">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Your thyroid hormone (TSH) is within the normal range — no action needed.</span>
                </div>
                <div className="flex gap-2 items-start">
                  <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Blood sugar (HbA1c) is slightly elevated — could indicate pre-diabetes. Discuss with your doctor.</span>
                </div>
                <div className="flex gap-2 items-start">
                  <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Kidney filtration (eGFR) is mildly reduced — worth monitoring over time.</span>
                </div>
                <div className="flex gap-2 items-start">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Inflammation marker (CRP) is elevated — your doctor should investigate the cause.</span>
                </div>
                <div className="flex gap-2 items-start">
                  <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Iron stores (Ferritin) are low — may cause fatigue. Iron supplement may help.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">{t('howItWorks.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
            {howItWorksSteps.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1 text-base text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">See It in Action</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Upload a report, get a clear explanation in seconds — here is what the experience looks like.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 items-start">
            {/* Step 1 — Upload */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">1</div>
                <span className="font-semibold text-gray-900">Upload your report</span>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50">
                <div className="w-10 h-10 mx-auto mb-2 text-gray-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                </div>
                <p className="text-xs text-gray-400 font-medium">Drop PDF, JPG, PNG or TXT</p>
                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  {['PDF', 'JPG', 'PNG', 'TXT'].map(f => (
                    <span key={f} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">{f}</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center mt-3">Encrypted · deleted after 30 days</p>
            </div>

            {/* Step 2 — Processing */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">2</div>
                <span className="font-semibold text-gray-900">AI reads & explains</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <span className="text-xs text-emerald-700">Extracting text from document…</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-xs text-emerald-700">Identifying all test values…</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-xs text-emerald-700">Generating plain language explanation…</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className="text-2xl font-bold text-emerald-600">~30s</span>
                <p className="text-xs text-gray-400 mt-1">Average processing time</p>
              </div>
            </div>

            {/* Step 3 — Result */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</div>
                <span className="font-semibold text-gray-900">Your report, explained</span>
              </div>
              <div className="space-y-2">
                <div className="border-l-4 border-emerald-400 pl-3 py-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-700">TSH</span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Normal</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Thyroid function is within healthy range.</p>
                </div>
                <div className="border-l-4 border-orange-400 pl-3 py-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-700">HbA1c</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">High</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Slightly elevated — discuss pre-diabetes risk with your doctor.</p>
                </div>
                <div className="border-l-4 border-red-400 pl-3 py-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-700">CRP</span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Critical</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Inflammation marker elevated — see your doctor soon.</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-500" /> + Questions to ask your doctor included</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-10">
                  Try It Free — No Credit Card <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/upload">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-10">
                  Upload My Report <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <Brain className="h-10 w-10 text-emerald-600 mb-4" />
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{t('features.ai.title')}</h3>
              <p className="text-gray-500 text-sm">{t('features.ai.desc')}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <Shield className="h-10 w-10 text-emerald-600 mb-4" />
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{t('features.secure.title')}</h3>
              <p className="text-gray-500 text-sm">{t('features.secure.desc')}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <Clock className="h-10 w-10 text-emerald-600 mb-4" />
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{t('features.fast.title')}</h3>
              <p className="text-gray-500 text-sm">{t('features.fast.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Post Carousel */}
      <section className="py-16 md:py-24 bg-gray-900 overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Available in 16 languages</h2>
            <p className="text-gray-400 text-lg">From Germany to the world — understand your health in your own language.</p>
          </div>

          <div className="relative">
            {/* Slides */}
            <div className="overflow-hidden rounded-2xl">
              {/* Slide 0 — EN Hook */}
              <div className={`transition-all duration-500 ${slide === 0 ? 'block' : 'hidden'}`}>
                <div className="bg-[#040C08] rounded-2xl p-8 md:p-12 relative overflow-hidden min-h-[340px] flex flex-col justify-between">
                  <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse at 30% 70%, rgba(16,185,129,0.08) 0%, transparent 60%)'}} />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <svg width="28" height="33" viewBox="0 0 88 104" fill="none"><rect x="26" y="16" width="48" height="62" rx="7" stroke="rgba(16,185,129,0.1)" strokeWidth="1.2" fill="rgba(16,185,129,0.015)"/><rect x="16" y="9" width="48" height="62" rx="7" stroke="rgba(16,185,129,0.22)" strokeWidth="1.4" fill="rgba(4,12,8,0.85)"/><rect x="5" y="2" width="52" height="68" rx="7" stroke="rgba(16,185,129,0.58)" strokeWidth="1.5" fill="#040C08"/><path d="M31 53 L35 53 L38 45 L42 65 L46 35 L50 53 L54 47 L58 53 L86 53" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><circle cx="35" cy="53" r="2.6" fill="#10B981" opacity="0.9"/></svg>
                      <span style={{fontFamily:'var(--font-playfair, "Playfair Display", Georgia, serif)', fontWeight:700, fontSize:'20px', color:'#E8F5F0', letterSpacing:'0.04em'}}>Medyra</span>
                    </div>
                    <h3 style={{fontFamily:'var(--font-playfair, "Playfair Display", Georgia, serif)', fontWeight:700, fontSize:'clamp(28px,4vw,42px)', lineHeight:1.15, color:'#E8F5F0'}}>
                      Your lab results,<br /><em style={{fontStyle:'italic', color:'#10B981'}}>finally clear.</em>
                    </h3>
                    <p className="mt-4 text-sm font-light max-w-md" style={{color:'rgba(232,245,240,0.55)', lineHeight:1.6}}>
                      Stop Googling medical terms at 2am. Upload your report and get a plain language explanation in under 60 seconds.
                    </p>
                  </div>
                  <div className="relative mt-6 text-xs tracking-widest uppercase font-medium" style={{color:'#10B981', letterSpacing:'0.22em'}}>medyra.de · Free to start →</div>
                  <svg className="absolute bottom-6 right-0 opacity-20 pointer-events-none" width="200" height="44" viewBox="0 0 200 44" fill="none"><path d="M0 22 L45 22 L53 9 L62 35 L71 2 L80 22 L88 15 L97 22 L200 22" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                </div>
              </div>

              {/* Slide 1 — Before/After EN */}
              <div className={`transition-all duration-500 ${slide === 1 ? 'block' : 'hidden'}`}>
                <div className="bg-[#040C08] rounded-2xl p-8 md:p-12 relative overflow-hidden min-h-[340px] flex flex-col justify-between">
                  <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.06) 0%, transparent 55%)'}} />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <svg width="24" height="28" viewBox="0 0 88 104" fill="none"><rect x="5" y="2" width="52" height="68" rx="7" stroke="rgba(16,185,129,0.58)" strokeWidth="1.5" fill="#040C08"/><path d="M31 53 L35 53 L38 45 L42 65 L46 35 L50 53 L54 47 L58 53 L86 53" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><circle cx="35" cy="53" r="2.6" fill="#10B981" opacity="0.9"/></svg>
                      <span style={{fontFamily:'var(--font-playfair, "Playfair Display", Georgia, serif)', fontWeight:700, fontSize:'18px', color:'#E8F5F0'}}>Medyra</span>
                    </div>
                    <h3 style={{fontFamily:'var(--font-playfair, "Playfair Display", Georgia, serif)', fontWeight:700, fontSize:'clamp(20px,3vw,28px)', color:'#E8F5F0', lineHeight:1.2}}>What your doctor gave you — explained.</h3>
                  </div>
                  <div className="relative grid grid-cols-2 gap-3 mt-5 flex-1">
                    <div className="rounded-xl p-4" style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)'}}>
                      <p className="text-xs tracking-widest uppercase mb-3" style={{color:'rgba(255,255,255,0.25)'}}>Your report</p>
                      {[['HbA1c','6.1% ↑'],['eGFR','58 mL/min ↓'],['CRP','12.4 mg/L ↑↑'],['Ferritin','11 µg/L ↓']].map(([k,v]) => (
                        <div key={k} className="flex justify-between text-xs mb-1.5" style={{color:'rgba(232,245,240,0.4)'}}><span>{k}</span><span className="font-semibold">{v}</span></div>
                      ))}
                      <p className="text-center text-xs mt-2 italic" style={{color:'rgba(232,245,240,0.2)'}}>What does this mean?</p>
                    </div>
                    <div className="rounded-xl p-4" style={{background:'rgba(16,185,129,0.04)', border:'1px solid rgba(16,185,129,0.15)'}}>
                      <p className="text-xs tracking-widest uppercase mb-3" style={{color:'rgba(16,185,129,0.6)'}}>Medyra explains</p>
                      {[['Blood sugar','slightly high — discuss pre-diabetes'],['Kidneys','mildly reduced — monitor'],['Inflammation','elevated — see doctor'],['Iron','low — may cause fatigue']].map(([k,v]) => (
                        <div key={k} className="text-xs mb-1.5" style={{color:'rgba(232,245,240,0.7)'}}><span style={{color:'#10B981', fontWeight:500}}>{k}</span> {v}</div>
                      ))}
                    </div>
                  </div>
                  <p className="relative mt-4 text-xs tracking-widest uppercase" style={{color:'rgba(16,185,129,0.4)', letterSpacing:'0.18em'}}>medyra.de · Free first report</p>
                </div>
              </div>

              {/* Slide 2 — DE Hook */}
              <div className={`transition-all duration-500 ${slide === 2 ? 'block' : 'hidden'}`}>
                <div className="bg-[#040C08] rounded-2xl p-8 md:p-12 relative overflow-hidden min-h-[340px] flex flex-col justify-between" style={{background:'linear-gradient(155deg, #040C08 0%, #050F0A 100%)'}}>
                  <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse at 70% 30%, rgba(16,185,129,0.07) 0%, transparent 55%)'}} />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <svg width="28" height="33" viewBox="0 0 88 104" fill="none"><rect x="26" y="16" width="48" height="62" rx="7" stroke="rgba(16,185,129,0.1)" strokeWidth="1.2" fill="rgba(16,185,129,0.015)"/><rect x="16" y="9" width="48" height="62" rx="7" stroke="rgba(16,185,129,0.22)" strokeWidth="1.4" fill="rgba(4,12,8,0.85)"/><rect x="5" y="2" width="52" height="68" rx="7" stroke="rgba(16,185,129,0.58)" strokeWidth="1.5" fill="#040C08"/><path d="M31 53 L35 53 L38 45 L42 65 L46 35 L50 53 L54 47 L58 53 L86 53" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><circle cx="35" cy="53" r="2.6" fill="#10B981" opacity="0.9"/></svg>
                      <span style={{fontFamily:'var(--font-playfair, "Playfair Display", Georgia, serif)', fontWeight:700, fontSize:'20px', color:'#E8F5F0', letterSpacing:'0.04em'}}>Medyra</span>
                    </div>
                    <h3 style={{fontFamily:'var(--font-playfair, "Playfair Display", Georgia, serif)', fontWeight:700, fontSize:'clamp(28px,4vw,40px)', lineHeight:1.2, color:'#E8F5F0'}}>
                      Dein Befund,<br /><em style={{fontStyle:'italic', color:'#10B981'}}>endlich verständlich.</em>
                    </h3>
                    <p className="mt-4 text-sm font-light max-w-md" style={{color:'rgba(232,245,240,0.55)', lineHeight:1.6}}>
                      Schluss mit dem nächtlichen Googeln von Laborwerten. Lade deinen Befund hoch und erhalte in unter 60 Sekunden eine klare Erklärung.
                    </p>
                  </div>
                  <div className="relative mt-6 text-xs tracking-widest uppercase font-medium" style={{color:'#10B981', letterSpacing:'0.22em'}}>medyra.de · Kostenlos starten →</div>
                  <svg className="absolute bottom-6 right-0 opacity-20 pointer-events-none" width="200" height="44" viewBox="0 0 200 44" fill="none"><path d="M0 22 L45 22 L53 9 L62 35 L71 2 L80 22 L88 15 L97 22 L200 22" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                </div>
              </div>

              {/* Slide 3 — Features DE */}
              <div className={`transition-all duration-500 ${slide === 3 ? 'block' : 'hidden'}`}>
                <div className="bg-[#040C08] rounded-2xl p-8 md:p-12 relative overflow-hidden min-h-[340px] flex flex-col justify-between">
                  <div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(ellipse at 80% 80%, rgba(16,185,129,0.06) 0%, transparent 55%)'}} />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <svg width="24" height="28" viewBox="0 0 88 104" fill="none"><rect x="5" y="2" width="52" height="68" rx="7" stroke="rgba(16,185,129,0.58)" strokeWidth="1.5" fill="#040C08"/><path d="M31 53 L35 53 L38 45 L42 65 L46 35 L50 53 L54 47 L58 53 L86 53" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><circle cx="35" cy="53" r="2.6" fill="#10B981" opacity="0.9"/></svg>
                      <span style={{fontFamily:'var(--font-playfair, "Playfair Display", Georgia, serif)', fontWeight:700, fontSize:'18px', color:'#E8F5F0'}}>Medyra</span>
                    </div>
                    <h3 style={{fontFamily:'var(--font-playfair, "Playfair Display", Georgia, serif)', fontWeight:700, fontSize:'clamp(22px,3vw,32px)', color:'#E8F5F0', lineHeight:1.2}}>
                      Medizinbefunde<br /><em style={{fontStyle:'italic', color:'#10B981'}}>auf einen Blick.</em>
                    </h3>
                  </div>
                  <div className="relative mt-5 flex flex-col gap-4 flex-1 justify-center">
                    {[
                      ['Kostenlos starten', 'Erster Bericht gratis, keine Kreditkarte nötig'],
                      ['DSGVO-konform', 'In Deutschland entwickelt, Daten nach 30 Tagen gelöscht'],
                      ['60 Sekunden', 'Ergebnis schneller als eine Google-Suche'],
                      ['16 Sprachen', 'Ideal für Expats & internationale Patienten'],
                    ].map(([title, desc]) => (
                      <div key={title} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{background:'#10B981'}} />
                        <p className="text-sm font-light" style={{color:'rgba(232,245,240,0.7)', lineHeight:1.5}}>
                          <span style={{color:'#E8F5F0', fontWeight:500}}>{title}</span> — {desc}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="relative mt-5 text-xs tracking-widest uppercase" style={{color:'rgba(16,185,129,0.4)', letterSpacing:'0.18em'}}>medyra.de</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prevSlide}
                className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                aria-label="Previous"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <div className="flex gap-2">
                {Array.from({length: SLIDE_COUNT}).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-6 bg-emerald-400' : 'w-1.5 bg-gray-600 hover:bg-gray-500'}`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={nextSlide}
                className="w-9 h-9 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA Strip */}
      <section className="bg-emerald-500 py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-4 border border-white/30">
            🎉 Launch Special — 50% off all paid plans
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">{t('pricingCta.title')}</h2>
          <p className="text-white/70 mb-8 text-lg">{t('pricingCta.subtitle')}</p>
          <Link href="/pricing">
            <Button size="lg" className="bg-white hover:bg-gray-100 text-emerald-600 font-semibold px-10">
              {t('pricingCta.cta')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-white/60 text-sm mt-4">Plans from €0/month · No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* From the blog */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">From the blog</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Learn about your lab results</h2>
            </div>
            <Link href="/blog" className="hidden sm:flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              All articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                href: '/blog/how-to-read-lab-results-germany-expat',
                tag: 'Germany · Expat',
                title: 'How to Read Your Lab Results in Germany as an Expat',
                desc: 'Decode your Laborbefund — abbreviations, reference ranges, and what flagged values actually mean.',
                time: '7 min',
              },
              {
                href: '/blog/what-is-tsh-and-why-does-it-matter',
                tag: 'Thyroid · TSH',
                title: 'What Is TSH and Why Does It Matter?',
                desc: 'TSH is on almost every blood panel. Here is what high or low results actually mean in plain language.',
                time: '6 min',
              },
              {
                href: '/blog/understanding-your-blood-test-results',
                tag: 'Blood Test · CBC',
                title: 'Understanding Your Blood Test Results',
                desc: 'CBC, HbA1c, CRP, cholesterol — the most common values explained so you can walk in informed.',
                time: '9 min',
              },
            ].map((post) => (
              <Link key={post.href} href={post.href} className="block group">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 h-full hover:border-emerald-300 hover:shadow-sm transition-all duration-200">
                  <p className="text-xs font-medium text-emerald-600 mb-2">{post.tag}</p>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-emerald-700 transition-colors">{post.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{post.desc}</p>
                  <p className="text-xs text-gray-400">{post.time} read</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6 sm:hidden">
            <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              See all articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Legal Notice */}
      <section className="bg-yellow-50 border-t border-yellow-200 py-10">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Shield className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-2 text-gray-900">{t('legal.title')}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{t('legal.text')}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <MedyraLogo size="sm" variant="dark" />
          </div>
          <p className="text-gray-400 mb-4 text-sm">{t('footer.tagline')}</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">{t('footer.privacy')}</Link>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">{t('footer.terms')}</Link>
            <Link href="/contact" className="hover:text-emerald-400 transition-colors">{t('footer.contact')}</Link>
          </div>
          <p className="text-gray-600 text-xs mt-5">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
