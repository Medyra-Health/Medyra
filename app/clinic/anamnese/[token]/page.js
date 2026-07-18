'use client'

// PUBLIC: multilingual intake questionnaire for patients of a Praxis.
// Token-based, no auth. The patient answers in their own language; the
// practice receives an AI-structured German summary.

import { use, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2, ArrowRight, ArrowLeft, Check, Stethoscope, Link2Off,
  ShieldCheck, PartyPopper, ClipboardList, Send,
} from 'lucide-react'
import { ct, questionText, ANAMNESE_QUESTIONS, RTL_LOCALES } from '@/lib/clinicI18n'

export default function PublicAnamnesePage({ params }) {
  const { token } = use(params)
  const [state, setState] = useState({ loading: true, error: null, status: null, language: 'de', practiceName: null })
  const [step, setStep] = useState(-1) // -1 = intro screen
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch(`/api/clinic/public/anamnese/${token}`)
      .then(async r => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || 'invalid')
        setState({ loading: false, error: null, status: d.status, language: d.language || 'de', practiceName: d.practiceName })
      })
      .catch(err => setState(s => ({ ...s, loading: false, error: err.message })))
  }, [token])

  const locale = state.language
  const isRTL = RTL_LOCALES.includes(locale)
  const t = key => ct(locale, key)
  const total = ANAMNESE_QUESTIONS.length
  const current = step >= 0 && step < total ? ANAMNESE_QUESTIONS[step] : null
  const currentAnswer = current ? (answers[current.id] || '') : ''
  const canProceed = current ? (!current.required || currentAnswer.trim().length > 0) : true

  const submit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/clinic/public/anamnese/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'error')
      setDone(true)
    } catch (err) {
      if (err.message === 'already_completed') setDone(true)
      else setState(s => ({ ...s, error: 'processing' }))
    } finally {
      setSubmitting(false)
    }
  }

  // ---- screens ----

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-7 w-7 text-indigo-300 animate-spin" />
      </div>
    )
  }

  const Shell = ({ children }) => (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex flex-col" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <header className="flex items-center justify-center pt-8 pb-2">
        <div className="flex items-center gap-2 text-white">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold">{state.practiceName || 'Medyra Clinic'}</span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">{children}</div>
      </main>
      <footer className="pb-6 text-center">
        <p className="text-[11px] text-indigo-300/50">{t('poweredBy')} · medyra.de</p>
      </footer>
    </div>
  )

  if (state.error || (state.status !== 'pending' && !done)) {
    const alreadyDone = state.status === 'completed'
    return (
      <Shell>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-10 text-center">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-5">
            {alreadyDone ? <Check className="h-7 w-7 text-emerald-300" /> : <Link2Off className="h-7 w-7 text-indigo-300" />}
          </div>
          <p className="text-white font-medium">{alreadyDone ? t('alreadyDone') : t('invalidLink')}</p>
        </motion.div>
      </Shell>
    )
  }

  if (done) {
    return (
      <Shell>
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="bg-white rounded-3xl p-10 text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 18 }}
            className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-5 shadow-lg shadow-emerald-200"
          >
            <PartyPopper className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">{t('thanksTitle')}</h1>
          <p className="text-sm text-slate-500 leading-relaxed">{t('thanksBody')}</p>
        </motion.div>
      </Shell>
    )
  }

  if (step === -1) {
    return (
      <Shell>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
            <ClipboardList className="h-6 w-6 text-indigo-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-3">{t('anamneseTitle')}</h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">{t('anamneseIntro')}</p>
          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-100 p-3.5 mb-7">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed">{t('privacyNote')}</p>
          </div>
          <button
            onClick={() => setStep(0)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2"
          >
            {t('start')} <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </motion.div>
      </Shell>
    )
  }

  // Question wizard
  const isLast = step === total - 1
  return (
    <Shell>
      <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-2xl">
        {/* Progress */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-indigo-600">
              {t('questionOf').replace('{n}', String(step + 1)).replace('{total}', String(total))}
            </span>
            {!ANAMNESE_QUESTIONS[step].required && (
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{t('optional')}</span>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              animate={{ width: `${((step + 1) / total) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: isRTL ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 24 : -24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <h2 className="text-lg font-bold text-slate-900 leading-snug mb-5">
              {questionText(locale, current.id)}
            </h2>
            <textarea
              value={currentAnswer}
              onChange={e => setAnswers(a => ({ ...a, [current.id]: e.target.value }))}
              placeholder={t('answerPlaceholder')}
              rows={4}
              autoFocus
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow resize-none leading-relaxed"
            />
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-3 mt-7">
          <button
            onClick={() => setStep(s => s - 1)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} /> {t('back')}
          </button>
          <div className="flex items-center gap-2">
            {!current.required && !currentAnswer.trim() && !isLast && (
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                {t('skip')}
              </button>
            )}
            {isLast ? (
              <button
                onClick={submit}
                disabled={!canProceed || submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? t('submitting') : t('submit')}
              </button>
            ) : (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                {t('next')} <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Shell>
  )
}
