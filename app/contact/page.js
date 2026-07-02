import Link from 'next/link'
import Image from 'next/image'
import { Mail, MessageSquare, Clock, Building2, MapPin, Stethoscope, Rocket } from 'lucide-react'

export const metadata = {
  title: 'Contact, Medyra',
  description: 'Get in touch with the Medyra founders. Direct access for questions, feedback, partnerships, and support.',
}

const founders = [
  {
    name: 'Mohammad Abralur Rahman Akash',
    role: 'Co-Founder & CEO',
    photo: '/team/akash-rahman.jpg',
    icon: Rocket,
    bio: 'Product, technology, and partnerships. Your direct line for anything Medyra: questions, ideas, or collaboration.',
    email: 'abralur28@gmail.com',
  },
  {
    name: 'Philipp Mattar',
    role: 'Co-Founder & CMO · Chief Medical Officer',
    photo: '/team/phillip-mattar.jpg',
    icon: Stethoscope,
    bio: 'Drives product, partnerships, and strategy together with Akash, and leads the medical side, making sure every explanation is clinically accurate and trustworthy.',
    email: 'Philipp.Mattar@student.hpi.uni-potsdam.de',
  },
]

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

      <main className="container mx-auto px-4 py-20 max-w-4xl">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-black text-[#0B1F17] mb-3" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Get in Touch</h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
            No ticket systems, no chatbots. Write to us directly. We read every message and reply personally.
          </p>
        </div>

        {/* Founders */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">The people behind Medyra</p>
          <h2 className="text-2xl font-black text-gray-900">Meet the Founders</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-14">
          {founders.map((founder) => (
            <div
              key={founder.name}
              className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-100 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                <Image
                  src={founder.photo}
                  alt={`${founder.name}, ${founder.role}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="text-white font-black text-lg leading-tight drop-shadow">{founder.name}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                  <founder.icon className="h-3.5 w-3.5" />
                  {founder.role}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">{founder.bio}</p>

                {founder.email ? (
                  <a
                    href={`mailto:${founder.email}`}
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors w-full justify-center"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{founder.email}</span>
                  </a>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 font-semibold text-sm px-4 py-2.5 rounded-xl w-full justify-center select-none">
                    <Mail className="h-4 w-4" />
                    Direct email coming soon
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* General enquiries + response time */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">General Enquiries</p>
                <p className="text-xs text-gray-500 font-medium">Company email</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              For billing, data privacy, GDPR requests, or press enquiries.
            </p>
            <div className="inline-flex items-center gap-2 bg-gray-200 text-gray-500 font-semibold text-sm px-4 py-2.5 rounded-xl w-full justify-center cursor-not-allowed select-none">
              <Mail className="h-4 w-4" />
              contact@medyra.de
              <span className="text-[10px] bg-gray-300 text-gray-500 px-1.5 py-0.5 rounded-full font-bold ml-1">SOON</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-bold text-blue-900 text-sm">We reply within 1 business day</p>
                <p className="text-xs text-blue-600 font-medium">Usually much faster</p>
              </div>
            </div>
            <p className="text-sm text-blue-800/70 leading-relaxed inline-flex items-start gap-1.5">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              Based in Potsdam, Germany · CET timezone
            </p>
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
