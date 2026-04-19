'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Check, X, Loader2, Shield, Brain, Globe,
  ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Sparkles,
  Users, FileText, MessageCircle, Stethoscope, History, Download,
} from 'lucide-react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import MedyraLogo from '@/components/MedyraLogo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '€0',
    priceSub: '/month',
    badge: null,
    cta: 'Get Started Free',
    ctaAction: 'signup',
    highlighted: false,
    color: 'gray',
    features: [
      { icon: FileText,      text: '2 reports / month' },
      { icon: Stethoscope,   text: '1 doctor visit prep / month' },
      { icon: MessageCircle, text: '4 AI chat messages / month' },
      { icon: Users,         text: '1 profile (yourself)' },
      { icon: Globe,         text: 'All 18 languages' },
      { icon: Download,      text: 'Watermarked PDF', note: true },
      { icon: X,             text: 'No health history tracking', negative: true },
    ],
  },
  {
    id: 'personal',
    name: 'Personal',
    price: '€4.99',
    priceSub: '/month',
    badge: 'Most Popular',
    cta: 'Start Personal Plan',
    ctaAction: 'checkout',
    highlighted: true,
    color: 'emerald',
    features: [
      { icon: FileText,      text: '10 reports / month' },
      { icon: Stethoscope,   text: 'Unlimited doctor visit preps*' },
      { icon: MessageCircle, text: 'Unlimited AI chat*' },
      { icon: Users,         text: '1 profile' },
      { icon: Globe,         text: 'All 18 languages' },
      { icon: Download,      text: 'Full PDF export' },
      { icon: History,       text: 'Health history tracking' },
    ],
  },
  {
    id: 'family',
    name: 'Family',
    price: '€9.99',
    priceSub: '/month',
    badge: 'Best Value',
    cta: 'Start Family Plan',
    ctaAction: 'checkout',
    highlighted: false,
    color: 'teal',
    features: [
      { icon: FileText,      text: '25 reports / month' },
      { icon: Stethoscope,   text: 'Unlimited doctor visit preps*' },
      { icon: MessageCircle, text: 'Unlimited AI chat*' },
      { icon: Users,         text: 'Up to 5 member profiles' },
      { icon: Globe,         text: 'All 18 languages' },
      { icon: Download,      text: 'Full PDF export' },
      { icon: History,       text: 'Shared family health history' },
      { icon: Shield,        text: 'Priority support' },
    ],
  },
  {
    id: 'clinic',
    name: 'Clinic',
    price: 'Custom',
    priceSub: 'pricing',
    badge: 'Coming Soon',
    cta: 'Join Waitlist',
    ctaAction: 'mailto',
    highlighted: false,
    color: 'violet',
    features: [
      { icon: FileText,      text: 'Unlimited reports' },
      { icon: Stethoscope,   text: 'Unlimited preps' },
      { icon: MessageCircle, text: 'Unlimited AI chat' },
      { icon: Users,         text: 'Multi-user staff accounts' },
      { icon: Globe,         text: 'All 18 languages' },
      { icon: Download,      text: 'Full PDF export' },
      { icon: Shield,        text: 'Dedicated support' },
    ],
  },
]

// Comparison table rows
const COMPARE_ROWS = [
  { label: 'Reports / month',       values: ['2',         '10',          '25',          'Unlimited'] },
  { label: 'AI chat messages',      values: ['4 / month', 'Unlimited*',  'Unlimited*',  'Unlimited'] },
  { label: 'Doctor visit preps',    values: ['1 / month', 'Unlimited*',  'Unlimited*',  'Unlimited'] },
  { label: 'PDF export',            values: ['Watermarked','Unlimited*', 'Unlimited*',  'Full']      },
  { label: 'Member profiles',       values: ['1',         '1',           'Up to 5',     'Multi-user'] },
  { label: 'Health history',        values: [false,        true,          true,          true]        },
  { label: 'Languages',             values: ['18',         '18',          '18',          '18']        },
  { label: 'Support',               values: ['Community',  'Email',       'Priority',    'Dedicated'] },
  { label: 'Price / month',         values: ['€0',         '€4.99',       '€9.99',       'Custom']    },
]

