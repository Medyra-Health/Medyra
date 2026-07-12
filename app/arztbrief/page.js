import DocumentFeaturePage from '@/components/DocumentFeaturePage'
import { getPageLocale, pickContent } from '@/lib/pageLocale'
import { CONTENT } from './content'

export const metadata = {
  title: 'Arztbrief verstehen: Befund einfach erklärt in 60 Sekunden | Medyra',
  description:
    'Arztbrief, Entlassungsbericht oder MRT-Befund voller Fachbegriffe? Medyra übersetzt jedes medizinische Dokument in verständliche Sprache. DSGVO-konform, in unter 60 Sekunden.',
  alternates: { canonical: 'https://medyra.de/arztbrief' },
  openGraph: {
    title: 'Arztbrief verstehen: Befund einfach erklärt',
    description: 'Medyra übersetzt Arztbriefe, Entlassungsberichte und Radiologie-Befunde in verständliche Sprache.',
    url: 'https://medyra.de/arztbrief',
  },
}

export default async function ArztbriefPage() {
  const locale = await getPageLocale()
  return (
    <DocumentFeaturePage
      tone="blue"
      uploadHref="/upload?type=letter"
      current="/arztbrief"
      pageName="Arztbrief verstehen"
      locale={locale}
      content={pickContent(CONTENT, locale)}
    />
  )
}
