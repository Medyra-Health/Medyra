import Link from 'next/link'

// The "understanding" topic cluster. Cross links every feature page with the
// others so link equity flows through the whole cluster, and emits a
// BreadcrumbList for the current page. Localized: de is the SEO base, other
// languages fall back to English.
const HREFS = ['/check', '/arztbrief', '/entlassungsbericht', '/medikamente', '/krankenkasse', '/sprachen']
const ICONS = { '/check': '🧪', '/arztbrief': '📋', '/entlassungsbericht': '🏥', '/medikamente': '💊', '/krankenkasse': '📬', '/sprachen': '🌍' }

const CONTENT = {
  de: {
    label: 'Mehr verstehen',
    title: 'Medyra erklärt noch mehr',
    items: {
      '/check': ['Laborwerte sofort checken', 'Wert eintippen und direkt sehen, ob er im Normalbereich liegt.'],
      '/arztbrief': ['Arztbriefe entschlüsseln', 'Befunde und Fachbegriffe in klare Sprache übersetzt.'],
      '/entlassungsbericht': ['Krankenhausberichte verstehen', 'Was im Krankenhaus passiert ist und was jetzt zu tun ist.'],
      '/medikamente': ['Medikamente klar erklärt', 'Medikationsplan verstehen: wofür, wie einnehmen, worauf achten.'],
      '/krankenkasse': ['Kassenbriefe ohne Amtsdeutsch', 'Bescheide, Fristen und Zuzahlungen verständlich gemacht.'],
      '/sprachen': ['Erklärt in 17 Sprachen', 'Deutsche Befunde in Ihrer Muttersprache verstehen.'],
    },
  },
  en: {
    label: 'Understand more',
    title: 'Medyra explains even more',
    items: {
      '/check': ['Check lab values instantly', 'Type a value and see right away if it is in the normal range.'],
      '/arztbrief': ['Decode doctor letters', 'Findings and medical terms translated into plain language.'],
      '/entlassungsbericht': ['Understand hospital reports', 'What happened at the hospital and what to do now.'],
      '/medikamente': ['Medications made clear', 'Understand your medication plan: what for, how to take it, what to watch.'],
      '/krankenkasse': ['Insurance letters, no jargon', 'Decisions, deadlines and copayments made understandable.'],
      '/sprachen': ['Explained in 17 languages', 'Understand German medical documents in your mother tongue.'],
    },
  },
  tr: {
    label: 'Daha fazlasını anlayın',
    title: 'Medyra daha fazlasını açıklıyor',
    items: {
      '/check': ['Tahlil değerini anında kontrol edin', 'Değeri yazın ve normal aralıkta olup olmadığını hemen görün.'],
      '/arztbrief': ['Doktor mektuplarını çözün', 'Bulgular ve tıbbi terimler anlaşılır dile çevrilir.'],
      '/entlassungsbericht': ['Hastane raporlarını anlayın', 'Hastanede ne oldu ve şimdi ne yapmalı.'],
      '/medikamente': ['İlaçlar net anlatılır', 'İlaç planınızı anlayın: ne için, nasıl alınır, nelere dikkat edilir.'],
      '/krankenkasse': ['Sigorta yazıları, bürokrasisiz', 'Kararlar, süreler ve katkı payları anlaşılır hale gelir.'],
      '/sprachen': ['17 dilde açıklama', 'Almanca tıbbi belgeleri ana dilinizde anlayın.'],
    },
  },
  ar: {
    label: 'افهم المزيد',
    title: 'Medyra يشرح المزيد',
    items: {
      '/check': ['افحص قيم التحاليل فوراً', 'اكتب القيمة وشاهد فوراً إن كانت ضمن النطاق الطبيعي.'],
      '/arztbrief': ['فك رموز خطابات الأطباء', 'النتائج والمصطلحات الطبية مترجمة إلى لغة بسيطة.'],
      '/entlassungsbericht': ['افهم تقارير المستشفى', 'ما الذي حدث في المستشفى وما الذي يجب فعله الآن.'],
      '/medikamente': ['أدويتك بوضوح', 'افهم خطة أدويتك: لماذا وكيف تؤخذ وما الذي تنتبه له.'],
      '/krankenkasse': ['خطابات التأمين بلا تعقيد', 'القرارات والمهل والمدفوعات بشكل مفهوم.'],
      '/sprachen': ['الشرح بـ 17 لغة', 'افهم المستندات الطبية الألمانية بلغتك الأم.'],
    },
  },
  ru: {
    label: 'Поймите больше',
    title: 'Medyra объясняет ещё больше',
    items: {
      '/check': ['Проверьте показатель мгновенно', 'Введите значение и сразу увидите, в норме ли оно.'],
      '/arztbrief': ['Расшифруйте письма врача', 'Заключения и медицинские термины простым языком.'],
      '/entlassungsbericht': ['Поймите больничную выписку', 'Что произошло в больнице и что делать дальше.'],
      '/medikamente': ['Лекарства простыми словами', 'Поймите план приёма: зачем, как принимать, на что обратить внимание.'],
      '/krankenkasse': ['Письма страховой без канцелярита', 'Решения, сроки и доплаты понятным языком.'],
      '/sprachen': ['Объяснение на 17 языках', 'Понимайте немецкие медицинские документы на родном языке.'],
    },
  },
}

export default function FeatureCluster({ current, pageName, locale = 'de' }) {
  const c = CONTENT[locale] || CONTENT.en
  const others = HREFS.filter(h => h !== current)

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Medyra', item: 'https://medyra.de' },
      { '@type': 'ListItem', position: 2, name: pageName || 'Verstehen', item: `https://medyra.de${current}` },
    ],
  }

  return (
    <section className="py-16 md:py-20 bg-white border-t border-gray-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">{c.label}</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#0B1F17]">{c.title}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {others.map(href => {
            const [title, desc] = c.items[href]
            return (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-gray-200 bg-white p-5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 transition-all"
              >
                <span className="text-2xl">{ICONS[href]}</span>
                <h3 className="font-bold text-[#0B1F17] text-sm mt-3 mb-1 group-hover:text-emerald-700 transition-colors">
                  {title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
