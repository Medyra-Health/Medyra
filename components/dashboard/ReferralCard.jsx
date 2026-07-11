'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Gift, Copy, Check, Users } from 'lucide-react'

// Dashboard card: personal invite link, +1 free report per side per invite.
export default function ReferralCard() {
  const t = useTranslations()
  const [data, setData] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/referral')
      .then(r => r.json())
      .then(d => { if (d.code) setData(d) })
      .catch(() => {})
  }, [])

  if (!data) return null

  const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://medyra.de'}/?ref=${data.code}`

  async function copy() {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Medyra', text: t('dashboard.referral.shareText'), url: link })
        return
      }
    } catch { /* fall through to clipboard */ }
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="rounded-2xl p-4 shadow-sm border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <Gift className="h-4 w-4 text-white" />
        </div>
        <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">{t('dashboard.referral.title')}</p>
      </div>
      <p className="text-sm text-emerald-900/70 leading-relaxed mb-3">{t('dashboard.referral.description')}</p>

      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 rounded-lg border border-emerald-200 bg-white/70 px-3 py-2 text-xs font-mono text-emerald-800 truncate">
          {link}
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex-shrink-0"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t('dashboard.referral.copied') : t('dashboard.referral.copy')}
        </button>
      </div>

      {(data.referredCount > 0 || data.bonusReports > 0) && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-3">
          <Users className="h-3.5 w-3.5" />
          {t('dashboard.referral.stats', { count: data.referredCount, bonus: data.bonusReports })}
        </p>
      )}
    </div>
  )
}
