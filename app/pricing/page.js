'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Check, X, Loader2, Shield, Brain, Globe,
  ChevronDown, ChevronUp, ArrowRight, Lock,
} from 'lucide-react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import MedyraLogo from '@/components/MedyraLogo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
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
  const opacity = muted ? 'opacity-50' : ''
  if (value === true) {
    return (
      <span className={opacity}>
        <Check className={`h-3.5 w-3.5 flex-shrink-0 ${highlighted ? 'text-emerald-400' : 'text-emerald-500'}`} />
      </span>
    )
  }
  if (value === false) {
    return (
      <span className={opacity}>
        <X className="h-3.5 w-3.5 flex-shrink-0 text-gray-700" />
      </span>
    )
  }
  return (
    <span className={`text-right text-[11px] font-medium leading-tight ${highlighted ? 'text-emerald-300' : 'text-gray-300'} ${opacity}`}>
      {value}
    </span>
  )
}

// ── FAQ item ───────────────────────────────────────────────────────────────
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${open ? 'border-violet-500/40 bg-violet-950/10' : 'border-gray-800 hover:border-violet-500/30'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className="font-semibold text-[#E8F5F0] text-sm pr-4 leading-snug" style={{ fontFamily: 'var(--font-playfair), serif' }}>
          {q}
        </span>
        {open
          ? <ChevronUp className="h-4 w-4 text-violet-400 flex-shrink-0" />
          : <ChevronDown className="h-4 w-4 text-gray-600 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-gray-400 leading-relaxed border-t border-gray-800/60">
          <p className="pt-4">{a}</p>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [loading, setLoading] = useState(null)
  const [isAnnual, setIsAnnual] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [count, setCount] = useState(0)

  // Animate counter from 0 to 67 on mount
  useEffect(() => {
    const TARGET = 67
    const DURATION = 1600
    const TICK = 20
    const steps = DURATION / TICK
    const inc = TARGET / steps
    let cur = 0
    const t = setInterval(() => {
      cur += inc
      if (cur >= TARGET) { setCount(TARGET); clearInterval(t) }
      else setCount(Math.floor(cur))
    }, TICK)
    return () => clearInterval(t)
  }, [])

  // Scroll fade-in for sections
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
      if (!data.url) throw new Error('No redirect URL')
      window.location.href = data.url
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#040C08] text-[#E8F5F0]" style={{ fontFamily: 'var(--font-dm-sans), Inter, sans-serif', hyphens: 'none', WebkitHyphens: 'none' }}>
      <style>{`
        .scroll-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .scroll-reveal.in-view { opacity: 1; transform: translateY(0); }
        .scroll-reveal.d1 { transition-delay: 80ms; }
        .scroll-reveal.d2 { transition-delay: 160ms; }
        .scroll-reveal.d3 { transition-delay: 240ms; }
        .scroll-reveal.d4 { transition-delay: 320ms; }
        .scroll-reveal.d5 { transition-delay: 400ms; }
        .card-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .card-lift:hover { transform: translateY(-5px); }
        .card-emerald-hover:hover { box-shadow: 0 20px 50px rgba(16,185,129,0.18); border-color: rgba(16,185,129,0.4); }
        .card-violet-hover:hover { box-shadow: 0 20px 50px rgba(124,58,237,0.18); border-color: rgba(124,58,237,0.4); }
        .card-highlighted { transform: translateY(-6px); box-shadow: 0 24px 60px rgba(16,185,129,0.22), 0 0 0 1px rgba(16,185,129,0.15); }
        .card-highlighted:hover { transform: translateY(-10px); box-shadow: 0 32px 70px rgba(16,185,129,0.28), 0 0 0 1px rgba(16,185,129,0.20); }
        .tooltip-arrow::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: #1f2937;
        }
      `}</style>

      {/* ── Early access banner ── */}
      <div className="text-center py-2.5 px-4 text-xs font-medium" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.10) 0%, rgba(124,58,237,0.08) 100%)', borderBottom: '1px solid rgba(16,185,129,0.15)' }}>
        <span className="text-emerald-400">🟢</span>
        <span className="text-gray-300 ml-2">Early access open — lock in 50% off forever before we hit 100 users</span>
      </div>

      {/* ── Sticky navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-800/70 bg-[#040C08]/96 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/"><MedyraLogo size="md" /></Link>

          <div className="hidden md:flex items-center gap-0.5">
            <Link href="/#how-it-works" className="px-3 py-2 text-sm text-gray-400 hover:text-[#E8F5F0] transition-colors rounded-lg hover:bg-white/5">
              How it Works
            </Link>
            <a href="#languages" className="px-3 py-2 text-sm text-gray-400 hover:text-[#E8F5F0] transition-colors rounded-lg hover:bg-white/5">
              Languages
            </a>
            <Link href="/pricing" className="px-3 py-2 text-sm font-semibold text-emerald-400 rounded-lg">
              Pricing
            </Link>
            <div className="w-px h-4 bg-gray-700 mx-2" />
            <LanguageSwitcher />
            <SignedOut>
              <SignInButton mode="modal">
                <button className="ml-2 px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-lg transition-all">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="ml-2 px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
                Dashboard
              </Link>
            </SignedIn>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3 py-1.5 text-xs font-semibold bg-emerald-500 text-white rounded-lg">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="px-3 py-1.5 text-xs font-semibold bg-emerald-500 text-white rounded-lg">Dashboard</Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pb-24">

        {/* ── Page header ── */}
        <div className="text-center pt-14 pb-12">
          {/* Animated spot counter */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-5 py-2.5 mb-7">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-sm text-gray-300">
              <span className="text-emerald-400 font-black text-xl tabular-nums">{count}</span>
              <span className="text-gray-400"> of 100 early access spots claimed</span>
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-[#E8F5F0] mb-4 leading-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Simple, honest pricing
          </h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto mb-10">
            Start free. Upgrade when you need more. No hidden fees, no surprises.
          </p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center gap-3.5">
            <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-[#E8F5F0]' : 'text-gray-500'}`}>
              Monthly
            </span>

            <div className="relative">
              <button
                onClick={() => setIsAnnual(a => !a)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                aria-label="Toggle annual billing"
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isAnnual ? 'bg-violet-600' : 'bg-gray-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>

              {showTooltip && (
                <div className="tooltip-arrow absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-20 bg-gray-800 border border-gray-700 text-xs text-gray-300 px-3 py-2 rounded-xl whitespace-nowrap">
                  Annual plans coming soon
                </div>
              )}
            </div>

            <span className={`text-sm font-medium transition-colors flex items-center gap-2 ${isAnnual ? 'text-violet-400' : 'text-gray-500'}`}>
              Annual
              <span className="text-[10px] font-bold bg-violet-500/15 border border-violet-500/30 text-violet-400 px-2 py-0.5 rounded-full">
                2 months free
              </span>
            </span>
          </div>
        </div>

        {/* ── Pricing cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6 items-end pb-4">
          {TIERS.map((tier, idx) => {
            const isHighlighted = !!tier.highlighted
            const isClinic = !!tier.isClinic
            const isLoading = loading === tier.id

            const cardBorderClass = isHighlighted
              ? 'border-emerald-500/50'
              : isClinic
                ? 'border-violet-500/30'
                : 'border-gray-800'

            const cardBg = isHighlighted
              ? 'linear-gradient(160deg, #0d2416 0%, #081209 100%)'
              : isClinic
                ? 'linear-gradient(160deg, #0d0a1a 0%, #070510 100%)'
                : 'linear-gradient(160deg, #0d1a10 0%, #080c09 100%)'

            const radialOverlay = isClinic
              ? 'radial-gradient(ellipse at 20% 0%, rgba(124,58,237,0.07) 0%, rgba(16,185,129,0.02) 50%, transparent 70%)'
              : 'radial-gradient(ellipse at 20% 0%, rgba(16,185,129,0.06) 0%, rgba(124,58,237,0.03) 50%, transparent 70%)'

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-3xl border p-5 transition-all duration-200
                  ${cardBorderClass}
                  ${isHighlighted ? 'card-highlighted' : isClinic ? 'card-lift card-violet-hover' : 'card-lift card-emerald-hover'}
                  scroll-reveal d${idx + 1}
                `}
                style={{ background: cardBg }}
              >
                {/* Radial gradient overlay */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ background: radialOverlay }} />

                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap ${
                      tier.badgeVariant === 'violet'
                        ? 'bg-violet-600 border border-violet-500/60 text-white'
                        : 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                    }`}>
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="relative z-10 flex flex-col flex-1">

                  {/* Tier name */}
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500 mb-3">
                    {tier.name}
                  </p>

                  {/* Price */}
                  <div className="mb-1">
                    {tier.discountedPrice ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-base text-gray-600 line-through font-medium">{tier.price}</span>
                        <span className="text-3xl font-black text-emerald-400 leading-none">{tier.discountedPrice}</span>
                        <span className="text-xs text-gray-500">{tier.period}</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-3xl font-black leading-none ${isHighlighted ? 'text-emerald-400' : 'text-[#E8F5F0]'}`}>{tier.price}</span>
                        <span className="text-xs text-gray-500">{tier.period}</span>
                      </div>
                    )}
                  </div>

                  {tier.discountedPrice && (
                    <div className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-1">
                      <Lock className="h-2.5 w-2.5" /> LAUNCH50 locked in
                    </div>
                  )}

                  <p className="text-[11px] text-gray-500 leading-relaxed mt-2 mb-5">{tier.description}</p>

                  {/* Feature rows */}
                  <ul className={`space-y-0 flex-1 mb-4 ${isClinic ? 'opacity-50' : ''}`}>
                    {FEATURE_ROWS.map(row => {
                      const val = tier.features[row.key]
                      return (
                        <li key={row.key} className="flex items-center justify-between gap-2 py-2 border-b border-gray-800/50 last:border-0">
                          <span className="text-[11px] text-gray-500 flex-1">{row.label}</span>
                          <FeatureCell value={val} highlighted={isHighlighted} muted={false} />
                        </li>
                      )
                    })}
                  </ul>

                  {/* Note */}
                  <p className="text-[10px] text-gray-600 mb-3.5">{tier.note}</p>

                  {/* CTA button */}
                  {tier.id === 'free' && (
                    <>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <button className="w-full py-2.5 rounded-xl text-sm font-semibold border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                            {tier.ctaLabel}
                          </button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <Link href="/dashboard" className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-colors">
                          Go to Dashboard
                        </Link>
                      </SignedIn>
                    </>
                  )}

                  {tier.isClinic && (
                    <button
                      onClick={() => handleSubscribe(tier)}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-colors"
                    >
                      {tier.ctaLabel}
                    </button>
                  )}

                  {tier.id !== 'free' && !tier.isClinic && (
                    <>
                      <SignedOut>
                        <SignInButton mode="modal">
                          <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isHighlighted
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                              : 'border border-gray-700 text-[#E8F5F0] hover:border-emerald-500/40 hover:text-emerald-400'
                          }`}>
                            {tier.ctaLabel}
                          </button>
                        </SignInButton>
                      </SignedOut>
                      <SignedIn>
                        <button
                          onClick={() => handleSubscribe(tier)}
                          disabled={isLoading}
                          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            isHighlighted
                              ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-lg shadow-emerald-900/50'
                              : 'border border-gray-700 text-[#E8F5F0] hover:border-emerald-500/40 hover:text-emerald-400'
                          }`}
                        >
                          {isLoading
                            ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing...</span>
                            : <span className="flex items-center justify-center gap-1">{tier.ctaLabel} <ArrowRight className="h-3.5 w-3.5" /></span>
                          }
                        </button>
                      </SignedIn>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Trust bar ── */}
        <div className="scroll-reveal flex flex-wrap justify-center gap-8 py-10 border-y border-gray-800 mb-14">
          {[
            { icon: Shield, label: 'GDPR Compliant' },
            { icon: Brain,  label: 'Powered by Claude AI' },
            { icon: Globe,  label: '18 Languages Supported' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-sm text-gray-400">
              <Icon className="h-4 w-4 text-violet-400" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* ── 18 Languages strip ── */}
        <section id="languages" className="text-center mb-16 scroll-reveal">
          <h2 className="text-2xl md:text-3xl font-bold text-[#E8F5F0] mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Available in 18 languages
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
            Understand your health reports in your own language, wherever you are in the world
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {LANGUAGES_18.map(lang => (
              <span
                key={lang}
                className="text-xs font-medium px-3.5 py-1.5 rounded-full border border-emerald-500/25 text-emerald-400/75 bg-emerald-500/5 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors cursor-default"
              >
                {lang}
              </span>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="max-w-2xl mx-auto scroll-reveal">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#E8F5F0] mb-8" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 py-10 mt-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <MedyraLogo size="sm" variant="dark" />
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-gray-600 mb-4">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
          </div>
          <p className="text-gray-700 text-xs">© 2025 Medyra. All rights reserved.</p>
          <p className="text-gray-700 text-xs mt-1">Medyra is an educational tool. It is not a substitute for professional medical advice, diagnosis, or treatment.</p>
        </div>
      </footer>
    </div>
  )
}
