import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'

export const metadata = {
  title: 'Health Vault & Profiles: Track Your Family\'s Health Over Time — Medyra',
  description:
    'Medyra\'s Health Vault lets you create profiles for yourself and your family, track biomarkers like hemoglobin, cholesterol, and vitamin D over time, and walk into every doctor appointment with a complete longitudinal history.',
  alternates: { canonical: 'https://medyra.de/blog/health-vault-profiles-guide' },
  openGraph: {
    title: 'Health Vault & Profiles: Track Your Family\'s Health Over Time — Medyra',
    description:
      'Create health profiles for every family member, track lab values over months and years, and let AI detect trends automatically.',
    url: 'https://medyra.de/blog/health-vault-profiles-guide',
  },
  keywords: [
    'health vault',
    'family health profiles',
    'track lab results over time',
    'biomarker tracking',
    'longitudinal health data',
    'hemoglobin trend',
    'cholesterol history',
    'Medyra Health Vault',
    'health tracking Germany',
  ],
}

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">← All articles</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {['Health Vault', 'Profiles', 'Biomarkers', 'Family Health'].map((tag) => (
              <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Health Vault &amp; Profiles: Track Your Family&apos;s Health Over Time
          </h1>
          <p className="text-gray-500 text-sm">16 April 2026 · 8 min read · By Medyra</p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">

          <p className="text-lg text-gray-600 leading-relaxed">
            A single lab result tells you very little. A hemoglobin of 12.8 g/dL is either perfectly normal or
            a significant drop — depending entirely on what it was six months ago. Medicine is longitudinal.
            Health is a story over time. Medyra&apos;s Health Vault is built on this idea.
          </p>

          <p>
            With the Personal and Family plans, you can now create health profiles for every member of your
            household, track key biomarkers across months and years, and walk into every appointment with a
            complete, structured history — automatically included in any doctor summary you generate.
          </p>

          {/* What is it */}
          <h2 className="text-xl font-bold text-gray-900 mt-8">What is the Health Vault?</h2>

          <p>
            The Health Vault is a private, encrypted store of longitudinal health data for you and your family.
            Each time you upload a lab report, Medyra reads the values and stores them against your profile.
            Over time, it builds a timeline — a visual chart showing how each biomarker has moved, with
            reference lines marking the normal range.
          </p>

          <p>
            The eight biomarkers Medyra currently tracks automatically are:
          </p>

          <div className="grid grid-cols-2 gap-3 not-prose my-4">
            {[
              { label: 'Hemoglobin', unit: 'g/dL', range: '12–17.5', color: 'bg-red-500' },
              { label: 'Ferritin', unit: 'µg/L', range: '15–150', color: 'bg-orange-500' },
              { label: 'TSH', unit: 'mIU/L', range: '0.4–4.0', color: 'bg-violet-500' },
              { label: 'HbA1c', unit: '%', range: '0–5.6', color: 'bg-blue-500' },
              { label: 'Cholesterol', unit: 'mg/dL', range: '0–200', color: 'bg-teal-500' },
              { label: 'Vitamin D', unit: 'nmol/L', range: '50–200', color: 'bg-yellow-500' },
              { label: 'CRP', unit: 'mg/L', range: '0–5', color: 'bg-pink-500' },
              { label: 'eGFR', unit: 'mL/min', range: '60–120', color: 'bg-emerald-500' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${b.color}`} />
                <div>
                  <p className="font-semibold text-sm text-gray-900">{b.label}</p>
                  <p className="text-xs text-gray-400">{b.unit} · Normal: {b.range}</p>
                </div>
              </div>
            ))}
          </div>

          <p>
            Medyra reads these values directly from uploaded reports. You can also add values manually if
            you have a printed result and want to include it.
          </p>

          {/* Profiles */}
          <h2 className="text-xl font-bold text-gray-900 mt-8">What are Health Profiles?</h2>

          <p>
            A Health Profile is a named record for one person. Each profile has its own timeline, its own
            biomarker history, and its own colour code so you can tell them apart at a glance. You can
            set the relationship — Myself, Partner, Child, Parent — which helps Medyra contextualise the data.
          </p>

          <p>
            Here is how profiles work by plan:
          </p>

          <div className="space-y-3 not-prose my-4">
            {[
              { plan: 'Free / One-Time', profiles: '0 profiles', note: 'Stateless — reports are analysed but nothing is stored long-term', color: 'bg-gray-100 text-gray-700' },
              { plan: 'Personal', profiles: '2 profiles', note: 'You + one family member. Perfect for a couple.', color: 'bg-emerald-50 text-emerald-800' },
              { plan: 'Family', profiles: '5 profiles', note: 'The whole household — partner, children, elderly parent.', color: 'bg-violet-50 text-violet-800' },
              { plan: 'Clinic', profiles: 'Unlimited', note: 'For medical practices managing patient data at scale.', color: 'bg-blue-50 text-blue-800' },
            ].map(row => (
              <div key={row.plan} className={`flex items-center justify-between px-4 py-3 rounded-xl ${row.color}`}>
                <div>
                  <p className="font-bold text-sm">{row.plan}</p>
                  <p className="text-xs opacity-75 mt-0.5">{row.note}</p>
                </div>
                <span className="font-black text-sm">{row.profiles}</span>
              </div>
            ))}
          </div>

          {/* How to use */}
          <h2 className="text-xl font-bold text-gray-900 mt-8">How to use it, step by step</h2>

          <div className="space-y-5 not-prose">

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-base flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Create your profiles</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Go to <strong>Dashboard → Health Profiles</strong> or visit <strong>medyra.de/profiles</strong>.
                  Click <em>New Profile</em>, enter the name, date of birth, relationship, and choose a colour.
                  Takes about 30 seconds per person.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-base flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Upload lab reports as usual</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Upload a PDF lab report from <strong>medyra.de/upload</strong>. After Medyra analyses it,
                  you can assign it to a profile. The biomarker values are automatically extracted and added
                  to that profile&apos;s timeline.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-base flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Watch the timeline build</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  On the dashboard, switch between profiles using the profile switcher at the top right.
                  Click through the biomarker tabs (Hemoglobin, TSH, Cholesterol, etc.) to see your values
                  plotted over time. A green alert appears if the latest value is outside the normal range.
                  A percentage badge shows how much the value has changed since your first reading.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-base flex items-center justify-center flex-shrink-0">4</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Use profile context in Doctor Visit</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  When you generate a doctor prep summary, select which profile it is for. Medyra
                  automatically pulls the relevant lab history into the summary — populating the
                  <em> Relevante Vorgeschichte</em> section with your actual tracked values, flagging any
                  that are abnormal, and noting significant trends. Your doctor gets a richer picture
                  without you having to remember or type any of it.
                </p>
              </div>
            </div>

          </div>

          {/* Why it matters */}
          <h2 className="text-xl font-bold text-gray-900 mt-8">Why longitudinal data changes everything</h2>

          <p>
            Most people interact with their health data exactly once — when they receive a result and panic,
            or receive a result and ignore it. Neither response is particularly useful. Context is what turns
            a number into information.
          </p>

          <p>
            Consider a ferritin of 18 µg/L. It is technically within the normal range (15–150). But if your
            ferritin was 85 µg/L last year, a drop to 18 is a significant trend worth discussing. Your GP
            may not notice this unless they have access to the previous value — and in Germany, where patients
            often switch between practices or see multiple specialists, that continuity is frequently lost.
          </p>

          <p>
            With the Health Vault, Medyra surfaces this automatically. If your ferritin has dropped more than
            10% since your first recorded reading, you will see a warning in the insight box below the chart:
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 not-prose text-sm text-amber-800 my-4">
            <p className="font-semibold mb-1">⚠ Trend alert</p>
            <p>Ferritin has changed by 78.8% since your first recorded value. Consider discussing this trend with your doctor.</p>
          </div>

          <p>
            That kind of contextual alert does not happen when you read a PDF in isolation. It requires memory.
            The Health Vault gives Medyra — and you — that memory.
          </p>

          {/* Family */}
          <h2 className="text-xl font-bold text-gray-900 mt-8">Managing health for a whole family</h2>

          <p>
            The Family plan supports up to five profiles. In practice this is designed for households where
            one person — usually a parent or caregiver — manages the medical administration for everyone.
          </p>

          <p>
            Common uses:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <strong>Parent tracking a child&apos;s iron levels</strong> — common in families with children
              on restrictive diets or with diagnosed anaemia
            </li>
            <li>
              <strong>Adult child managing an elderly parent&apos;s health</strong> — uploading their lab reports
              and generating structured German summaries before GP appointments
            </li>
            <li>
              <strong>Couples tracking chronic conditions together</strong> — one partner with diabetes,
              one with a thyroid condition; each has their own profile
            </li>
            <li>
              <strong>Anyone who attends appointments with a family member</strong> — having the history
              at your fingertips means you can answer questions on their behalf accurately
            </li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Privacy and data security</h2>

          <p>
            Health data in the Vault is encrypted at rest using AES-256-GCM field-level encryption. This means
            that even if our database were compromised, the data would be unreadable without the encryption keys.
            We do not sell, share, or use your health data for advertising. It is yours.
          </p>

          <p>
            You can delete a profile at any time. Deletion removes all associated biomarker history permanently.
            Read more in our{' '}
            <Link href="/blog/how-medyra-protects-your-medical-data" className="text-emerald-600 hover:underline">
              data security guide
            </Link>.
          </p>

          {/* CTA */}
          <div className="bg-gray-900 rounded-2xl p-7 text-center not-prose mt-10 space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-white font-bold text-xl">Start building your Health Vault</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Personal plan — 2 profiles · 5 doctor summaries/month · Unlimited reports · From €9/month
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/pricing"
                className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                See plans →
              </Link>
              <Link
                href="/profiles"
                className="inline-block border border-white/20 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Manage profiles
              </Link>
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 mt-8">
        © 2026 Medyra ·{' '}
        <Link href="/privacy" className="hover:text-gray-600">Privacy</Link> ·{' '}
        <Link href="/terms" className="hover:text-gray-600">Terms</Link>
      </footer>
    </div>
  )
}
