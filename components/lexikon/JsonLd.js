export default function JsonLd({ entry }) {
  const medicalPage = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${entry.acronym}: ${entry.fullName}`,
    description: entry.metaDescription,
    url: `https://medyra.de/lexikon/${entry.slug}`,
    inLanguage: 'de-DE',
    lastReviewed: entry.lastReviewed,
    mainEntity: {
      '@type': 'MedicalTest',
      name: entry.fullName,
      alternateName: entry.acronym,
      usesDevice: { '@type': 'MedicalDevice', name: 'Laboranalyse' },
    },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
    </>
  )
}
