'use client'

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import MedyraUserButton from '@/components/MedyraUserButton'
import Link from 'next/link'
import { Brain, Shield, Clock, ChevronRight, Menu, X, ArrowRight, AlertTriangle, CheckCircle, AlertCircle, Lock, Zap, FileText, MessageSquare, Download } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
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

// ── New to Germany section ─────────────────────────────────────────────────
const DOCUMENT_TYPES = [
  {
    id: 'insurance',
    pill: 'Health Insurance Letter',
    heading: 'What does this letter even mean?',
    body: 'Krankenkasse letters are dense German bureaucracy. Medyra reads it and tells you exactly what you owe, what you\'re covered for, and what to do next — in plain English.',
    preview: [
      { label: 'Coverage start', value: '01.04.2024', ok: true },
      { label: 'Monthly premium', value: '€ 109,19', ok: true },
      { label: 'Coverage type', value: 'Gesetzlich (GKV)', ok: true },
      { label: 'Action needed', value: 'Submit to university', ok: null },
    ],
    badge: 'You\'re covered ✅',
  },
  {
    id: 'lab',
    pill: 'Lab Results',
    heading: 'Your Blutbild decoded.',
    body: 'German lab reports list 20+ values with no explanation. Medyra flags what\'s outside normal range, explains what each marker means, and tells you what to ask your doctor.',
    preview: [
      { label: 'Hämoglobin', value: '11.8 g/dL ↓', ok: false },
      { label: 'Ferritin', value: '8 µg/L ↓', ok: false },
      { label: 'TSH', value: '2.1 mIU/L', ok: true },
      { label: 'Cholesterin', value: '195 mg/dL', ok: true },
    ],
    badge: 'Iron levels low — ask about supplements 💡',
  },
  {
    id: 'prescription',
    pill: 'Prescription',
    heading: 'Kassenrezept — what do I do with this?',
    body: 'A German Kassenrezept has codes, LANR numbers, and abbreviations. Medyra translates it: what the medication is, how to take it, and how to pick it up from the pharmacy.',
    preview: [
      { label: 'Medication', value: 'Ibuprofen 400mg', ok: true },
      { label: 'Dosage', value: '3× daily with food', ok: true },
      { label: 'Stomach protection', value: 'Omeprazol 20mg', ok: true },
      { label: 'Pharmacy', value: 'Any Apotheke (free)', ok: true },
    ],
    badge: 'Take to any Apotheke 🏥',
  },
]

