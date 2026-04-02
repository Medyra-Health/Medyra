'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Loader2, ArrowLeft, Shield, MessageSquare, Zap, Star, Building2, User, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import MedyraLogo from '@/components/MedyraLogo'

const TIER_KEYS = ['free', 'onetime', 'personal', 'family', 'clinic']

const TIER_ICONS = {
  free: Zap,
  onetime: Star,
  personal: User,
  family: Users,
  clinic: Building2,
}

const CHAT_TABLE = [
  { key: 'free',     label: 'Free',      questions: '5',   protection: 'Safe',          protectionClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { key: 'onetime',  label: 'One-Time',  questions: '15',  protection: 'Safe',          protectionClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { key: 'personal', label: 'Personal',  questions: '50',  protection: 'High cap',      protectionClass: 'bg-blue-50 text-blue-700 border-blue-200',           dot: 'bg-blue-500' },
  { key: 'family',   label: 'Family',    questions: '100', protection: 'Very high cap', protectionClass: 'bg-purple-50 text-purple-700 border-purple-200',     dot: 'bg-purple-500' },
  { key: 'clinic',   label: 'Clinic',    questions: '100', protection: 'Very high cap', protectionClass: 'bg-purple-50 text-purple-700 border-purple-200',     dot: 'bg-purple-500' },
]

const FAQ_ITEMS = [
  { q: 'Is my health data secure?', a: 'Yes. All data is encrypted in transit and at rest. We are GDPR compliant and automatically delete your reports after 30 days. We never sell or share your data.' },
  { q: 'What counts as an AI question?', a: 'Each message you send to the AI chat on a report page counts as one question. The limit resets per report — so uploading a new report gives you a fresh quota.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel your subscription at any time from your dashboard — no penalties, no questions asked.' },
  { q: 'Is this medical advice?', a: 'No. Medyra is an educational tool that helps you understand medical terminology. Always consult your doctor for medical decisions.' },
  { q: 'What file formats are supported?', a: 'PDF, JPG, PNG, and TXT. Our AI can extract text from scanned images and photos of lab reports.' },
  { q: 'Which languages are supported?', a: 'Medyra is available in 16 languages including English, German, French, Spanish, Arabic, Chinese, Japanese, and more.' },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50">
          <p className="pt-3">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  const t = useTranslations()
  const [loading, setLoading] = useState(null)
  const [hoveredTier, setHoveredTier] = useState(null)

  const pricingTiers = TIER_KEYS.map((key) => ({
    key,
    name: t(`pricing.tiers.${key}.name`),
    price: t(`pricing.tiers.${key}.price`),
    originalPrice: t(`pricing.tiers.${key}.originalPrice`),
    period: t(`pricing.tiers.${key}.period`),
    description: t(`pricing.tiers.${key}.desc`),
    features: t.raw(`pricing.tiers.${key}.features`),
    cta: t(`pricing.tiers.${key}.cta`),
    highlighted: key === 'personal',
    isFree: key === 'free',
    isClinic: key === 'clinic',
    Icon: TIER_ICONS[key],
  }))

  async function handleSubscribe(tier) {
    if (tier === 'free' || tier === 'clinic') return
    setLoading(tier)
    try {
      const origin = window.location.origin
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, origin })
      })
      if (!response.ok) throw new Error('Failed to create checkout session')
      const data = await response.json()
      window.location.href = data.url
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/">
              <MedyraLogo size="md" />
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4 mr-1" /> {t('common.back')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-semibold text-xs mb-4">
            🎉 {t('pricing.subtitle')}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">{t('pricing.title')}</h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">Start free, upgrade when you need more. All plans include AI-powered medical report analysis.</p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-16">
          {pricingTiers.map((tier) => {
            const { Icon } = tier
            const isHovered = hoveredTier === tier.key
            return (
              <div
                key={tier.key}
                onMouseEnter={() => setHoveredTier(tier.key)}
                onMouseLeave={() => setHoveredTier(null)}
                className={`
                  relative flex flex-col rounded-2xl border p-5 transition-all duration-200 cursor-default
                  ${tier.highlighted
                    ? 'border-emerald-500 shadow-lg shadow-emerald-100 bg-white ring-1 ring-emerald-500/20 scale-105 z-10'
                    : isHovered
                      ? 'border-gray-300 shadow-md bg-white -translate-y-0.5'
                      : 'border-gray-200 bg-white'}
                `}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-500 text-white text-xs px-3 py-0.5 shadow">{t('pricing.mostPopular')}</Badge>
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tier.highlighted ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                    <Icon className={`h-4 w-4 ${tier.highlighted ? 'text-emerald-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">{tier.name}</p>
                    {tier.originalPrice && (
                      <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0 mt-0.5">{t('pricing.launchBadge')}</Badge>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-1">
                  <div className="flex items-baseline gap-1.5">
                    {tier.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">{tier.originalPrice}</span>
                    )}
                    <span className="text-3xl font-black text-gray-900">{tier.price}</span>
                    <span className="text-gray-400 text-xs">{tier.period}</span>
                  </div>
                  {tier.originalPrice && (
                    <p className="text-xs text-orange-600 font-medium">{t('pricing.launchNote')}</p>
                  )}
                </div>

                <p className="text-xs text-gray-400 mb-4 leading-relaxed">{tier.description}</p>

                {/* Features */}
                <ul className="space-y-2 flex-1 mb-5">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${tier.highlighted ? 'text-emerald-500' : 'text-gray-400'}`} />
                      <span className={`text-xs leading-relaxed ${feature.includes('AI questions') ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {tier.isFree ? (
                  <>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <Button className="w-full text-xs h-9" size="sm" variant="outline">{tier.cta}</Button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <Link href="/dashboard" className="w-full">
                        <Button className="w-full text-xs h-9" size="sm" variant="outline">Go to Dashboard</Button>
                      </Link>
                    </SignedIn>
                  </>
                ) : tier.isClinic ? (
                  <Link href="/contact" className="w-full">
                    <Button className="w-full text-xs h-9" size="sm" variant="outline">{tier.cta}</Button>
                  </Link>
                ) : (
                  <>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <Button
                          className={`w-full text-xs h-9 ${tier.highlighted ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold' : ''}`}
                          size="sm"
                          variant={tier.highlighted ? 'default' : 'outline'}
                        >
                          {tier.cta}
                        </Button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <Button
                        className={`w-full text-xs h-9 ${tier.highlighted ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold' : ''}`}
                        size="sm"
                        variant={tier.highlighted ? 'default' : 'outline'}
                        onClick={() => handleSubscribe(tier.key)}
                        disabled={loading === tier.key}
                      >
                        {loading === tier.key ? <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Loading...</> : tier.cta}
                      </Button>
                    </SignedIn>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* AI Chat Limits section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
              <MessageSquare className="h-3.5 w-3.5" /> AI Chat Limits
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">How many questions can I ask?</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">Each plan includes a set number of AI chat questions per report. Questions reset with each new report upload.</p>
          </div>

          <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
              <div className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Plan</div>
              <div className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Questions / report</div>
              <div className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Cost Protection</div>
            </div>
            {/* Table rows */}
            {CHAT_TABLE.map((row, i) => (
              <div
                key={row.key}
                className={`grid grid-cols-3 items-center border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50 ${row.key === 'personal' ? 'bg-emerald-50/40' : ''}`}
              >
                <div className="px-5 py-3.5 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${row.dot}`} />
                  <span className="text-sm font-semibold text-gray-800">{row.label}</span>
                  {row.key === 'personal' && (
                    <Badge className="bg-emerald-500 text-white text-xs px-1.5 py-0">Popular</Badge>
                  )}
                </div>
                <div className="px-5 py-3.5 text-center">
                  <span className="text-lg font-black text-gray-900">{row.questions}</span>
                </div>
                <div className="px-5 py-3.5 flex justify-center">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${row.protectionClass}`}>
                    {row.protection}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Cost Protection means you are always in control — high caps prevent unexpected AI usage costs while keeping Medyra affordable.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-16 text-sm text-gray-500">
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500" /> GDPR Compliant</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Cancel anytime</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> No hidden fees</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Data deleted after 30 days</div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 border-t border-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <MedyraLogo size="sm" variant="dark" />
          </div>
          <p className="text-gray-500 text-xs">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
