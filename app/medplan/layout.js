// /medplan is a client component, so its metadata lives here (same pattern as
// /pricing and /app). Targets the German "Medikationsplan" queries first, since
// the 1-0-1-0 scheme and the printable plan are German standards.
export const metadata = {
  title: 'Medikationsplan kostenlos erstellen und ausdrucken',
  description:
    'Kostenloser Medikationsplan: Medikamente im 1-0-1-0 Schema eintragen, Einnahme morgens, mittags, abends und nachts abhaken, Erinnerungen per Kalender oder E-Mail und den Plan ausdrucken. In 17 Sprachen, ohne Kosten.',
  keywords: [
    'Medikationsplan',
    'Medikationsplan kostenlos',
    'Medikamentenplan',
    'Tablettenplan',
    'Einnahmeplan Medikamente',
    'Medikationsplan erstellen',
    'Medikationsplan Vorlage',
    '1-0-1-0 Schema',
    'Medikamentenplan App',
    'Tabletten Erinnerung',
    'medication plan',
    'medication tracker',
    'pill reminder',
  ],
  alternates: { canonical: 'https://medyra.de/medplan' },
  openGraph: {
    type: 'website',
    url: 'https://medyra.de/medplan',
    title: 'Medikationsplan kostenlos: Tabletten im 1-0-1-0 Schema planen',
    description:
      'Medikamente eintragen, tages-, wochen- und monatsweise planen, Einnahme abhaken und den Plan ausdrucken. Kostenlos, in 17 Sprachen.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medikationsplan kostenlos erstellen | Medyra',
    description:
      'Tabletten im 1-0-1-0 Schema planen, abhaken und ausdrucken. Kostenlos, in 17 Sprachen.',
  },
}

export default function MedplanLayout({ children }) {
  return children
}
