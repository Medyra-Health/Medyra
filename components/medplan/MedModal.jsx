'use client'

// Add/edit medication modal. Highlight: the German "1-0-1-0" scheme input —
// typing the dose scheme fills the slot toggles instantly.

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import {
  X, Loader2, Trash2, Pill, Droplets, Syringe, SprayCan, Package, Tablets, CircleDot,
  Sunrise, Sun, Sunset, Moon,
} from 'lucide-react'
import { toast } from 'sonner'

export const MED_COLORS = {
  emerald: { dot: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-600', ring: 'ring-emerald-400' },
  sky: { dot: 'bg-sky-500', soft: 'bg-sky-50 text-sky-600', ring: 'ring-sky-400' },
  violet: { dot: 'bg-violet-500', soft: 'bg-violet-50 text-violet-600', ring: 'ring-violet-400' },
  amber: { dot: 'bg-amber-500', soft: 'bg-amber-50 text-amber-600', ring: 'ring-amber-400' },
  rose: { dot: 'bg-rose-500', soft: 'bg-rose-50 text-rose-600', ring: 'ring-rose-400' },
  indigo: { dot: 'bg-indigo-500', soft: 'bg-indigo-50 text-indigo-600', ring: 'ring-indigo-400' },
}

export const FORM_ICONS = {
  tablet: Tablets,
  capsule: Pill,
  drops: Droplets,
  injection: Syringe,
  spray: SprayCan,
  ointment: Package,
  other: CircleDot,
}

const SLOT_META = [
  { id: 'morning', icon: Sunrise, tint: 'text-amber-500' },
  { id: 'noon', icon: Sun, tint: 'text-sky-500' },
  { id: 'evening', icon: Sunset, tint: 'text-violet-500' },
  { id: 'night', icon: Moon, tint: 'text-indigo-500' },
]

const DEFAULT_TIMES = { morning: '08:00', noon: '13:00', evening: '19:00', night: '22:00' }

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-shadow'

export default function MedModal({ med, profileId, onClose, onSaved }) {
  const t = useTranslations('medplan')
  const locale = useLocale()
  const editing = !!med

  const [form, setForm] = useState({
    name: med?.name || '',
    dose: med?.dose || '',
    notes: med?.notes || '',
    form: med?.form || 'tablet',
    color: med?.color || 'emerald',
    slots: { morning: false, noon: false, evening: false, night: false, ...(med?.slots || {}) },
    times: { ...DEFAULT_TIMES, ...(med?.times || {}) },
    days: med?.days || [],
  })
  const [scheme, setScheme] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 1-0-1-0 quick scheme -> slot toggles
  useEffect(() => {
    const m = scheme.trim().match(/^([01])\s*-\s*([01])\s*-\s*([01])(?:\s*-\s*([01]))?$/)
    if (!m) return
    setForm(f => ({
      ...f,
      slots: {
        morning: m[1] === '1',
        noon: m[2] === '1',
        evening: m[3] === '1',
        night: m[4] === '1',
      },
    }))
  }, [scheme])

  const schemeFromSlots = ['morning', 'noon', 'evening', 'night']
    .map(s => (form.slots[s] ? '1' : '0')).join('-')

  const dayLabel = d =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, 7 + d))
  // Week starts Monday for display
  const WEEK = [1, 2, 3, 4, 5, 6, 0]

  const toggleDay = d =>
    setForm(f => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d],
    }))

  const save = async () => {
    if (!form.name.trim()) { toast.error(t('nameRequired')); return }
    if (!Object.values(form.slots).some(Boolean)) { toast.error(t('slotRequired')); return }
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/medplan/medications/${med.id}` : '/api/medplan/medications', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, profileId }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error === 'med_limit_reached' ? t('medLimit') : 'Error')
      onSaved()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm(t('deleteConfirm'))) return
    setDeleting(true)
    try {
      await fetch(`/api/medplan/medications/${med.id}`, { method: 'DELETE' })
      onSaved()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur z-10 flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 rounded-t-3xl">
          <h3 className="font-bold text-slate-900">{editing ? t('editMed') : t('addMed')}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Name + dose */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <label className="block">
              <span className="block text-xs font-semibold text-slate-600 mb-1.5">{t('medName')}</span>
              <input
                className={inputCls}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={t('medNamePlaceholder')}
                autoFocus={!editing}
              />
            </label>
            <label className="block w-28">
              <span className="block text-xs font-semibold text-slate-600 mb-1.5">{t('dose')}</span>
              <input
                className={inputCls}
                value={form.dose}
                onChange={e => setForm(f => ({ ...f, dose: e.target.value }))}
                placeholder="500 mg"
              />
            </label>
          </div>

          {/* Form + color */}
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <span className="block text-xs font-semibold text-slate-600 mb-1.5">{t('medForm')}</span>
              <div className="flex gap-1.5">
                {Object.entries(FORM_ICONS).map(([id, Icon]) => (
                  <button
                    key={id}
                    onClick={() => setForm(f => ({ ...f, form: id }))}
                    title={t(`form_${id}`)}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center border-2 transition-all ${
                      form.form === id
                        ? 'border-teal-400 bg-teal-50 text-teal-600 scale-105'
                        : 'border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-600 mb-1.5">{t('medColor')}</span>
              <div className="flex gap-1.5">
                {Object.entries(MED_COLORS).map(([id, c]) => (
                  <button
                    key={id}
                    onClick={() => setForm(f => ({ ...f, color: id }))}
                    className={`h-7 w-7 rounded-full ${c.dot} transition-transform hover:scale-110 ${
                      form.color === id ? 'ring-2 ring-offset-2 ' + c.ring + ' scale-110' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Scheme quick input */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-50/70 to-cyan-50/50 border border-teal-100 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[140px]">
                <span className="block text-xs font-bold text-teal-800 mb-1">{t('scheme')}</span>
                <input
                  className="w-full rounded-xl border border-teal-200 bg-white px-3.5 py-2.5 text-lg font-bold tracking-[0.15em] text-slate-800 placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition-shadow tabular-nums"
                  value={scheme}
                  onChange={e => setScheme(e.target.value)}
                  placeholder={schemeFromSlots}
                  inputMode="numeric"
                />
              </div>
              <p className="text-[11px] text-teal-700/70 leading-relaxed max-w-[180px]">{t('schemeHint')}</p>
            </div>
          </div>

          {/* Slots with times */}
          <div>
            <span className="block text-xs font-semibold text-slate-600 mb-2">{t('schedule')}</span>
            <div className="grid grid-cols-2 gap-2.5">
              {SLOT_META.map(({ id, icon: Icon, tint }) => (
                <div
                  key={id}
                  className={`rounded-2xl border-2 p-3 transition-all cursor-pointer ${
                    form.slots[id] ? 'border-teal-400 bg-teal-50/40' : 'border-slate-100 hover:border-slate-200'
                  }`}
                  onClick={() => setForm(f => ({ ...f, slots: { ...f.slots, [id]: !f.slots[id] } }))}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Icon className={`h-4 w-4 ${tint}`} /> {t(`slot_${id}`)}
                    </span>
                    <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      form.slots[id] ? 'bg-teal-500 border-teal-500' : 'border-slate-300'
                    }`}>
                      {form.slots[id] && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <input
                    type="time"
                    value={form.times[id]}
                    disabled={!form.slots[id]}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setForm(f => ({ ...f, times: { ...f.times, [id]: e.target.value } }))}
                    className="w-full text-xs font-semibold text-slate-600 bg-transparent focus:outline-none disabled:text-slate-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Weekdays */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">{t('daysLabel')}</span>
              <button
                onClick={() => setForm(f => ({ ...f, days: [] }))}
                className={`text-[11px] font-bold transition-colors ${form.days.length === 0 ? 'text-teal-600' : 'text-slate-400 hover:text-teal-600'}`}
              >
                {t('daysAll')}
              </button>
            </div>
            <div className="flex gap-1.5">
              {WEEK.map(d => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`h-9 flex-1 rounded-xl text-xs font-bold transition-all ${
                    form.days.length === 0 || form.days.includes(d)
                      ? 'bg-teal-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  } ${form.days.length === 0 ? 'opacity-60' : ''}`}
                >
                  {dayLabel(d)}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <label className="block">
            <span className="block text-xs font-semibold text-slate-600 mb-1.5">{t('notes')}</span>
            <input
              className={inputCls}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder={t('notesPlaceholder')}
            />
          </label>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-1 pb-2">
            {editing ? (
              <button
                onClick={remove}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors"
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                {t('delete')}
              </button>
            ) : <span />}
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
                {t('cancel')}
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold shadow-sm hover:shadow-lg hover:shadow-teal-200 transition-all disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} {t('save')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
