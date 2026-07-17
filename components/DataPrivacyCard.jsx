'use client'

// Account-wide data retention + privacy control.
// Every user (free and paid) chooses here whether reports are auto deleted
// after 30 days (default) or kept as an encrypted backup.
// Shown on the dashboard and on the profiles page; uses GET/POST /api/settings.
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Shield, Trash2, Check, Loader2 } from 'lucide-react'

export default function DataPrivacyCard() {
  const t = useTranslations('profiles')
  const [retention, setRetention] = useState(null)
  const [totalReports, setTotalReports] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setRetention(d.dataRetention || 'auto30')
      setTotalReports(d.totalReports || 0)
    }).catch(() => setRetention('auto30'))
  }, [])

  async function choose(value) {
    if (value === retention || saving) return
    setSaving(true)
    const prev = retention
    setRetention(value)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataRetention: value }),
      })
      if (!res.ok) setRetention(prev)
    } catch { setRetention(prev) }
    finally { setSaving(false) }
  }

  const options = [
    {
      value: 'keep',
      icon: Shield,
      title: t('keepDataTitle'),
      desc: t('keepDataDesc'),
    },
    {
      value: 'auto30',
      icon: Trash2,
      title: t('autoDeleteTitle'),
      desc: t('autoDeleteDesc'),
    },
  ]

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <Shield className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">{t('dataPrivacyTitle')}</h3>
        {retention && <span className="text-xs text-gray-400 ml-1">{t('documentsStored', { count: totalReports })}</span>}
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400 ml-auto" />}
      </div>
      <div className="p-5 space-y-3">
        {retention === null ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-gray-300" /></div>
        ) : (
          <>
            {options.map(o => {
              const Icon = o.icon
              const active = retention === o.value
              return (
                <button
                  key={o.value}
                  onClick={() => choose(o.value)}
                  className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${active ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${active ? 'text-emerald-800' : 'text-gray-800'}`}>{o.title}</p>
                      {active && <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{o.desc}</p>
                  </div>
                </button>
              )
            })}
            <p className="text-xs text-gray-400 leading-relaxed pt-1">
              {t('privacyFooterNote')}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
