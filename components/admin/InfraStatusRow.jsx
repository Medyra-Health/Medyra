'use client'

import { motion } from 'framer-motion'
import { Database, CreditCard, ShieldCheck, Triangle, Search, Server, Smartphone } from 'lucide-react'

const DOT = {
  ok: 'bg-emerald-500',
  error: 'bg-red-500',
  not_configured: 'bg-gray-300',
}

const LABEL = {
  ok: 'Operational',
  error: 'Error',
  not_configured: 'Not configured',
}

function resolveState(entry) {
  if (!entry) return 'not_configured'
  if (!entry.configured) return 'not_configured'
  return entry.status === 'ok' ? 'ok' : 'error'
}

function Tile({ icon: Icon, title, detail, state, index, href }) {
  const content = (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="p-1.5 rounded-lg bg-gray-50">
          <Icon className="h-4 w-4 text-gray-500" />
        </div>
        <span className={`h-2 w-2 rounded-full ${DOT[state]}`} title={LABEL[state]} />
      </div>
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5 truncate">{detail}</p>
    </>
  )
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm"
    >
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          {content}
        </a>
      ) : content}
    </motion.div>
  )
}

export default function InfraStatusRow({ infra, mobile, loading }) {
  if (loading && !infra) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3.5 h-[84px] animate-pulse" />
        ))}
      </div>
    )
  }

  const mongoState = resolveState(infra?.mongo)
  const stripeState = resolveState(infra?.stripe)
  const clerkState = resolveState(infra?.clerk)
  const vercelState = resolveState(infra?.vercel)
  const gscState = resolveState(infra?.searchConsole)
  const atlasState = resolveState(infra?.atlas)
  const mobileState = mobile ? 'ok' : (mobile === null ? 'error' : 'not_configured')

  const tiles = [
    {
      icon: Database, title: 'MongoDB', state: mongoState,
      detail: mongoState === 'ok' ? `${infra.mongo.pingMs}ms · ${infra.mongo.collectionCount} collections`
        : mongoState === 'error' ? infra.mongo.error : 'MONGO_URL not set',
    },
    {
      icon: CreditCard, title: 'Stripe', state: stripeState,
      detail: stripeState === 'ok' ? `${infra.stripe.chargesLast30d} charges · €${infra.stripe.volumeLast30d} / 30d`
        : stripeState === 'error' ? infra.stripe.error : 'STRIPE_SECRET_KEY not set',
      href: 'https://dashboard.stripe.com',
    },
    {
      icon: ShieldCheck, title: 'Clerk', state: clerkState,
      detail: clerkState === 'ok' ? `${infra.clerk.totalUsers.toLocaleString()} total users`
        : clerkState === 'error' ? infra.clerk.error : 'CLERK_SECRET_KEY not set',
      href: 'https://dashboard.clerk.com',
    },
    {
      icon: Triangle, title: 'Vercel', state: vercelState,
      detail: vercelState === 'ok' ? `${infra.vercel.latestDeployment?.state || 'unknown'} · ${infra.vercel.latestDeployment?.target || ''}`
        : vercelState === 'error' ? infra.vercel.error : 'VERCEL_API_TOKEN not set',
      href: 'https://vercel.com/dashboard',
    },
    {
      icon: Search, title: 'Search Console', state: gscState,
      detail: gscState === 'ok' ? `${infra.searchConsole.last28d.clicks} clicks / 28d`
        : gscState === 'error' ? infra.searchConsole.error : 'SEARCH_CONSOLE_SITE_URL not set',
      href: 'https://search.google.com/search-console',
    },
    {
      icon: Server, title: 'Atlas Cluster', state: atlasState,
      detail: atlasState === 'ok' ? `${infra.atlas.clusterState} · ${infra.atlas.tier || ''}`
        : atlasState === 'error' ? infra.atlas.error : 'Atlas API key not set',
      href: 'https://cloud.mongodb.com',
    },
    {
      icon: Smartphone, title: 'Mobile App', state: mobileState,
      detail: mobileState === 'ok' ? `${mobile.opensToday} opens today · ${mobile.errorCount7d} errors/7d`
        : 'No tracking data yet',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {tiles.map((t, i) => <Tile key={t.title} index={i} {...t} />)}
    </div>
  )
}
