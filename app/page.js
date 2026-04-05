'use client'

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import MedyraUserButton from '@/components/MedyraUserButton'
import Link from 'next/link'
import { Brain, Shield, Clock, ChevronRight, Menu, X, ArrowRight, AlertTriangle, CheckCircle, AlertCircle, Lock, Zap, FileText, MessageSquare, Download } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import JsonLd from '@/components/JsonLd'
import MedyraLogo from '@/components/MedyraLogo'

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
  { code: 'SE', name: 'Svenska' },
]

export default function LandingPage() {
  const t = useTranslations()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <JsonLd />

      {/* ── NAVIGATION ── */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <MedyraLogo size="md" />

            <div className="hidden md:flex items-center gap-1">
              <a href="#how-it-works">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">How it works</Button>
              </a>
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
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">{t('nav.signIn')}</Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">Try for free</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/upload">
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">{t('nav.upload')}</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">{t('nav.dashboard')}</Button>
                </Link>
                <MedyraUserButton />
              </SignedIn>
            </div>

            <div className="flex md:hidden items-center space-x-2">
              <LanguageSwitcher />
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-gray-700 hover:bg-gray-50">
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
                  <Button variant="ghost" className="w-full justify-start text-gray-700" onClick={() => setMobileMenuOpen(false)}>{t('nav.signIn')}</Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button className="w-full mt-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold" onClick={() => setMobileMenuOpen(false)}>Try for free</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/upload" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">{t('nav.upload')}</Button>
                </Link>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-gray-700">{t('nav.dashboard')}</Button>
                </Link>
                <div className="px-2 py-1"><MedyraUserButton /></div>
              </SignedIn>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gray-950">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-3xl" />
          <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 20% 50%, rgba(16,185,129,0.06) 0%, transparent 50%)'}} />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10 py-20 md:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide mb-7">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Free to start · No credit card needed
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                Your lab results,<br />
                <span className="text-emerald-400">finally clear.</span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
                Upload any medical report and get a plain-language explanation from AI in under 60 seconds. No medical degree required.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button size="lg" className="text-base px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl h-12 w-full sm:w-auto">
                      Analyse My Report Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </SignInButton>
                  <a href="#how-it-works">
                    <Button size="lg" variant="outline" className="text-base h-12 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 hover:text-white rounded-xl w-full sm:w-auto">
                      See how it works
                    </Button>
                  </a>
                </SignedOut>
                <SignedIn>
                  <Link href="/upload" className="w-full sm:w-auto">
                    <Button size="lg" className="text-base px-8 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl h-12">
                      Upload My Report <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </SignedIn>
              </div>

              <div className="flex flex-wrap gap-5 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> 3 free reports</span>
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-500" /> GDPR encrypted</span>
                <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-emerald-500" /> Results in ~30s</span>
                <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-emerald-500" /> PDF, JPG, PNG, TXT</span>
              </div>
            </div>

            {/* Right — floating report card */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-xl" />
                {/* Card */}
                <div className="relative bg-gray-900 rounded-2xl border border-gray-700/60 shadow-2xl overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-white font-semibold text-sm">Medyra AI Report</span>
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full font-medium border border-emerald-400/20">Complete</span>
                  </div>

                  {/* Results */}
                  <div className="p-5 space-y-2.5">
                    {[
                      { name: 'TSH', value: '4.2 mIU/L', status: 'Normal', bar: 'bg-emerald-500', badge: 'bg-emerald-500/15 text-emerald-400' },
                      { name: 'HbA1c', value: '6.1% ↑', status: 'Elevated', bar: 'bg-orange-500', badge: 'bg-orange-500/15 text-orange-400' },
                      { name: 'eGFR', value: '58 mL/min ↓', status: 'Low', bar: 'bg-orange-500', badge: 'bg-orange-500/15 text-orange-400' },
                      { name: 'CRP', value: '12.4 mg/L', status: 'Critical', bar: 'bg-red-500', badge: 'bg-red-500/15 text-red-400' },
                    ].map((r) => (
                      <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/40 hover:border-gray-600/60 transition-colors">
                        <div className={`w-1 h-8 rounded-full flex-shrink-0 ${r.bar}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white">{r.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{r.value}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.badge}`}>{r.status}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI summary */}
                  <div className="px-5 pb-4">
                    <div className="bg-emerald-950/60 border border-emerald-800/30 rounded-xl p-4">
                      <p className="text-xs font-semibold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                        <Brain className="h-3 w-3" /> AI Summary
                      </p>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Your thyroid (TSH) is healthy. Blood sugar and inflammation markers need attention — book a follow-up with your doctor.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 px-5 pb-5">
                    <div className="flex-1 flex items-center gap-1.5 justify-center py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-400">
                      <MessageSquare className="h-3.5 w-3.5" /> Ask AI
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 justify-center py-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-400">
                      <Download className="h-3.5 w-3.5" /> Save PDF
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
          <ChevronRight className="h-5 w-5 rotate-90" />
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="bg-white border-b border-gray-100 py-5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-center">
            {[
              { value: '3', label: 'Free reports to start' },
              { value: '~30s', label: 'Average analysis time' },
              { value: '18', label: 'Languages supported' },
              { value: '256-bit', label: 'AES encryption' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">The problem we solve</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('problem.heading')}</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">{t('problem.subheading')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-stretch">
            {/* Before */}
            <div className="rounded-2xl border-2 border-red-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('problem.before')}</span>
              </div>
              <div className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2 text-gray-700">
                {[['TSH','4.2 mIU/L','text-gray-700'],['HbA1c','6.1% ↑','text-orange-600'],['eGFR','58 mL/min ↓','text-orange-600'],['CRP','12.4 mg/L ↑↑','text-red-600'],['Ferritin','11 µg/L ↓','text-orange-600'],['Vitamin D','28 nmol/L','text-gray-700']].map(([k,v,c]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className={`font-bold ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-red-400 mt-4 text-center italic font-medium">What does any of this mean?</p>
            </div>

            {/* After */}
            <div className="rounded-2xl border-2 border-emerald-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('problem.after')}</span>
              </div>
              <div className="space-y-3">
                {[
                  { icon: CheckCircle, color: 'text-emerald-500', text: 'Your thyroid hormone (TSH) is within the normal range — no action needed.' },
                  { icon: AlertCircle, color: 'text-orange-500', text: 'Blood sugar (HbA1c) is slightly elevated — could indicate pre-diabetes. Discuss with your doctor.' },
                  { icon: AlertCircle, color: 'text-orange-500', text: 'Kidney filtration (eGFR) is mildly reduced — worth monitoring over time.' },
                  { icon: AlertTriangle, color: 'text-red-500', text: 'Inflammation (CRP) is elevated — your doctor should investigate the cause soon.' },
                  { icon: AlertCircle, color: 'text-orange-500', text: 'Iron stores (Ferritin) are low — may cause fatigue. Iron supplement may help.' },
                ].map(({ icon: Icon, color, text }, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${color}`} />
                    <span className="text-sm text-gray-700 leading-relaxed">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Simple process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('howItWorks.title')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line desktop */}
            <div className="hidden md:block absolute top-9 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200" />

            {[
              {
                step: '01',
                icon: FileText,
                title: 'Upload your report',
                desc: 'Drop any PDF, JPG, PNG or TXT. Our AI reads the text — even from scanned photos.',
                detail: 'Encrypted immediately',
              },
              {
                step: '02',
                icon: Brain,
                title: 'AI analyses in ~30s',
                desc: 'Claude AI identifies every test value, flags abnormal results, and writes a plain-language explanation.',
                detail: 'No medical jargon',
              },
              {
                step: '03',
                icon: CheckCircle,
                title: 'Get your answers',
                desc: 'Read your results, chat with the AI for follow-up questions, and export a PDF for your next appointment.',
                detail: 'Share with your doctor',
              },
            ].map(({ step, icon: Icon, title, desc, detail }) => (
              <div key={step} className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-18 h-18 w-[72px] h-[72px] bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 group-hover:scale-105 transition-all duration-200">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">{step}</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{desc}</p>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full">{detail}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 rounded-xl h-12">
                  Start free — no credit card <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/upload">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 rounded-xl h-12">
                  Upload My Report <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO SHOWCASE ── */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">See it in action</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What you actually get</h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">Here is exactly what the Medyra experience looks like — from upload to explained report.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Upload card */}
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">1</div>
                <span className="font-bold text-gray-900">Upload your report</span>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors cursor-pointer">
                <div className="w-10 h-10 mx-auto mb-3 text-gray-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 font-medium mb-3">Drop PDF, JPG, PNG or TXT</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {['PDF', 'JPG', 'PNG', 'TXT'].map(f => (
                    <span key={f} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-xs font-semibold">{f}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 justify-center">
                <Lock className="h-3 w-3 text-emerald-500" />
                <p className="text-xs text-gray-400">Encrypted · auto-deleted after 30 days</p>
              </div>
            </div>

            {/* Processing card */}
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">2</div>
                <span className="font-bold text-gray-900">AI reads & explains</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { text: 'Extracting text from document…', done: true },
                  { text: 'Identifying all test values…', done: true },
                  { text: 'Generating explanation…', done: false },
                ].map(({ text, done }) => (
                  <div key={text} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 bg-emerald-500 ${done ? '' : 'animate-pulse'}`} />
                    <span className="text-xs text-emerald-700 font-medium">{text}</span>
                    {done && <CheckCircle className="h-3.5 w-3.5 text-emerald-500 ml-auto" />}
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <span className="text-3xl font-black text-emerald-600">~30s</span>
                <p className="text-xs text-gray-400 mt-1 font-medium">Average processing time</p>
              </div>
            </div>

            {/* Result card */}
            <div className="rounded-2xl border-2 border-emerald-300 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white text-sm font-bold flex items-center justify-center">3</div>
                <span className="font-bold text-gray-900">Your report, explained</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: 'TSH', status: 'Normal', statusColor: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', desc: 'Thyroid function is within healthy range.' },
                  { name: 'HbA1c', status: 'High', statusColor: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500', desc: 'Discuss pre-diabetes risk with your doctor.' },
                  { name: 'CRP', status: 'Critical', statusColor: 'bg-red-100 text-red-700', bar: 'bg-red-500', desc: 'Inflammation elevated — see your doctor soon.' },
                ].map((r) => (
                  <div key={r.name} className={`border-l-[3px] ${r.bar.replace('bg-', 'border-')} pl-3 py-1.5`}>
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-sm font-bold text-gray-800">{r.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.statusColor}`}>{r.status}</span>
                    </div>
                    <p className="text-xs text-gray-500">{r.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  Questions to ask your doctor · included
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 rounded-xl h-12">
                  Try It Free — No Credit Card <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/upload">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 rounded-xl h-12">
                  Upload My Report <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* ── LANGUAGES ── */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Global reach</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Available in 18 languages</h2>
          <p className="text-gray-400 text-base mb-10">From Germany to the world — understand your health in your own language.</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {LANGUAGES.map(({ code, name }) => (
              <span key={code} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:border-emerald-500/40 hover:text-white transition-colors">
                <span className="text-[10px] font-bold text-gray-500 tracking-widest">{code}</span>
                <span>{name}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENCRYPTION / SECURITY ── */}
      <section className="py-20 md:py-28 bg-gray-950 overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
              <Shield className="h-3.5 w-3.5" /> Bank-grade encryption
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Your data is encrypted — even from us</h2>
            <p className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
              Every report, every value, every AI explanation is encrypted with AES-256-GCM before it touches our database.
              We store ciphertext. Only you hold the key — through your account.
            </p>
          </div>

          {/* Encrypt flow */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 mb-14">
            {[
              { icon: '📄', title: 'Your report', sub: 'HbA1c: 6.1%\neGFR: 58 mL/min', highlight: false },
              null,
              { icon: '🔐', title: 'AES-256-GCM', sub: '256-bit key · random IV\ntamper-proof auth tag', highlight: true },
              null,
              { icon: '🗄️', title: 'Our database', sub: 'a3f92b…:8d41c0…:\nff19e4…', highlight: false },
            ].map((item, i) => {
              if (item === null) return (
                <div key={i} className="flex flex-col items-center px-4">
                  <div className="hidden md:flex items-center gap-1">
                    <div className="w-10 h-px bg-emerald-500/40" />
                    <svg width="8" height="12" viewBox="0 0 8 12"><path d="M0 0 L8 6 L0 12" fill="none" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.6" /></svg>
                  </div>
                  <div className="md:hidden w-px h-6 bg-emerald-500/40" />
                </div>
              )
              return (
                <div key={item.title} className={`w-44 rounded-2xl p-5 text-center ${item.highlight ? 'border border-emerald-500/40 bg-emerald-950/60 shadow-lg shadow-emerald-900/30' : 'border border-gray-700 bg-gray-900'}`}>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className={`text-xs font-bold mb-1 ${item.highlight ? 'text-emerald-400' : 'text-white'}`}>{item.title}</p>
                  <p className={`text-xs whitespace-pre-line leading-relaxed ${item.highlight ? 'text-emerald-600/80' : 'text-gray-500'}`}>{item.sub}</p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { icon: '🔑', title: 'AES-256-GCM', desc: 'Recommended by BSI TR-02102-1 for sensitive data' },
              { icon: '🇪🇺', title: 'GDPR Art. 32', desc: 'Encryption required for personal health data (§9 BDSG)' },
              { icon: '🎲', title: 'Unique IV per field', desc: 'No two ciphertexts are alike — even for identical values' },
              { icon: '🚫', title: 'Zero plaintext stored', desc: 'Breach of our DB reveals nothing readable' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-gray-800 bg-gray-900 p-4 hover:border-gray-700 transition-colors">
                <div className="text-xl mb-2">{icon}</div>
                <p className="text-xs font-bold text-white mb-1">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/blog/how-medyra-protects-your-medical-data" className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              How does it work technically? Read the deep dive <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING CTA ── */}
      <section className="bg-emerald-500 py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-5 border border-white/30">
            🎉 Launch Special — 50% off all paid plans
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('pricingCta.title')}</h2>
          <p className="text-white/70 mb-8 text-lg">{t('pricingCta.subtitle')}</p>
          <Link href="/pricing">
            <Button size="lg" className="bg-white hover:bg-gray-100 text-emerald-600 font-bold px-10 rounded-xl h-12">
              {t('pricingCta.cta')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-white/60 text-sm mt-5">Plans from €0 · No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* ── BLOG ── */}
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">From the blog</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Learn about your lab results</h2>
            </div>
            <Link href="/blog" className="hidden sm:flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
              All articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                href: '/blog/how-medyra-protects-your-medical-data',
                tag: 'Security · GDPR',
                title: 'How Medyra Protects Your Medical Data',
                desc: 'AES-256-GCM encryption, GDPR Art. 32, and why a breach of our database reveals nothing readable.',
                time: '8 min',
              },
              {
                href: '/blog/how-to-read-lab-results-germany-expat',
                tag: 'Germany · Expat',
                title: 'How to Read Your Lab Results in Germany as an Expat',
                desc: 'Decode your Laborbefund — abbreviations, reference ranges, and what flagged values actually mean.',
                time: '7 min',
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
                  <p className="text-xs font-semibold text-emerald-600 mb-2">{post.tag}</p>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-emerald-700 transition-colors">{post.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{post.desc}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {post.time} read
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6 sm:hidden">
            <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-emerald-600 font-semibold">
              See all articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── LEGAL NOTICE ── */}
      <section className="bg-amber-50 border-t border-amber-200 py-10">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Shield className="h-8 w-8 text-amber-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-2 text-gray-900">{t('legal.title')}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{t('legal.text')}</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 border-t border-gray-800 text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <MedyraLogo size="sm" variant="dark" />
          </div>
          <p className="text-gray-400 mb-5 text-sm">{t('footer.tagline')}</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">{t('footer.privacy')}</Link>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">{t('footer.terms')}</Link>
            <Link href="/contact" className="hover:text-emerald-400 transition-colors">{t('footer.contact')}</Link>
          </div>
          <p className="text-gray-600 text-xs mt-6">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
