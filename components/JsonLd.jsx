export default function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://medyra.de/#organization',
        name: 'Medyra',
        url: 'https://medyra.de',
        logo: {
          '@type': 'ImageObject',
          url: 'https://medyra.de/icon-512.png',
          width: 512,
          height: 512,
        },
        description:
          'AI powered medical lab report explanation platform. GDPR compliant. Made in Germany.',
        foundingLocation: {
          '@type': 'Place',
          name: 'Germany',
        },
        areaServed: 'Worldwide',
        knowsLanguage: ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'tr', 'ar', 'zh', 'ja', 'ko', 'hi', 'bn', 'ru'],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          url: 'https://medyra.de/contact',
        },
      },
      {
        '@type': 'WebApplication',
        '@id': 'https://medyra.de/#webapp',
        name: 'Medyra',
        url: 'https://medyra.de',
        description:
          'Upload your medical lab results and get AI powered plain language explanations in under 60 seconds. Understand your TSH, HbA1c, cholesterol, and 100+ other lab values.',
        applicationCategory: 'HealthApplication',
        applicationSubCategory: 'MedicalApplication',
        operatingSystem: 'Web Browser, iOS, Android',
        inLanguage: ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'tr', 'ar', 'zh', 'ja', 'ko', 'hi', 'bn', 'ru'],
        offers: [
          {
            '@type': 'Offer',
            name: 'Free',
            description: '3 medical reports per month at no cost',
            price: '0',
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            name: 'Personal',
            description: '20 reports/month, 2 health profiles, AI chat & prep summaries',
            price: '4.99',
            priceCurrency: 'EUR',
            eligibleDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            name: 'Family',
            description: '50 reports/month, up to 5 member profiles, multi-user access',
            price: '9.99',
            priceCurrency: 'EUR',
            eligibleDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
            availability: 'https://schema.org/InStock',
          },
        ],
        featureList: [
          'AI-powered medical report explanation',
          'OCR for scanned lab reports',
          'Abnormal value flagging',
          'Follow-up chat with AI',
          'GDPR compliant data handling',
          'Auto-deletion after 30 days',
          '16 language support',
          'PDF, JPG, PNG, TXT file support',
        ],
        screenshot: 'https://medyra.de/opengraph-image',
        publisher: { '@id': 'https://medyra.de/#organization' },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://medyra.de/#website',
        url: 'https://medyra.de',
        name: 'Medyra',
        description: 'Understand your medical reports in plain language with AI',
        publisher: { '@id': 'https://medyra.de/#organization' },
        inLanguage: 'en',
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://medyra.de/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is Medyra?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Medyra is an AI-powered platform that explains your medical lab results in plain language. Upload your PDF or image of lab results and receive a clear, plain-language explanation in under 60 seconds.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is my health data secure with Medyra?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. All data is encrypted in transit and at rest. Medyra is fully GDPR compliant and automatically deletes your reports after 30 days. We never sell or share your data.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is Medyra a substitute for medical advice?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Medyra is an educational tool that helps you understand medical terminology. It does not provide medical advice, diagnosis, or treatment recommendations. Always consult your licensed physician for medical decisions.',
            },
          },
          {
            '@type': 'Question',
            name: 'What file formats does Medyra support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Medyra supports PDF, JPG, PNG, and TXT files. Our OCR technology can extract text from scanned images and photos of lab reports up to 10MB.',
            },
          },
          {
            '@type': 'Question',
            name: 'How much does Medyra cost?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Medyra offers a free plan (3 reports/month), Personal at €4.99/month (20 reports, 2 health profiles), and Family at €9.99/month (50 reports, up to 5 profiles). No credit card required.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which languages does Medyra support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Medyra is available in 16 languages: English, German, French, Spanish, Italian, Portuguese, Dutch, Polish, Turkish, Arabic, Chinese, Japanese, Korean, Hindi, Bengali, and Russian.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I cancel my subscription anytime?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. You can cancel your subscription at any time from your dashboard with no penalties or hidden fees.',
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://medyra.de/#breadcrumb',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://medyra.de',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Pricing',
            item: 'https://medyra.de/pricing',
          },
        ],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