// Silent fair-use hard caps (shown in footnote)
const FAIR_USE_CAPS = [
  { feature: 'AI chat messages',   personal: '200 / month', family: '400 / month' },
  { feature: 'Doctor visit preps', personal: '30 / month',  family: '60 / month'  },
  { feature: 'PDF exports',        personal: '50 / month',  family: '100 / month' },
]

const LANGUAGES_18 = [
  'Deutsch', 'English', 'Français', 'Español', 'Italiano',
  'Português', 'Nederlands', 'Polski', 'Türkçe', 'Русский',
  'العربية', '中文', '日本語', '한국어', 'हिन्दी',
  'বাংলা', 'اردو', 'Svenska',
]

const FAQ_ITEMS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — cancel from your dashboard at any time. No penalties, no questions asked. Access continues until the end of the billing period.',
  },
  {
    q: 'Is my health data stored securely?',
    a: 'All data is encrypted with AES-256-GCM before touching our database. We are fully GDPR compliant and documents are automatically deleted after 30 days.',
  },
  {
    q: 'What does "Unlimited*" mean?',
    a: 'Paid plans have generous monthly soft limits designed so that virtually no normal user will ever hit them. Personal: 200 chats, 30 preps, 50 PDFs. Family: 400 chats, 60 preps, 100 PDFs. If you hit a limit, you\'ll see a friendly message — no auto-upgrade, just a human email to discuss your needs.',
  },
  {
    q: 'What documents can I upload?',
    a: 'PDF, JPG, PNG, and TXT files. Our AI can read text from scanned images and photos of lab reports, doctor letters, and prescriptions.',
  },
  {
    q: 'How does the Family plan work?',
    a: 'One subscription covers up to 5 family members, each with their own secure profile and shared health history. The 25 monthly reports are shared across all members.',
  },
  {
    q: 'What is a doctor visit prep?',
    a: 'Medyra generates a structured summary of your symptoms and biomarker trends that you can share with your doctor before an appointment.',
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${open ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-200 hover:border-gray-300'}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="font-semibold text-gray-900 text-sm pr-4">{q}</span>
        {open
          ? <ChevronUp className="h-4 w-4 text-emerald-500 flex-shrink-0" />
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

export default function PricingPage() {
  const [loading, setLoading] = useState(null)

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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-in { animation: fadeUp 0.45s ease both; }
        .scroll-reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.55s ease, transform 0.55s ease; }
        .scroll-reveal.in-view { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Simple, transparent pricing
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight">
            Understand your health.<br className="hidden md:block" />
            <span className="text-emerald-600"> On your terms.</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
            Start free. Upgrade when you need more. Cancel anytime. No hidden fees.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {TIERS.map((tier, idx) => {
            const c = COLOR_MAP[tier.color]
            const isLoading = loading === tier.id

            return (
              <div
                key={tier.id}
                className={`
                  relative flex flex-col rounded-2xl border p-5 card-in transition-all duration-200
                  ${tier.highlighted
                    ? `ring-2 ${c.ring} shadow-xl bg-white`
                    : `border-gray-200 bg-white hover:border-gray-300 hover:shadow-md`}
                `}
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                {/* Badge */}
                <div className="h-7 flex items-start mb-3">
                  {tier.badge && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${c.badge}`}>
                      {tier.badge}
                    </span>
                  )}
                </div>

                {/* Name */}
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">{tier.name}</p>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-3xl font-black ${c.price}`}>{tier.price}</span>
                    <span className="text-xs text-gray-400">{tier.priceSub}</span>
                  </div>
                </div>

                {/* CTA */}
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
                          <Button className="w-full" size="sm" variant="outline">Go to Dashboard</Button>
                        </Link>
                      </SignedIn>
                    </>
                  )}

                  {tier.ctaAction === 'mailto' && (
                    <Button
                      className="w-full border-violet-300 text-violet-600 hover:bg-violet-50"
                      size="sm" variant="outline"
                      onClick={() => handleSubscribe(tier)}
                    >
                      {tier.cta}
                    </Button>
                  )}

                  {tier.id !== 'free' && tier.ctaAction !== 'mailto' && (
                    <>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <Button
                            className={`w-full ${tier.highlighted ? c.btn : ''}`}
                            size="sm"
                            variant={tier.highlighted ? 'default' : 'outline'}
                          >
                            {tier.cta}
                          </Button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <Button
                          className={`w-full ${tier.highlighted ? c.btn : ''}`}
                          size="sm"
                          variant={tier.highlighted ? 'default' : 'outline'}
                          onClick={() => handleSubscribe(tier)}
                          disabled={isLoading}
                        >
                          {isLoading
                            ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Processing…</>
                            : <>{tier.cta} <ArrowRight className="h-3 w-3 ml-1.5" /></>}
                        </Button>
                      </SignedIn>
                    </>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 mb-4" />

                {/* Feature list */}
                <ul className="flex flex-col gap-2.5 flex-1">
                  {tier.features.map((f, i) => {
                    const Icon = f.icon
                    return (
                      <li key={i} className={`flex items-start gap-2.5 text-[12px] leading-snug ${f.negative ? 'text-gray-300' : 'text-gray-600'}`}>
                        {f.negative
                          ? <X className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-300" />
                          : <Check className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${c.icon}`} />}
                        {f.text}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Fair use footnote */}
        <div className="scroll-reveal bg-gray-50 border border-gray-200 rounded-xl p-5 mb-16">
          <p className="text-xs font-semibold text-gray-500 mb-3">* Subject to fair use policy — hard caps nobody should ever hit:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-gray-500">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-2 font-medium">Feature</th>
                  <th className="text-center pb-2 font-medium text-emerald-700">Personal cap</th>
                  <th className="text-center pb-2 font-medium text-teal-700">Family cap</th>
                </tr>
              </thead>
              <tbody>
                {FAIR_USE_CAPS.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0">
                    <td className="py-1.5">{row.feature}</td>
                    <td className="text-center py-1.5 text-emerald-600 font-medium">{row.personal}</td>
                    <td className="text-center py-1.5 text-teal-600 font-medium">{row.family}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-400 mt-3">
            If you hit a cap, we silently block and show a friendly message — no auto-upgrade.
            Anyone genuinely reaching these limits hears from us directly.
          </p>
        </div>

        {/* Compare table */}
        <div className="scroll-reveal mb-16 overflow-x-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Compare plans</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs w-1/3">Feature</th>
                <th className="text-center py-3 px-4 font-bold text-xs text-gray-600">Free</th>
                <th className="text-center py-3 px-4 font-bold text-xs text-emerald-700">Personal</th>
                <th className="text-center py-3 px-4 font-bold text-xs text-teal-700">Family</th>
                <th className="text-center py-3 px-4 font-bold text-xs text-violet-600">Clinic</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, ri) => (
                <tr key={ri} className={`border-b border-gray-50 ${ri % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                  <td className="py-3 px-4 text-gray-600 text-xs font-medium">{row.label}</td>
                  {row.values.map((v, vi) => (
                    <td key={vi} className={`text-center py-3 px-4 text-xs ${vi === 1 ? 'font-semibold text-emerald-700' : vi === 2 ? 'font-semibold text-teal-700' : 'text-gray-600'}`}>
                      {v === true
                        ? <Check className="h-4 w-4 text-emerald-500 mx-auto" />
                        : v === false
                          ? <X className="h-4 w-4 text-gray-300 mx-auto" />
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
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500" /> GDPR Compliant</div>
          <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-emerald-500" /> Powered by Claude AI</div>
          <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-500" /> 18 Languages</div>
        </div>

        {/* Languages */}
        <section className="scroll-reveal text-center mb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Available in 18 languages</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Understand your health reports in your own language
          </p>
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
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <MedyraLogo size="sm" variant="dark" />
          </div>
          <p className="text-gray-500 text-xs">© 2025 Medyra. All rights reserved.</p>
          <p className="text-gray-600 text-xs mt-1">Educational tool — not a substitute for professional medical advice.</p>
        </div>
      </footer>
    </div>
  )
}
