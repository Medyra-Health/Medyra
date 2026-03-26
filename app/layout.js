import { ClerkProvider } from '@clerk/nextjs'
import { NextIntlClientProvider } from 'next-intl'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import MobileNav from '@/components/MobileNav'
import enMessages from '../messages/en.json'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Medyra - Understand Your Medical Reports',
  description: 'AI-powered medical lab report explanations in plain language',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Medyra',
  },
}

export default function RootLayout({ children }) {
  const locale = 'en' // Default locale, client-side will handle switching
  const messages = enMessages

  return (
    <ClerkProvider>
      <html lang={locale}>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#2563eb" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Medyra" />
          <link rel="apple-touch-icon" href="/icon-192.png" />
        </head>
        <body className={`${inter.className} pb-16 md:pb-0`}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <MobileNav />
          </NextIntlClientProvider>
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
