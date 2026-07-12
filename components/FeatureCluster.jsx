import Link from 'next/link'

// The "understanding" topic cluster. Cross links every feature page with the
// others so link equity flows through the whole cluster, and emits a
// BreadcrumbList for the current page. Server component, German copy
// (these pages target German search).
const CLUSTER = [
  { href: '/check', icon: '🧪', title: 'Laborwerte sofort checken', desc: 'Wert eintippen und direkt sehen, ob er im Normalbereich liegt.' },
  { href: '/arztbrief', icon: '📋', title: 'Arztbriefe entschlüsseln', desc: 'Befunde und Fachbegriffe in klare Sprache übersetzt.' },
  { href: '/entlassungsbericht', icon: '🏥', title: 'Krankenhausberichte verstehen', desc: 'Was im Krankenhaus passiert ist und was jetzt zu tun ist.' },
  { href: '/medikamente', icon: '💊', title: 'Medikamente klar erklärt', desc: 'Medikationsplan verstehen: wofür, wie einnehmen, worauf achten.' },
  { href: '/krankenkasse', icon: '📬', title: 'Kassenbriefe ohne Amtsdeutsch', desc: 'Bescheide, Fristen und Zuzahlungen verständlich gemacht.' },
  { href: '/sprachen', icon: '🌍', title: 'Erklärt in 17 Sprachen', desc: 'Deutsche Befunde in Ihrer Muttersprache verstehen.' },
]

export default function FeatureCluster({ current, pageName }) {
  const others = CLUSTER.filter(c => c.href !== current)
  const self = CLUSTER.find(c => c.href === current)

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Medyra', item: 'https://medyra.de' },
      { '@type': 'ListItem', position: 2, name: pageName || self?.title || 'Verstehen', item: `https://medyra.de${current}` },
    ],
  }

  return (
    <section className="py-16 md:py-20 bg-white border-t border-gray-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Mehr verstehen</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#0B1F17]">
            Medyra erklärt noch mehr
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {others.map(c => (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-2xl border border-gray-200 bg-white p-5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 transition-all"
            >
              <span className="text-2xl">{c.icon}</span>
              <h3 className="font-bold text-[#0B1F17] text-sm mt-3 mb-1 group-hover:text-emerald-700 transition-colors">
                {c.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
