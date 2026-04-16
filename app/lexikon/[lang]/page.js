import { notFound } from 'next/navigation'
import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'
import { getAllEntries, SUPPORTED_LANGS, getTranslation } from '@/lib/lexikon'

const LANG_META = {
  en: { name: 'English',     heading: 'Medical Lab Values — Explained Simply',  sub: 'Understand your blood test results: normal ranges, causes, and questions for your doctor.' },
  tr: { name: 'Türkçe',     heading: 'Laboratuvar Değerleri — Basitçe Açıklandı', sub: 'Kan tahlili sonuçlarınızı anlayın: normal aralıklar, nedenler ve doktorunuz için sorular.' },
  bn: { name: 'বাংলা',      heading: 'রক্ত পরীক্ষার মান — সহজে ব্যাখ্যা',      sub: 'আপনার রক্ত পরীক্ষার ফলাফল বুঝুন: স্বাভাবিক মাত্রা, কারণ এবং ডাক্তারের জন্য প্রশ্ন।' },
  fr: { name: 'Français',   heading: 'Valeurs de Laboratoire — Expliquées Simplement', sub: 'Comprenez vos résultats d\'analyses sanguines: valeurs normales, causes et questions pour votre médecin.' },
  ar: { name: 'العربية',    heading: 'قيم المختبر — شرح بسيط',                  sub: 'افهم نتائج فحص الدم: القيم الطبيعية والأسباب وأسئلة لطبيبك.' },
  es: { name: 'Español',    heading: 'Valores de Laboratorio — Explicados',      sub: 'Entiende tus resultados de análisis de sangre: rangos normales, causas y preguntas para tu médico.' },
  it: { name: 'Italiano',   heading: 'Valori del Sangue — Spiegati Semplicemente', sub: 'Comprendi i tuoi esami del sangue: valori normali, cause e domande per il tuo medico.' },
  pt: { name: 'Português',  heading: 'Valores Laboratoriais — Explicados',       sub: 'Entenda seus resultados de exame de sangue: valores normais, causas e perguntas para seu médico.' },
  nl: { name: 'Nederlands', heading: 'Bloedwaarden — Eenvoudig Uitgelegd',       sub: 'Begrijp uw bloedonderzoeksresultaten: normaalwaarden, oorzaken en vragen voor uw arts.' },
  pl: { name: 'Polski',     heading: 'Wyniki Laboratoryjne — Proste Wyjaśnienie', sub: 'Zrozum wyniki badań krwi: normy, przyczyny i pytania do lekarza.' },
  zh: { name: '中文',        heading: '化验值 — 简单解释',                         sub: '了解您的血液检查结果：正常范围、原因以及医生问题。' },
  ja: { name: '日本語',      heading: '検査値 — わかりやすく解説',                 sub: '血液検査の結果を理解する：基準値、原因、医師への質問。' },
  ko: { name: '한국어',      heading: '혈액 검사 수치 — 쉽게 설명',               sub: '혈액 검사 결과를 이해하세요: 정상 범위, 원인, 의사를 위한 질문.' },
  hi: { name: 'हिन्दी',    heading: 'रक्त परीक्षण मान — सरल व्याख्या',          sub: 'अपने रक्त परीक्षण परिणाम समझें: सामान्य सीमाएं, कारण और डॉक्टर के लिए प्रश्न।' },
  ur: { name: 'اردو',       heading: 'خون کے ٹیسٹ کی قدریں — آسان وضاحت',      sub: 'اپنے خون کے ٹیسٹ کے نتائج سمجھیں: نارمل رینج، وجوہات اور ڈاکٹر کے لیے سوالات۔' },
  ru: { name: 'Русский',    heading: 'Лабораторные показатели — Простое объяснение', sub: 'Поймите результаты анализа крови: нормальные значения, причины и вопросы для врача.' },
}

const CATEGORY_COLORS = {
  'Blutbild':         'bg-red-50 border-red-200 text-red-700',
  'Leberwerte':       'bg-amber-50 border-amber-200 text-amber-700',
  'Nierenwerte':      'bg-blue-50 border-blue-200 text-blue-700',
  'Entzündungswerte': 'bg-orange-50 border-orange-200 text-orange-700',
  'Stoffwechsel':     'bg-violet-50 border-violet-200 text-violet-700',
  'Schilddrüse':      'bg-teal-50 border-teal-200 text-teal-700',
  'Elektrolyte':      'bg-sky-50 border-sky-200 text-sky-700',
  'Eisenwerte':       'bg-rose-50 border-rose-200 text-rose-700',
  'Vitamine':         'bg-yellow-50 border-yellow-200 text-yellow-700',
  'Gerinnung':        'bg-indigo-50 border-indigo-200 text-indigo-700',
  'Urinwerte':        'bg-emerald-50 border-emerald-200 text-emerald-700',
}

export async function generateStaticParams() {
  return SUPPORTED_LANGS.map(lang => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  if (!SUPPORTED_LANGS.includes(lang)) return {}
  const meta = LANG_META[lang] || { name: lang.toUpperCase(), heading: 'Medical Lexikon | Medyra' }
  return {
    title: `${meta.heading} | Medyra`,
    description: meta.sub,
    alternates: {
      canonical: `https://medyra.de/lexikon/${lang}`,
      languages: {
        'de': 'https://medyra.de/lexikon',
        ...Object.fromEntries(SUPPORTED_LANGS.map(l => [l, `https://medyra.de/lexikon/${l}`])),
      },
    },
  }
}

export default async function LexikonLangPage({ params }) {
  const { lang } = await params
  if (!SUPPORTED_LANGS.includes(lang)) notFound()

  const meta = LANG_META[lang] || { name: lang.toUpperCase(), heading: 'Medical Lexikon', sub: '', rtl: false }
  const isRTL = lang === 'ar' || lang === 'ur'
  const entries = getAllEntries()

  // Group entries by category
  const byCategory = entries.reduce((acc, entry) => {
    const cat = entry.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    // Get translated title if available
    const t = getTranslation(entry.slug, lang)
    acc[cat].push({ ...entry, _t: t })
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <nav className="flex items-center gap-3">
            <Link href="/lexikon" className="text-sm text-gray-500 hover:text-gray-800 transition-colors hidden sm:block">← Lexikon (DE)</Link>
            <Link href="/upload" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors">
              Upload Report
            </Link>
          </nav>
        </div>
      </header>

      {/* Language switcher */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Link href="/lexikon" className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-emerald-400 transition-colors font-medium">DE</Link>
          {SUPPORTED_LANGS.map(l => (
            <Link key={l} href={`/lexikon/${l}`}
              className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full border font-semibold transition-colors ${l === lang ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600'}`}>
              {l.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{meta.heading}</h1>
          <p className="text-gray-500 text-sm">{meta.sub}</p>
        </div>

        {Object.entries(byCategory).map(([category, items]) => {
          const colorClass = CATEGORY_COLORS[category] || 'bg-gray-50 border-gray-200 text-gray-700'
          return (
            <div key={category} className="mb-8">
              <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border mb-4 ${colorClass}`}>
                {items[0]._t?.categoryLabel || category}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {items.map(entry => (
                  <Link key={entry.slug} href={`/lexikon/${lang}/${entry.slug}`}
                    className="group bg-white border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-xl px-4 py-3 transition-all shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-gray-900 text-sm">{entry.acronym}</span>
                      <span className="text-gray-300 group-hover:text-emerald-400 text-xs transition-colors">→</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{entry.fullName}</p>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </main>
    </div>
  )
}
