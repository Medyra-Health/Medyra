import DocumentFeaturePage from '@/components/DocumentFeaturePage'
import { getPageLocale, pickContent } from '@/lib/pageLocale'
import { CONTENT } from './content'

export const metadata = {
  title: 'Krankenkassen-Brief verstehen: Bescheide einfach erklärt | Medyra',
  description:
    'Bescheid, Ablehnung oder Zuzahlungsbrief von der Krankenkasse und nichts verstanden? Medyra übersetzt Amtsdeutsch in klare Sprache: was drinsteht, was es für Sie bedeutet und was Sie jetzt tun müssen.',
  alternates: { canonical: 'https://medyra.de/krankenkasse' },
  openGraph: {
    title: 'Krankenkassen-Brief verstehen: Bescheide einfach erklärt',
    description: 'Medyra erklärt Briefe und Bescheide der Krankenkasse in verständlicher Sprache.',
    url: 'https://medyra.de/krankenkasse',
  },
}

export default async function KrankenkassePage() {
  const locale = await getPageLocale()
  return (
    <DocumentFeaturePage
      tone="amber"
      uploadHref="/upload?type=insurance"
      current="/krankenkasse"
      pageName="Krankenkasse verstehen"
      locale={locale}
      content={pickContent(CONTENT, locale)}
    />
  )
}
