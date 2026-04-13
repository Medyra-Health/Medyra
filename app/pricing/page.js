'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Check, X, Loader2, Shield, Brain, Globe,
  ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Copy, CheckCheck,
} from 'lucide-react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import MedyraLogo from '@/components/MedyraLogo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// ── Feature rows — same order, same label, across every card ───────────────
const FEATURE_ROWS = [
  { key: 'uploads',   label: 'Uploads per month' },
  { key: 'explain',   label: 'Report explanation' },
  { key: 'chat',      label: 'AI follow-up chat' },
  { key: 'prep',      label: 'Doctor Visit Prep' },
  { key: 'history',   label: 'Health history' },
  { key: 'family',    label: 'Family members' },
  { key: 'languages', label: 'Languages' },
  { key: 'pdf',       label: 'PDF export' },
  { key: 'support',   label: 'Support' },
]

// ── Tier data ──────────────────────────────────────────────────────────────
// Feature values must stay SHORT — one line max — so rows align across cards
const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '€0',
    priceSub: '/month',
    originalPrice: null,
    badge: null,
    cta: 'Get Started Free',
    ctaAction: 'signup',
    ctaStyle: 'outline',
    features: {
      uploads:   '2/month',
      explain:   'Basic only',
      chat:      false,
      prep:      false,
      history:   false,
      family:    false,
      languages: '18',
      pdf:       'Watermarked',
      support:   'Community',
    },
  },
  {
    id: 'onetime',
    name: 'One-Time Report',
    price: '€2.99',
    priceSub: 'single payment',
    originalPrice: null,
    badge: null,
    cta: 'Buy Single Report',
    ctaAction: 'checkout',
    ctaStyle: 'outline',
    features: {
      uploads:   '1 report',
      explain:   'Full',
      chat:      '5 questions',
      prep:      '1 session',
      history:   false,
      family:    false,
      languages: '18',
      pdf:       'Clean PDF',
      support:   'Email',
    },
  },
  {
    id: 'personal',
    name: 'Personal',
    price: '€9',
    priceSub: '/month',
    discountedPrice: null,
    badge: 'Most Popular',
    badgeColor: 'emerald',
    cta: 'Start Personal Plan',
    ctaAction: 'checkout',
    ctaStyle: 'primary',
    highlighted: true,
    features: {
      uploads:   '5/month',
      explain:   'Full',
      chat:      '20/report',
      prep:      '5/month',
      history:   true,
      family:    false,
      languages: '18',
      pdf:       'Full PDF',
      support:   'Priority email',
    },
  },
  {
    id: 'family',
    name: 'Family',
    price: '€18',
    priceSub: '/month',
    discountedPrice: null,
    badge: 'Best Value',
    badgeColor: 'emerald',
    cta: 'Start Family Plan',
    ctaAction: 'checkout',
    ctaStyle: 'outline',
    features: {
      uploads:   '15/month',
      explain:   'Full',
      chat:      '20/report',
      prep:      '15/month',
      history:   true,
      family:    '5 members',
      languages: '18',
      pdf:       'Full PDF',
      support:   'Priority email',
    },
  },
  {
    id: 'clinic',
    name: 'Clinic',
    price: 'Contact us',
    priceSub: 'for pricing',
    originalPrice: null,
    badge: 'Coming Soon',
    badgeColor: 'violet',
    cta: 'Join Waitlist',
    ctaAction: 'mailto',
    ctaStyle: 'violet',
    isClinic: true,
    features: {
      uploads:   'Unlimited',
      explain:   'Full',
      chat:      'Unlimited',
      prep:      'Unlimited',
      history:   true,
      family:    'Multi-user',
      languages: '18',
      pdf:       'Full PDF',
      support:   'Dedicated',
    },
  },
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
    q: 'What documents can I upload?',
    a: 'PDF, JPG, PNG, and TXT files. Our AI can read text from scanned images and photos of lab reports, doctor letters, and prescriptions.',
  },
  {
    q: 'How does the family plan work?',
    a: 'One subscription covers up to 5 family members, each with their own secure profile. The 15 monthly uploads are shared across the family.',
  },
]

