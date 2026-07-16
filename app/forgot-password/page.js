'use client'

import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function ForgotPasswordPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const t = useTranslations()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onSendCode(e) {
    e.preventDefault()
    if (!isLoaded || loading) return
    setError(null)
    setLoading(true)
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim(),
      })
      setCodeSent(true)
    } catch (err) {
      setError(err?.errors?.[0]?.message ?? t('forgotPassword.resetFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function onReset(e) {
    e.preventDefault()
    if (!isLoaded || loading) return
    setError(null)
    if (password.length < 8) {
      setError(t('forgotPassword.passwordTooShort'))
      return
    }
    setLoading(true)
    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
        password,
      })
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId })
        router.push('/dashboard')
      } else {
        setError(t('forgotPassword.resetFailed'))
      }
    } catch (err) {
      setError(err?.errors?.[0]?.message ?? t('forgotPassword.invalidCode'))
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900">{t('forgotPassword.title')}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {codeSent
            ? t('forgotPassword.codeSent', { email: email.trim() })
            : t('forgotPassword.subtitle')}
        </p>

        {!codeSent ? (
          <form onSubmit={onSendCode} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('forgotPassword.email')}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={!email.trim() || loading}
              className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? '…' : t('forgotPassword.sendCode')}
            </button>
          </form>
        ) : (
          <form onSubmit={onReset} className="mt-6 space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                {t('forgotPassword.code')}
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('forgotPassword.newPassword')}
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={!code.trim() || !password || loading}
              className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? '…' : t('forgotPassword.resetCta')}
            </button>
          </form>
        )}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <p className="mt-6 text-center text-sm">
          <Link href="/sign-in" className="text-emerald-700 hover:underline">
            {t('forgotPassword.backToSignIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
