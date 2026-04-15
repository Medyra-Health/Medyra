import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'

export const metadata = {
  title: 'Medyra Lexikon: How to Look Up Any Lab Value in Plain German — Complete Guide',
  description:
    'A step-by-step guide to using the Medyra Medical Lexikon — 46 German lab value pages that explain what each value means, what causes abnormal results, and what to ask your doctor.',
  alternates: { canonical: 'https://medyra.de/blog/medizinisches-lexikon-guide' },
  openGraph: {
    title: 'Medyra Lexikon: How to Look Up Any Lab Value in Plain German',
    description:
      'CRP too high? HbA1c elevated? Learn how to use the Medyra Lexikon to understand any lab result in seconds — with doctor questions included.',
    url: 'https://medyra.de/blog/medizinisches-lexikon-guide',
  },
  keywords: [
    'Medyra Lexikon',
    'Laborwerte verstehen',
    'lab values explained German',
    'CRP erhöht bedeutung',
    'HbA1c was bedeutet',
    'Blutwerte nachschlagen',
    'medizinisches Wörterbuch',
    'Laborwerte Normalwerte',
  ],
}

// The 46 lexikon entries grouped by category — for the reference table
const LEXIKON_TERMS = [
  { cat: 'Blutbild', color: 'red', terms: [
    { slug: 'leukozyten', label: 'Leukozyten' },
    { slug: 'erythrozyten', label: 'Erythrozyten' },
    { slug: 'haemoglobin', label: 'Hämoglobin' },
    { slug: 'haematokrit', label: 'Hämatokrit' },
    { slug: 'thrombozyten', label: 'Thrombozyten' },
    { slug: 'mcv', label: 'MCV' },
    { slug: 'mch', label: 'MCH' },
    { slug: 'mchc', label: 'MCHC' },
  ]},
  { cat: 'Leber', color: 'amber', terms: [
    { slug: 'gpt-alt', label: 'GPT / ALT' },
    { slug: 'got-ast', label: 'GOT / AST' },
    { slug: 'ggt', label: 'GGT' },
    { slug: 'bilirubin', label: 'Bilirubin' },
    { slug: 'alkalische-phosphatase', label: 'Alk. Phosphatase' },
  ]},
  { cat: 'Niere', color: 'blue', terms: [
    { slug: 'kreatinin', label: 'Kreatinin' },
    { slug: 'harnstoff', label: 'Harnstoff' },
    { slug: 'gfr', label: 'GFR / eGFR' },
    { slug: 'harnsaeure', label: 'Harnsäure' },
  ]},
  { cat: 'Entzündung', color: 'orange', terms: [
    { slug: 'crp', label: 'CRP' },
    { slug: 'bsg', label: 'BSG' },
    { slug: 'procalcitonin', label: 'Procalcitonin' },
  ]},
  { cat: 'Stoffwechsel', color: 'violet', terms: [
    { slug: 'hba1c', label: 'HbA1c' },
    { slug: 'blutzucker', label: 'Blutzucker' },
    { slug: 'cholesterin', label: 'Cholesterin' },
    { slug: 'hdl', label: 'HDL' },
    { slug: 'ldl', label: 'LDL' },
    { slug: 'triglyzeride', label: 'Triglyzeride' },
  ]},
  { cat: 'Schilddrüse', color: 'teal', terms: [
    { slug: 'tsh', label: 'TSH' },
    { slug: 'ft3', label: 'fT3' },
    { slug: 'ft4', label: 'fT4' },
  ]},
  { cat: 'Elektrolyte', color: 'sky', terms: [
    { slug: 'natrium', label: 'Natrium' },
    { slug: 'kalium', label: 'Kalium' },
    { slug: 'calcium', label: 'Calcium' },
    { slug: 'magnesium', label: 'Magnesium' },
    { slug: 'chlorid', label: 'Chlorid' },
  ]},
  { cat: 'Eisen', color: 'rose', terms: [
    { slug: 'ferritin', label: 'Ferritin' },
    { slug: 'transferrin', label: 'Transferrin' },
    { slug: 'eisen', label: 'Eisen' },
  ]},
  { cat: 'Vitamine', color: 'yellow', terms: [
    { slug: 'vitamin-d', label: 'Vitamin D' },
    { slug: 'vitamin-b12', label: 'Vitamin B12' },
    { slug: 'folsaeure', label: 'Folsäure' },
  ]},
  { cat: 'Gerinnung', color: 'indigo', terms: [
    { slug: 'inr', label: 'INR' },
    { slug: 'ptt', label: 'PTT' },
    { slug: 'quick', label: 'Quick' },
  ]},
  { cat: 'Urin', color: 'emerald', terms: [
    { slug: 'leukozyten-urin', label: 'Leukozyten (Urin)' },
    { slug: 'erythrozyten-urin', label: 'Erythrozyten (Urin)' },
    { slug: 'protein-urin', label: 'Protein (Urin)' },
  ]},
]

