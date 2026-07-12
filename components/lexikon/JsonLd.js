const LANG_TAGS = {
  de: 'de-DE', en: 'en', tr: 'tr-TR', bn: 'bn-BD', fr: 'fr-FR', ar: 'ar',
  es: 'es-ES', it: 'it-IT', pt: 'pt-PT', nl: 'nl-NL', pl: 'pl-PL', zh: 'zh-CN',
  ja: 'ja-JP', ko: 'ko-KR', hi: 'hi-IN', ur: 'ur-PK', ru: 'ru-RU',
}

export default function JsonLd({ entry, lang = 'de' }) {
  const url = lang === 'de'
    ? `https://medyra.de/lexikon/${entry.slug}`
    : `https://medyra.de/lexikon/${lang}/${entry.slug}`

  const medicalPage = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${entry.acronym}: ${entry.fullName}`,
    description: entry.metaDescription,
    url,
    inLanguage: LANG_TAGS[lang] || lang,
    lastReviewed: entry.lastReviewed,
    mainEntity: {
      '@type': 'MedicalTest',
      name: entry.fullName,
      alternateName: entry.acronym,
      usesDevice: { '@type': 'MedicalDevice', name: 'Laboranalyse' },
    },
    publisher: { '@id': 'https://medyra.de/#organization' },
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Medyra', item: 'https://medyra.de' },
      { '@type': 'ListItem', position: 2, name: 'Lexikon', item: 'https://medyra.de/lexikon' },
      { '@type': 'ListItem', position: 3, name: entry.acronym, item: url },
    ],
  }

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (entry.doctorQuestions || []).map(q => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Diese Frage sollten Sie mit Ihrem Arzt besprechen. ${entry.shortAnswer}`,
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
    </>
  )
}
