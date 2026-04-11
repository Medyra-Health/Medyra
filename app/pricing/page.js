'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Check, X, Loader2, Shield, Brain, Globe,
  ChevronDown, ChevronUp, ArrowRight, Lock, ArrowLeft,
} from 'lucide-react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import MedyraLogo from '@/components/MedyraLogo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// ── Feature row order (consistent across all cards) ────────────────────────
const FEATURE_ROWS = [
  { key: 'uploads',   label: 'Document uploads per month' },
  { key: 'explain',   label: 'Document explanation' },
  { key: 'chat',      label: 'Follow-up chat questions' },
  { key: 'prep',      label: 'Doctor Visit Prep sessions' },
  { key: 'history',   label: 'Health history tracking' },
  { key: 'family',    label: 'Family members' },
  { key: 'languages', label: 'Languages supported' },
  { key: 'pdf',       label: 'PDF export' },
  { key: 'support',   label: 'Support level' },
]

// ── Tier definitions ────────────────────────────────────────────────────────
const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '€0',
    discountedPrice: null,
    period: '/month',
    description: 'Get started with no commitment',
    badge: null,
    ctaLabel: 'Get Started Free',
    ctaAction: 'signup',
    note: 'No credit card required',
    features: {
      uploads:   '2 per month',
      explain:   'Basic only',
      chat:      false,
      prep:      false,
      history:   false,
      family:    false,
      languages: '18 included',
      pdf:       'Watermarked PDF',
      support:   'Community',
    },
  },
  {
    id: 'onetime',
    name: 'One-Time Report',
    price: '€2.99',
    discountedPrice: null,
    period: 'single payment',
    description: 'Pay once, no subscription needed',
    badge: null,
    ctaLabel: 'Buy Single Report',
    ctaAction: 'checkout',
    note: 'No subscription needed',
    features: {
      uploads:   '1 report',
      explain:   'Full explanation',
      chat:      '5 questions',
      prep:      '1 session included',
      history:   false,
      family:    false,
      languages: '18 included',
      pdf:       'Clean PDF export',
      support:   'Email',
    },
  },
  {
    id: 'personal',
    name: 'Personal',
    price: '€9',
    discountedPrice: '€4.50',
    period: '/month',
    description: 'For individuals who want full access each month',
    badge: 'Most Popular',
    badgeVariant: 'emerald',
    ctaLabel: 'Start Personal Plan',
    ctaAction: 'checkout',
    note: 'LAUNCH50 applied — 50% off forever',
    highlighted: true,
    features: {
      uploads:   '5 per month',
      explain:   'Full explanation',
      chat:      '20 per report',
      prep:      '5 sessions per month',
      history:   true,
      family:    false,
      languages: '18 included',
      pdf:       'Full PDF export',
      support:   'Priority email',
    },
  },
  {
    id: 'family',
    name: 'Family',
    price: '€18',
    discountedPrice: '€9',
    period: '/month',
    description: 'For families tracking health together',
    badge: 'Best Value',
    badgeVariant: 'emerald',
    ctaLabel: 'Start Family Plan',
    ctaAction: 'checkout',
    note: 'LAUNCH50 applied — 50% off forever',
    features: {
      uploads:   '15 per month shared',
      explain:   'Full explanation',
      chat:      '20 per report',
      prep:      '15 sessions per month',
      history:   true,
      family:    'Up to 5 members',
      languages: '18 included',
      pdf:       'Full PDF export',
      support:   'Priority email',
    },
  },
  {
    id: 'clinic',
    name: 'Clinic',
    price: 'Contact us',
    discountedPrice: null,
    period: 'for pricing',
    description: 'For medical practices and healthcare teams',
    badge: 'Coming Soon',
    badgeVariant: 'violet',
    ctaLabel: 'Join Waitlist',
    ctaAction: 'mailto',
    note: 'EHR integration coming soon',
    isClinic: true,
    features: {
      uploads:   'Unlimited',
      explain:   'Full explanation',
      chat:      'Unlimited',
      prep:      'Unlimited',
      history:   true,
      family:    'Multi-user staff accounts',
      languages: '18 included',
      pdf:       'Full PDF export',
      support:   'Dedicated support',
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
    a: 'Yes — cancel your subscription at any time from your dashboard. There are no cancellation fees, no lock-in periods, and no questions asked. Your access continues until the end of the billing period.',
  },
  {
    q: 'Is my health data stored securely?',
    a: 'Your data is encrypted with AES-256-GCM before it ever touches our database. We are fully GDPR compliant and your documents are automatically deleted after 30 days. We never sell or share your health data with anyone.',
  },
  {
    q: 'What documents can I upload?',
    a: 'PDF, JPG, PNG, and TXT files are all supported. Our AI can read text from scanned images and photos of lab reports, doctor letters, prescriptions, and hospital discharge letters.',
  },
  {
    q: 'How does the family plan work?',
    a: 'One subscription covers up to 5 family members. Each person gets their own secure profile, and the 15 monthly report uploads are shared across the family. Health history is tracked separately for each member.',
  },
]

