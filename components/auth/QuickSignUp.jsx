'use client'

// One-click account creation. Google is the fastest path (no form at all), with
// Clerk's modal as the email fallback. Google OAuth doubles as sign-up: with a
// public sign-up mode Clerk transfers an unknown account into a new one.

import { useState } from 'react'
import { useSignIn, SignUpButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { Loader2, Mail } from 'lucide-react'

function GoogleMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 010-3.44V4.95H.96a9 9 0 000 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  )
}

/**
 * @param {string} redirectUrl where to land once the account exists
 * @param {'dark'|'light'} tone match the surrounding section
 */
export default function QuickSignUp({ redirectUrl = '/dashboard', tone = 'dark' }) {
  const t = useTranslations('quickSignup')
  const { signIn, isLoaded } = useSignIn()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const dark = tone === 'dark'

  const withGoogle = async () => {
    if (!isLoaded || busy) return
    setBusy(true)
    setFailed(false)
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: redirectUrl,
      })
      // On success the browser navigates away, so nothing after this runs.
    } catch {
      // Popup blocked, provider misconfigured, offline: fall back to the modal
      setFailed(true)
      setBusy(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <button
        onClick={withGoogle}
        disabled={!isLoaded || busy}
        className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-slate-800 font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:translate-y-0 disabled:cursor-wait"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleMark className="h-[18px] w-[18px]" />}
        {t('google')}
      </button>

      <div className={`flex items-center gap-3 my-3 text-[11px] font-semibold uppercase tracking-wider ${dark ? 'text-white/30' : 'text-slate-400'}`}>
        <span className={`h-px flex-1 ${dark ? 'bg-white/10' : 'bg-slate-200'}`} />
        {t('or')}
        <span className={`h-px flex-1 ${dark ? 'bg-white/10' : 'bg-slate-200'}`} />
      </div>

      <SignUpButton mode="modal" forceRedirectUrl={redirectUrl} signInForceRedirectUrl={redirectUrl}>
        <button
          className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border font-bold text-sm transition-colors ${
            dark
              ? 'border-white/15 text-white/80 hover:border-teal-400/50 hover:text-teal-300'
              : 'border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-700'
          }`}
        >
          <Mail className="h-4 w-4" /> {t('email')}
        </button>
      </SignUpButton>

      <p className={`text-center text-xs mt-3 ${dark ? 'text-white/40' : 'text-slate-400'}`}>
        {failed ? t('retryHint') : t('speed')}
      </p>
    </div>
  )
}
