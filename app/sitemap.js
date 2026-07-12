import { getAllSlugs, SUPPORTED_LANGS } from '@/lib/lexikon'

export default function sitemap() {
  const baseUrl = 'https://medyra.de'
  const now = new Date()
  const lexikonSlugs = getAllSlugs()

  // hreflang set for one lexikon term: German base URL + every translation.
  // Google uses these to rank the right language version in each country
  // (the Korean and English lexikon pages are the site's top non-brand pages).
  const lexikonLanguages = slug => ({
    de: `${baseUrl}/lexikon/${slug}`,
    'x-default': `${baseUrl}/lexikon/${slug}`,
    ...Object.fromEntries(SUPPORTED_LANGS.map(l => [l, `${baseUrl}/lexikon/${l}/${slug}`])),
  })

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/app`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/medyra-summer-2026-update`,
      lastModified: new Date('2026-07-12'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/meet-the-founders`,
      lastModified: new Date('2026-07-12'),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/medyra-potsdam-transfer`,
      lastModified: new Date('2026-07-12'),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/medizinisches-lexikon-guide`,
      lastModified: new Date('2026-04-16'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/health-vault-profiles-guide`,
      lastModified: new Date('2026-04-16'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/doctor-visit-prep-germany`,
      lastModified: new Date('2026-04-11'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/arztbrief-verstehen-fur-senioren`,
      lastModified: new Date('2026-04-11'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/how-medyra-protects-your-medical-data`,
      lastModified: new Date('2026-04-04'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/how-to-read-lab-results-germany-expat`,
      lastModified: new Date('2026-04-02'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/what-is-tsh-and-why-does-it-matter`,
      lastModified: new Date('2026-04-02'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/understanding-your-blood-test-results`,
      lastModified: new Date('2026-04-02'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/verstehen`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/check`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/arztbrief`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/medikamente`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/entlassungsbericht`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/krankenkasse`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sprachen`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/prep`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/impressum`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/lexikon`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // German base lexikon pages (44 terms) with hreflang alternates
    ...lexikonSlugs.map(slug => ({
      url: `${baseUrl}/lexikon/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: { languages: lexikonLanguages(slug) },
    })),
    // Translated lexikon pages (16 languages x 44 terms). These are the
    // site's strongest organic performers; every one belongs in the sitemap.
    ...SUPPORTED_LANGS.flatMap(lang =>
      lexikonSlugs.map(slug => ({
        url: `${baseUrl}/lexikon/${lang}/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: lexikonLanguages(slug) },
      }))
    ),
  ]
}
