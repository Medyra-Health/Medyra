import DocumentFeaturePage from '@/components/DocumentFeaturePage'
import { getPageLocale, pickContent } from '@/lib/pageLocale'
import { CONTENT } from './content'

export const metadata = {
  title: 'Entlassungsbericht verstehen: Krankenhausbericht einfach erklärt | Medyra',
  description:
    'Entlassungsbericht aus dem Krankenhaus voller Abkürzungen und Fachbegriffe? Medyra erklärt Diagnosen, Therapien und Nachsorge-Anweisungen in verständlicher Sprache. In unter 60 Sekunden.',
  alternates: { canonical: 'https://medyra.de/entlassungsbericht' },
  openGraph: {
    title: 'Entlassungsbericht verstehen: Krankenhausbericht einfach erklärt',
    description: 'Medyra erklärt Krankenhausberichte und Entlassungsbriefe in verständlicher Sprache.',
    url: 'https://medyra.de/entlassungsbericht',
  },
}

export default async function EntlassungsberichtPage() {
  const locale = await getPageLocale()
  return (
    <DocumentFeaturePage
      tone="blue"
      uploadHref="/upload?type=letter"
      current="/entlassungsbericht"
      pageName="Entlassungsbericht verstehen"
      locale={locale}
      content={pickContent(CONTENT, locale)}
    />
  )
}
