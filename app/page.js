'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { FileText, Brain, Shield, Clock, Users, MessageSquare, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const pricingTiers = [
  {
    name: 'Free',
    price: '€0',
    period: '/mo',
    description: 'Perfect for trying out',
    features: [
      '1 report per month',
      'Plain-language explanation',
      'Normal range highlights',
      'Basic support'
    ],
    cta: 'Get Started',
    highlighted: false,
    tier: 'free'
  },
  {
    name: 'One-Time',
    price: '€4.99',
    period: '/report',
    description: 'Pay as you go',
    features: [
      'Full explanation',
      'Follow-up questions',
      'PDF export',
      'Priority support'
    ],
    cta: 'Buy Now',
    highlighted: false,
    tier: 'onetime'
  },
  {
    name: 'Personal',
    price: '€9',
    period: '/mo',
    description: 'Most popular choice',
    features: [
      'Unlimited reports',
      'Report history',
      'Follow-up chat',
      'PDF export',
      'Email support'
    ],
    cta: 'Subscribe',
    highlighted: true,
    tier: 'personal'
  },
  {
    name: 'Family',
    price: '€19',
    period: '/mo',
    description: 'For the whole family',
    features: [
      'Up to 5 members',
      'Shared history',
      'Parent/elder care mode',
      'All Personal features',
      'Family dashboard'
    ],
    cta: 'Subscribe',
    highlighted: false,
    tier: 'family'
  },
  {
    name: 'Clinic',
    price: '€199',
    period: '/mo',
    description: 'White-label for clinics',
    features: [
      'Unlimited patients',
      'EHR integration',
      'Custom branding',
      'Dedicated support',
      'API access'
    ],
    cta: 'Contact Sales',
    highlighted: false,
    tier: 'clinic'
  }
]

export default function LandingPage() {
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
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button>Get Started</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4" variant="secondary">Trusted by 10,000+ users</Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Understand Your <span className="text-blue-600">Medical Reports</span>
          <br />in Plain Language
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Upload your lab results and get AI-powered explanations that actually make sense.
          No medical degree required.
        </p>
        <div className="flex justify-center space-x-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" className="text-lg px-8">
                Try Free Report <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/upload">
              <Button size="lg" className="text-lg px-8">
                Upload Report <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </SignedIn>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          ⚠️ This is educational information, not medical advice. Always consult your doctor.
        </p>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Brain className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>AI-Powered Explanations</CardTitle>
              <CardDescription>
                Advanced AI breaks down complex medical terminology into simple language
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>GDPR Compliant</CardTitle>
              <CardDescription>
                Your data is encrypted and automatically deleted after 30 days
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Clock className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Instant Results</CardTitle>
              <CardDescription>
                Get your report explained in under 60 seconds
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Upload', desc: 'Upload your PDF, image, or text report' },
              { step: '2', title: 'Extract', desc: 'OCR extracts text from your document' },
              { step: '3', title: 'Explain', desc: 'AI analyzes and explains in plain language' },
              { step: '4', title: 'Ask', desc: 'Follow up with questions about your results' }
            ].map((item, i) => (
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
        <h2 className="text-4xl font-bold text-center mb-4">Choose Your Plan</h2>
        <p className="text-center text-gray-600 mb-12">Start with free, upgrade anytime</p>
        <div className="grid md:grid-cols-5 gap-6">
          {pricingTiers.map((tier, i) => (
            <Card key={i} className={tier.highlighted ? 'border-blue-600 border-2 shadow-xl' : ''}>
              <CardHeader>
                {tier.highlighted && (
                  <Badge className="mb-2 w-fit">Most Popular</Badge>
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
          <h3 className="text-2xl font-bold mb-4">Important Legal Notice</h3>
          <p className="text-gray-700 max-w-3xl mx-auto">
            <strong>This is an educational and information tool, not medical software.</strong>
            {' '}Medyra explains what medical terms mean but does not provide medical advice, diagnosis, or treatment recommendations.
            {' '}<strong>Always consult your licensed physician</strong> before making any health decisions.
            {' '}Your data is handled in compliance with GDPR and automatically deleted after 30 days.
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
          <p className="text-gray-400 mb-4">Understanding your health, one report at a time</p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
          <p className="text-gray-500 text-xs mt-6">© 2025 Medyra. Made with ❤️ in Germany.</p>
        </div>
      </footer>
    </div>
  )
}