const COLOR_MAP = {
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-400'    },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-400'  },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-400'   },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-400' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-400'   },
  sky:    { bg: 'bg-sky-50',    text: 'text-sky-700',    border: 'border-sky-200',    dot: 'bg-sky-400'    },
  rose:   { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   dot: 'bg-rose-400'   },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-400' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-400' },
  emerald:{ bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-400'},
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

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {['Lexikon', 'Laborwerte', 'Guide', 'New Feature'].map(tag => (
              <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-100">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Medyra Lexikon: Every Lab Value Explained — How to Use It
          </h1>
          <p className="text-gray-500 text-sm">16 April 2026 · 7 min read · By Medyra</p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">

          {/* Intro */}
          <p className="text-lg text-gray-600 leading-relaxed">
            You receive a blood test result. Somewhere on the page it says <strong>CRP: 18 mg/l</strong> and there is
            a small <strong>H</strong> next to it — meaning high. The normal range is printed in tiny text. You have no idea
            what CRP is, what causes it to rise, or whether 18 is a little high or a lot high.
          </p>

          <p>
            The Medyra Lexikon was built for exactly this moment. It is a free German medical dictionary covering
            46 of the most common laboratory values — searchable, plain-language, and structured to give you the
            answer you actually need: <em>what does this mean for me, and what should I ask my doctor?</em>
          </p>

          {/* What is the Lexikon */}
          <h2 className="text-xl font-bold text-gray-900 mt-10">What is the Medyra Lexikon?</h2>

          <p>
            The Lexikon lives at <Link href="/lexikon" className="text-emerald-600 hover:underline font-medium">medyra.de/lexikon</Link>.
            It is a collection of individual pages, one per lab value. Each page is structured identically so you always
            know where to find what you need:
          </p>

          <div className="not-prose space-y-3 my-6">
            {[
              { step: '①', title: 'Plain-language summary', desc: 'A 2–3 sentence explanation in simple German: what the value measures, what it means if it is high or low, and when to follow up with a doctor.' },
              { step: '②', title: 'Reference range table', desc: 'A colour-coded table showing the normal range, the "mildly elevated" range, and the "significantly elevated" range — with the values in the same units your lab report uses.' },
              { step: '③', title: 'Possible causes', desc: 'Two lists: what can cause the value to be too high, and what can cause it to be too low. These are possibilities, not diagnoses.' },
              { step: '④', title: 'Questions for your doctor', desc: 'Ready-to-use questions you can bring to your next appointment. You can print or screenshot the page and hand it directly to your doctor.' },
              { step: '⑤', title: 'Related values', desc: 'Links to other lab values that are commonly measured alongside this one — so you can build a complete picture.' },
            ].map(item => (
              <div key={item.step} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                <span className="text-2xl font-black text-emerald-500 flex-shrink-0 leading-none mt-0.5">{item.step}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-0.5">{item.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* How to find a value */}
          <h2 className="text-xl font-bold text-gray-900 mt-10">How to find the value you are looking for</h2>

          <p>There are three ways to find any term in the Lexikon:</p>

          <h3 className="text-base font-bold text-gray-800 mt-6">Method 1 — Use the search bar</h3>
          <p>
            At the top of <Link href="/lexikon" className="text-emerald-600 hover:underline">medyra.de/lexikon</Link> there
            is a live search box. Start typing the abbreviation or the full name — results filter instantly as you type.
            You can search by acronym (<strong>CRP</strong>, <strong>TSH</strong>, <strong>GFR</strong>) or by full German
            name (<strong>Kreatinin</strong>, <strong>Hämoglobin</strong>, <strong>Cholesterin</strong>). No need to press
            Enter — it updates immediately.
          </p>

          {/* Search demo box */}
          <div className="not-prose my-4 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Search example</p>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-3 border border-emerald-300 rounded-xl px-4 py-2.5 bg-white">
                <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <span className="text-sm text-gray-700">crp</span>
                <span className="ml-auto text-xs text-emerald-500 font-medium">1 result found</span>
              </div>
              <Link href="/lexikon/crp" className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                <span className="font-black text-emerald-700 text-base w-14 flex-shrink-0">CRP</span>
                <span className="text-sm text-gray-700">C-reaktives Protein</span>
                <span className="ml-auto text-xs text-gray-400">Entzündungswerte →</span>
              </Link>
            </div>
          </div>

          <h3 className="text-base font-bold text-gray-800 mt-6">Method 2 — Browse by category</h3>
          <p>
            The index page groups all 46 terms into 11 medical categories. If you know roughly what your result
            relates to — liver, kidneys, thyroid, blood count — scroll to that section and scan the list. Each
            category has a colour so you can orient yourself at a glance.
          </p>

          <h3 className="text-base font-bold text-gray-800 mt-6">Method 3 — Direct URL</h3>
          <p>
            Every term has a permanent URL in the format <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-emerald-700">medyra.de/lexikon/[term]</code>.
            If you know the abbreviation, you can often navigate directly — for example:
          </p>

          <div className="not-prose flex flex-wrap gap-2 my-4">
            {[
              { slug: 'crp', label: '/lexikon/crp' },
              { slug: 'tsh', label: '/lexikon/tsh' },
              { slug: 'hba1c', label: '/lexikon/hba1c' },
              { slug: 'kreatinin', label: '/lexikon/kreatinin' },
              { slug: 'ferritin', label: '/lexikon/ferritin' },
              { slug: 'vitamin-d', label: '/lexikon/vitamin-d' },
            ].map(t => (
              <Link key={t.slug} href={`/lexikon/${t.slug}`}
                className="text-xs font-mono px-3 py-1.5 rounded-lg bg-gray-900 text-emerald-400 hover:bg-gray-800 transition-colors border border-gray-700">
                {t.label}
              </Link>
            ))}
          </div>

          {/* When to use it */}
          <h2 className="text-xl font-bold text-gray-900 mt-10">When should you use the Lexikon?</h2>

          <p>The Lexikon is most useful in four specific situations:</p>

          <div className="not-prose space-y-4 my-6">
            {[
              {
                icon: '📄',
                when: 'You just received a lab report',
                how: 'Look up every value marked with H (high) or L (low) before your next appointment. The Lexikon tells you what it means and gives you ready-made questions to ask your doctor — so you do not forget them under pressure.',
              },
              {
                icon: '🤔',
                when: 'Your doctor mentioned a value but did not explain it',
                how: 'Doctors often say things like "your CRP is a bit elevated, we\'ll watch it" without explaining what CRP is. Look it up immediately after the appointment so you understand what was said.',
              },
              {
                icon: '📅',
                when: 'You are preparing for an upcoming appointment',
                how: 'Use the Lexikon alongside the Medyra Doctor Visit feature. Look up any values you plan to discuss, read the "Questions for your doctor" section, and then use Doctor Visit to create a structured German summary.',
              },
              {
                icon: '👴',
                when: 'You are helping a family member understand their results',
                how: 'The Lexikon uses B1-level German — short sentences, no jargon. It is designed to be readable by anyone, including elderly relatives or people who are not native German speakers.',
              },
            ].map(item => (
              <div key={item.icon} className="flex gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:border-emerald-200 transition-colors">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-1">{item.when}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.how}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Full term reference */}
          <h2 className="text-xl font-bold text-gray-900 mt-10">All 46 terms — quick reference</h2>
          <p>
            Here is every term currently in the Lexikon, grouped by category. Click any term to go directly to its page.
          </p>

          <div className="not-prose space-y-5 my-6">
            {LEXIKON_TERMS.map(group => {
              const c = COLOR_MAP[group.color]
              return (
                <div key={group.cat} className={`rounded-2xl border ${c.border} ${c.bg} p-4`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    <p className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{group.cat}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.terms.map(t => (
                      <Link key={t.slug} href={`/lexikon/${t.slug}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${c.border} bg-white ${c.text} hover:opacity-80 transition-opacity`}>
                        {t.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* How to read a lexikon page */}
          <h2 className="text-xl font-bold text-gray-900 mt-10">How to read a Lexikon page</h2>

          <p>
            Let us walk through a real example. Suppose you received a blood test and your CRP was 22 mg/l — marked high.
            Here is how you would use the Lexikon page at{' '}
            <Link href="/lexikon/crp" className="text-emerald-600 hover:underline">medyra.de/lexikon/crp</Link>:
          </p>

          {/* Walkthrough */}
          <div className="not-prose space-y-4 my-6">
            <div className="border border-gray-200 rounded-2xl overflow-hidden">

              {/* Step A */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">A</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">Read the plain-language summary first</p>
                    <p className="text-sm text-gray-600 leading-relaxed">The green bordered box at the top answers the essential question in 2–3 sentences. For CRP it would explain that CRP is a protein the liver produces in response to inflammation, that values above 5 mg/l suggest the body is fighting something, and that a result of 22 mg/l is moderately elevated and worth discussing with a doctor.</p>
                  </div>
                </div>
              </div>

              {/* Step B */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">B</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">Check the range table</p>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">The colour-coded table shows:</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="font-semibold text-emerald-700">Normal</span>
                        <span className="text-gray-500 ml-auto">0 – 5 mg/l</span>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                        <span className="font-semibold text-amber-700">Leicht erhöht</span>
                        <span className="text-gray-500 ml-auto">5 – 50 mg/l</span>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs">
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                        <span className="font-semibold text-red-700">Stark erhöht</span>
                        <span className="text-gray-500 ml-auto">über 50 mg/l</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mt-3">Your value of 22 mg/l falls in the amber range — leicht erhöht (mildly elevated). This tells you it is not an emergency, but it is worth investigating.</p>
                  </div>
                </div>
              </div>

              {/* Step C */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">C</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">Review the possible causes</p>
                    <p className="text-sm text-gray-600 leading-relaxed">The causes section lists conditions that can cause CRP to be elevated — things like bacterial infection, chronic inflammation, or autoimmune conditions. These are possibilities, not a diagnosis. Read them to understand the range of explanations, then discuss with your doctor which (if any) are relevant to you.</p>
                  </div>
                </div>
              </div>

              {/* Step D */}
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">D</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-1">Copy the doctor questions</p>
                    <p className="text-sm text-gray-600 leading-relaxed">Every Lexikon page ends with 2–3 ready-made questions for your doctor. For CRP these include things like "Sollte der Wert in 2 Wochen kontrolliert werden?" (Should the value be rechecked in 2 weeks?) Screenshot these or print the page and bring it to your appointment.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Lexikon + Doctor Visit together */}
          <h2 className="text-xl font-bold text-gray-900 mt-10">Using the Lexikon together with Doctor Visit</h2>

          <p>
            The Lexikon and the{' '}
            <Link href="/prep" className="text-emerald-600 hover:underline">Doctor Visit</Link> feature work together.
            Here is the ideal workflow before any appointment where you have abnormal lab results:
          </p>

          <div className="not-prose my-6">
            <div className="relative pl-6 space-y-0">
              {[
                { n: 1, title: 'Look up each abnormal value in the Lexikon', desc: 'Understand what it measures, where your result sits in the range, and what can cause it.' },
                { n: 2, title: 'Note the doctor questions from each page', desc: 'Write them down or screenshot them — these form the basis of your appointment agenda.' },
                { n: 3, title: 'Open Doctor Visit at medyra.de/prep', desc: 'Choose "I have test results" as your category. Medyra will ask you follow-up questions.' },
                { n: 4, title: 'Describe what you found', desc: 'Mention the abnormal values by name, using the terminology from the Lexikon pages. "My CRP was 22, which is leicht erhöht — I also have elevated LDL."' },
                { n: 5, title: 'Generate your German summary', desc: 'Medyra creates a structured clinical document with your findings, history, and doctor questions — all in formal German, ready to hand to your GP or specialist.' },
              ].map((item, i, arr) => (
                <div key={item.n} className="relative flex gap-4 pb-6">
                  {i < arr.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-emerald-200" />
                  )}
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 z-10">{item.n}</div>
                  <div className="pt-0.5">
                    <p className="font-bold text-gray-900 text-sm mb-0.5">{item.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What it doesn't do */}
          <h2 className="text-xl font-bold text-gray-900 mt-10">What the Lexikon does not do</h2>

          <p>
            The Lexikon is an educational reference, not a diagnostic tool. It does not:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Tell you what <em>your specific</em> abnormal result means for your health — only a doctor can do that</li>
            <li>Recommend medication or treatment</li>
            <li>Replace a consultation — if you are worried, call your doctor</li>
            <li>Account for lab-to-lab variation — reference ranges can differ slightly between laboratories</li>
          </ul>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 not-prose text-sm text-amber-800 my-4">
            <p className="font-semibold mb-1">⚠ Important</p>
            <p>If you have a result that is significantly outside the normal range, especially for kidney function (GFR, Kreatinin), blood count (Hämoglobin, Thrombozyten), or liver values (GOT, GPT, GGT), contact your doctor promptly — do not wait for the next scheduled appointment.</p>
          </div>

          {/* FAQ */}
          <h2 className="text-xl font-bold text-gray-900 mt-10">Frequently asked questions</h2>

          <div className="not-prose space-y-4 my-4">
            {[
              {
                q: 'Is the Lexikon free?',
                a: 'Yes, completely free. No account needed. Every page is publicly accessible.',
              },
              {
                q: 'Is the content medically reviewed?',
                a: 'The reference ranges and educational content are based on standard German laboratory guidelines (Deutsche Gesellschaft für Klinische Chemie und Laboratoriumsmedizin). Each page shows a "last reviewed" date. The Lexikon is updated regularly.',
              },
              {
                q: 'My lab uses different units — does the Lexikon still apply?',
                a: 'Most German labs use the same units (mg/l, mmol/l, µg/l etc.). The unit is shown on each Lexikon page. If your lab uses different units, the reference range numbers may differ — check the unit shown on your own result.',
              },
              {
                q: 'Can I use this for my family members\' results?',
                a: 'Yes. The content is written in plain B1-level German so it is accessible to anyone. For elderly relatives, you can also read it aloud or print the page. The Medyra Family plan lets you store separate health profiles for up to 5 family members.',
              },
              {
                q: 'Will more terms be added?',
                a: 'Yes. The current 46 terms cover the most commonly ordered lab tests in Germany. Additional terms — including hormone panels, cardiac markers, and autoimmune markers — will be added over time.',
              },
            ].map(item => (
              <details key={item.q} className="group border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-semibold text-sm text-gray-900 hover:bg-gray-50 transition-colors">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform text-lg leading-none flex-shrink-0 ml-3">↓</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gray-900 rounded-2xl p-7 text-center not-prose mt-10 space-y-4">
            <p className="text-white font-bold text-xl">Open the Medyra Lexikon</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              46 terms · Free · No account required · Updated April 2026
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/lexikon"
                className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-7 py-3 rounded-xl transition-colors text-sm">
                Browse the Lexikon →
              </Link>
              <Link href="/prep"
                className="inline-block border border-white/20 hover:bg-white/10 text-white font-bold px-7 py-3 rounded-xl transition-colors text-sm">
                Prepare for your appointment
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
