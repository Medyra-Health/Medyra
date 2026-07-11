'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { BellRing, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const PRESETS = [
  { id: '4w', tKey: 'report.reminder.in4w' },
  { id: '3m', tKey: 'report.reminder.in3m' },
  { id: '6m', tKey: 'report.reminder.in6m' },
]

// "Kontrolle in 3 Monaten" -> one-click email reminder for this report.
export default function RecheckReminderCard({ reportId, fileName }) {
  const t = useTranslations()
  const locale = useLocale()
  const [reminder, setReminder] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(null) // preset id while creating

  useEffect(() => {
    fetch(`/api/reminders?reportId=${reportId}`)
      .then(r => r.json())
      .then(d => {
        if (d.reminders?.length) setReminder(d.reminders[0])
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [reportId])

  async function createReminder(preset) {
    setBusy(preset)
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset, reportId, label: fileName || null, locale }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed')
      setReminder(d.reminder)
      toast.success(t('report.reminder.created'))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(null)
    }
  }

  async function cancelReminder() {
    const prev = reminder
    setReminder(null)
    try {
      await fetch(`/api/reminders/${prev.id}`, { method: 'DELETE' })
      toast.success(t('report.reminder.cancelled'))
    } catch {
      setReminder(prev)
    }
  }

  if (!loaded) return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
          <BellRing className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          {reminder ? (
            <>
              <p className="text-sm font-semibold text-gray-800 mb-0.5 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                {t('report.reminder.activeTitle')}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                {t('report.reminder.activeDesc', { date: new Date(reminder.dueAt).toLocaleDateString() })}
              </p>
              <button
                onClick={cancelReminder}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" /> {t('report.reminder.cancel')}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-800 mb-0.5">{t('report.reminder.title')}</p>
              <p className="text-xs text-gray-500 mb-3">{t('report.reminder.description')}</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => createReminder(p.id)}
                    disabled={busy !== null}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50 transition-all disabled:opacity-50"
                  >
                    {busy === p.id && <Loader2 className="h-3 w-3 animate-spin" />}
                    {t(p.tKey)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
