import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export const metadata = {
  title: 'Everything New at Medyra: Value Checker, 17 Languages, Share Links & More | Medyra',
  description:
    'Our biggest update yet: a free instant lab value checker, explanations for doctor letters, hospital reports, medication plans and insurance letters, AI answers in 17 languages, secure share links, recheck reminders and a referral program.',
  alternates: { canonical: 'https://medyra.de/blog/medyra-summer-2026-update' },
  openGraph: {
    title: 'Everything New at Medyra: Value Checker, 17 Languages, Share Links & More',
    description: 'The July 2026 feature wave, explained in two minutes.',
    url: 'https://medyra.de/blog/medyra-summer-2026-update',
  },
  keywords: [
    'Medyra update', 'lab value checker free', 'Arztbrief verstehen', 'medical report explained',
    'health app Germany', 'Medikationsplan erklärt', 'share medical report securely',
  ],
}

const FEATURES = [
  {
    emoji: '🧪',
    title: 'Free instant value checker',
    body: 'Type any lab value, TSH, ferritin, HbA1c, and see immediately how it compares to the reference range. No signup, nothing stored, everything runs in your browser.',
    link: '/check', linkLabel: 'Try the checker',
  },
  {
    emoji: '📋',
    title: 'Medyra now explains every document',
    body: 'Not just lab reports anymore. Upload doctor letters, hospital discharge reports, radiology findings, medication plans and health insurance letters. Tell Medyra what you are uploading and the explanation adapts.',
    link: '/arztbrief', linkLabel: 'See how it works',
  },
  {
    emoji: '🌍',
    title: 'Explanations written in your language',
    body: 'This is the big one. The AI explanation itself now arrives in the language you choose, all 17 of them. Upload a German Befund and read the explanation in Turkish, Arabic, English or Ukrainian. The follow up chat answers in your language too.',
    link: '/sprachen', linkLabel: 'All 17 languages',
  },
  {
    emoji: '🔗',
    title: 'Secure share links',
    body: 'Share an explained report with family, a caregiver or your doctor. The link shows only the explanation, never your file or chat, expires after 7 days, and you can revoke it anytime.',
    link: null, linkLabel: null,
  },
  {
    emoji: '🔔',
    title: 'Recheck reminders',
    body: 'Your report says "kontrollieren in 3 Monaten"? One click and Medyra emails you when it is time, so you can upload the new results and compare.',
    link: null, linkLabel: null,
  },
  {
    emoji: '🎁',
    title: 'Invite a friend, both get more',
    body: 'Share your personal invite link from the dashboard. You and your friend each get one extra free report per month.',
    link: null, linkLabel: null,
  },
]

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white">
      <AppHeader back={{ href: '/blog', label: 'All articles' }} title="Blog" tone="amber" />

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {['Product update', 'New features', 'July 2026'].map((tag) => (
              <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Everything New at Medyra: Value Checker, 17 Languages, Share Links &amp; More
          </h1>
          <p className="text-gray-500 text-sm">12 July 2026 · 4 min read · By Medyra</p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">
          <p className="text-lg text-gray-600 leading-relaxed">
            This is our biggest update since launch. Medyra started as a tool that explains lab results in
            plain language. As of this month, it explains almost every document your doctor, hospital or
            Krankenkasse sends you, and it does so in your language. Here is everything that shipped.
          </p>

          {FEATURES.map(f => (
            <div key={f.title} className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 not-prose">
              <p className="text-2xl mb-2">{f.emoji}</p>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{f.body}</p>
              {f.link && (
                <Link href={f.link} className="inline-block mt-3 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                  {f.linkLabel} →
                </Link>
              )}
            </div>
          ))}

          <h2 className="text-xl font-bold text-gray-900">Nothing changed about your privacy</h2>
          <p>
            Every new feature follows the same rules as before: everything is encrypted before it is stored,
            reports are deleted automatically after 30 days unless you choose to keep them for trend tracking,
            and your data is never used to train AI models. Share links show only the explanation, never the
            original document.
          </p>

          <h2 className="text-xl font-bold text-gray-900">Try it now</h2>
          <p>
            The fastest way to see the update: open the{' '}
            <Link href="/check" className="text-emerald-600 font-semibold hover:text-emerald-700">free value checker</Link>{' '}
            and type in a value from your last blood test. Then switch the site language and watch everything follow.
          </p>

          <p className="text-sm text-gray-500 border-t border-gray-100 pt-4">
            Medyra is an educational tool and does not replace medical advice. Always discuss your results
            with your doctor.
          </p>
        </div>
      </main>
    </div>
  )
}
