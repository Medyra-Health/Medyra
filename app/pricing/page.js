'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Check, X, Loader2, Shield, Brain, Globe,
  ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Sparkles,
  Users, FileText, MessageCircle, Stethoscope, History, Download,
} from 'lucide-react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import MedyraLogo from '@/components/MedyraLogo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const COLOR_MAP = {
  emerald: {
    ring: 'ring-emerald-400 border-emerald-400 shadow-emerald-100',
    badge: 'bg-emerald-500 text-white',
    btn: 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500',
    icon: 'text-emerald-500',
    price: 'text-emerald-700',
  },
  teal: {
    ring: 'ring-teal-400 border-teal-400 shadow-teal-100',
    badge: 'bg-teal-500 text-white',
    btn: 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600',
    icon: 'text-teal-500',
    price: 'text-teal-700',
  },
  violet: {
    ring: 'ring-violet-300 border-violet-300',
    badge: 'bg-violet-100 text-violet-700 border border-violet-200',
    btn: 'border-violet-300 text-violet-600 hover:bg-violet-50',
    icon: 'text-violet-400',
    price: 'text-violet-700',
  },
  gray: {
    ring: 'ring-gray-200 border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    btn: '',
    icon: 'text-emerald-500',
    price: 'text-gray-900',
  },
}

