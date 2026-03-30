'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Brain, Shield, Clock, ChevronRight, Menu, X, ArrowRight, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import JsonLd from '@/components/JsonLd'
import MedyraLogo from '@/components/MedyraLogo'

export default function LandingPage() {
  const t = useTranslations()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
            <div className="bg-[#060D0B] rounded-xl px-3 py-2">
              <MedyraLogo size="sm" variant="dark" showTagline />
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/pricing">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('nav.pricing')}</Button>
              </Link>
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
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('nav.dashboard')}</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
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
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('nav.pricing')}</Button>
              </Link>
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
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('nav.dashboard')}</Button>
                </Link>
                <div className="px-2 py-1"><UserButton afterSignOutUrl="/" /></div>
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
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="text-base px-8 w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                  {t('hero.secondaryCta')}
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/upload" className="w-full sm:w-auto">
                <Button size="lg" className="text-base px-8 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                  {t('nav.upload')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="text-base px-8 w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                  {t('hero.secondaryCta')}
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

      {/* Features */}
      <section className="py-16 md:py-24 bg-gray-50">
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

      {/* Pricing CTA Strip */}
      <section className="bg-emerald-500 py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-3">{t('pricingCta.title')}</h2>
          <p className="text-white/70 mb-8 text-lg">{t('pricingCta.subtitle')}</p>
          <Link href="/pricing">
            <Button size="lg" className="bg-white hover:bg-gray-100 text-emerald-600 font-semibold px-10">
              {t('pricingCta.cta')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-white/60 text-sm mt-4">Plans from €0/month · No credit card required</p>
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
