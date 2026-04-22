import Link from 'next/link'

export const metadata = {
  title: 'Impressum',
  description: 'Legal notice for Medyra — Angaben gemäß § 5 TMG.',
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
        <p className="text-gray-500 text-sm mb-10">Angaben gemäß § 5 TMG</p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Verantwortlich für den Inhalt</h2>
            <p>Mohammad Abralur Rahman Akash</p>
            <p className="text-gray-500 text-xs mt-1">Founder &amp; CEO, Medyra</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Kontakt / Contact</h2>
            <p>
              E-Mail:{' '}
              <a href="mailto:contact@medyra.de" className="text-emerald-600 hover:underline">
                contact@medyra.de
              </a>
            </p>
            <p>Website: <a href="https://medyra.de" className="text-emerald-600 hover:underline">medyra.de</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Inhaltlich Verantwortlicher gemäß § 55 Abs. 2 RStV</h2>
            <p>Mohammad Abralur Rahman Akash (Anschrift wie oben)</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Haftungsausschluss / Disclaimer</h2>
            <p className="mb-3">
              <strong>Haftung für Inhalte:</strong> Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir keine Gewähr übernehmen. Medyra ist ein Bildungsangebot und ersetzt keine ärztliche Beratung.
            </p>
            <p>
              <strong>Haftung für Links:</strong> Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Urheberrecht / Copyright</h2>
            <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
          </section>

          <section className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
            <strong>Note:</strong> Medyra is an early-stage product. VAT registration and full business registration details will be added once formal incorporation is complete.
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
