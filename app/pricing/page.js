'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { FileText, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

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
    tier: 'free',
    disabled: true
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
    tier: 'onetime',
    highlighted: false
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
    tier: 'personal',
    highlighted: true
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
    tier: 'family',
    highlighted: false
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
    tier: 'clinic',
    highlighted: false
  }
]

export default function PricingPage() {
  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(null)

  async function handleSubscribe(tier) {
    if (tier === 'free') return

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
      toast.error('Failed to start checkout')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Medyra</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">Start with free, upgrade anytime</p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.tier}
              className={tier.highlighted ? 'border-blue-600 border-2 shadow-xl scale-105' : ''}
            >
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
                {tier.disabled ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={tier.highlighted ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(tier.tier)}
                    disabled={loading === tier.tier}
                  >
                    {loading === tier.tier ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      tier.tier === 'clinic' ? 'Contact Sales' : 'Subscribe'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Is my health data secure?</h3>
              <p className="text-gray-600">
                Yes. All data is encrypted in transit and at rest. We are GDPR compliant and automatically delete reports after 30 days.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Absolutely. You can cancel your subscription at any time with no penalties.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Is this medical advice?</h3>
              <p className="text-gray-600">
                No. Medyra is an educational tool that helps you understand medical terminology. Always consult your doctor for medical advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
