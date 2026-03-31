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

      <main className="container mx-auto px-4 py-16 max-w-xl text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Get in Touch</h1>
        <p className="text-gray-500 mb-10">We usually respond within 24 hours on business days.</p>

        <div className="space-y-4">
          <a
            href="mailto:contact@medyra.de"
            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <span className="text-2xl">✉️</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900">General enquiries</p>
              <p className="text-emerald-600 text-sm">contact@medyra.de</p>
            </div>
          </a>

          <a
            href="mailto:privacy@medyra.de"
            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🔒</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Privacy & GDPR requests</p>
              <p className="text-gray-500 text-sm">privacy@medyra.de</p>
            </div>
          </a>

          <a
            href="mailto:support@medyra.de"
            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🛠️</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Technical support</p>
              <p className="text-gray-500 text-sm">support@medyra.de</p>
            </div>
          </a>

          <a
            href="mailto:sales@medyra.de"
            className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🏥</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Clinic & enterprise enquiries</p>
              <p className="text-gray-500 text-sm">sales@medyra.de</p>
            </div>
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-10">
          Medyra · medyra.de · Made in Germany
        </p>
      </main>
    </div>
  )
}
