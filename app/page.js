'use client'

import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import MedyraUserButton from '@/components/MedyraUserButton'
import Link from 'next/link'
import { Brain, Shield, Clock, ChevronRight, Menu, X, ArrowRight, AlertTriangle, CheckCircle, AlertCircle, Lock, Zap, FileText, MessageSquare, Download, ChevronLeft } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
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
function NewToGermanySection() {
  const t = useTranslations()
  const [active, setActive] = useState('insurance')
  const [animKey, setAnimKey] = useState(0)

  const DOCUMENT_TYPES = [
    {
      id: 'insurance',
      pill: t('landing.newToGermany.pill1'),
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
      pill: t('landing.newToGermany.pill2'),
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
      pill: t('landing.newToGermany.pill3'),
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
            {t('landing.newToGermany.badge')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('landing.newToGermany.title')}{' '}
            <span className="text-emerald-600">{t('landing.newToGermany.titleHighlight')}</span>
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            {t('landing.newToGermany.subtitle')}
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">{t('landing.newToGermany.medyraExplains')}</p>
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
                    {t('landing.newToGermany.ctaUnsigned')}
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/upload" className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors">
                  {t('landing.newToGermany.ctaSigned')}
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>

        {/* Bottom trust line */}
        <p className="text-center text-sm text-gray-400 mt-8">
          {t('landing.newToGermany.trustLine')}
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

// ── Campaign carousel ──────────────────────────────────────────────────────
const CAMPAIGNS = [
  {
    tag: 'Language & Healthcare',
    title: 'German lab results, translated instantly.',
    body: 'Eliminating the double barrier of language and medical terminology for international residents navigating the German healthcare system.',
    visual: '🧪',
    gradient: 'from-slate-900 via-slate-800 to-gray-900',
    accent: 'emerald',
    mockLines: [
      { label: 'Hämoglobin', raw: '11.8 g/dL ↓', plain: 'Slightly low — may cause fatigue', flag: 'warn' },
      { label: 'Leukozyten', raw: '8.4 G/L', plain: 'Normal range — no concern', flag: 'ok' },
      { label: 'Ferritin', raw: '8 µg/L ↓', plain: 'Low iron stores — discuss supplements', flag: 'warn' },
    ],
  },
  {
    tag: 'Mental Health Awareness',
    title: 'Clear results, calm mind.',
    body: 'Addressing the "jargon anxiety" that occurs when patients receive complex medical results they cannot interpret — because clarity is a vital part of mental well-being.',
    visual: '🧠',
    gradient: 'from-violet-950 via-slate-900 to-gray-900',
    accent: 'violet',
    mockLines: [
      { label: 'Diagnosis letter', raw: '3 pages of German medical text', plain: 'You have mild hypertension. Your doctor recommends...', flag: 'ok' },
      { label: 'Jargon removed', raw: '24 medical terms', plain: 'All explained in plain language', flag: 'ok' },
      { label: 'Clarity score', raw: '—', plain: 'Fully understood ✓', flag: 'ok' },
    ],
  },
  {
    tag: 'European Patients\' Rights Day',
    title: 'Your health data, finally clear.',
    body: 'Empowering patients to advocate for themselves by reclaiming their right to understand their own medical data — because knowledge is the foundation of care.',
    visual: '🇪🇺',
    gradient: 'from-blue-950 via-slate-900 to-gray-900',
    accent: 'blue',
    mockLines: [
      { label: 'Your right (EU)', raw: 'Art. 15 GDPR', plain: 'Access and understand your health data', flag: 'ok' },
      { label: 'Blood panel', raw: '18 values', plain: 'Every result explained — in your language', flag: 'ok' },
      { label: 'Report language', raw: 'German', plain: 'Translated to English, Arabic, Hindi...', flag: 'ok' },
    ],
  },
]

function CampaignSection() {
  const [active, setActive] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(prev => (prev + 1) % CAMPAIGNS.length)
      setAnimKey(k => k + 1)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  function go(idx) {
    setActive(idx)
    setAnimKey(k => k + 1)
  }

  const c = CAMPAIGNS[active]
  const accentMap = {
    emerald: { dot: 'bg-emerald-400', text: 'text-emerald-400', ring: 'ring-emerald-400', bar: 'bg-emerald-400', tag: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400', btn: 'bg-emerald-500 hover:bg-emerald-600' },
    violet:  { dot: 'bg-violet-400',  text: 'text-violet-400',  ring: 'ring-violet-400',  bar: 'bg-violet-400',  tag: 'bg-violet-400/10 border-violet-400/30 text-violet-400',  btn: 'bg-violet-500 hover:bg-violet-600'  },
    blue:    { dot: 'bg-blue-400',    text: 'text-blue-400',    ring: 'ring-blue-400',    bar: 'bg-blue-400',    tag: 'bg-blue-400/10 border-blue-400/30 text-blue-400',    btn: 'bg-blue-500 hover:bg-blue-600'    },
  }
  const a = accentMap[c.accent]

  return (
    <section className="py-20 bg-gray-950 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Section header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Why it matters</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Health clarity for everyone</h2>
          </div>
          {/* Dot nav */}
          <div className="flex items-center gap-2">
            {CAMPAIGNS.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === active ? `w-6 h-2 ${a.dot}` : 'w-2 h-2 bg-gray-700 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Campaign card */}
        <div
          key={animKey}
          style={{ animation: 'campFade 0.5s ease both' }}
          className={`grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-white/10`}
        >
          {/* Left — text */}
          <div className={`bg-gradient-to-br ${c.gradient} p-8 md:p-12 flex flex-col justify-between min-h-[320px]`}>
            <div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-6 ${a.tag}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />
                {c.tag}
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
                {c.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
                {c.body}
              </p>
            </div>
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex gap-1.5">
                {CAMPAIGNS.map((_, i) => (
                  <div key={i} className="h-0.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full ${a.bar} ${i === active ? 'animate-[progressBar_5s_linear_both]' : i < active ? 'w-full' : 'w-0'}`}
                      style={i === active ? { animation: 'progressBar 5s linear both' } : undefined}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${a.text}`}>{active + 1} / {CAMPAIGNS.length}</span>
                <div className="flex gap-2">
                  <button onClick={() => go((active - 1 + CAMPAIGNS.length) % CAMPAIGNS.length)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <ChevronLeft className="h-3.5 w-3.5 text-white" />
                  </button>
                  <button onClick={() => go((active + 1) % CAMPAIGNS.length)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <ChevronRight className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right — mock output */}
          <div className="bg-gray-900 p-8 md:p-12 flex flex-col justify-center border-l border-white/5">
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${a.dot} animate-pulse`} />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Medyra AI Output</span>
            </div>
            <div className="space-y-4">
              {c.mockLines.map((line, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/8 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-500">{line.label}</span>
                    <span className={`text-xs font-mono ${line.flag === 'warn' ? 'text-amber-400' : 'text-gray-500'}`}>{line.raw}</span>
                  </div>
                  <p className={`text-sm font-medium ${line.flag === 'warn' ? 'text-amber-300' : a.text}`}>
                    {line.plain}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-white/10">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className={`w-full py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${a.btn}`}>
                    Try it free — 2 reports/month →
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/upload" className={`block w-full py-2.5 rounded-xl text-sm font-bold text-white text-center transition-colors ${a.btn}`}>
                  Upload a report →
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes campFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  )
}

function NavLink({ href, children, color = '#10B981', className = '' }) {
  const pathname = usePathname()
  const active = pathname === href
  return (
    <Link
      href={href}
      className={`relative px-3 py-2 text-sm font-medium transition-colors group ${
        active ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
    >
      {children}
      <span
        className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-transform duration-200 origin-left ${
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`}
        style={{ backgroundColor: color }}
      />
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
      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/"><MedyraLogo size="md" /></Link>

            <div className="hidden md:flex items-center gap-0.5">
              <NavLink href="/pricing">{t('nav.pricing')}</NavLink>
              <NavLink href="/prep" color="#7c3aed" className="text-violet-600 hover:text-violet-700">{t('nav.doctorVisit')}</NavLink>
              <NavLink href="/blog">{t('nav.blog')}</NavLink>
              <NavLink href="/verstehen" color="#0d9488" className="text-xs">{t('nav.verstehen')}</NavLink>
              <div className="w-px h-4 bg-gray-200 mx-2" />
              <LanguageSwitcher />
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    {t('nav.signIn')}
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="ml-1 px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-lg transition-all shadow-sm shadow-emerald-200">
                    {t('nav.tryFree')}
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/upload">
                  <button className="ml-1 px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-lg transition-all shadow-sm shadow-emerald-200">
                    {t('nav.upload')}
                  </button>
                </Link>
                <Link href="/dashboard">
                  <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    {t('nav.dashboard')}
                  </button>
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
            <div className="md:hidden pt-3 pb-2 border-t border-gray-100 mt-3 space-y-0.5">
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                {t('nav.pricing')}
              </Link>
              <Link href="/prep" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                {t('nav.doctorVisit')}
              </Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                {t('nav.blog')}
              </Link>
              <Link href="/verstehen" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                {t('nav.verstehen')}
              </Link>
              <div className="border-t border-gray-100 my-2" />
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.signIn')}
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="w-full mt-1 px-4 py-3 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.tryFree')}
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/upload" onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-3 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors">
                  {t('nav.upload')}
                </Link>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  {t('nav.dashboard')}
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
                {t('landing.hero.badge')}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                {t('landing.hero.title1')}<br />
                <span className="text-emerald-400">{t('landing.hero.title2')}</span>
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
                {t('landing.hero.description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button size="lg" className="text-base px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl h-12 w-full sm:w-auto">
                      {t('landing.hero.ctaAnalyse')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </SignInButton>
                  <a href="#how-it-works">
                    <Button size="lg" variant="outline" className="text-base h-12 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 hover:text-white rounded-xl w-full sm:w-auto">
                      {t('landing.hero.ctaHowItWorks')}
                    </Button>
                  </a>
                </SignedOut>
                <SignedIn>
                  <Link href="/upload" className="w-full sm:w-auto">
                    <Button size="lg" className="text-base px-8 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl h-12">
                      {t('landing.hero.ctaUpload')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </SignedIn>
              </div>

              <div className="flex flex-wrap gap-5 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> {t('landing.hero.tag1')}</span>
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-500" /> {t('landing.hero.tag2')}</span>
                <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-emerald-500" /> {t('landing.hero.tag3')}</span>
                <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-emerald-500" /> {t('landing.hero.tag4')}</span>
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
              { value: '2/mo', labelKey: 'landing.trust.stat1Label' },
              { value: '~30s', labelKey: 'landing.trust.stat2Label' },
              { value: '18', labelKey: 'landing.trust.stat3Label' },
              { value: '256-bit', labelKey: 'landing.trust.stat4Label' },
            ].map(({ value, labelKey }) => (
              <div key={labelKey}>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t(labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8 scroll-fade">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">{t('problem.badge')}</p>
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
              <p className="text-xs text-red-400 mt-3 text-center italic font-medium">{t('problem.beforeNote')}</p>
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
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">{t('landing.howItWorks.badge')}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('howItWorks.title')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative scroll-fade delay-1">
            {/* Connecting line desktop */}
            <div className="hidden md:block absolute top-9 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200" />

            {[
              {
                step: '01',
                icon: FileText,
                title: t('landing.howItWorks.step1Title'),
                desc: t('landing.howItWorks.step1Desc'),
                detail: t('landing.howItWorks.step1Detail'),
              },
              {
                step: '02',
                icon: Brain,
                title: t('landing.howItWorks.step2Title'),
                desc: t('landing.howItWorks.step2Desc'),
                detail: t('landing.howItWorks.step2Detail'),
              },
              {
                step: '03',
                icon: CheckCircle,
                title: t('landing.howItWorks.step3Title'),
                desc: t('landing.howItWorks.step3Desc'),
                detail: t('landing.howItWorks.step3Detail'),
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
                  {t('landing.howItWorks.cta')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/upload">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 rounded-xl h-12">
                  {t('landing.hero.ctaUpload')} <ArrowRight className="ml-2 h-4 w-4" />
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
              <FileText className="h-3.5 w-3.5" /> {t('landing.doctorVisit.badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {t('landing.doctorVisit.title1')}<br />
              <span className="text-emerald-400">{t('landing.doctorVisit.title2')}</span>
            </h2>
            <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
              {t('landing.doctorVisit.description')}
            </p>
          </div>

          {/* Three-column how it works */}
          <div className="grid md:grid-cols-3 gap-6 mb-14 scroll-fade delay-1">
            {[
              {
                step: '01',
                emoji: '🗣️',
                title: t('landing.doctorVisit.step1Title'),
                desc: t('landing.doctorVisit.step1Desc'),
              },
              {
                step: '02',
                emoji: '⚡',
                title: t('landing.doctorVisit.step2Title'),
                desc: t('landing.doctorVisit.step2Desc'),
              },
              {
                step: '03',
                emoji: '🏥',
                title: t('landing.doctorVisit.step3Title'),
                desc: t('landing.doctorVisit.step3Desc'),
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
                  {t('landing.doctorVisit.cta')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-10 rounded-xl h-12">
                  {t('nav.tryFree')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignInButton>
            </SignedOut>
            <p className="text-gray-500 text-xs mt-3">{t('landing.doctorVisit.freePlan')}</p>
          </div>
        </div>
      </section>

      {/* ── LANGUAGES ── */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">{t('landing.languages.badge')}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{t('landing.languages.title')}</h2>
          <p className="text-gray-400 text-base mb-10">{t('landing.languages.subtitle')}</p>
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
              <Shield className="h-3.5 w-3.5" /> {t('landing.security.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.security.title')}</h2>
            <p className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
              {t('landing.security.subtitle')}
            </p>
          </div>

          {/* Encrypt flow */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 mb-14 scroll-fade delay-1">
            {[
              { icon: '📄', title: t('landing.security.yourReport'), sub: 'HbA1c: 6.1%\neGFR: 58 mL/min', highlight: false },
              null,
              { icon: '🔐', title: 'AES-256-GCM', sub: '256-bit key · random IV\ntamper-proof auth tag', highlight: true },
              null,
              { icon: '🗄️', title: t('landing.security.ourDatabase'), sub: 'a3f92b…:8d41c0…:\nff19e4…', highlight: false },
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
              { icon: '🔑', title: t('landing.security.feat1Title'), desc: t('landing.security.feat1Desc') },
              { icon: '🇪🇺', title: t('landing.security.feat2Title'), desc: t('landing.security.feat2Desc') },
              { icon: '🎲', title: t('landing.security.feat3Title'), desc: t('landing.security.feat3Desc') },
              { icon: '🚫', title: t('landing.security.feat4Title'), desc: t('landing.security.feat4Desc') },
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
              {t('landing.security.deepDive')} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CAMPAIGNS ── */}
      <CampaignSection />

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
          <p className="text-white/60 text-sm mt-5">{t('landing.pricingCta.note')}</p>
        </div>
      </section>

      {/* ── BLOG ── */}
      <section className="py-20 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">{t('landing.blog.badge')}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('landing.blog.title')}</h2>
            </div>
            <Link href="/blog" className="hidden sm:flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
              {t('landing.blog.allArticles')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4 scroll-fade delay-1">
            {[
              {
                href: '/blog/doctor-visit-prep-germany',
                tag: 'Doctor Visit · New',
                title: 'How to Prepare for a Doctor\'s Appointment in Germany',
                desc: 'Describe symptoms in any language — Medyra generates a structured German summary for your doctor.',
                time: '6 min',
              },
              {
                href: '/blog/arztbrief-verstehen-fur-senioren',
                tag: 'Für Senioren · Neu',
                title: 'Ihren Arztbrief einfach verstehen — Medyra für Senioren',
                desc: 'Befund erhalten und nicht verstanden? Medyra erklärt alles auf Deutsch — zum Lesen oder Vorlesen lassen.',
                time: '5 Min.',
              },
              {
                href: '/blog/how-to-read-lab-results-germany-expat',
                tag: 'Germany · Expat',
                title: 'How to Read Your Lab Results in Germany as an Expat',
                desc: 'Decode your Laborbefund — abbreviations, reference ranges, and what flagged values actually mean.',
                time: '7 min',
              },
            ].map((post) => (
              <Link key={post.href} href={post.href} className="block group">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 h-full hover:border-emerald-300 hover:shadow-sm transition-all duration-200">
                  <p className="text-xs font-semibold text-emerald-600 mb-2">{post.tag}</p>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-emerald-700 transition-colors">{post.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{post.desc}</p>
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
