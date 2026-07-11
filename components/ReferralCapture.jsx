'use client'

import { useEffect } from 'react'

// Invisible: if any page is opened with ?ref=<code>, remember the referral
// code in a cookie for 30 days. It is redeemed server-side on first consent.
export default function ReferralCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get('ref')
      if (ref && /^[a-f0-9]{8}$/.test(ref)) {
        document.cookie = `medyra_ref=${ref}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
      }
    } catch {}
  }, [])
  return null
}
