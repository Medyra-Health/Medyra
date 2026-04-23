import { ClerkProvider } from '@clerk/nextjs'
import { NextIntlClientProvider } from 'next-intl'
import { Inter, Playfair_Display, DM_Sans } from 'next/font/google'
import { cookies } from 'next/headers'
import './globals.css'
import { Toaster } from 'sonner'
import MobileNav from '@/components/MobileNav'
import CookieBanner from '@/components/CookieBanner'
import SiteFooter from '@/components/SiteFooter'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '800'], variable: '--font-playfair' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-dm-sans' })

export const metadata = {
  metadataBase: new URL('https://medyra.de'),

  title: {
    default: 'Medyra AI – Lab Results & Medical Reports Explained in Plain Language',
    template: '%s | Medyra AI',
  },
  description:
    'Medyra AI explains your lab results and medical reports in plain language in under 60 seconds. Understand TSH, HbA1c, CRP, cholesterol and 100+ values. GDPR compliant. 17 languages. Free to start. Made in Germany.',

  keywords: [
    'Medyra AI',
    'medical report AI',
    'lab results explainer',
    'lab results Germany expat',
    'understand lab results',
    'blood test explained AI',
    'Laborbefund verstehen',
    'Blutbild erklären',
    'Befund erklären KI',
    'Arztbrief verstehen',
    'medical AI Germany',
    'AI Laborbefund',
    'TSH Wert erklären',
    'HbA1c meaning',
    'CRP explained',
    'cholesterol results explained',
    'medical report explainer app',
    'GDPR health AI',
    'German lab results English',
    'expat Germany doctor',
    'Medyra',
  ],

  authors: [{ name: 'Medyra AI', url: 'https://medyra.de' }],
  creator: 'Medyra AI',
  publisher: 'Medyra AI',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    type: 'website',
    url: 'https://medyra.de',
    siteName: 'Medyra AI',
    title: 'Medyra AI – Lab Results & Medical Reports Explained in Plain Language',
    description:
      'Upload your lab results or medical report and get a plain-language AI explanation in 60 seconds. GDPR compliant. 17 languages. Free to start.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Medyra AI – Medical Report & Lab Results Explainer',
      },
    ],
    locale: 'en_US',
    alternateLocale: ['de_DE', 'fr_FR', 'es_ES', 'it_IT', 'tr_TR', 'ar_AE', 'zh_CN', 'ja_JP', 'ko_KR', 'hi_IN', 'pt_BR', 'nl_NL', 'pl_PL'],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Medyra AI – Medical Report Explainer',
    description:
      'Get your lab results explained in plain language in 60 seconds. GDPR compliant. Made in Germany.',
    images: ['/opengraph-image'],
  },

  alternates: {
    canonical: 'https://medyra.de',
    languages: {
      'en': 'https://medyra.de',
      'de': 'https://medyra.de',
      'fr': 'https://medyra.de',
      'es': 'https://medyra.de',
      'it': 'https://medyra.de',
      'pt': 'https://medyra.de',
      'nl': 'https://medyra.de',
      'pl': 'https://medyra.de',
      'tr': 'https://medyra.de',
      'ar': 'https://medyra.de',
      'zh': 'https://medyra.de',
      'ja': 'https://medyra.de',
      'ko': 'https://medyra.de',
      'hi': 'https://medyra.de',
      'ru': 'https://medyra.de',
      'x-default': 'https://medyra.de',
    },
  },

  manifest: '/manifest.json',
  themeColor: '#10B981',

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Medyra AI',
  },

  category: 'health',

  other: {
    'geo.region': 'DE',
    'geo.placename': 'Germany',
    'language': 'en, de, fr, es, it, pt, nl, pl, tr, ar, zh, ja, ko, hi, bn, ru',
  },
}

const SUPPORTED_LOCALES = ['en','de','bn','fr','es','it','pt','nl','pl','tr','ar','zh','ja','ko','hi','ur','ru']

export default async function RootLayout({ children }) {
  const cookieStore = await cookies()
  const rawLocale = cookieStore.get('locale')?.value || 'en'
  const locale = SUPPORTED_LOCALES.includes(rawLocale) ? rawLocale : 'en'

  let messages
  try {
    messages = (await import(`../messages/${locale}.json`)).default
  } catch {
    messages = (await import('../messages/en.json')).default
  }

  return (
    <ClerkProvider>
      <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`${inter.className} ${playfair.variable} ${dmSans.variable} scroll-smooth`}>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#10B981" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Medyra" />
          <link rel="apple-touch-icon" href="/icon-192.png" />
          {/* Google Analytics */}
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-Q8Y2GQCSSS" />
          <script dangerouslySetInnerHTML={{ __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Q8Y2GQCSSS');
          `}} />
        </head>
        <body className="md:pb-0" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <SiteFooter />
            <MobileNav />
            <CookieBanner />
          </NextIntlClientProvider>
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
