import { getAllSlugs, SUPPORTED_LANGS } from '@/lib/lexikon'

const BASE = 'https://medyra.de'

// Only routes that are public in middleware.js belong here. Submitting an
// auth-gated route makes Google report "Submitted URL not found (404)" and
// wastes crawl budget, so keep this list in sync when a route's access
// changes. Utility pages (sso-callback, forgot-password) are intentionally
// absent: they are reachable but carry no search value.
const MARKETING = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/check', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/lexikon', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/medplan', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/app', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/arztbrief', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/medikamente', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/entlassungsbericht', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/krankenkasse', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/verstehen', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/sprachen', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/sign-up', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/sign-in', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/impressum', changeFrequency: 'yearly', priority: 0.3 },
]

// Publication dates drive lastModified: a post that has not changed should not
// keep claiming it was updated today.
const POSTS = [
  { slug: 'medyra-summer-2026-update', date: '2026-07-12', priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'meet-the-founders', date: '2026-07-12', priority: 0.7, changeFrequency: 'yearly' },
  { slug: 'medyra-potsdam-transfer', date: '2026-07-12', priority: 0.7, changeFrequency: 'yearly' },
  { slug: 'medizinisches-lexikon-guide', date: '2026-04-16', priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'health-vault-profiles-guide', date: '2026-04-16', priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'doctor-visit-prep-germany', date: '2026-04-11', priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'arztbrief-verstehen-fur-senioren', date: '2026-04-11', priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'how-medyra-protects-your-medical-data', date: '2026-04-04', priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'how-to-read-lab-results-germany-expat', date: '2026-04-02', priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'what-is-tsh-and-why-does-it-matter', date: '2026-04-02', priority: 0.8, changeFrequency: 'monthly' },
  { slug: 'understanding-your-blood-test-results', date: '2026-04-02', priority: 0.8, changeFrequency: 'monthly' },
]

export default function sitemap() {
  const now = new Date()
  const slugs = getAllSlugs()

  // hreflang set for one lexikon term: German base URL + every translation.
  // Google uses these to rank the right language version in each country
  // (the Korean and English lexikon pages are the site's top non-brand pages).
  // Only the lexikon gets hreflang: every other page serves all 17 languages
  // from one cookie-selected URL, so there is no distinct URL to point at.
  const languagesFor = slug => ({
    de: `${BASE}/lexikon/${slug}`,
    'x-default': `${BASE}/lexikon/${slug}`,
    ...Object.fromEntries(SUPPORTED_LANGS.map(l => [l, `${BASE}/lexikon/${l}/${slug}`])),
  })

  return [
    ...MARKETING.map(p => ({
      url: `${BASE}${p.path}`,
      lastModified: now,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),

    ...POSTS.map(p => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),

    // German base lexikon pages with hreflang alternates
    ...slugs.map(slug => ({
      url: `${BASE}/lexikon/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: { languages: languagesFor(slug) },
    })),

    // Translated lexikon pages (16 languages x every term). These are the
    // site's strongest organic performers; every one belongs in the sitemap.
    ...SUPPORTED_LANGS.flatMap(lang =>
      slugs.map(slug => ({
        url: `${BASE}/lexikon/${lang}/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: languagesFor(slug) },
      }))
    ),
  ]
}