// ── Feature cell ───────────────────────────────────────────────────────────
function FeatureCell({ value, highlighted, muted }) {
  const cls = muted ? 'opacity-40' : ''
  if (value === true) {
    return (
      <span className={cls}>
        <Check className={`h-3.5 w-3.5 flex-shrink-0 ${highlighted ? 'text-emerald-500' : 'text-emerald-500'}`} />
      </span>
    )
  }
  if (value === false) {
    return (
      <span className={cls}>
        <X className="h-3.5 w-3.5 flex-shrink-0 text-gray-300" />
      </span>
    )
  }
  return (
    <span className={`text-right text-[11px] font-medium leading-tight ${highlighted ? 'text-emerald-700' : 'text-gray-700'} ${cls}`}>
      {value}
    </span>
  )
}

// ── FAQ item ───────────────────────────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${open ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{q}</span>
        {open
          ? <ChevronUp className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
          <p className="pt-3">{a}</p>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [loading, setLoading] = useState(null)
  const [hoveredTier, setHoveredTier] = useState(null)

  // Scroll fade-in
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
      if (!data.url) throw new Error('No redirect URL')
      window.location.href = data.url
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        .scroll-reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .scroll-reveal.in-view { opacity: 1; transform: translateY(0); }
        .scroll-reveal.d1 { transition-delay: 60ms; }
        .scroll-reveal.d2 { transition-delay: 120ms; }
        .scroll-reveal.d3 { transition-delay: 180ms; }
        .scroll-reveal.d4 { transition-delay: 240ms; }
        .scroll-reveal.d5 { transition-delay: 300ms; }
      `}</style>

      {/* ── Header (same as before) ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">

        {/* ── Hero ── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-5 shadow-lg shadow-emerald-200 animate-pulse">
            Limited launch offer — 50% off forever with LAUNCH50
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Start free. Upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>

        {/* ── Pricing cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-16 items-end pb-2">
          {TIERS.map((tier, idx) => {
            const isHighlighted = !!tier.highlighted
            const isClinic = !!tier.isClinic
            const isHovered = hoveredTier === tier.id
            const isLoading = loading === tier.id

            return (
              <div
                key={tier.id}
                onMouseEnter={() => setHoveredTier(tier.id)}
                onMouseLeave={() => setHoveredTier(null)}
                className={`
                  relative flex flex-col rounded-2xl border p-5 transition-all duration-200
                  scroll-reveal d${idx + 1}
                  ${isHighlighted
                    ? 'border-emerald-400 shadow-xl shadow-emerald-100 ring-1 ring-emerald-400/20 -translate-y-2 z-10 bg-white'
                    : isClinic
                      ? 'border-gray-200 bg-gray-50 opacity-80'
                      : isHovered
                        ? 'border-gray-300 shadow-md bg-white -translate-y-1'
                        : 'border-gray-200 bg-white'
                  }
                `}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${
                      tier.badgeVariant === 'violet'
                        ? 'bg-violet-600 text-white'
                        : 'bg-emerald-500 text-white shadow shadow-emerald-200'
                    }`}>
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Name */}
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">{tier.name}</p>

                {/* Price */}
                <div className="mb-1">
                  {tier.discountedPrice ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-gray-400 line-through">{tier.price}</span>
                      <span className="text-3xl font-black text-gray-900">{tier.discountedPrice}</span>
                      <span className="text-xs text-gray-400">{tier.period}</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-gray-900">{tier.price}</span>
                      <span className="text-xs text-gray-400">{tier.period}</span>
                    </div>
                  )}
                </div>

                {tier.discountedPrice && (
                  <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-1">
                    <Lock className="h-2.5 w-2.5" /> LAUNCH50 locked in
                  </div>
                )}

                <p className="text-[11px] text-gray-500 leading-relaxed mt-2 mb-4">{tier.description}</p>

                {/* Feature rows */}
                <ul className={`space-y-0 flex-1 mb-4 ${isClinic ? 'opacity-50' : ''}`}>
                  {FEATURE_ROWS.map(row => {
                    const val = tier.features[row.key]
                    return (
                      <li key={row.key} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
                        <span className="text-[11px] text-gray-500 flex-1">{row.label}</span>
                        <FeatureCell value={val} highlighted={isHighlighted} muted={false} />
                      </li>
                    )
                  })}
                </ul>

                {/* Note */}
                <p className="text-[10px] text-gray-400 mb-3">{tier.note}</p>

                {/* CTA */}
                {tier.id === 'free' && (
                  <>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <Button className="w-full text-xs h-9" size="sm" variant="outline">{tier.ctaLabel}</Button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/dashboard" className="w-full">
                        <Button className="w-full text-xs h-9" size="sm" variant="outline">Go to Dashboard</Button>
                      </Link>
                    </SignedIn>
                  </>
                )}

                {tier.isClinic && (
                  <Button
                    className="w-full text-xs h-9 border-violet-300 text-violet-600 hover:bg-violet-50"
                    size="sm"
                    variant="outline"
                    onClick={() => handleSubscribe(tier)}
                  >
                    {tier.ctaLabel}
                  </Button>
                )}

                {tier.id !== 'free' && !tier.isClinic && (
                  <>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <Button
                          className={`w-full text-xs h-9 ${isHighlighted ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold' : ''}`}
                          size="sm"
                          variant={isHighlighted ? 'default' : 'outline'}
                        >
                          {tier.ctaLabel}
                        </Button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <Button
                        className={`w-full text-xs h-9 ${isHighlighted ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold' : ''}`}
                        size="sm"
                        variant={isHighlighted ? 'default' : 'outline'}
                        onClick={() => handleSubscribe(tier)}
                        disabled={isLoading}
                      >
                        {isLoading
                          ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Processing</>
                          : <>{tier.ctaLabel} <ArrowRight className="ml-1 h-3 w-3" /></>
                        }
                      </Button>
                    </SignedIn>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Trust bar ── */}
        <div className="scroll-reveal flex flex-wrap justify-center gap-8 py-8 border-y border-gray-100 mb-14 text-sm text-gray-500">
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500" /> GDPR Compliant</div>
          <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-emerald-500" /> Powered by Claude AI</div>
          <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-500" /> 18 Languages Supported</div>
        </div>

        {/* ── 18 Languages strip ── */}
        <section id="languages" className="text-center mb-16 scroll-reveal">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available in 18 languages</h2>
          <p className="text-gray-400 text-sm mb-7 max-w-md mx-auto">
            Understand your health reports in your own language, wherever you are in the world
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {LANGUAGES_18.map(lang => (
              <span
                key={lang}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                {lang}
              </span>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <div className="max-w-2xl mx-auto scroll-reveal">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Frequently asked questions</h2>
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
          <p className="text-gray-600 text-xs mt-1">Medyra is an educational tool — not a substitute for professional medical advice.</p>
        </div>
      </footer>
    </div>
  )
}