const LANGUAGES_18 = [
  'Deutsch', 'English', 'Français', 'Español', 'Italiano',
  'Português', 'Nederlands', 'Polski', 'Türkçe', 'Русский',
  'العربية', '中文', '日本語', '한국어', 'हिन्दी',
  'বাংলা', 'اردو', 'Svenska',
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${open ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-200 hover:border-gray-300'}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="font-semibold text-gray-900 text-sm pr-4">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-emerald-500 flex-shrink-0" />
               : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
          <p>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  const t = useTranslations('pricingPage')
  const [loading, setLoading] = useState(null)

  const TIERS = [
    {
      id: 'free', color: 'gray', price: '€0', priceSub: t('free.priceSub'),
      badge: null, highlighted: false, ctaAction: 'signup',
      name: t('free.name'), cta: t('free.cta'),
      features: [
        { icon: FileText,      text: t('free.f1') },
        { icon: Stethoscope,   text: t('free.f2') },
        { icon: MessageCircle, text: t('free.f3') },
        { icon: Users,         text: t('free.f4') },
        { icon: Globe,         text: t('free.f5') },
        { icon: Download,      text: t('free.f6') },
        { icon: X,             text: t('free.f7'), negative: true },
      ],
    },
    {
      id: 'personal', color: 'emerald', price: '€4.99', priceSub: t('personal.priceSub'),
      badge: t('personal.badge'), highlighted: true, ctaAction: 'checkout',
      name: t('personal.name'), cta: t('personal.cta'),
      features: [
        { icon: FileText,      text: t('personal.f1') },
        { icon: Stethoscope,   text: t('personal.f2') },
        { icon: MessageCircle, text: t('personal.f3') },
        { icon: Users,         text: t('personal.f4') },
        { icon: Globe,         text: t('personal.f5') },
        { icon: Download,      text: t('personal.f6') },
        { icon: History,       text: t('personal.f7') },
      ],
    },
    {
      id: 'family', color: 'teal', price: '€9.99', priceSub: t('family.priceSub'),
      badge: t('family.badge'), highlighted: false, ctaAction: 'checkout',
      name: t('family.name'), cta: t('family.cta'),
      features: [
        { icon: FileText,      text: t('family.f1') },
        { icon: Stethoscope,   text: t('family.f2') },
        { icon: MessageCircle, text: t('family.f3') },
        { icon: Users,         text: t('family.f4') },
        { icon: Globe,         text: t('family.f5') },
        { icon: Download,      text: t('family.f6') },
        { icon: History,       text: t('family.f7') },
        { icon: Shield,        text: t('family.f8') },
      ],
    },
    {
      id: 'clinic', color: 'violet', price: t('clinic.price'), priceSub: t('clinic.priceSub'),
      badge: t('clinic.badge'), highlighted: false, ctaAction: 'mailto',
      name: t('clinic.name'), cta: t('clinic.cta'),
      features: [
        { icon: FileText,      text: t('clinic.f1') },
        { icon: Stethoscope,   text: t('clinic.f2') },
        { icon: MessageCircle, text: t('clinic.f3') },
        { icon: Users,         text: t('clinic.f4') },
        { icon: Globe,         text: t('clinic.f5') },
        { icon: Download,      text: t('clinic.f6') },
        { icon: Shield,        text: t('clinic.f7') },
      ],
    },
  ]

  const FAQ_ITEMS = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
    { q: t('faq.q6'), a: t('faq.a6') },
    { q: t('faq.q7'), a: t('faq.a7') },
  ]

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target) }
      }),
      { threshold: 0.06 }
    )
    document.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  async function handleSubscribe(tier) {
    if (tier.ctaAction === 'mailto') {
      window.location.href = 'mailto:hello@medyra.de'
      return
    }
    if (tier.ctaAction === 'signup') return
    setLoading(tier.id)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tier.id, origin: window.location.origin }),
      })
      const data = await res.json()
      if (!data.url) throw new Error()
      window.location.href = data.url
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .card-in { animation: fadeUp 0.45s ease both; }
        .scroll-reveal { opacity:0;transform:translateY(14px);transition:opacity .55s ease,transform .55s ease }
        .scroll-reveal.in-view { opacity:1;transform:translateY(0) }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4 mr-1" /> {t('back')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="h-3.5 w-3.5" /> {t('badge')}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight">
            {t('heroLine1')}<br className="hidden md:block" />
            <span className="text-emerald-600"> {t('heroLine2')}</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">{t('subtitle')}</p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {TIERS.map((tier, idx) => {
            const c = COLOR_MAP[tier.color]
            const isLoading = loading === tier.id
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border p-5 card-in transition-all duration-200 ${
                  tier.highlighted
                    ? `ring-2 ${c.ring} shadow-xl bg-white`
                    : `border-gray-200 bg-white hover:border-gray-300 hover:shadow-md`
                }`}
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <div className="h-7 flex items-start mb-3">
                  {tier.badge && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${c.badge}`}>{tier.badge}</span>
                  )}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">{tier.name}</p>
                <div className="mb-5">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-3xl font-black ${c.price}`}>{tier.price}</span>
                    <span className="text-xs text-gray-400">{tier.priceSub}</span>
                  </div>
                </div>

                <div className="mb-5">
                  {tier.id === 'free' && (
                    <>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <Button className="w-full" size="sm" variant="outline">{tier.cta}</Button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <Link href="/dashboard">
                          <Button className="w-full" size="sm" variant="outline">{t('free.ctaDashboard')}</Button>
                        </Link>
                      </SignedIn>
                    </>
                  )}
                  {tier.ctaAction === 'mailto' && (
                    <Button className="w-full border-violet-300 text-violet-600 hover:bg-violet-50" size="sm" variant="outline"
                      onClick={() => handleSubscribe(tier)}>{tier.cta}</Button>
                  )}
                  {tier.id !== 'free' && tier.ctaAction !== 'mailto' && (
                    <>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <Button className={`w-full ${tier.highlighted ? c.btn : ''}`} size="sm" variant={tier.highlighted ? 'default' : 'outline'}>
                            {tier.cta}
                          </Button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <Button className={`w-full ${tier.highlighted ? c.btn : ''}`} size="sm" variant={tier.highlighted ? 'default' : 'outline'}
                          onClick={() => handleSubscribe(tier)} disabled={isLoading}>
                          {isLoading
                            ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />{t('processing')}</>
                            : <>{tier.cta} <ArrowRight className="h-3 w-3 ml-1.5" /></>}
                        </Button>
                      </SignedIn>
                    </>
                  )}
                </div>

                <div className="border-t border-gray-100 mb-4" />
                <ul className="flex flex-col gap-2.5 flex-1">
                  {tier.features.map((f, i) => (
                    <li key={i} className={`flex items-start gap-2.5 text-[12px] leading-snug ${f.negative ? 'text-gray-300' : 'text-gray-600'}`}>
                      {f.negative
                        ? <X className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-300" />
                        : <Check className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${c.icon}`} />}
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* ── Fair Use Policy, professional section ── */}
        <div className="scroll-reveal mb-16">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200">
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

            <div className="bg-gray-50/60 px-6 py-7 md:px-8 md:py-8">
              <div className="flex flex-col md:flex-row md:items-start md:gap-10">

                {/* Left: headline + explanation */}
                <div className="md:w-80 flex-shrink-0 mb-6 md:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t('fairUse.label')}</span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">{t('fairUse.title')}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{t('fairUse.body')}</p>
                </div>

                {/* Right: cap table */}
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                    {t('fairUse.tableTitle')}
                  </p>
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{t('fairUse.featureCol')}</th>
                          <th className="text-center px-4 py-2.5 text-xs font-semibold text-emerald-700">{t('fairUse.personalCol')}</th>
                          <th className="text-center px-4 py-2.5 text-xs font-semibold text-teal-700">{t('fairUse.familyCol')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          [t('fairUse.cap1'), t('fairUse.cap1p'), t('fairUse.cap1f')],
                          [t('fairUse.cap2'), t('fairUse.cap2p'), t('fairUse.cap2f')],
                          [t('fairUse.cap3'), t('fairUse.cap3p'), t('fairUse.cap3f')],
                        ].map(([feature, personal, family], i) => (
                          <tr key={i} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <td className="px-4 py-3 text-xs text-gray-700 font-medium">{feature}</td>
                            <td className="px-4 py-3 text-xs text-center">
                              <span className="inline-flex items-center bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">{personal}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-center">
                              <span className="inline-flex items-center bg-teal-50 text-teal-700 font-semibold px-2.5 py-1 rounded-full">{family}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">{t('fairUse.footnote')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compare table */}
        <div className="scroll-reveal mb-16 overflow-x-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">{t('compare.title')}</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs w-1/3">{t('compare.feature')}</th>
                <th className="text-center py-3 px-4 font-bold text-xs text-gray-600">{t('free.name')}</th>
                <th className="text-center py-3 px-4 font-bold text-xs text-emerald-700">{t('personal.name')}</th>
                <th className="text-center py-3 px-4 font-bold text-xs text-teal-700">{t('family.name')}</th>
                <th className="text-center py-3 px-4 font-bold text-xs text-violet-600">{t('clinic.name')}</th>
              </tr>
            </thead>
            <tbody>
              {[
                [t('compare.r1'),   '3',                   '20',                  '50',                  t('compare.unlimited')],
                [t('compare.r2'),   `4 / ${t('compare.month')}`, t('compare.unlimitedStar'), t('compare.unlimitedStar'), t('compare.unlimited')],
                [t('compare.r3'),   `1 / ${t('compare.month')}`, t('compare.unlimitedStar'), t('compare.unlimitedStar'), t('compare.unlimited')],
                [t('compare.r4'),   t('compare.watermarked'), t('compare.unlimitedStar'), t('compare.unlimitedStar'), t('compare.full')],
                [t('compare.r5'),   '1',                   '2',                   t('compare.upTo5'),    t('compare.multiuser')],
                [t('compare.r6'),   false,                 true,                  true,                  true],
                [t('compare.r7'),   '18',                  '18',                  '18',                  '18'],
                [t('compare.r8'),   t('compare.community'), t('compare.email'),   t('compare.priority'), t('compare.dedicated')],
                [t('compare.r9'),   '€0',                  '€4.99',               '€9.99',               t('compare.custom')],
              ].map((row, ri) => (
                <tr key={ri} className={`border-b border-gray-50 ${ri % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                  <td className="py-3 px-4 text-gray-600 text-xs font-medium">{row[0]}</td>
                  {row.slice(1).map((v, vi) => (
                    <td key={vi} className={`text-center py-3 px-4 text-xs ${vi === 1 ? 'font-semibold text-emerald-700' : vi === 2 ? 'font-semibold text-teal-700' : 'text-gray-600'}`}>
                      {v === true  ? <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                       : v === false ? <X className="h-4 w-4 text-gray-300 mx-auto" />
                       : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Trust bar */}
        <div className="scroll-reveal flex flex-wrap justify-center gap-8 py-8 border-y border-gray-100 mb-14 text-sm text-gray-500">
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500" /> GDPR {t('trust.gdpr')}</div>
          <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-emerald-500" /> {t('trust.ai')}</div>
          <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-500" /> {t('trust.languages')}</div>
        </div>

        {/* Languages */}
        <section className="scroll-reveal text-center mb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('languages.title')}</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">{t('languages.subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {LANGUAGES_18.map(lang => (
              <span key={lang} className="text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                {lang}
              </span>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <div className="scroll-reveal max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6">{t('faq.title')}</h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
          </div>
        </div>

      </div>

    </div>
  )
}
