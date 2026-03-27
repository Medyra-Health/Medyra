'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { FileText, Brain, Shield, Clock, ChevronRight, Check, Menu, X } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

const TIER_KEYS = ['free', 'onetime', 'personal', 'family', 'clinic']

export default function LandingPage() {
  const t = useTranslations()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <FileText className="h-7 w-7 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Medyra</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-3">
              <LanguageSwitcher />
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">{t('nav.signIn')}</Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm">{t('hero.cta')}</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">{t('nav.dashboard')}</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>

            {/* Mobile: language + hamburger */}
            <div className="flex md:hidden items-center space-x-2">
              <LanguageSwitcher />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-3 pb-2 border-t mt-3 space-y-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.signIn')}
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    {t('hero.cta')}
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">{t('nav.dashboard')}</Button>
                </Link>
                <div className="flex items-center px-2 py-1">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <Badge className="mb-4" variant="secondary">{t('hero.trusted')}</Badge>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          <span className="text-blue-600">{t('hero.title')}</span>
          <br />{t('hero.subtitle')}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto px-2">
          {t('hero.description')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" className="text-base px-8 w-full sm:w-auto">
                {t('hero.cta')} <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/upload" className="w-full sm:w-auto">
              <Button size="lg" className="text-base px-8 w-full">
                {t('nav.upload')} <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </SignedIn>
        </div>
        <p className="text-sm text-gray-500 mt-4 px-4">
          ⚠️ {t('hero.disclaimer')}
        </p>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-blue-600 mb-3" />
              <CardTitle className="text-lg">{t('features.ai.title')}</CardTitle>
              <CardDescription>{t('features.ai.desc')}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-green-600 mb-3" />
              <CardTitle className="text-lg">{t('features.secure.title')}</CardTitle>
              <CardDescription>{t('features.secure.desc')}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-purple-600 mb-3" />
              <CardTitle className="text-lg">{t('features.fast.title')}</CardTitle>
              <CardDescription>{t('features.fast.desc')}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">{t('howItWorks.title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {howItWorksSteps.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="text-base md:text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">{t('pricing.title')}</h2>
        <p className="text-center text-gray-600 mb-10">{t('pricing.subtitle')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {pricingTiers.map((tier, i) => (
            <Card key={i} className={tier.highlighted ? 'border-blue-600 border-2 shadow-xl' : ''}>
              <CardHeader className="pb-3">
                {tier.highlighted && (
                  <Badge className="mb-2 w-fit">{t('pricing.mostPopular')}</Badge>
                )}
                <CardTitle className="text-base">{tier.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{tier.price}</span>
                  <span className="text-gray-600 text-sm">{tier.period}</span>
                </div>
                <CardDescription className="mt-1 text-xs">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <ul className="space-y-1.5">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="w-full" size="sm" variant={tier.highlighted ? 'default' : 'outline'}>
                      {tier.cta}
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/pricing" className="w-full">
                    <Button className="w-full" size="sm" variant={tier.highlighted ? 'default' : 'outline'}>
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
      <section className="bg-yellow-50 border-t border-yellow-200 py-10">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-10 w-10 text-yellow-600 mx-auto mb-3" />
          <h3 className="text-xl md:text-2xl font-bold mb-3">{t('legal.title')}</h3>
          <p className="text-gray-700 max-w-3xl mx-auto text-sm md:text-base">
            {t('legal.text')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <FileText className="h-5 w-5" />
            <span className="text-lg font-bold">Medyra</span>
          </div>
          <p className="text-gray-400 mb-4 text-sm">{t('footer.tagline')}</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white">{t('footer.privacy')}</Link>
            <Link href="/terms" className="hover:text-white">{t('footer.terms')}</Link>
            <Link href="/contact" className="hover:text-white">{t('footer.contact')}</Link>
          </div>
          <p className="text-gray-500 text-xs mt-5">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
