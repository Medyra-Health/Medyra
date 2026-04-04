import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'

export const metadata = {
  title: 'Health & Lab Results Blog — Medyra',
  description:
    'Practical guides to understanding your medical reports, lab values, and blood test results. Written for patients, not doctors. Available in plain language.',
  alternates: { canonical: 'https://medyra.de/blog' },
  openGraph: {
    title: 'Health & Lab Results Blog — Medyra',
    description: 'Plain language guides to understanding your lab results and medical reports.',
    url: 'https://medyra.de/blog',
  },
}

const POSTS = [
  {
    slug: 'how-medyra-protects-your-medical-data',
    title: 'How Medyra Protects Your Medical Data',
    description:
      'A technical deep-dive into the AES-256-GCM field-level encryption that protects every report on Medyra. We explain what is encrypted, why a database breach reveals nothing readable, and how GDPR Art. 32 and BDSG §64 requirements are met.',
    date: '4 April 2026',
    readTime: '8 min read',
    tags: ['Security', 'GDPR', 'Encryption'],
  },
  {
    slug: 'how-to-read-lab-results-germany-expat',
    title: 'How to Read Your Lab Results in Germany as an Expat',
    description:
      'A practical guide for international residents navigating German medical reports — from decoding abbreviations to knowing when a value is actually a problem.',
    date: '2 April 2026',
    readTime: '7 min read',
    tags: ['Germany', 'Expat', 'Lab Results'],
  },
  {
    slug: 'what-is-tsh-and-why-does-it-matter',
    title: 'What Is TSH and Why Does It Matter?',
    description:
      'TSH is one of the most commonly tested hormones — and one of the most misunderstood. Here is what your thyroid result actually means.',
    date: '2 April 2026',
    readTime: '6 min read',
    tags: ['Thyroid', 'TSH', 'Hormones'],
  },
  {
    slug: 'understanding-your-blood-test-results',
    title: 'Understanding Your Blood Test Results: A Complete Plain-Language Guide',
    description:
      'CBC, CRP, HbA1c, cholesterol — this guide explains the most common blood test values in plain language so you can walk into your next appointment informed.',
    date: '2 April 2026',
    readTime: '9 min read',
    tags: ['Blood Test', 'CBC', 'Cholesterol'],
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">← Back to Medyra</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-14 max-w-2xl">
        <div className="mb-10">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">Medyra Blog</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Health & Lab Results</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Plain language guides for understanding your medical reports. No jargon — just clear explanations written for patients.
          </p>
        </div>

        <div className="space-y-8">
          {POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <article className="border border-gray-200 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-sm transition-all duration-200">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                  ))}
                </div>
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-2 leading-snug">{post.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{post.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="mt-14 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
          <p className="text-sm font-semibold text-emerald-800 mb-1">Want instant explanations for your own results?</p>
          <p className="text-xs text-emerald-700 leading-relaxed mb-3">
            Upload your medical report and Medyra will explain every value in plain language — in under 60 seconds, in your language, GDPR compliant.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Analyse my report — it&apos;s free →
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 mt-8">
        © 2026 Medyra · <Link href="/privacy" className="hover:text-gray-600">Privacy</Link> · <Link href="/terms" className="hover:text-gray-600">Terms</Link>
      </footer>
    </div>
  )
}
