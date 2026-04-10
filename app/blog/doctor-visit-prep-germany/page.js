import Link from 'next/link'
import MedyraLogo from '@/components/MedyraLogo'

export const metadata = {
  title: 'How to Prepare for a Doctor\'s Appointment in Germany — Medyra Doctor Visit | Medyra',
  description:
    'Medyra\'s Doctor Visit feature lets you describe your symptoms in any language and generates a structured German summary your doctor can read in seconds. Here\'s how it works.',
  alternates: { canonical: 'https://medyra.de/blog/doctor-visit-prep-germany' },
  openGraph: {
    title: 'How to Prepare for a Doctor\'s Appointment in Germany — Medyra Doctor Visit',
    description:
      'Describe your symptoms in English, Arabic, Hindi, or any language — Medyra turns it into a professional German clinical summary for your doctor.',
    url: 'https://medyra.de/blog/doctor-visit-prep-germany',
  },
  keywords: [
    'doctor appointment Germany expat',
    'Arzttermin vorbereiten',
    'describe symptoms in German',
    'doctor visit Germany English',
    'Medyra Doctor Visit',
    'prepare for doctor Germany',
    'symptoms in German',
  ],
}

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><MedyraLogo size="md" /></Link>
          <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">← All articles</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {['Doctor Visit', 'Germany', 'Expat', 'Symptoms'].map((tag) => (
              <span key={tag} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            How to Prepare for a Doctor&apos;s Appointment in Germany — Medyra Doctor Visit
          </h1>
          <p className="text-gray-500 text-sm">11 April 2026 · 6 min read · By Medyra</p>
        </div>

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">

          <p className="text-lg text-gray-600 leading-relaxed">
            You have a German doctor&apos;s appointment next week. You know something is wrong — a persistent
            headache, chest tightness, fatigue that started three months ago — but you have no idea how to
            explain it in German. Not fluently. Not in the formal, clinical language a doctor expects.
            Even confident German speakers freeze up in medical appointments.
          </p>

          <p>
            Medyra&apos;s <strong>Doctor Visit</strong> feature solves this. You describe what&apos;s going on in
            whatever language feels natural, and Medyra produces a structured German clinical summary your
            doctor can read in under a minute — the kind of document that makes appointments faster, clearer,
            and more productive.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">The real problem with German medical appointments</h2>

          <p>
            In Germany, appointments are often short — 10 to 15 minutes is standard for a Kassenarzt. That
            is not a lot of time to explain a complex or ongoing problem, especially when you&apos;re also translating
            in your head.
          </p>

          <p>
            What tends to happen: you get to the appointment, panic, forget half of what you wanted to say, use
            the wrong German word, and leave without having explained the thing that actually worried you most.
            The doctor writes a brief note. You walk away unsatisfied. You are not alone — this is extremely common
            among expats, international students, and anyone not living in their first language.
          </p>

          <p>
            The solution is not to learn more German. The solution is to arrive prepared.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">What Medyra Doctor Visit actually does</h2>

          <p>
            Medyra Doctor Visit is a guided conversation that produces a written German clinical summary. You
            access it at <strong>medyra.de/prep</strong>. Here is what happens:
          </p>

          <div className="space-y-5 not-prose">

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-violet-500 text-white font-bold text-base flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Choose your category</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  You start by picking what kind of appointment this is. The four options are:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  <li><span className="font-semibold">Symptoms</span> — something new is wrong and you want to explain it</li>
                  <li><span className="font-semibold">Existing diagnosis</span> — you have a known condition and need follow-up</li>
                  <li><span className="font-semibold">Lab results</span> — you received a Befund and want to discuss specific values</li>
                  <li><span className="font-semibold">General question</span> — medication, referrals, specialist recommendations, anything else</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-violet-500 text-white font-bold text-base flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Have a conversation — in any language</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Medyra asks you questions tailored to your category. How long have you had this symptom?
                  Does anything make it better or worse? Any relevant medical history? You answer freely —
                  in English, Arabic, Hindi, Turkish, French, or any of the 18 supported languages.
                  No formal writing required. You can describe things the way you would to a friend.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mt-2">
                  Suggestion chips appear below each response to help if you are not sure what to add next.
                  When you feel you have covered everything, you click <strong>&quot;I&apos;m ready — create summary&quot;</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-violet-500 text-white font-bold text-base flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Receive a structured German summary</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Medyra generates a formal German clinical document — the kind of structured summary a GP
                  or specialist can read immediately. It covers your chief complaints (<em>Hauptbeschwerden</em>),
                  timeline, relevant medical history, current medications, and suggested questions for your doctor.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-violet-500 text-white font-bold text-base flex items-center justify-center flex-shrink-0">4</div>
              <div>
                <p className="font-bold text-gray-900 mb-1">Print and bring it to your appointment</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  One button prints a clean A4 summary with the Medyra header. Hand it to your doctor at
                  the start of your visit. This single action changes the dynamic of the appointment — your
                  doctor immediately understands what you came for, without you having to struggle through
                  an explanation in German.
                </p>
              </div>
            </div>

          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8">What the output looks like</h2>

          <p>
            Here is an example of what Medyra generates. The input was a description in English of recurring
            headaches and dizziness — roughly: &quot;I&apos;ve been getting bad headaches every morning for about three
            weeks, worse when I stand up, and I take Metformin for my blood sugar.&quot;
          </p>

          <div className="bg-gray-950 rounded-2xl p-6 font-mono text-xs space-y-4 not-prose">
            <div>
              <p className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] mb-2">Hauptbeschwerden</p>
              <p className="text-gray-300">· Der Patient berichtet über Kopfschmerzen seit ca. 3 Wochen mit morgendlicher Verstärkung.</p>
              <p className="text-gray-300">· Schwindel beim Aufstehen aus liegender oder sitzender Position (orthostatische Komponente möglich).</p>
            </div>
            <div>
              <p className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] mb-2">Relevante Vorgeschichte</p>
              <p className="text-gray-300">Bekannter Diabetes mellitus Typ 2. Tägliche Einnahme von Metformin (Dosierung nicht angegeben).</p>
            </div>
            <div>
              <p className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] mb-2">Fragen an den Arzt</p>
              <p className="text-gray-300">1. Könnte der Schwindel mit der Metformin-Einnahme in Zusammenhang stehen?</p>
              <p className="text-gray-300">2. Welche Untersuchungen sind bei diesen Beschwerden empfehlenswert?</p>
            </div>
            <p className="text-gray-600 text-[10px] italic border-t border-gray-800 pt-3">
              Dieses Dokument wurde zur Kommunikation erstellt und stellt keine medizinische Diagnose dar.
            </p>
          </div>

          <p>
            A document like this takes a GP less than 30 seconds to read. You have communicated more clearly
            in writing than most patients manage verbally in a full appointment — in the right language, in the
            right format.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Who is this for?</h2>

          <p>
            Doctor Visit was built for anyone who has ever dreaded a German medical appointment because of the
            language barrier. That includes:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>
              <strong>Expats and international workers</strong> — you speak good German day-to-day, but medical
              vocabulary is a different register entirely
            </li>
            <li>
              <strong>International students</strong> — especially in the first year, before you have found your
              feet in the German health system
            </li>
            <li>
              <strong>Migrants and refugees</strong> — who may have had little formal medical contact in German
              so far
            </li>
            <li>
              <strong>Families with elderly relatives</strong> — you can complete the intake on behalf of a parent
              or grandparent who cannot use the app themselves
            </li>
            <li>
              <strong>Anyone with a complex condition</strong> — even native German speakers benefit from having
              a written summary ready before a short appointment
            </li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Languages supported</h2>

          <p>
            You can describe your symptoms and answer questions in any of the following languages:
          </p>

          <div className="flex flex-wrap gap-2 not-prose">
            {[
              'English', 'Deutsch', 'Français', 'Español', 'Italiano',
              'Português', 'Nederlands', 'Polski', 'Türkçe', 'Русский',
              'العربية', '中文', '日本語', '한국어', 'हिन्दी', 'বাংলা', 'اردو',
            ].map(lang => (
              <span key={lang} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{lang}</span>
            ))}
          </div>

          <p>
            The output summary is always in formal German — ready to hand directly to your doctor.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">How many summaries can I create?</h2>

          <p>
            The free plan includes one Doctor Visit summary per month. Paid plans (Personal and Family) include
            unlimited summaries, along with unlimited report uploads. You can see all current plans at{' '}
            <Link href="/pricing" className="text-emerald-600 hover:underline">medyra.de/pricing</Link>.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Important: this is not medical advice</h2>

          <p>
            Medyra is a communication tool, not a diagnostic service. The summary it generates is based on what
            you tell it — it does not examine you, and it cannot diagnose anything. Its job is to help you
            communicate clearly with the doctor who will.
          </p>

          <p>
            If you are experiencing a medical emergency, call <strong>112</strong> immediately.
          </p>

          <div className="bg-gray-900 rounded-2xl p-7 text-center not-prose mt-10">
            <p className="text-white font-bold text-xl mb-2">Try Doctor Visit before your next appointment</p>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              Free · Works in 17 languages · Takes about 5 minutes · Print-ready output
            </p>
            <Link
              href="/prep"
              className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors"
            >
              Open Doctor Visit →
            </Link>
          </div>

        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 mt-8">
        © 2026 Medyra ·{' '}
        <Link href="/privacy" className="hover:text-gray-600">Privacy</Link> ·{' '}
        <Link href="/terms" className="hover:text-gray-600">Terms</Link>
      </footer>
    </div>
  )
}
