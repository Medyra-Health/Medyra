// /verstehen is a client component, so its metadata lives here. The page is
// the senior-facing entry point (large type, German UI, read-aloud), so the
// copy targets plain German "Arztbrief verstehen" queries.
export const metadata = {
  title: 'Arztbrief vorlesen lassen: Hilfe für Senioren',
  description:
    'Arztbrief oder Laborbefund hochladen und in einfacher Sprache erklärt bekommen, ohne Fachbegriffe. Große Schrift, Vorlesefunktion und Erklärungen in 17 Sprachen. Besonders für Seniorinnen und Senioren.',
  keywords: [
    'Arztbrief verstehen',
    'Arztbrief einfach erklärt',
    'Befund verstehen',
    'Laborbefund erklärt',
    'medizinische Fachbegriffe übersetzen',
    'Arztbrief vorlesen lassen',
    'Befunddolmetscher',
    'Arztbrief für Senioren',
  ],
  alternates: { canonical: 'https://medyra.de/verstehen' },
  openGraph: {
    type: 'website',
    url: 'https://medyra.de/verstehen',
    title: 'Ihr Arztbrief, einfach erklärt',
    description:
      'Befund hochladen, Erklärung in einfacher Sprache erhalten. Große Schrift, Vorlesefunktion, 17 Sprachen.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arztbrief verstehen | Medyra',
    description: 'Befund hochladen und in einfacher Sprache erklärt bekommen. Mit Vorlesefunktion.',
  },
}

export default function VerstehenLayout({ children }) {
  return children
}
