import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export const metadata = {
  title: 'Medyra × Potsdam Transfer: Backed by the University of Potsdam Startup Service | Medyra',
  description:
    'Medyra is supported by Potsdam Transfer, the central startup service of the University of Potsdam. What that means for the product, and why university backing matters for a health platform.',
  alternates: { canonical: 'https://medyra.de/blog/medyra-potsdam-transfer' },
  openGraph: {
    title: 'Medyra × Potsdam Transfer: Backed by the University of Potsdam Startup Service',
    description: 'Why university backing matters for a health platform.',
    url: 'https://medyra.de/blog/medyra-potsdam-transfer',
  },
}

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white">
      <AppHeader back={{ href: '/blog', label: 'All articles' }} title="Blog" tone="amber" />

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {['Announcement', 'Partnership', 'Potsdam'].map((tag) => (
              <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Medyra × Potsdam Transfer: Backed by the University of Potsdam Startup Service
          </h1>
          <p className="text-gray-500 text-sm">12 July 2026 · 2 min read · By Medyra</p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">
          <p className="text-lg text-gray-600 leading-relaxed">
            We are proud to share that Medyra is supported by{' '}
            <a href="https://www.potsdam-transfer.de" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold hover:text-emerald-700">
              Potsdam Transfer
            </a>
            , the central institution for startups, innovation and knowledge transfer at the University of
            Potsdam.
          </p>

          <h2 className="text-xl font-bold text-gray-900">Why this matters</h2>
          <p>
            Health platforms live and die by trust. Being built within a university startup ecosystem means
            Medyra grows with guidance, scrutiny and standards around it, not in a vacuum. Potsdam Transfer
            supports young companies from the University of Potsdam on their way from idea to real product,
            with coaching, infrastructure and a network that takes both innovation and responsibility
            seriously.
          </p>

          <h2 className="text-xl font-bold text-gray-900">What stays the same</h2>
          <p>
            Everything you rely on: Medyra remains independent, GDPR compliant and privacy first. Your
            documents are encrypted before storage, deleted on your schedule, and never used to train AI
            models. The support helps us build better and faster, the principles do not move.
          </p>

          <h2 className="text-xl font-bold text-gray-900">What comes next</h2>
          <p>
            We just shipped our{' '}
            <Link href="/blog/medyra-summer-2026-update" className="text-emerald-600 font-semibold hover:text-emerald-700">
              biggest feature update yet
            </Link>
            , and the roadmap is full: better trend tracking, deeper document understanding, and more of the
            17 languages woven through every corner of the product. Being anchored in Potsdam&apos;s research
            and startup community makes that pace possible.
          </p>

          <p>
            To the team at Potsdam Transfer: thank you for the support. To everyone using Medyra: this
            backing exists so we can serve you better.
          </p>
        </div>
      </main>
    </div>
  )
}
