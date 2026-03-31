'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Loader2, ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import MedyraLogo from '@/components/MedyraLogo'

const TIER_KEYS = ['free', 'onetime', 'personal', 'family', 'clinic']

export default function PricingPage() {
  const t = useTranslations()
  const [loading, setLoading] = useState(null)

  const pricingTiers = TIER_KEYS.map((key) => ({
    key,
    name: t(`pricing.tiers.${key}.name`),
    price: t(`pricing.tiers.${key}.price`),
    period: t(`pricing.tiers.${key}.period`),
    description: t(`pricing.tiers.${key}.desc`),
    features: t.raw(`pricing.tiers.${key}.features`),
    cta: t(`pricing.tiers.${key}.cta`),
    highlighted: key === 'personal',
    isFree: key === 'free',
    isClinic: key === 'clinic'
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

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">{t('pricing.title')}</h1>
          <p className="text-lg text-gray-500">{t('pricing.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.key}
              className={`flex flex-col ${tier.highlighted ? 'border-emerald-600 border-2 shadow-lg ring-1 ring-emerald-600/20' : 'border-gray-200'}`}
            >
              <CardHeader className="pb-3">
                {tier.highlighted && (
                  <Badge className="mb-2 w-fit bg-emerald-500 text-white">{t('pricing.mostPopular')}</Badge>
                )}
                <CardTitle className="text-base">{tier.name}</CardTitle>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-400 text-sm">{tier.period}</span>
                </div>
                <CardDescription className="text-xs mt-1">{tier.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 pb-3">
                <ul className="space-y-2">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-0">
                {tier.isFree ? (
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button className="w-full" size="sm" variant="outline">{tier.cta}</Button>
                    </SignInButton>
                  </SignedOut>
                ) : tier.isClinic ? (
                  <Link href="/contact" className="w-full">
                    <Button className="w-full" size="sm" variant="outline">{tier.cta}</Button>
                  </Link>
                ) : (
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button
                        className={`w-full ${tier.highlighted ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold' : ''}`}
                        size="sm"
                        variant={tier.highlighted ? 'default' : 'outline'}
                      >
                        {tier.cta}
                      </Button>
                    </SignInButton>
                  </SignedOut>
                )}
                <SignedIn>
                  {!tier.isFree && !tier.isClinic && (
                    <Button
                      className={`w-full ${tier.highlighted ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold' : ''}`}
                      size="sm"
                      variant={tier.highlighted ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(tier.key)}
                      disabled={loading === tier.key}
                    >
                      {loading === tier.key ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Loading...</> : tier.cta}
                    </Button>
                  )}
                  {tier.isFree && (
                    <Link href="/dashboard" className="w-full">
                      <Button className="w-full" size="sm" variant="outline">Go to Dashboard</Button>
                    </Link>
                  )}
                  {tier.isClinic && (
                    <Link href="/contact" className="w-full">
                      <Button className="w-full" size="sm" variant="outline">{tier.cta}</Button>
                    </Link>
                  )}
                </SignedIn>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-500">
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500" /> GDPR Compliant</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Cancel anytime</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> No hidden fees</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Data deleted after 30 days</div>
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {[
              { q: 'Is my health data secure?', a: 'Yes. All data is encrypted in transit and at rest. We are GDPR compliant and automatically delete your reports after 30 days. We never sell or share your data.' },
              { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel your subscription at any time from your dashboard — no penalties, no questions asked.' },
              { q: 'Is this medical advice?', a: 'No. Medyra is an educational tool that helps you understand medical terminology. Always consult your doctor for medical decisions.' },
              { q: 'What file formats are supported?', a: 'PDF, JPG, PNG, and TXT. Our OCR technology can extract text from scanned images and photos of lab reports.' },
              { q: 'Which languages are supported?', a: 'Medyra is available in 16 languages including English, German, French, Spanish, Arabic, Chinese, Japanese, and more.' }
            ].map((item, i) => (
              <div key={i} className="border-b border-gray-200 pb-5">
                <h3 className="font-semibold text-gray-900 mb-1">{item.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </div>
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
