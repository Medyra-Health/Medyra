'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  FileHeart, UploadCloud, Loader2, Trash2, ExternalLink, QrCode,
  FlaskConical, FileText, Hospital, Pill, Sparkles, CheckCircle2, Eye, FileUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { useClinicT } from '@/components/clinic/ui'
import {
  Card, SectionTitle, LangBadge, Modal, Field, inputCls, LanguageSelect,
  EmptyState, PrimaryButton, CopyButton, QRBlock, fadeUp, formatDate,
} from '@/components/clinic/shared'

const DOC_TYPES = [
  { id: 'lab', icon: FlaskConical, labelKey: 'leDocLab' },
  { id: 'letter', icon: FileText, labelKey: 'leDocLetter' },
  { id: 'discharge', icon: Hospital, labelKey: 'leDocDischarge' },
  { id: 'medication', icon: Pill, labelKey: 'leDocMedication' },
]

function briefUrl(token) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://medyra.de'
  return `${origin}/clinic/brief/${token}`
}

function GeneratingOverlay() {
  const { t } = useClinicT()
  const steps = [t('leStep1'), t('leStep2'), t('leStep3')]
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 5000)
    return () => clearInterval(id)
  }, [steps.length])
  return (
    <div className="flex flex-col items-center py-10">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
        className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 mb-5"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          className="text-sm font-semibold text-slate-700"
        >
          {steps[step]}
        </motion.p>
      </AnimatePresence>
      <div className="flex gap-1.5 mt-4">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-indigo-500' : 'w-4 bg-slate-200'}`} />
        ))}
      </div>
    </div>
  )
}

