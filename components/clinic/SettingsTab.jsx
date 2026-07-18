'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Loader2, Check, Printer, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useClinicT } from '@/components/clinic/ui'
import { Card, SectionTitle, Field, inputCls, PrimaryButton } from '@/components/clinic/shared'

const EMPTY = { name: '', doctorName: '', street: '', city: '', phone: '' }

export default function SettingsTab() {
  const { t } = useClinicT()
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/clinic/settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.settings) setForm({ ...EMPTY, ...d.settings }) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/clinic/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      toast.error('Error')
    } finally {
      setSaving(false)
    }
  }

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="space-y-6">
      <SectionTitle title={t('seTitle')} subtitle={t('seSubtitle')} />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 text-indigo-400 animate-spin" /></div>
      ) : (
        <>
          <Card className="p-6 max-w-2xl">
            <h2 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-500" /> {t('navSettings')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t('seName')}>
                <input className={inputCls} value={form.name} onChange={set('name')} placeholder="Praxis Dr. Mattar" />
              </Field>
              <Field label={t('seDoctor')}>
                <input className={inputCls} value={form.doctorName} onChange={set('doctorName')} placeholder="Dr. med. …" />
              </Field>
              <Field label={t('seStreet')}>
                <input className={inputCls} value={form.street} onChange={set('street')} />
              </Field>
              <Field label={t('seCity')}>
                <input className={inputCls} value={form.city} onChange={set('city')} />
              </Field>
              <Field label={t('sePhone')}>
                <input className={inputCls} value={form.phone} onChange={set('phone')} />
              </Field>
            </div>
            <div className="flex justify-end mt-6">
              <PrimaryButton onClick={save} disabled={saving} className={saved ? '!from-emerald-500 !to-emerald-600' : ''}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
                {saved ? t('seSaved') : t('save')}
              </PrimaryButton>
            </div>
          </Card>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-6 max-w-2xl bg-gradient-to-br from-slate-900 to-indigo-950 border-0 text-white">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-2 mb-1.5">
                    <Printer className="h-4 w-4 text-indigo-300" /> {t('sePosterTitle')}
                  </h2>
                  <p className="text-xs text-indigo-200/70 max-w-sm leading-relaxed">{t('sePosterSub')}</p>
                </div>
                <a
                  href="/clinic/poster"
                  target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-sm font-bold hover:bg-indigo-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" /> {t('sePosterOpen')}
                </a>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  )
}
