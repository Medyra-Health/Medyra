'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useClinicT } from '@/components/clinic/ui'
import {
  Card, SectionTitle, LangBadge, Modal, Field, inputCls,
  LanguageSelect, EmptyState, PrimaryButton, fadeUp, formatDate,
} from '@/components/clinic/shared'

const EMPTY_FORM = { name: '', language: 'de', dob: '', note: '' }

export default function PatientsTab({ patients, patientsLoading, refreshPatients }) {
  const { t, lang } = useClinicT()
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null) // patient object or null (= create)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return patients
    return patients.filter(p => p.name.toLowerCase().includes(q))
  }, [patients, query])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = p => {
    setEditing(p)
    setForm({ name: p.name, language: p.language, dob: p.dob || '', note: p.note || '' })
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) { toast.error(t('paNameRequired')); return }
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/clinic/patients/${editing.id}` : '/api/clinic/patients', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setModalOpen(false)
      await refreshPatients()
    } catch {
      toast.error('Error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async p => {
    if (!window.confirm(t('confirmDelete'))) return
    const res = await fetch(`/api/clinic/patients/${p.id}`, { method: 'DELETE' })
    if (res.ok) refreshPatients()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionTitle title={t('paTitle')} subtitle={t('paSubtitle')} />
        <PrimaryButton onClick={openCreate}>
          <Plus className="h-4 w-4" /> {t('paAdd')}
        </PrimaryButton>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('search')}
          className={`${inputCls} pl-10`}
        />
      </div>

      {patientsLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 text-indigo-400 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            text={t('paEmpty')}
            action={<PrimaryButton onClick={openCreate}><Plus className="h-4 w-4" /> {t('paAdd')}</PrimaryButton>}
          />
        </Card>
      ) : (
        <Card className="divide-y divide-slate-100 overflow-hidden">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              custom={Math.min(i, 10)} variants={fadeUp} initial="hidden" animate="show"
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-indigo-50/40 transition-colors group"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                {p.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-slate-900 truncate">{p.name}</div>
                <div className="text-[11px] text-slate-400">
                  {p.dob ? `${p.dob} · ` : ''}{t('created')} {formatDate(p.createdAt, lang)}
                  {p.note ? <span className="text-slate-400"> · {p.note}</span> : null}
                </div>
              </div>
              <LangBadge code={p.language} />
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(p)} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('paEdit') : t('paAdd')}>
        <div className="space-y-4">
          <Field label={t('paName')}>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
          </Field>
          <Field label={t('paLang')}>
            <LanguageSelect value={form.language} onChange={v => setForm(f => ({ ...f, language: v }))} />
          </Field>
          <Field label={t('paDob')}>
            <input className={inputCls} value={form.dob} placeholder="TT.MM.JJJJ" onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
          </Field>
          <Field label={t('paNote')}>
            <input className={inputCls} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
              {t('cancel')}
            </button>
            <PrimaryButton onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} {t('save')}
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}