function NewToGermanySection() {
  const [active, setActive] = useState('insurance')
  const [animKey, setAnimKey] = useState(0)
  const doc = DOCUMENT_TYPES.find(d => d.id === active)

  function switchDoc(id) {
    if (id === active) return
    setActive(id)
    setAnimKey(k => k + 1)
  }

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            New to Germany
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            New to Germany?{' '}
            <span className="text-emerald-600">We&apos;ve got you.</span>
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            Health documents in Germany are written for Germans. Whether you just arrived or have been here for years — Medyra turns bureaucratic paperwork into plain language, in your language.
          </p>
        </div>

        {/* Pill selector */}
        <div className="flex justify-center gap-2 flex-wrap mb-10">
          {DOCUMENT_TYPES.map(d => (
            <button
              key={d.id}
              onClick={() => switchDoc(d.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                active === d.id
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {d.pill}
            </button>
          ))}
        </div>

        {/* Content card */}
        <div
          key={animKey}
          style={{ animation: 'ngFadeIn 0.3s ease both' }}
          className="grid md:grid-cols-2 gap-0 rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
        >
          {/* Left — explanation */}
          <div className="bg-gray-950 p-8 md:p-10 flex flex-col justify-center">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">{doc.pill}</p>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-snug">
              {doc.heading}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {doc.body}
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
              {doc.badge}
            </div>
          </div>

          {/* Right — mock output */}
          <div className="bg-white p-8 md:p-10 flex flex-col justify-center border-l border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Medyra explains</p>
            <div className="space-y-3">
              {doc.preview.map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className={`text-sm font-semibold flex items-center gap-1.5 ${
                    row.ok === false ? 'text-amber-600' : row.ok === true ? 'text-gray-900' : 'text-emerald-600'
                  }`}>
                    {row.ok === false && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />}
                    {row.ok === true && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors cursor-pointer">
                    Try it free →
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/upload" className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors">
                  Upload a report →
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>

        {/* Bottom trust line */}
        <p className="text-center text-sm text-gray-400 mt-8">
          3 free reports · No credit card needed · <span className="text-emerald-600 font-medium">Results in under 60 seconds</span>
        </p>

      </div>
      <style>{`
        @keyframes ngFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
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
    document.querySelectorAll('.scroll-fade').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        .scroll-fade {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .scroll-fade.in-view {
          opacity: 1;
          transform: translateY(0);
        }
        .scroll-fade.delay-1 { transition-delay: 100ms; }
        .scroll-fade.delay-2 { transition-delay: 200ms; }
        .scroll-fade.delay-3 { transition-delay: 300ms; }
        .scroll-fade.delay-4 { transition-delay: 400ms; }
      `}</style>
      <JsonLd />

      {/* ── NAVIGATION ── */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <MedyraLogo size="md" />

            <div className="hidden md:flex items-center gap-1">
              <Link href="/pricing">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">{t('nav.pricing')}</Button>
              </Link>
              <Link href="/prep">
                <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 font-medium">Doctor Visit</Button>
              </Link>
              <Link href="/blog">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50">Blog</Button>
              </Link>
              <Link href="/verstehen">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-800 hover:bg-gray-50 text-xs">Für Senioren</Button>
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
              <Link href="/prep" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-violet-600 hover:bg-violet-50 font-medium">Doctor Visit</Button>
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
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-center scroll-fade">
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
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8 scroll-fade">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">The problem we solve</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t('problem.heading')}</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">{t('problem.subheading')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 items-stretch">
            {/* Before */}
            <div className="rounded-xl border-2 border-red-100 bg-white p-4 shadow-sm scroll-fade delay-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('problem.before')}</span>
              </div>
              <div className="font-mono text-xs bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-1.5 text-gray-700">
                {[['TSH','4.2 mIU/L','text-gray-700'],['HbA1c','6.1% ↑','text-orange-600'],['eGFR','58 mL/min ↓','text-orange-600'],['CRP','12.4 mg/L ↑↑','text-red-600'],['Ferritin','11 µg/L ↓','text-orange-600'],['Vitamin D','28 nmol/L','text-gray-700']].map(([k,v,c]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-400">{k}</span>
                    <span className={`font-bold ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-red-400 mt-3 text-center italic font-medium">What does any of this mean?</p>
            </div>

            {/* After */}
            <div className="rounded-xl border-2 border-emerald-200 bg-white p-4 shadow-sm scroll-fade delay-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('problem.after')}</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { icon: CheckCircle, color: 'text-emerald-500', text: 'Your thyroid (TSH) is within the normal range — no action needed.' },
                  { icon: AlertCircle, color: 'text-orange-500', text: 'Blood sugar (HbA1c) slightly elevated — discuss pre-diabetes risk with your doctor.' },
                  { icon: AlertCircle, color: 'text-orange-500', text: 'Kidney filtration (eGFR) mildly reduced — worth monitoring over time.' },
                  { icon: AlertTriangle, color: 'text-red-500', text: 'Inflammation (CRP) elevated — your doctor should investigate soon.' },
                  { icon: AlertCircle, color: 'text-orange-500', text: 'Iron stores (Ferritin) low — may cause fatigue.' },
                ].map(({ icon: Icon, color, text }, i) => (
                  <div key={i} className="flex gap-2.5 items-start px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Icon className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${color}`} />
                    <span className="text-xs text-gray-700 leading-relaxed">{text}</span>
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
          <div className="text-center mb-16 scroll-fade">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Simple process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('howItWorks.title')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative scroll-fade delay-1">
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

      {/* ── DOCTOR VISIT PREP ── */}
      <section className="py-20 md:py-28 bg-[#040C08] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 max-w-5xl relative">
          {/* Badge + heading */}
          <div className="text-center mb-14 scroll-fade">
            <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
              <FileText className="h-3.5 w-3.5" /> New feature
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Going to the doctor?<br />
              <span className="text-emerald-400">Arrive prepared.</span>
            </h2>
            <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
              Describe how you feel — in any language. Medyra turns it into a structured,
              professional German summary your doctor can read in seconds.
            </p>
          </div>

          {/* Three-column how it works */}
          <div className="grid md:grid-cols-3 gap-6 mb-14 scroll-fade delay-1">
            {[
              {
                step: '01',
                emoji: '🗣️',
                title: 'Describe in any language',
                desc: 'Write freely in English, Arabic, Hindi, Turkish — whatever feels natural. No medical knowledge needed.',
              },
              {
                step: '02',
                emoji: '⚡',
                title: 'AI structures it instantly',
                desc: 'Claude converts your description into a formal German clinical summary: chief complaints, timeline, history, and suggested questions.',
              },
              {
                step: '03',
                emoji: '🏥',
                title: 'Print & bring to the appointment',
                desc: 'One click prints a clean A4 sheet with the Medyra header — hand it to your doctor at the start of your visit.',
              },
            ].map(({ step, emoji, title, desc }) => (
              <div key={step} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{step}</span>
                </div>
                <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Sample output preview */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 mb-12 max-w-2xl mx-auto scroll-fade delay-2">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-gray-300">Beispiel-Ausgabe</span>
              </div>
              <span className="text-xs text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Deutsch</span>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5">Hauptbeschwerden</p>
                <div className="space-y-1">
                  {['Der Patient berichtet über Kopfschmerzen seit 3 Tagen mit morgendlicher Verstärkung.', 'Schwindel beim Aufstehen aus liegender Position.'].map(t => (
                    <div key={t} className="flex gap-2 text-gray-300"><span className="text-emerald-400 font-bold">·</span>{t}</div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5">Relevante Vorgeschichte</p>
                <p className="text-gray-300">Tägliche Einnahme von Metformin (Dosierung nicht angegeben).</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5">Fragen an den Arzt</p>
                <div className="space-y-1">
                  {['1. Könnte der Schwindel mit der Metformin-Einnahme in Zusammenhang stehen?', '2. Welche Untersuchungen sind bei diesen Beschwerden empfehlenswert?'].map(q => (
                    <p key={q} className="text-gray-300">{q}</p>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-gray-600 italic border-t border-white/10 pt-3">Dieses Dokument wurde zur Kommunikation erstellt und stellt keine medizinische Diagnose dar.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <SignedIn>
              <Link href="/prep">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 rounded-xl h-12">
                  Prepare for my appointment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 rounded-xl h-12">
                  Try it free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </SignedOut>
            <p className="text-gray-500 text-xs mt-3">Free plan includes 1 prep document per month</p>
          </div>
        </div>
      </section>

      {/* ── LANGUAGES ── */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Global reach</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Available in 18 languages</h2>
          <p className="text-gray-400 text-base mb-10">From Germany to the world — understand your health in your own language.</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 scroll-fade delay-1">
            {LANGUAGES.map(({ code, name }) => (
              <span key={code} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-sm text-gray-300 hover:border-emerald-500/40 hover:text-white transition-colors">
                <span className="text-[10px] font-bold text-gray-500 tracking-widest">{code}</span>
                <span>{name}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW TO GERMANY ── */}
      <NewToGermanySection />

      {/* ── ENCRYPTION / SECURITY ── */}
      <section className="py-20 md:py-28 bg-gray-950 overflow-hidden">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14 scroll-fade">
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
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 mb-14 scroll-fade delay-1">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 scroll-fade delay-2">
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('pricingCta.title')}</h2>
          <p className="text-white/80 mb-8 text-lg">{t('pricingCta.subtitle')}</p>
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
          <div className="grid md:grid-cols-3 gap-4 scroll-fade delay-1">
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
