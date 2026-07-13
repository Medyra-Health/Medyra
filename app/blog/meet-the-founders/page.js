import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export const metadata = {
  title: 'Meet the Founders: Why We Built Medyra | Medyra',
  description:
    'Medyra was founded by Mohammad Abralur Rahman Akash and Dr. med. Philipp Mattar in Potsdam. The story behind the mission: nobody should leave a doctor visit more confused than they arrived.',
  alternates: { canonical: 'https://medyra.de/blog/meet-the-founders' },
  openGraph: {
    title: 'Meet the Founders: Why We Built Medyra',
    description: 'The team and the mission behind Medyra.',
    url: 'https://medyra.de/blog/meet-the-founders',
  },
}

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white">
      <AppHeader back={{ href: '/blog', label: 'All articles' }} title="Blog" tone="amber" />

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {['Team', 'Founders', 'Mission'].map((tag) => (
              <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Meet the Founders: Why We Built Medyra
          </h1>
          <p className="text-gray-500 text-sm">12 July 2026 · 3 min read · By Medyra</p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">
          <p className="text-lg text-gray-600 leading-relaxed">
            Medyra exists because of one simple, frustrating observation: medical documents are written for
            professionals, but handed to patients. A lab report, an Arztbrief, a Krankenkasse letter, they all
            land in your hands, and for most people they might as well be in another language. Often, they
            literally are.
          </p>

          <h2 className="text-xl font-bold text-gray-900">The team</h2>
          <p>
            Medyra was founded in Potsdam by <strong>Mohammad Abralur Rahman Akash</strong> and{' '}
            <strong>Dr. med. Philipp Mattar</strong>, a builder and a physician.
          </p>
          <p>
            Akash is a software engineer with a Master's in Digital Health from the University of Potsdam
            and Hasso Plattner Institute. Before Medyra, he built data systems and dashboards for Berlin's
            State Office for Health and Social Affairs (LAGeSo) and worked as a software engineer at HPI.
            Medyra is the first product he's designed, built, and shipped end to end, from architecture and
            data modeling to billing, auth, and day to day operations.
          </p>
          <p>
            Philipp is a board certified Internist who has spent over five years in clinical practice at
            Berlin hospitals. That time at the bedside is exactly where the idea for Medyra came from,
            watching patients leave appointments holding documents they couldn't make sense of. He brings a
            deep fascination with Digital Health, AI, and healthcare transformation to the team.
          </p>
          <p>
            That combination is deliberate. Everything Medyra explains has to be two things at once:
            genuinely understandable for a person with no medical background, and medically careful enough
            that a doctor would nod along. The engineering side makes the first part possible. The medical
            side keeps the second part honest, from the wording of our explanations to the strict rule that
            Medyra never diagnoses and always points you back to your doctor.
          </p>

          <h2 className="text-xl font-bold text-gray-900">What we believe</h2>
          <p>
            Understanding your own health data is not a premium feature. It is a precondition for being an
            active participant in your own care. Studies consistently show that patients who understand their
            results ask better questions, follow therapy more reliably and feel less anxious. That is the gap
            Medyra closes, in 17 languages, because millions of people in Germany receive medical documents
            in a language that is not their mother tongue.
          </p>

          <h2 className="text-xl font-bold text-gray-900">How we work</h2>
          <p>
            We build in Potsdam, supported by{' '}
            <Link href="/blog/medyra-potsdam-transfer" className="text-emerald-600 font-semibold hover:text-emerald-700">
              Potsdam Transfer
            </Link>
            , the startup service of the University of Potsdam. Privacy is a founding principle, not an
            afterthought: your data is encrypted before it is stored, deleted on your schedule, and never used
            to train AI models.
          </p>

          <p>
            Questions, feedback, or just want to say hi? Write to us at{' '}
            <a href="mailto:hello@medyra.de" className="text-emerald-600 font-semibold hover:text-emerald-700">hello@medyra.de</a>
            , we read everything.
          </p>
        </div>
      </main>
    </div>
  )
}
