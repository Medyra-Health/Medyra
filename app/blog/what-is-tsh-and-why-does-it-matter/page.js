import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'

export const metadata = {
  title: 'What Is TSH and Why Does It Matter? | Medyra',
  description:
    'TSH (thyroid-stimulating hormone) is one of the most commonly tested blood values. This plain language guide explains what TSH measures, what high or low results mean, and when to see your doctor.',
  alternates: { canonical: 'https://medyra.de/blog/what-is-tsh-and-why-does-it-matter' },
  openGraph: {
    title: 'What Is TSH and Why Does It Matter?',
    description:
      'A plain language guide to TSH — what your thyroid test result means, what counts as normal, and when a result outside the reference range needs attention.',
    url: 'https://medyra.de/blog/what-is-tsh-and-why-does-it-matter',
  },
  keywords: [
    'what is TSH',
    'TSH blood test explained',
    'TSH normal range',
    'thyroid stimulating hormone',
    'TSH high low meaning',
    'TSH Schilddrüse erklärt',
    'TSH Referenzbereich',
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
            {['Thyroid', 'TSH', 'Hormones'].map((tag) => (
              <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            What Is TSH and Why Does It Matter?
          </h1>
          <p className="text-gray-500 text-sm">2 April 2026 · 6 min read · By Medyra</p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">

          <p className="text-lg text-gray-600 leading-relaxed">
            TSH appears on almost every routine blood panel. It is easy to overlook — just another three-letter
            abbreviation in a sea of numbers. But TSH is actually one of the most informative single values in
            a blood test, because it reflects how your entire thyroid system is functioning.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">What does TSH stand for?</h2>

          <p>
            TSH stands for <strong>thyroid-stimulating hormone</strong> (in German: <em>Thyreoidea-stimulierendes Hormon</em>
            or <em>Thyrotropin</em>). It is a hormone produced by the pituitary gland — a small structure at the
            base of your brain — whose job is to signal the thyroid gland in your neck to produce thyroid hormones
            (T3 and T4).
          </p>
          <p>
            Think of TSH as the thermostat signal. When your body needs more thyroid hormone, the pituitary
            raises TSH. When there is already enough, it lowers TSH. This feedback loop is why TSH is such a
            useful diagnostic value: it reflects not just what your thyroid is doing, but how your entire body
            is responding to it.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">What is a normal TSH level?</h2>

          <p>
            TSH is measured in <strong>mIU/L</strong> (milli-international units per litre) or sometimes µIU/mL,
            which is numerically the same. The most widely used reference range for adults is:
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
            <p className="font-semibold text-gray-800 mb-2">Standard adult TSH reference range</p>
            <p className="text-gray-600"><strong>0.4 – 4.0 mIU/L</strong> (varies slightly by lab and age)</p>
            <p className="text-xs text-gray-400 mt-2">
              Pregnant women have different reference ranges — typically lower — which is why pregnancy always
              requires TSH monitoring.
            </p>
          </div>

          <p>
            German labs (and most European labs) use the same range, though the exact boundaries can vary
            by 0.1–0.2 units between laboratories. Always use the reference range printed on <em>your</em>
            specific report.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">What does a high TSH mean?</h2>

          <p>
            A TSH value <strong>above</strong> the reference range (typically above 4.0–4.5 mIU/L) usually
            indicates that the pituitary is working hard to stimulate the thyroid — which means the thyroid
            is not producing enough hormone on its own. This is called <strong>hypothyroidism</strong> (an
            underactive thyroid).
          </p>
          <p>Common symptoms of hypothyroidism include:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Persistent fatigue and sluggishness</li>
            <li>Feeling cold more than usual</li>
            <li>Unexplained weight gain</li>
            <li>Dry skin or hair loss</li>
            <li>Difficulty concentrating ("brain fog")</li>
            <li>Low mood or depression</li>
          </ul>
          <p>
            Mildly elevated TSH (e.g. 4.5–10 mIU/L) with no symptoms is sometimes called
            <em> subclinical hypothyroidism</em> and may be monitored rather than immediately treated,
            depending on your doctor&apos;s assessment.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">What does a low TSH mean?</h2>

          <p>
            A TSH value <strong>below</strong> the reference range (typically below 0.4 mIU/L) means the
            pituitary is barely signalling the thyroid — because thyroid hormone levels are already too high.
            This is called <strong>hyperthyroidism</strong> (an overactive thyroid).
          </p>
          <p>Common symptoms of hyperthyroidism include:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Heart palpitations or a racing heartbeat</li>
            <li>Unexplained weight loss despite normal or increased appetite</li>
            <li>Feeling hot and sweating excessively</li>
            <li>Anxiety, irritability, or trembling hands</li>
            <li>Difficulty sleeping</li>
          </ul>
          <p>
            Low TSH can also occur if someone is taking thyroid medication at a slightly too-high dose.
            If you are already on levothyroxine (the standard thyroid hormone replacement), a low TSH
            typically prompts a dose adjustment.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">What happens after an abnormal TSH?</h2>

          <p>
            An abnormal TSH alone is usually a starting point, not a diagnosis. Your doctor will typically
            order <strong>Free T4 (fT4)</strong> and sometimes <strong>Free T3 (fT3)</strong> to get a complete
            picture of thyroid function. In some cases, thyroid antibodies (anti-TPO, anti-TG) are tested to
            check for autoimmune thyroid conditions like Hashimoto&apos;s disease or Graves&apos; disease.
          </p>
          <p>
            A single abnormal TSH reading is sometimes a transient finding caused by illness, stress,
            or lab variation. Most doctors will repeat the test before starting treatment if symptoms
            are mild or absent.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">TSH in German lab reports</h2>

          <p>
            In German Laborbefunde, TSH is usually listed as <strong>TSH</strong> or <strong>TSH basal</strong>.
            The unit will be mIU/L or µIU/mL. You may also see:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>fT3</strong> — Freies Trijodthyronin (Free T3)</li>
            <li><strong>fT4</strong> — Freies Thyroxin (Free T4)</li>
            <li><strong>Anti-TPO</strong> — Thyreoperoxidase-Antikörper (TPO antibodies)</li>
            <li><strong>TgAk</strong> — Thyreoglobulin-Antikörper (thyroglobulin antibodies)</li>
            <li><strong>TRAK</strong> — TSH-Rezeptor-Antikörper (TSH receptor antibodies, tested for Graves&apos; disease)</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Questions to ask your doctor</h2>

          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>Is my TSH result within normal range for my age?</li>
            <li>Do you recommend testing fT3 and fT4 as well?</li>
            <li>Should we retest in 3–6 months or act now?</li>
            <li>Could any of my current medications or supplements be affecting my TSH?</li>
            <li>If I have symptoms, could they be related to this result?</li>
          </ul>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mt-6">
            <strong>Important:</strong> This article is for educational purposes only and does not constitute
            medical advice. Always discuss your specific TSH result with your doctor or an endocrinologist.
          </div>

        </div>

        <div className="mt-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
          <p className="text-sm font-semibold text-emerald-800 mb-1">Get your full lab report explained</p>
          <p className="text-xs text-emerald-700 leading-relaxed mb-3">
            Have a blood test with TSH and other values? Upload your report and Medyra will explain every
            value — including TSH, fT4, and more — in plain language. Free to start.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Explain my blood test →
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 mt-8">
        © 2026 Medyra · <Link href="/privacy" className="hover:text-gray-600">Privacy</Link> · <Link href="/terms" className="hover:text-gray-600">Terms</Link>
      </footer>
    </div>
  )
}
