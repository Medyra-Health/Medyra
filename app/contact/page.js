import Link from 'next/link'
import Image from 'next/image'
import { Mail, MessageSquare, Clock, Building2, MapPin, Stethoscope, Rocket } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import AppHeader from '@/components/AppHeader'

export async function generateMetadata() {
  const t = await getTranslations('contact')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function ContactPage() {
  const t = await getTranslations('contact')

  const founders = [
    {
      name: 'Mohammad Abralur Rahman Akash',
      role: t('akashRole'),
      photo: '/team/akash-rahman.jpg',
      icon: Rocket,
      bio: t('akashBio'),
      email: 'akash@medyra.de',
    },
    {
      name: 'Dr. med. Philipp Mattar',
      role: t('philippRole'),
      photo: '/team/phillip-mattar.jpg',
      icon: Stethoscope,
      bio: t('philippBio'),
      email: 'philipp@medyra.de',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <AppHeader back={{ href: '/', label: 'Back to Medyra' }} title="Contact" tone="emerald" />

      <main className="container mx-auto px-4 py-20 max-w-4xl">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-black text-[#0B1F17] mb-3" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>{t('heroTitle')}</h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
            {t('heroSub')}
          </p>
        </div>

        {/* Founders */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">{t('peopleLabel')}</p>
          <h2 className="text-2xl font-black text-gray-900">{t('meetTitle')}</h2>
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
                    {t('emailComingSoon')}
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
                <p className="font-bold text-gray-900 text-sm">{t('generalEnquiries')}</p>
                <p className="text-xs text-gray-500 font-medium">{t('companyEmail')}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {t('generalDesc')}
            </p>
            <a
              href="mailto:hello@medyra.de"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl w-full justify-center transition-colors"
            >
              <Mail className="h-4 w-4" />
              hello@medyra.de
            </a>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-bold text-blue-900 text-sm">{t('replyTime')}</p>
                <p className="text-xs text-blue-600 font-medium">{t('replyTimeSub')}</p>
              </div>
            </div>
            <p className="text-sm text-blue-800/70 leading-relaxed inline-flex items-start gap-1.5">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {t('location')}
            </p>
          </div>
        </div>

        {/* FAQ nudge */}
        <div className="text-center text-sm text-gray-400">
          {t('faqNudge')}{' '}
          <Link href="/privacy" className="text-emerald-600 hover:underline font-medium">{t('privacyPolicy')}</Link>
          {' '}·{' '}
          <Link href="/terms" className="text-emerald-600 hover:underline font-medium">{t('termsOfService')}</Link>
        </div>
      </main>
    </div>
  )
}
