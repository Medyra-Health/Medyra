import { notFound } from 'next/navigation'
import { COMMERCE_ENABLED } from '@/lib/commerce'

export const metadata = { robots: { index: false, follow: false } }

export default function PricingLayout({ children }) {
  if (!COMMERCE_ENABLED) notFound()
  return children
}
