import Link from 'next/link'
import { Mail, MessageSquare, Clock, Building2 } from 'lucide-react'

export const metadata = {
  title: 'Contact, Medyra',
  description: 'Get in touch with the Medyra team. Direct founder access for questions, feedback, and support.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">← Back to Medyra</Link>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600 text-sm">Contact</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 max-w-2xl">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">Get in Touch</h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
            Have a question, feedback, or need support? We read every message and reply personally.
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">

          {/* Founder direct */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-black text-sm">AR</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Mohammad Abralur Rahman Akash</p>
                <p className="text-xs text-emerald-600 font-semibold">Founder & CEO</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Direct line to the founder. Questions about the product, partnerships, or anything else, reach out.
            </p>
            <a
              href="mailto:abralur28@gmail.com"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors w-full justify-center"
            >
              <Mail className="h-4 w-4" />
              abralur28@gmail.com
            </a>
          </div>

          {/* General support */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">General Enquiries</p>
                <p className="text-xs text-gray-500 font-medium">Company email</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              For billing, data privacy, GDPR requests, or press enquiries. Company email coming soon.
            </p>
            <div className="inline-flex items-center gap-2 bg-gray-200 text-gray-500 font-semibold text-sm px-4 py-2.5 rounded-xl w-full justify-center cursor-not-allowed select-none">
              <Mail className="h-4 w-4" />
              contact@medyra.de
              <span className="text-[10px] bg-gray-300 text-gray-500 px-1.5 py-0.5 rounded-full font-bold ml-1">SOON</span>
            </div>
          </div>
        </div>

        {/* Response time */}
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-10">
          <Clock className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900">We reply within 1 business day</p>
            <p className="text-xs text-blue-600 mt-0.5">Based in Germany · CET timezone</p>
          </div>
        </div>

        {/* FAQ nudge */}
        <div className="text-center text-sm text-gray-400">
          Looking for data & privacy info?{' '}
          <Link href="/privacy" className="text-emerald-600 hover:underline font-medium">Privacy Policy</Link>
          {' '}·{' '}
          <Link href="/terms" className="text-emerald-600 hover:underline font-medium">Terms of Service</Link>
        </div>
      </main>
    </div>
  )
}