// ── Feature value cell ─────────────────────────────────────────────────────
function Cell({ value, highlighted }) {
  if (value === true) {
    return <Check className={`h-4 w-4 flex-shrink-0 ${highlighted ? 'text-emerald-500' : 'text-emerald-500'}`} />
  }
  if (value === false) {
    return <X className="h-4 w-4 flex-shrink-0 text-gray-300" />
  }
  return (
    <span className={`text-[11px] font-semibold leading-tight text-right ${highlighted ? 'text-emerald-700' : 'text-gray-700'}`}>
      {value}
    </span>
  )
}

// ── FAQ item ───────────────────────────────────────────────────────────────
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

// ── Main page ──────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [loading, setLoading] = useState(null)
  const [hoveredTier, setHoveredTier] = useState(null)
  const [copied, setCopied] = useState(false)

  function copyCoupon() {
    navigator.clipboard.writeText('LAUNCH50').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Scroll animations for below-fold sections only
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
      window.location.href = 'mailto:abralur28@gmail.com'
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
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-in { animation: fadeUp 0.45s ease both; }
        .scroll-reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.55s ease, transform 0.55s ease; }
        .scroll-reveal.in-view { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* ── Header ── */}
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

      <div className="container mx-auto px-4 py-10 md:py-14 max-w-[1280px]">

        {/* ── Page title ── */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Simple, transparent pricing</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-7">Start free. Upgrade when you need more. No hidden fees.</p>

          {/* Coupon box — enter at Stripe checkout */}
          <div className="inline-block max-w-sm w-full">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Early access offer · First 100 users only</p>
              <p className="text-xl font-black text-gray-900 mb-0.5">50% off for life</p>
              <p className="text-sm text-gray-500 mb-4">Lock in this rate forever — apply the code at checkout on Personal or Family plans</p>
              <button
                onClick={copyCoupon}
                className="w-full flex items-center justify-between bg-white border-2 border-emerald-200 hover:border-emerald-400 rounded-xl px-4 py-3 transition-all group"
              >
                <span className="text-xl font-black tracking-widest text-emerald-700">LAUNCH50</span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                  {copied ? <><CheckCheck className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy code</>}
                </span>
              </button>
              <p className="text-xs text-gray-400 mt-2">Paste it in the &ldquo;Promo code&rdquo; field at Stripe checkout</p>
            </div>
          </div>
        </div>

        {/* ── Pricing grid ─────────────────────────────────────────────────── */}
        {/* Each card section has a fixed min-height so rows align across all 5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-10">
          {TIERS.map((tier, idx) => {
            const hi = !!tier.highlighted
            const isHovered = hoveredTier === tier.id
            const isLoading = loading === tier.id

            return (
              <div
                key={tier.id}
                onMouseEnter={() => setHoveredTier(tier.id)}
                onMouseLeave={() => setHoveredTier(null)}
                className={`
                  relative flex flex-col rounded-2xl border p-4
                  card-in transition-shadow duration-200
                  ${hi
                    ? 'border-emerald-400 shadow-lg shadow-emerald-100 ring-1 ring-emerald-300/30 bg-white'
                    : isHovered
                      ? 'border-emerald-300 shadow-md bg-white'
                      : 'border-gray-200 bg-white'}
                `}
                style={{ animationDelay: `${idx * 60}ms` }}
              >

                {/* ── Badge area — fixed height so all cards align ── */}
                <div className="h-6 flex items-start justify-center mb-2">
                  {tier.badge && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      tier.badgeColor === 'violet'
                        ? 'bg-violet-100 text-violet-700 border border-violet-200'
                        : 'bg-emerald-500 text-white'
                    }`}>
                      {tier.badge}
                    </span>
                  )}
                </div>

                {/* ── Tier name ── */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{tier.name}</p>

                {/* ── Price area — fixed min-height so CTA always aligns ── */}
                <div className="min-h-[68px] mb-3">
                  {tier.discountedPrice ? (
                    <>
                      <div className="flex items-baseline gap-1.5 mb-0.5">
                        <span className="text-sm text-gray-400 line-through">{tier.price}</span>
                        <span className="text-2xl font-black text-gray-900">{tier.discountedPrice}</span>
                        <span className="text-xs text-gray-400">{tier.priceSub}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        <Lock className="h-2 w-2" /> LAUNCH50 applied
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-gray-900">{tier.price}</span>
                      <span className="text-xs text-gray-400">{tier.priceSub}</span>
                    </div>
                  )}
                </div>

                {/* ── CTA button ── */}
                <div className="mb-4">
                  {tier.id === 'free' && (
                    <>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <Button className="w-full h-8 text-xs" size="sm" variant="outline">{tier.cta}</Button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <Link href="/dashboard">
                          <Button className="w-full h-8 text-xs" size="sm" variant="outline">Go to Dashboard</Button>
                        </Link>
                      </SignedIn>
                    </>
                  )}

                  {tier.ctaAction === 'mailto' && (
                    <Button
                      className="w-full h-8 text-xs border-violet-300 text-violet-600 hover:bg-violet-50"
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
                            className={`w-full h-8 text-xs ${hi ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}
                            size="sm" variant={hi ? 'default' : 'outline'}
                          >
                            {tier.cta}
                          </Button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <Button
                          className={`w-full h-8 text-xs ${hi ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}
                          size="sm" variant={hi ? 'default' : 'outline'}
                          onClick={() => handleSubscribe(tier)}
                          disabled={isLoading}
                        >
                          {isLoading
                            ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Processing</>
                            : <>{tier.cta} <ArrowRight className="h-3 w-3 ml-1" /></>}
                        </Button>
                      </SignedIn>
                    </>
                  )}
                </div>

                {/* ── Divider ── */}
                <div className="border-t border-gray-100 mb-3" />

                {/* ── Feature rows ── each has a fixed height so they line up ── */}
                <ul className="flex flex-col gap-0">
                  {FEATURE_ROWS.map(row => {
                    const val = tier.features[row.key]
                    return (
                      <li
                        key={row.key}
                        className="flex items-center justify-between gap-2 border-b border-gray-50 last:border-0"
                        style={{ minHeight: '32px' }}
                      >
                        <span className="text-[11px] text-gray-500 flex-shrink-0">{row.label}</span>
                        <Cell value={val} highlighted={hi} />
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>

        {/* ── What each plan is for (marketing copy BELOW cards) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-14 scroll-reveal">
          {[
            { name: 'Free', text: 'Try Medyra with no commitment. Understand 2 reports per month at no cost.' },
            { name: 'One-Time', text: 'Need to understand one document right now? Pay once, no subscription.' },
            { name: 'Personal', text: 'Regular lab results, doctor letters, or prescriptions? This is your plan.' },
            { name: 'Family', text: 'Track health for the whole family. Shared uploads, separate profiles.' },
            { name: 'Clinic', text: 'For practices and healthcare teams. Unlimited reports, multi-user access.' },
          ].map(({ name, text }) => (
            <div key={name} className="px-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 mb-1">{name}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* ── Trust bar ── */}
        <div className="scroll-reveal flex flex-wrap justify-center gap-8 py-8 border-y border-gray-100 mb-14 text-sm text-gray-500">
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500" /> GDPR Compliant</div>
          <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-emerald-500" /> Powered by Claude AI</div>
          <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-500" /> 18 Languages Supported</div>
        </div>

        {/* ── 18 Languages strip ── */}
        <section id="languages" className="scroll-reveal text-center mb-16">
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

        {/* ── FAQ ── */}
        <div className="scroll-reveal max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

      </div>

      {/* ── Footer ── */}
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
