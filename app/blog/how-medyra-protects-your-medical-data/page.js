import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'

export const metadata = {
  title: 'How Medyra Protects Your Medical Data: AES-256-GCM Encryption Explained | Medyra',
  description:
    'Your medical reports contain some of your most sensitive personal data. Here is exactly how Medyra encrypts every field before storing it — and why even we cannot read your data.',
  alternates: { canonical: 'https://medyra.de/blog/how-medyra-protects-your-medical-data' },
  openGraph: {
    title: 'How Medyra Protects Your Medical Data: AES-256-GCM Encryption Explained',
    description:
      'AES-256-GCM field-level encryption, GDPR Art. 32, and BSI-compliant key management — a transparent look at how Medyra keeps your health data safe.',
    url: 'https://medyra.de/blog/how-medyra-protects-your-medical-data',
  },
  keywords: [
    'medical data encryption',
    'GDPR health data',
    'AES-256-GCM encryption',
    'healthcare data security',
    'BDSG Datenschutz',
    'medical report privacy',
    'Medyra security',
    'encrypted medical records',
  ],
}

function EncryptionDiagram() {
  return (
    <div className="my-10 rounded-2xl overflow-hidden border border-emerald-100 bg-gradient-to-br from-slate-900 to-emerald-950 p-6 md:p-10">
      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest text-center mb-8">How your data is encrypted</p>

      {/* Flow */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">

        {/* Step 1: Your report */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-600 flex flex-col items-center justify-center mb-3 shadow-lg">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="4" width="20" height="24" rx="3" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
              <path d="M10 10h12M10 14h12M10 18h8" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-xs text-slate-400 mt-1 font-medium">Your report</span>
          </div>
          <div className="text-xs text-slate-500 text-center max-w-[90px]">Lab PDF or image</div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex flex-col items-center mx-2">
          <div className="w-12 h-px bg-slate-600" />
          <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-slate-600 -mr-2" />
        </div>
        <div className="md:hidden text-slate-600 text-2xl">↓</div>

        {/* Step 2: Encryption engine */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-20 rounded-2xl bg-emerald-900 border border-emerald-600 flex flex-col items-center justify-center mb-3 shadow-lg shadow-emerald-900/50">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="5" y="12" width="18" height="13" rx="2.5" stroke="#10b981" strokeWidth="1.5" fill="none" />
              <path d="M9 12V9a5 5 0 0 1 10 0v3" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="14" cy="18" r="2" fill="#10b981" />
            </svg>
            <span className="text-xs text-emerald-400 mt-1 font-bold">AES-256-GCM</span>
          </div>
          <div className="text-xs text-emerald-500 text-center max-w-[110px] font-medium">Encryption engine</div>
          <div className="mt-2 text-xs text-slate-500 text-center max-w-[110px]">Unique random key per field</div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex flex-col items-center mx-2">
          <div className="w-12 h-px bg-slate-600" />
          <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8 border-l-slate-600 -mr-2" />
        </div>
        <div className="md:hidden text-slate-600 text-2xl">↓</div>

        {/* Step 3: MongoDB */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-600 flex flex-col items-center justify-center mb-3 shadow-lg">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <ellipse cx="15" cy="9" rx="9" ry="4" stroke="#64748b" strokeWidth="1.5" />
              <path d="M6 9v6c0 2.2 4 4 9 4s9-1.8 9-4V9" stroke="#64748b" strokeWidth="1.5" />
              <path d="M6 15v6c0 2.2 4 4 9 4s9-1.8 9-4v-6" stroke="#64748b" strokeWidth="1.5" />
            </svg>
            <span className="text-xs text-slate-400 mt-1 font-medium">MongoDB</span>
          </div>
          <div className="text-xs text-slate-500 text-center max-w-[90px]">Only ciphertext stored</div>
        </div>
      </div>

      {/* What's stored example */}
      <div className="mt-8 rounded-xl bg-slate-800/60 border border-slate-700 p-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">What MongoDB actually contains</p>
        <div className="space-y-2 font-mono text-xs">
          <div><span className="text-slate-500">fileName:</span> <span className="text-amber-400">&quot;a3f4b12c...9e1d:7f3a...c429:8b2e...f104&quot;</span></div>
          <div><span className="text-slate-500">extractedText:</span> <span className="text-amber-400">&quot;d84f9a01...2c7b:9e4f...b312:3a7c...e920&quot;</span></div>
          <div><span className="text-slate-500">explanation:</span> <span className="text-amber-400">&quot;b29e4f11...8a3d:5c1a...9f04:7b3e...d214&quot;</span></div>
          <div><span className="text-slate-500">conversations[0].question:</span> <span className="text-amber-400">&quot;e10b3c...f7a9:...&quot;</span></div>
        </div>
        <p className="text-xs text-slate-500 mt-3">Without the encryption key, this data is mathematically unreadable — by anyone.</p>
      </div>

      {/* Key separation */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 rounded-xl bg-red-950/40 border border-red-900/50 p-3 text-center">
          <p className="text-xs font-bold text-red-400 mb-1">🔑 Encryption key</p>
          <p className="text-xs text-red-300/70">Stored only in server environment variables. Never in the database.</p>
        </div>
        <div className="flex-1 rounded-xl bg-slate-800/60 border border-slate-700 p-3 text-center">
          <p className="text-xs font-bold text-slate-300 mb-1">🗄️ MongoDB Atlas</p>
          <p className="text-xs text-slate-500">Contains only encrypted ciphertext. Useless without the key.</p>
        </div>
      </div>
    </div>
  )
}

export default function EncryptionBlogPost() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">← All articles</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {['Security', 'GDPR', 'Privacy', 'Encryption'].map(tag => (
            <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">{tag}</span>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          How Medyra Protects Your Medical Data: AES-256-GCM Encryption Explained
        </h1>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-8 pb-8 border-b border-gray-100">
          <span>4 April 2026</span>
          <span>·</span>
          <span>8 min read</span>
          <span>·</span>
          <span>Medyra Security Team</span>
        </div>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">

          <p className="text-lg text-gray-600 leading-relaxed font-light">
            Your medical reports contain some of the most sensitive data that exists about you — diagnoses, medication history, hormone levels, genetic markers. When you upload a document to any digital service, you deserve to know exactly what happens to it. This article explains precisely how Medyra handles your data, what we encrypt, and why not even our own team can read it.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">The problem with storing medical data</h2>
          <p>
            Most healthcare applications store patient data in a plain-text database. This means that anyone with database access — a developer, a hacker who breaches the server, or even a cloud provider employee — can read your records directly. For general data this is already bad. For medical data, it is unacceptable.
          </p>
          <p>
            German and EU law reflects this. Article 32 of the GDPR explicitly requires &ldquo;appropriate technical measures&rdquo; to protect sensitive personal data, including encryption. The German Federal Data Protection Act (BDSG, §64) sets an even higher bar for health data specifically. We built Medyra to exceed both standards.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What we encrypt — and why those fields</h2>

          <div className="grid sm:grid-cols-2 gap-3 not-prose">
            {[
              { field: 'Extracted text', why: 'The raw OCR text from your lab report — contains every diagnosis, test name, and value.' },
              { field: 'AI explanation', why: 'The full analysis: flagged values, interpretations, and the summary your doctor would see.' },
              { field: 'Chat conversations', why: 'Every question you asked and every answer — your private health dialogue with the AI.' },
              { field: 'File name', why: 'Often contains your name, date of birth, or patient ID — directly identifying personal data.' },
            ].map(item => (
              <div key={item.field} className="rounded-xl border border-gray-200 p-4">
                <p className="font-semibold text-gray-900 text-sm mb-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
                  {item.field}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.why}</p>
              </div>
            ))}
          </div>

          <p className="mt-2">
            The fields we do <em>not</em> encrypt are non-sensitive structural fields: your Clerk user ID (already pseudonymous), timestamps, and subscription status. These are needed to query the database efficiently and contain no health information.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">AES-256-GCM: the encryption standard explained</h2>

          <EncryptionDiagram />

          <p>
            We use <strong>AES-256-GCM</strong> — the same encryption standard used by German banking systems, the BSI (Bundesamt für Sicherheit in der Informationstechnik), and NATO for classified communications. Here is what each part means:
          </p>

          <ul className="space-y-3 list-none pl-0 not-prose">
            {[
              { term: 'AES', def: 'Advanced Encryption Standard — the global standard for symmetric encryption, adopted by the US NIST and EU agencies.' },
              { term: '256', def: '256-bit key length. There are 2²⁵⁶ possible keys — more than the number of atoms in the observable universe. Brute-force is mathematically impossible.' },
              { term: 'GCM', def: 'Galois/Counter Mode. This is authenticated encryption — it not only encrypts the data but produces a cryptographic tag that detects any tampering. If someone modifies the ciphertext in the database, decryption fails loudly rather than returning corrupted data silently.' },
            ].map(item => (
              <li key={item.term} className="flex gap-3 items-start p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="font-black text-emerald-600 text-sm font-mono flex-shrink-0 mt-0.5">{item.term}</span>
                <span className="text-sm text-gray-600 leading-relaxed">{item.def}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">How each value is encrypted individually</h2>
          <p>
            A critical detail: we do not encrypt the entire database record with one key. We encrypt <strong>each field individually</strong>, and each encryption uses a freshly generated random value called an <em>initialisation vector</em> (IV).
          </p>
          <p>
            This matters because it means that even if two users upload identical documents, the resulting ciphertext in the database is completely different — an attacker cannot detect patterns or correlations between records. Each encrypted value in MongoDB looks like:
          </p>
          <div className="rounded-xl bg-gray-900 p-4 font-mono text-xs text-amber-300 overflow-x-auto not-prose">
            <span className="text-slate-500">{/* Format: IV : ciphertext : auth_tag */}</span><br />
            <span className="text-emerald-400">a3f4b12c9e1d8f07</span>
            <span className="text-slate-600">:</span>
            <span className="text-amber-300">7f3a291bc8e4d0f9a2c...</span>
            <span className="text-slate-600">:</span>
            <span className="text-blue-400">8b2ef104a93d7c1e</span>
          </div>
          <p className="text-sm text-gray-500">
            The green section is the IV (unique per encryption), amber is the ciphertext, blue is the GCM authentication tag.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Key management: where the key lives</h2>
          <p>
            The encryption key is the only secret that makes decryption possible. We store it exclusively as a server-side environment variable on Vercel — never in the database, never in the source code, never logged. This means:
          </p>
          <ul className="space-y-2 not-prose">
            {[
              'A MongoDB database breach exposes only ciphertext — mathematically useless without the key.',
              'A source code leak (e.g. a public GitHub repository) exposes no patient data.',
              'Medyra employees with database access cannot read patient records.',
              'Even Vercel (our hosting provider) cannot access the key in transit.',
            ].map((point, i) => (
              <li key={i} className="flex gap-2 items-start text-sm text-gray-700">
                <span className="text-emerald-500 flex-shrink-0 mt-0.5 font-bold">✓</span>
                {point}
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">GDPR Article 32 and BDSG compliance</h2>
          <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-5 not-prose">
            <p className="text-sm font-semibold text-emerald-900 mb-2">GDPR Art. 32(1)(a)</p>
            <p className="text-sm text-emerald-800 italic leading-relaxed">
              &ldquo;The controller and the processor shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including as appropriate: the pseudonymisation and <strong>encryption of personal data</strong>.&rdquo;
            </p>
          </div>
          <p>
            AES-256-GCM satisfies this requirement explicitly. The BSI Technical Guideline TR-02102-1 lists AES-256 as the recommended symmetric encryption algorithm through at least 2030. Our implementation also satisfies the BDSG requirement for health data (as a special category under GDPR Art. 9) to apply heightened technical protections.
          </p>
          <p>
            Additionally, all data is automatically deleted after 30 days via a MongoDB TTL index — satisfying the GDPR data minimisation and storage limitation principles (Art. 5(1)(e)).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What we do not store</h2>
          <ul className="space-y-2 not-prose">
            {[
              'The original file — we extract the text and discard the binary immediately.',
              'Any data beyond the 30-day window — a TTL index hard-deletes all records automatically.',
              'Payment card details — handled entirely by Stripe, never touches our servers.',
              'Biometric data or genetic sequences — we analyse the text values in lab reports, not raw biological data.',
            ].map((point, i) => (
              <li key={i} className="flex gap-2 items-start text-sm text-gray-700">
                <span className="text-red-400 flex-shrink-0 mt-0.5 font-bold">✗</span>
                {point}
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Our commitment to transparency</h2>
          <p>
            We believe you should not have to trust us blindly. This is why we explain our encryption implementation in detail — the algorithm, the key management model, and the regulatory framework we comply with. If you have questions about our data handling practices, you can contact us at any time.
          </p>
          <p>
            Medical data deserves military-grade protection. We built Medyra with that principle from day one — not as an afterthought, and not just to tick a compliance checkbox.
          </p>

        </div>

        {/* CTA */}
        <div className="mt-14 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
          <p className="text-sm font-semibold text-emerald-800 mb-1">Ready to try Medyra?</p>
          <p className="text-xs text-emerald-700 leading-relaxed mb-3">
            Your first 3 reports are free. No credit card needed. Everything described in this article protects every upload from your first report onward.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Analyse my report — it&apos;s free →
          </Link>
        </div>

        {/* Related */}
        <div className="mt-10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">More from the blog</p>
          <div className="space-y-3">
            {[
              { href: '/blog/how-to-read-lab-results-germany-expat', title: 'How to Read Your Lab Results in Germany as an Expat' },
              { href: '/blog/what-is-tsh-and-why-does-it-matter', title: 'What Is TSH and Why Does It Matter?' },
              { href: '/blog/understanding-your-blood-test-results', title: 'Understanding Your Blood Test Results: A Plain Language Guide' },
            ].map(post => (
              <Link key={post.href} href={post.href} className="block text-sm text-emerald-700 hover:text-emerald-900 hover:underline">
                {post.title} →
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 mt-8">
        © 2026 Medyra · <Link href="/privacy" className="hover:text-gray-600">Privacy</Link> · <Link href="/terms" className="hover:text-gray-600">Terms</Link>
      </footer>
    </div>
  )
}
