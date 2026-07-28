import DocumentFeaturePage from '@/components/DocumentFeaturePage'
import { getPageLocale, pickContent } from '@/lib/pageLocale'
import { CONTENT } from './content'

export const metadata = {
  // Leads with "Rezept" so this page does not compete with /medplan, which
  // owns "Medikationsplan erstellen". The term stays in the description.
  title: 'Medikamente und Rezept verstehen: einfach erklärt',
  description:
    'Medikationsplan oder Rezept voller Abkürzungen? Medyra erklärt jedes Medikament: wofür es ist, wie Sie es einnehmen und worauf Sie achten sollten. In unter 60 Sekunden.',
  alternates: { canonical: 'https://medyra.de/medikamente' },
  openGraph: {
    title: 'Medikationsplan verstehen: Medikamente einfach erklärt',
    description: 'Medyra erklärt Medikationspläne und Rezepte in verständlicher Sprache.',
    url: 'https://medyra.de/medikamente',
  },
}

export default async function MedikamentePage() {
  const locale = await getPageLocale()
  return (
    <DocumentFeaturePage
      tone="indigo"
      uploadHref="/upload?type=medication"
      current="/medikamente"
      pageName="Medikamente verstehen"
      locale={locale}
      content={pickContent(CONTENT, locale)}
    />
  )
}
