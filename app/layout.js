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
    default: 'Medyra | Understand Your Medical Reports in Plain Language',
    template: '%s | Medyra',
  },
  description:
    'Upload your lab results and get AI powered explanations in plain language. Instantly understand your blood test, TSH, HbA1c, cholesterol, and more. GDPR compliant, 16 languages, results in 60 seconds. Made in Germany.',

  keywords: [
    'medical report explanation',
    'lab results AI',
    'understand blood test results',
    'lab report explainer',
    'medical terminology explained',
    'AI medical report',
    'blood test explained',
    'what does my lab report mean',
    'TSH explanation',
    'HbA1c meaning',
    'cholesterol results explained',
    'GDPR health AI',
    'Laborbefund verstehen',
    'Blutbild erklären',
    'Befund erklären KI',
    'medical AI Germany',
    'Medyra',
  ],

  authors: [{ name: 'Medyra', url: 'https://medyra.de' }],
  creator: 'Medyra',
  publisher: 'Medyra',

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
    siteName: 'Medyra',
    title: 'Medyra | Understand Your Medical Reports in Plain Language',
    description:
      'Upload your lab results and get AI powered explanations in plain language. GDPR compliant, 16 languages, results in 60 seconds.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Medyra | Medical Report Explainer',
      },
    ],
    locale: 'en_US',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Medyra | Understand Your Medical Reports in Plain Language',
    description:
      'Upload your lab results and get clear AI powered explanations. GDPR compliant. Made in Germany.',
    images: ['/opengraph-image'],
  },

  alternates: {
    canonical: 'https://medyra.de',
  },

  manifest: '/manifest.json',
  themeColor: '#10B981',

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Medyra',
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
        <body className="pb-16 md:pb-0">
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
