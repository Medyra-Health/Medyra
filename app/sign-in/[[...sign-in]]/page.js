'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function SignInPage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <SignIn />
      <p className="mt-4 text-sm">
        <Link href="/forgot-password" className="text-emerald-700 hover:underline">
          {t('forgotPassword.link')}
        </Link>
      </p>
    </div>
  )
}