export default function LettersTab({ patients }) {
  const { t, lang } = useClinicT()
  const [letters, setLetters] = useState([])
  const [loading, setLoading] = useState(true)

  const [patientId, setPatientId] = useState('')
  const [docType, setDocType] = useState('lab')
  const [langOverride, setLangOverride] = useState('')
  const [file, setFile] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null) // freshly created letter
  const [qrLetter, setQrLetter] = useState(null)
  const resultRef = useRef(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/clinic/letters')
      if (res.ok) setLetters((await res.json()).letters || [])
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const onDrop = useCallback(accepted => {
    if (accepted?.[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'text/plain': ['.txt'],
    },
  })

  const selectedPatient = patients.find(p => p.id === patientId)

  const generate = async () => {
    if (!file) { toast.error(t('leNeedFile')); return }
    setGenerating(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      if (patientId) fd.append('patientId', patientId)
      fd.append('docType', docType)
      if (langOverride) fd.append('language', langOverride)
      const res = await fetch('/api/clinic/letters', { method: 'POST', body: fd })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Error')
      setResult(d.letter)
      setFile(null)
      toast.success(t('leSuccess'))
      refresh()
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const remove = async l => {
    if (!window.confirm(t('confirmDelete'))) return
    const res = await fetch(`/api/clinic/letters/${l.id}`, { method: 'DELETE' })
    if (res.ok) {
      if (result?.id === l.id) setResult(null)
      refresh()
    }
  }

  const docTypeLabel = id => t(DOC_TYPES.find(d => d.id === id)?.labelKey || 'leDocLetter')

  return (
    <div className="space-y-6">
      <SectionTitle title={t('leTitle')} subtitle={t('leSubtitle')} />

      {/* Creator */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-slate-700 mb-5 flex items-center gap-2">
          <FileHeart className="h-4 w-4 text-violet-500" /> {t('leNew')}
        </h2>

        {generating ? (
          <GeneratingOverlay />
        ) : (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t('leSelectPatient')}>
                <select value={patientId} onChange={e => setPatientId(e.target.value)} className={inputCls}>
                  <option value="">{t('noPatient')}</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </Field>
              <Field label={t('leLang')}>
                <LanguageSelect
                  value={langOverride}
                  onChange={setLangOverride}
                  allowEmpty
                  emptyLabel={selectedPatient ? `${t('leLangAuto')} (${selectedPatient.language.toUpperCase()})` : 'Deutsch'}
                />
              </Field>
            </div>

            <Field label={t('leDocType')}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {DOC_TYPES.map(({ id, icon: Icon, labelKey }) => (
                  <button
                    key={id}
                    onClick={() => setDocType(id)}
                    className={`flex flex-col items-start gap-2 p-3.5 rounded-xl border-2 text-left transition-all ${
                      docType === id
                        ? 'border-indigo-500 bg-indigo-50/60 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${docType === id ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className={`text-xs font-bold leading-tight ${docType === id ? 'text-indigo-900' : 'text-slate-600'}`}>
                      {t(labelKey)}
                    </span>
                  </button>
                ))}
              </div>
            </Field>

            <div
              {...getRootProps()}
              className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
                  : file ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-800">{file.name}</div>
                    <div className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</div>
                  </div>
                </div>
              ) : (
                <>
                  <motion.div
                    animate={{ y: isDragActive ? -4 : 0 }}
                    className="h-11 w-11 mx-auto rounded-xl bg-indigo-100 flex items-center justify-center mb-3"
                  >
                    <UploadCloud className="h-6 w-6 text-indigo-500" />
                  </motion.div>
                  <p className="text-sm font-semibold text-slate-700">{t('leDrop')}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{t('leDropSub')}</p>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <PrimaryButton onClick={generate} disabled={!file}>
                <Sparkles className="h-4 w-4" /> {t('leGenerate')}
              </PrimaryButton>
            </div>
          </div>
        )}
      </Card>

      {/* Fresh result */}
      <AnimatePresence>
        {result && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <Card className="p-6 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-violet-50/40">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-bold text-slate-900">{t('leSuccess')}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                    {result.letter?.title || docTypeLabel(result.docType)}
                    {result.patientName ? ` · ${result.patientName}` : ''}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <LangBadge code={result.language} />
                    <span className="text-[11px] text-slate-400">{t('expires')} {formatDate(result.expiresAt, lang)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <CopyButton text={briefUrl(result.shareToken)} label={t('leShare')} />
                    <a
                      href={briefUrl(result.shareToken)}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> {t('leOpenBrief')}
                    </a>
                  </div>
                </div>
                <QRBlock url={briefUrl(result.shareToken)} size={120} />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3">{t('leList')}</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-indigo-400 animate-spin" /></div>
        ) : letters.length === 0 ? (
          <Card><EmptyState icon={FileUp} text={t('leEmpty')} /></Card>
        ) : (
          <Card className="divide-y divide-slate-100 overflow-hidden">
            {letters.map((l, i) => (
              <motion.div
                key={l.id}
                custom={Math.min(i, 10)} variants={fadeUp} initial="hidden" animate="show"
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-indigo-50/40 transition-colors group"
              >
                <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <FileHeart className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-slate-900 truncate">
                    {l.patientName || t('noPatient')}
                    <span className="text-slate-400 font-normal"> · {docTypeLabel(l.docType)}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    {formatDate(l.createdAt, lang)}
                    <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {l.views} {t('views')}</span>
                  </div>
                </div>
                <LangBadge code={l.language} />
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setQrLetter(l)} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition-colors" title={t('qrCode')}>
                    <QrCode className="h-4 w-4" />
                  </button>
                  <a href={briefUrl(l.shareToken)} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition-colors" title={t('open')}>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button onClick={() => remove(l)} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-red-500 transition-colors" title={t('delete')}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </Card>
        )}
      </div>

      {/* QR modal */}
      <Modal open={!!qrLetter} onClose={() => setQrLetter(null)} title={t('qrCode')}>
        {qrLetter && (
          <div className="flex flex-col items-center gap-4">
            <QRBlock url={briefUrl(qrLetter.shareToken)} size={200} />
            <CopyButton text={briefUrl(qrLetter.shareToken)} label={t('leShare')} />
          </div>
        )}
      </Modal>
    </div>
  )
}
