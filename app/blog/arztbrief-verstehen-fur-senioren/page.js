import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'

export const metadata = {
  title: 'Ihren Arztbrief einfach verstehen — Medyra für Senioren | Medyra',
  description:
    'Befund, Arztbrief oder Entlassungsbericht erhalten und nicht verstanden? Medyra erklärt Ihren medizinischen Brief auf Deutsch, ohne Fachbegriffe — zum Lesen oder Vorlesen lassen.',
  alternates: { canonical: 'https://medyra.de/blog/arztbrief-verstehen-fur-senioren' },
  openGraph: {
    title: 'Ihren Arztbrief einfach verstehen — Medyra für Senioren',
    description:
      'Medyra übersetzt Ihren Befund oder Arztbrief in einfaches Deutsch. Kein Fachlatein, keine Verwirrung. Einfach hochladen — Erklärung erhalten.',
    url: 'https://medyra.de/blog/arztbrief-verstehen-fur-senioren',
  },
  keywords: [
    'Arztbrief verstehen',
    'Befund einfach erklärt',
    'Entlassungsbericht verstehen Senioren',
    'medizinische Befunde erklären lassen',
    'Medyra Senioren',
    'Arztbrief auf Deutsch erklärt',
    'Befund vorlesen lassen',
  ],
}

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">← Alle Artikel</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {['Für Senioren', 'Arztbrief', 'Deutsch', 'Befund'].map((tag) => (
              <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Ihren Arztbrief einfach verstehen — Medyra erklärt alles auf Deutsch
          </h1>
          <p className="text-gray-500 text-sm">11 April 2026 · 5 Min. Lesezeit · Von Medyra</p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">

          <p className="text-lg text-gray-600 leading-relaxed">
            Sie haben einen Brief vom Krankenhaus oder Arzt bekommen. Darin stehen Wörter wie{' '}
            <em>„linksventrikuläre Ejektionsfraktion"</em> oder{' '}
            <em>„Cholestase bei chronischer Hepatopathie"</em>. Sie haben keine Ahnung, was das bedeutet —
            und das ist vollkommen normal. Medizinisches Deutsch ist selbst für Muttersprachler schwer zu verstehen.
          </p>

          <p>
            Genau für diese Situation haben wir <strong>Medyra für Senioren</strong> entwickelt. Diese Seite
            erklärt Ihnen, was ein Arztbrief, Befund oder Entlassungsbericht ist, warum diese Dokumente so
            schwer zu lesen sind — und wie Medyra Ihnen helfen kann, alles zu verstehen, ohne einen Arzt anrufen
            zu müssen.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Was ist ein Arztbrief, Befund und Entlassungsbericht?</h2>

          <p>
            Im deutschen Gesundheitssystem gibt es drei häufige Arten von medizinischen Dokumenten, die Patienten
            erhalten — und alle drei sehen auf den ersten Blick ähnlich aus:
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 not-prose">
            <div>
              <p className="font-bold text-gray-900 mb-1">📄 Der Befund</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Das Ergebnis einer Untersuchung — zum Beispiel Bluttest, Röntgen, Ultraschall oder EKG. Der Befund
                zeigt Messwerte und markiert, welche Werte außerhalb des Normalbereichs liegen. Er kommt meist
                vom Labor oder einem Facharzt.
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">📋 Der Arztbrief</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ein Schreiben eines Facharztes oder Krankenhauses an Ihren Hausarzt. Er beschreibt, was bei Ihnen
                festgestellt wurde, welche Behandlung empfohlen wird und welche Medikamente Sie nehmen sollen.
                Oft erhalten Sie eine Kopie davon.
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">🏥 Der Entlassungsbericht</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Dieses Dokument erhalten Sie beim Verlassen des Krankenhauses. Es fasst zusammen, warum Sie
                aufgenommen wurden, was behandelt wurde, welche Medikamente Sie jetzt nehmen müssen und wann Sie
                zur Nachsorge müssen.
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Warum sind diese Dokumente so schwer zu lesen?</h2>

          <p>
            Arztbriefe und Befunde werden nicht für Patienten geschrieben — sie werden für Ärzte geschrieben.
            Mediziner haben eine eigene Sprache, die auf Latein und Griechisch basiert und in Deutschland besonders
            komprimiert formuliert wird. Ein einziger Satz kann mehrere Diagnosen, Behandlungen und Empfehlungen
            gleichzeitig enthalten.
          </p>

          <p>
            Dazu kommt: Selbst wenn Sie die einzelnen Wörter nachschlagen könnten, ist der Zusammenhang oft nicht
            klar. Was bedeutet „leicht erhöhter Troponin-Wert" für Ihren Alltag? Müssen Sie sofort handeln — oder
            ist das harmlos? Diese Fragen beantwortet der Brief meistens nicht.
          </p>

          <p>
            Das Ergebnis: Viele ältere Menschen warten auf den nächsten Arzttermin, nur um zu fragen, was im
            letzten Brief stand. Oder sie rufen ihre Kinder an, die dann selbst versuchen, es zu recherchieren.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Wie Medyra Ihnen hilft — Schritt für Schritt</h2>

          <p>
            Medyra ist ein KI-Dienst, der Ihren Arztbrief liest und Ihnen alles in einfachem Deutsch erklärt.
            Sie brauchen keine technischen Kenntnisse — nur Ihr Dokument und ein Gerät mit Internet.
          </p>

          <div className="space-y-6 not-prose">

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Gehen Sie zu medyra.de/verstehen</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Öffnen Sie auf Ihrem Handy, Tablet oder Computer die Adresse{' '}
                  <strong>medyra.de/verstehen</strong>. Die Seite ist extra mit großer Schrift gestaltet und
                  führt Sie Schritt für Schritt.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Dokument hochladen oder abfotografieren</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Sie können Ihren Arztbrief als PDF hochladen, falls er digital vorliegt. Wenn Sie nur den
                  Papierbrief haben: einfach mit dem Handy abfotografieren und das Foto hochladen. Das funktioniert
                  genauso gut.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Medyra liest und erklärt</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Das dauert etwa 30 Sekunden. Danach sehen Sie eine Zusammenfassung und eine Erklärung jedes
                  wichtigen Werts — in einfachem Deutsch, ohne Fachbegriffe. Zum Beispiel: statt
                  „Ejektionsfraktion 45 %" lesen Sie „Ihre Herzpumpleistung ist leicht eingeschränkt — sprechen
                  Sie mit Ihrem Arzt darüber."
                </p>
              </div>
            </div>

          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Die Vorlesen-Funktion: einfach zuhören</h2>

          <p>
            Wenn Lesen anstrengend ist — wegen Sehproblemen, Müdigkeit oder einfach weil es so viel auf einmal
            ist — gibt es bei Medyra eine besondere Funktion: den <strong>„Vorlesen lassen"</strong>-Knopf.
          </p>

          <p>
            Nachdem Ihr Dokument erklärt wurde, sehen Sie einen großen grünen Knopf mit der Aufschrift{' '}
            <strong>„Vorlesen lassen"</strong>. Wenn Sie darauf drücken, liest Ihnen Ihr Gerät die gesamte
            Erklärung laut vor — in klarem Deutsch, etwas langsamer als normal, damit alles gut verständlich ist.
          </p>

          <p>
            Sie können die Vorlesung jederzeit stoppen, indem Sie erneut auf den Knopf drücken. Es gibt keine
            Einstellungen, die Sie verstehen müssen — es funktioniert einfach.
          </p>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 not-prose">
            <p className="font-semibold text-emerald-800 mb-2">Das kann Medyra vorlesen:</p>
            <ul className="space-y-1 text-sm text-emerald-700">
              <li>✓ Die Zusammenfassung Ihres Befunds in einem kurzen Absatz</li>
              <li>✓ Jeden einzelnen Wert mit Erklärung (z. B. was „Ferritin erniedrigt" bedeutet)</li>
              <li>✓ Fragen, die Sie beim nächsten Arzttermin stellen könnten</li>
            </ul>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Ausdrucken und zum Arzt mitnehmen</h2>

          <p>
            Auf der Ergebnisseite finden Sie einen Knopf zum Drucken. Die ausgedruckte Erklärung können Sie
            beim nächsten Termin mitbringen — und Ihrem Arzt zeigen, wenn Sie Fragen haben. Viele Patienten
            nutzen Medyra genau so: einmal vor dem Termin hochladen, ausdrucken, mitnehmen.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Datenschutz: Ihre Daten sind sicher</h2>

          <p>
            Wir verstehen, dass medizinische Dokumente sehr persönliche Informationen enthalten. Deshalb
            nimmt Medyra Datenschutz ernst:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Alle Dokumente werden <strong>verschlüsselt gespeichert</strong> — niemand anderes kann sie lesen</li>
            <li>Ihre Daten werden <strong>nicht an Dritte weitergegeben</strong></li>
            <li>Medyra ist <strong>DSGVO-konform</strong> und folgt deutschem Datenschutzrecht</li>
            <li>Dokumente werden nach 30 Tagen automatisch gelöscht</li>
          </ul>

          <p>
            Bevor Ihr erstes Dokument hochgeladen wird, werden Sie um Ihre ausdrückliche Zustimmung gebeten.
            Sie können diese Zustimmung jederzeit widerrufen.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Für Kinder und Angehörige: Link weiterschicken</h2>

          <p>
            Wenn Ihre Eltern oder Großeltern einen Befund erhalten haben und Hilfe brauchen — schicken Sie
            ihnen einfach diesen Link: <strong>medyra.de/verstehen</strong>
          </p>

          <p>
            Die Seite ist bewusst so einfach gestaltet, dass auch ältere Menschen ohne Computererfahrung sie
            problemlos nutzen können. Großer Text, wenige Knöpfe, klare Anweisungen auf Deutsch.
          </p>

          <p>
            Alternativ können Sie auch das Dokument Ihrer Eltern selbst hochladen und ihnen dann die erklärte
            Version ausdrucken oder vorlesen.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Was Medyra nicht ist</h2>

          <p>
            Medyra ist kein Arzt und ersetzt keine medizinische Beratung. Die Erklärungen helfen Ihnen,
            Ihren Befund besser zu verstehen — aber sie sind keine Diagnose und keine Behandlungsempfehlung.
            Bei ernsthaften Fragen wenden Sie sich bitte immer an Ihren Arzt.
          </p>

          <div className="bg-gray-900 rounded-2xl p-7 text-center not-prose mt-10">
            <p className="text-white font-bold text-xl mb-2">Probieren Sie es jetzt aus</p>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              Kostenlos · Auf Deutsch · 3 Befunde gratis · Keine Kreditkarte nötig
            </p>
            <Link
              href="/verstehen"
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors"
            >
              Jetzt Dokument hochladen →
            </Link>
          </div>

        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 mt-8">
        © 2026 Medyra ·{' '}
        <Link href="/privacy" className="hover:text-gray-600">Datenschutz</Link> ·{' '}
        <Link href="/terms" className="hover:text-gray-600">Nutzungsbedingungen</Link>
      </footer>
    </div>
  )
}
