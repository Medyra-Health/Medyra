'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList, ClipboardCheck, Loader2, Trash2, QrCode, Plus,
  ExternalLink, FileText, Copy, Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { questionText, ANAMNESE_QUESTIONS } from '@/lib/clinicI18n'
import { useClinicT } from '@/components/clinic/ui'
import {
  Card, SectionTitle, LangBadge, StatusBadge, Modal, Field, inputCls,
  LanguageSelect, EmptyState, PrimaryButton, CopyButton, QRBlock, fadeUp, formatDate,
} from '@/components/clinic/shared'

function anamneseUrl(token) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://medyra.de'
  return `${origin}/clinic/anamnese/${token}`
}

export default function AnamneseTab({ patients }) {
  const { t, lang } = useClinicT()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [patientId, setPatientId] = useState('')
  const [language, setLanguage] = useState('de')
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(null)

  const [detail, setDetail] = useState(null) // completed anamnesis to view
  const [qrItem, setQrItem] = useState(null)
  const [copiedSummary, setCopiedSummary] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/clinic/anamnesis')
      if (res.ok) setItems((await res.json()).anamnesis || [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Preselect the patient's language when a patient is chosen
  const selectPatient = id => {
    setPatientId(id)
    const p = patients.find(x => x.id === id)
    if (p) setLanguage(p.language)
  }

  const create = async () => {
    setCreating(true)
    setCreated(null)
    try {
      const res = await fetch('/api/clinic/anamnesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patientId || null, language }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Error')
      setCreated(d.anamnesis)
      refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  const remove = async a => {
    if (!window.confirm(t('confirmDelete'))) return
    const res = await fetch(`/api/clinic/anamnesis/${a.id}`, { method: 'DELETE' })
    if (res.ok) {
      if (created?.id === a.id) setCreated(null)
      refresh()
    }
  }

  const copySummary = async text => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSummary(true)
      setTimeout(() => setCopiedSummary(false), 1800)
    } catch {}
  }

  return (
    <div className="space-y-6">
      <SectionTitle title={t('anTitle')} subtitle={t('anSubtitle')} />

      {/* Creator */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-violet-500" /> {t('anNew')}
        </h2>
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <Field label={t('anPatientOpt')}>
            <select value={patientId} onChange={e => selectPatient(e.target.value)} className={inputCls}>
              <option value="">{t('noPatient')}</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label={t('anLang')}>
            <LanguageSelect value={language} onChange={setLanguage} />
          </Field>
          <PrimaryButton onClick={create} disabled={creating} className="h-[42px]">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {t('anCreate')}
          </PrimaryButton>
        </div>

        <AnimatePresence>
          {created && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-violet-50/40 p-5 flex items-start justify-between gap-5 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-sm text-slate-900">{t('anReady')}</span>
                    <LangBadge code={created.language} />
                  </div>
                  <p className="text-xs text-slate-500 mb-4 max-w-sm">{t('anReadySub')}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CopyButton text={anamneseUrl(created.token)} />
                    <a
                      href={anamneseUrl(created.token)}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> {t('open')}
                    </a>
                  </div>
                </div>
                <QRBlock url={anamneseUrl(created.token)} size={120} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* List */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3">{t('anList')}</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-indigo-400 animate-spin" /></div>
        ) : items.length === 0 ? (
          <Card><EmptyState icon={ClipboardList} text={t('anEmpty')} /></Card>
        ) : (
          <Card className="divide-y divide-slate-100 overflow-hidden">
            {items.map((a, i) => (
              <motion.div
                key={a.id}
                custom={Math.min(i, 10)} variants={fadeUp} initial="hidden" animate="show"
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-indigo-50/40 transition-colors group"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  a.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {a.status === 'completed' ? <ClipboardCheck className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-slate-900 truncate">
                    {a.patientName || t('noPatient')}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatDate(a.createdAt, lang)}
                    {a.completedAt ? ` · ${t('completed')}: ${formatDate(a.completedAt, lang)}` : ''}
                  </div>
                </div>
                <LangBadge code={a.language} />
                <StatusBadge status={a.status} />
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {a.status === 'completed' ? (
                    <button
                      onClick={() => setDetail(a)}
                      className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition-colors"
                      title={t('anViewSummary')}
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setQrItem(a)}
                      className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition-colors"
                      title={t('qrCode')}
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => remove(a)} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-red-500 transition-colors" title={t('delete')}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </Card>
        )}
      </div>

      {/* QR modal for pending invites */}
      <Modal open={!!qrItem} onClose={() => setQrItem(null)} title={t('qrCode')}>
        {qrItem && (
          <div className="flex flex-col items-center gap-4">
            <QRBlock url={anamneseUrl(qrItem.token)} size={200} />
            <CopyButton text={anamneseUrl(qrItem.token)} />
          </div>
        )}
      </Modal>

      {/* Summary modal for completed questionnaires */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={t('anSummary')} wide>
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              {detail.patientName && <span className="text-sm font-bold text-slate-800">{detail.patientName}</span>}
              <LangBadge code={detail.language} />
              <button
                onClick={() => copySummary(detail.summary || '')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  copiedSummary ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {copiedSummary ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedSummary ? t('copied') : t('anCopySummary')}
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {(detail.summary || '').replace(/\*\*/g, '')}
            </div>

            {detail.answers && (
              <details className="group">
                <summary className="text-xs font-bold text-slate-500 cursor-pointer hover:text-indigo-600 transition-colors">
                  {t('anAnswers')} ({detail.language.toUpperCase()})
                </summary>
                <div className="mt-3 space-y-3">
                  {ANAMNESE_QUESTIONS.map(q => (
                    detail.answers[q.id] ? (
                      <div key={q.id} className="rounded-lg bg-white border border-slate-100 p-3">
                        <div className="text-[11px] font-semibold text-slate-400 mb-1">{questionText(detail.language, q.id)}</div>
                        <div className="text-sm text-slate-700">{detail.answers[q.id]}</div>
                      </div>
                    ) : null
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
