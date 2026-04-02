import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'

export const metadata = {
  title: 'Understanding Your Blood Test Results: A Plain Language Guide | Medyra',
  description:
    'What do CBC, HbA1c, CRP, and cholesterol results actually mean? This guide explains the most common blood test values in plain language — so you can understand your results before your next appointment.',
  alternates: { canonical: 'https://medyra.de/blog/understanding-your-blood-test-results' },
  openGraph: {
    title: 'Understanding Your Blood Test Results: A Complete Plain Language Guide',
    description:
      'CBC, CRP, HbA1c, cholesterol, liver enzymes — explained in plain language. Know what your blood test results mean without needing a medical degree.',
    url: 'https://medyra.de/blog/understanding-your-blood-test-results',
  },
  keywords: [
    'blood test results explained',
    'CBC explained plain language',
    'complete blood count meaning',
    'HbA1c explained',
    'CRP blood test meaning',
    'cholesterol test results explained',
    'Blutbild erklären',
    'Bluttest verstehen',
  ],
}

const PANELS = [
  {
    title: 'Complete Blood Count (CBC / Blutbild)',
    intro: 'The CBC is the most commonly ordered blood test. It gives a snapshot of the cells circulating in your blood.',
    values: [
      { name: 'Haemoglobin (Hb)', normal: 'Men: 13.5–17.5 g/dL · Women: 12.0–15.5 g/dL', desc: 'Carries oxygen in red blood cells. Low values indicate anaemia; high values can indicate dehydration or other conditions.' },
      { name: 'White Blood Cells (WBC / Leukozyten)', normal: '4.0–11.0 × 10³/µL', desc: 'The immune system cells. High WBC often indicates infection or inflammation; low WBC may indicate immune suppression.' },
      { name: 'Platelets (Thrombozyten)', normal: '150–400 × 10³/µL', desc: 'Responsible for clotting. Very low platelets increase bleeding risk; very high platelets can increase clot risk.' },
      { name: 'MCV', normal: '80–100 fL', desc: 'Average size of your red blood cells. Low MCV suggests iron deficiency; high MCV can indicate B12 or folate deficiency.' },
    ],
  },
  {
    title: 'Blood Sugar (Blutzucker / Glukose)',
    intro: 'Blood sugar tests show how your body manages glucose. There are two main types: fasting glucose and HbA1c.',
    values: [
      { name: 'Fasting Glucose (Nüchternblutzucker)', normal: '< 5.6 mmol/L (< 100 mg/dL)', desc: 'Blood sugar taken after at least 8 hours fasting. Values 5.6–6.9 mmol/L suggest pre-diabetes; ≥ 7.0 mmol/L suggests diabetes.' },
      { name: 'HbA1c', normal: '< 5.7% (< 39 mmol/mol)', desc: 'Shows your average blood sugar over the last 2–3 months. Does not require fasting. 5.7–6.4% suggests pre-diabetes; ≥ 6.5% suggests diabetes.' },
    ],
  },
  {
    title: 'Cholesterol (Lipidprofil)',
    intro: 'A lipid panel measures fats in your blood. It usually includes total cholesterol, LDL, HDL, and triglycerides.',
    values: [
      { name: 'Total Cholesterol (Gesamtcholesterin)', normal: '< 5.0 mmol/L (< 200 mg/dL)', desc: 'The overall amount of cholesterol in your blood. Elevated total cholesterol is a risk factor for heart disease.' },
      { name: 'LDL Cholesterol', normal: '< 3.0 mmol/L (< 115 mg/dL)', desc: 'Often called "bad cholesterol". LDL deposits cholesterol in artery walls. Lower is better; target thresholds vary by your individual cardiovascular risk.' },
      { name: 'HDL Cholesterol', normal: 'Men: > 1.0 mmol/L · Women: > 1.2 mmol/L', desc: 'Often called "good cholesterol". HDL carries cholesterol away from arteries. Higher is generally better.' },
      { name: 'Triglycerides', normal: '< 1.7 mmol/L (< 150 mg/dL)', desc: 'Fat stored in the blood. High triglycerides, especially combined with low HDL, indicate metabolic risk. Alcohol, refined carbohydrates, and inactivity raise triglycerides.' },
    ],
  },
  {
    title: 'Inflammation (Entzündungsmarker)',
    intro: 'Inflammation markers help detect infections, autoimmune activity, or chronic inflammation.',
    values: [
      { name: 'CRP (C-reactive protein)', normal: '< 5 mg/L (high-sensitivity CRP: < 1 mg/L)', desc: 'Rises rapidly during infection or inflammation. Very high CRP (> 100 mg/L) typically indicates a bacterial infection. Mildly elevated CRP (5–20 mg/L) is less specific.' },
      { name: 'ESR (Blutsenkungsgeschwindigkeit / BSG)', normal: 'Men: < 15 mm/h · Women: < 20 mm/h (age-adjusted)', desc: 'An older and less specific inflammation marker. Used alongside CRP or to track chronic inflammatory conditions like rheumatoid arthritis.' },
    ],
  },
  {
    title: 'Liver (Leberwerte)',
    intro: 'Liver function tests check how well your liver is processing substances. They are commonly ordered as part of routine checks or before starting certain medications.',
    values: [
      { name: 'ALT (GPT / Alanine aminotransferase)', normal: 'Men: < 45 U/L · Women: < 35 U/L', desc: 'The most liver specific enzyme. Elevated ALT usually indicates liver cell damage or inflammation (hepatitis, fatty liver, medications).' },
      { name: 'AST (GOT / Aspartate aminotransferase)', normal: '< 40 U/L', desc: 'Found in liver and muscle. Less specific than ALT — elevated AST can also indicate muscle damage (e.g. after intense exercise or a heart attack).' },
      { name: 'GGT (Gamma-glutamyltransferase)', normal: 'Men: < 60 U/L · Women: < 40 U/L', desc: 'Sensitive to alcohol and certain medications. Often the first liver value to rise with regular alcohol consumption.' },
      { name: 'Bilirubin', normal: 'Total: < 17 µmol/L (< 1.0 mg/dL)', desc: 'A breakdown product of haemoglobin. Elevated bilirubin causes jaundice (yellowing of the skin or whites of the eyes). Can indicate liver disease, bile duct problems, or haemolysis.' },
    ],
  },
  {
    title: 'Kidney (Nierenwerte)',
    intro: 'Kidney function tests check whether your kidneys are filtering blood effectively.',
    values: [
      { name: 'Creatinine (Kreatinin)', normal: 'Men: 62–115 µmol/L · Women: 53–97 µmol/L', desc: 'A waste product filtered by the kidneys. Elevated creatinine suggests reduced kidney function, dehydration, or high muscle mass.' },
      { name: 'eGFR (estimated Glomerular Filtration Rate)', normal: '> 60 mL/min/1.73m²', desc: 'Estimates how much blood the kidneys filter per minute. eGFR 45–59 suggests mild-to-moderate kidney disease; below 15 is kidney failure.' },
      { name: 'Urea (Harnstoff)', normal: '2.5–7.1 mmol/L', desc: 'Another kidney waste product. High urea with high creatinine confirms kidney impairment. High urea with normal creatinine can indicate dehydration or high protein intake.' },
    ],
  },
]

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
            {['Blood Test', 'CBC', 'Cholesterol', 'HbA1c'].map((tag) => (
              <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Understanding Your Blood Test Results: A Complete Plain Language Guide
          </h1>
          <p className="text-gray-500 text-sm">2 April 2026 · 9 min read · By Medyra</p>
        </div>

        <div className="text-gray-700 leading-relaxed space-y-6">

          <p className="text-lg text-gray-600 leading-relaxed">
            Your doctor has ordered a blood test and now you have a page of numbers. Some values are
            highlighted or flagged with arrows. You have a follow up appointment next week but you
            want to understand what you are looking at now.
          </p>
          <p className="text-gray-600">
            This guide covers the most commonly ordered blood test panels — what each value measures,
            what counts as normal, and what it means if a value is outside the reference range.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <strong>How to use this guide:</strong> Reference ranges here are approximate general adult values.
            Your lab report will include ranges specific to your age and sex — always use those. Values
            slightly outside range do not automatically mean something is wrong; your doctor considers
            the full clinical picture.
          </div>

          {PANELS.map((panel) => (
            <div key={panel.title} className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{panel.title}</h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{panel.intro}</p>
              <div className="space-y-3">
                {panel.values.map((v) => (
                  <div key={v.name} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1.5">
                      <p className="font-semibold text-gray-900 text-sm">{v.name}</p>
                      <p className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">{v.normal}</p>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <h2 className="text-xl font-bold text-gray-900 mt-8">What to do with an out of range result</h2>

          <p className="text-sm leading-relaxed">
            Seeing a flagged value can be alarming — but context is everything. A few guiding principles:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li><strong>Mildly out of range:</strong> Often not clinically significant on its own, especially without symptoms. Many labs flag anything outside the 2.5–97.5th percentile, which means 1 in 20 healthy people will have at least one flag.</li>
            <li><strong>Significantly out of range:</strong> Values far from the reference range, especially with symptoms, need follow up.</li>
            <li><strong>Trends over time:</strong> A value that has been gradually worsening over three tests is more concerning than a one time blip.</li>
            <li><strong>Multiple related values:</strong> If LDL, triglycerides, and blood sugar are all elevated together, that is a more complete metabolic picture.</li>
          </ul>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 mt-4">
            <strong>Important:</strong> This guide is for educational purposes only. The reference ranges
            listed here are approximate and may not match your specific lab report. Always discuss your
            results with your doctor before drawing any conclusions.
          </div>
        </div>

        <div className="mt-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
          <p className="text-sm font-semibold text-emerald-800 mb-1">Get your specific results explained instantly</p>
          <p className="text-xs text-emerald-700 leading-relaxed mb-3">
            Rather than looking up each value manually, upload your lab report and Medyra will explain
            every value in context — including what is flagged, what it means for you, and what questions
            to ask your doctor. Free to start, 16 languages, GDPR compliant.
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
