'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'

// Landing point for the one-click Google flow. Clerk finishes the handshake
// here and then forwards to the `redirectUrlComplete` the button asked for.
export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
      <Loader2 className="h-7 w-7 text-teal-500 animate-spin" aria-label="Loading" />
    </div>
  )
}
