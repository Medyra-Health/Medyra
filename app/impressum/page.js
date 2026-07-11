import Link from 'next/link'

export const metadata = {
  title: 'Impressum',
  description: 'Legal notice for Medyra — Angaben gemäß § 5 DDG.',
}

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 text-sm">← Back to Medyra</Link>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600 text-sm font-medium">Impressum</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Impressum</h1>
        <p className="text-gray-500 text-sm mb-10">Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Diensteanbieter</h2>
            <p>Medyra ist ein Angebot von:</p>
            <p className="mt-2">Mohammad Abralur Rahman Akash und Dr. med. Philipp Mattar</p>
            <p className="text-gray-500 text-xs mt-1">Gemeinschaftlich betrieben (Gesellschaft bürgerlichen Rechts)</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Anschrift</h2>
            <p className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
              Die ladungsfähige Geschäftsanschrift am Standort Potsdam Transfer, Universität Potsdam,
              Campus Griebnitzsee, wird derzeit eingerichtet und hier ergänzt, sobald der Vertrag
              abgeschlossen ist. Bis dahin erreichen Sie uns unter{' '}
              <a href="mailto:hello@medyra.de" className="underline font-semibold">hello@medyra.de</a>.
              <br />
              <span className="font-semibold">Platzhalter: vor endgültiger Veröffentlichung durch die vollständige Anschrift ersetzen.</span>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Kontakt / Contact</h2>
            <p>
              E-Mail:{' '}
              <a href="mailto:hello@medyra.de" className="text-emerald-600 hover:underline">
                hello@medyra.de
              </a>
            </p>
            <p>Website: <a href="https://medyra.de" className="text-emerald-600 hover:underline">medyra.de</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV</h2>
            <p>Mohammad Abralur Rahman Akash (Anschrift wie oben)</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Umsatzsteuer</h2>
            <p>
              Es besteht derzeit keine Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG. Als Kleinunternehmer
              im Sinne des § 19 UStG wird keine Umsatzsteuer ausgewiesen. Eine Handelsregistereintragung besteht
              nicht.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Verbraucherstreitbeilegung</h2>
            <p>
              Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle im Sinne des § 36 VSBG teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Medizinischer Hinweis</h2>
            <p>
              Medyra ist ein Bildungsangebot, das medizinische Dokumente in einfacher Sprache erklärt. Es stellt
              keine medizinische Beratung, Diagnose oder Behandlungsempfehlung dar und ersetzt nicht das Gespräch
              mit einer Ärztin oder einem Arzt. Medyra erbringt keine ärztlichen Leistungen im Sinne der
              Heilberufe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Haftungsausschluss / Disclaimer</h2>
            <p className="mb-3">
              <strong>Haftung für Inhalte:</strong> Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
            </p>
            <p>
              <strong>Haftung für Links:</strong> Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Urheberrecht / Copyright</h2>
            <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Förderung</h2>
            <p>Medyra wird von Potsdam Transfer, dem Gründungsservice der Universität Potsdam, unterstützt.</p>
          </section>

        </div>
      </main>

      <footer className="border-t bg-gray-50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-gray-400">
          <div className="flex justify-center gap-6 mb-2">
            <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
            <Link href="/impressum" className="text-emerald-600">Impressum</Link>
            <Link href="/contact" className="hover:text-gray-600">Contact</Link>
          </div>
          © 2026 Medyra. Made with care in Germany.
        </div>
      </footer>
    </div>
  )
}
