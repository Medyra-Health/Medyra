'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { FileText, Brain, Shield, Clock, ChevronRight, Check } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const TIER_KEYS = ['free', 'onetime', 'personal', 'family', 'clinic']

export default function LandingPage() {
  const t = useTranslations()

  const pricingTiers = TIER_KEYS.map((key) => ({
    key,
    name: t(`pricing.tiers.${key}.name`),
    price: t(`pricing.tiers.${key}.price`),
    period: t(`pricing.tiers.${key}.period`),
    description: t(`pricing.tiers.${key}.desc`),
    features: t.raw(`pricing.tiers.${key}.features`),
    cta: t(`pricing.tiers.${key}.cta`),
    highlighted: key === 'personal'
  }))

  const howItWorksSteps = ['step1', 'step2', 'step3', 'step4'].map((step, i) => ({
    step: String(i + 1),
    title: t(`howItWorks.${step}.title`),
    desc: t(`howItWorks.${step}.desc`)
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Medyra</span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">{t('nav.signIn')}</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button>{t('hero.cta')}</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="ghost">{t('nav.dashboard')}</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4" variant="secondary">{t('hero.trusted')}</Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          <span className="text-blue-600">{t('hero.title')}</span>
          <br />{t('hero.subtitle')}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {t('hero.description')}
        </p>
        <div className="flex justify-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" className="text-lg px-8">
                {t('hero.cta')} <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/upload">
              <Button size="lg" className="text-lg px-8">
                {t('nav.upload')} <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </SignedIn>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          ⚠️ {t('hero.disclaimer')}
        </p>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Brain className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>{t('features.ai.title')}</CardTitle>
              <CardDescription>{t('features.ai.desc')}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>{t('features.secure.title')}</CardTitle>
              <CardDescription>{t('features.secure.desc')}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Clock className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>{t('features.fast.title')}</CardTitle>
              <CardDescription>{t('features.fast.desc')}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">{t('howItWorks.title')}</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorksSteps.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">{t('pricing.title')}</h2>
        <p className="text-center text-gray-600 mb-12">{t('pricing.subtitle')}</p>
        <div className="grid md:grid-cols-5 gap-6">
          {pricingTiers.map((tier, i) => (
            <Card key={i} className={tier.highlighted ? 'border-blue-600 border-2 shadow-xl' : ''}>
              <CardHeader>
                {tier.highlighted && (
                  <Badge className="mb-2 w-fit">{t('pricing.mostPopular')}</Badge>
                )}
                <CardTitle>{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-gray-600">{tier.period}</span>
                </div>
                <CardDescription className="mt-2">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="w-full" variant={tier.highlighted ? 'default' : 'outline'}>
                      {tier.cta}
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/pricing" className="w-full">
                    <Button className="w-full" variant={tier.highlighted ? 'default' : 'outline'}>
                      {tier.cta}
                    </Button>
                  </Link>
                </SignedIn>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="bg-yellow-50 border-t border-yellow-200 py-12">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">{t('legal.title')}</h3>
          <p className="text-gray-700 max-w-3xl mx-auto">
            {t('legal.text')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FileText className="h-6 w-6" />
            <span className="text-xl font-bold">Medyra</span>
          </div>
          <p className="text-gray-400 mb-4">{t('footer.tagline')}</p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white">{t('footer.privacy')}</Link>
            <Link href="/terms" className="hover:text-white">{t('footer.terms')}</Link>
            <Link href="/contact" className="hover:text-white">{t('footer.contact')}</Link>
          </div>
          <p className="text-gray-500 text-xs mt-6">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
