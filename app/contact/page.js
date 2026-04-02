import Link from 'next/link'

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with the Medyra team.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 text-sm">← Back to Medyra</Link>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600 text-sm font-medium">Contact</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
          🚀
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Contact page coming soon</h1>
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          We are setting up a proper contact form. In the meantime, reach us directly by email.
        </p>

        <a
          href="mailto:contact@medyra.de"
          className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
        >
          <span>✉️</span>
          contact@medyra.de
        </a>

        <p className="text-xs text-gray-400 mt-10">
          We usually respond within one business day.
        </p>
      </main>
    </div>
  )
}
