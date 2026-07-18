'use client'

// PUBLIC: read-only Patientenbrief for the patient. Token-based, no auth.
// Rendered in the patient's language (RTL-aware) with the practice letterhead.

import { use, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2, Printer, CheckCircle, TrendingUp, TrendingDown, AlertTriangle,
  Stethoscope, HeartHandshake, ListChecks, MessageCircleQuestion, Link2Off,
} from 'lucide-react'
import { ct, RTL_LOCALES } from '@/lib/clinicI18n'

function flagStyle(flag) {
  return {
    normal: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    low: 'bg-amber-50 border-amber-200 text-amber-700',
    high: 'bg-orange-50 border-orange-200 text-orange-700',
    critical: 'bg-red-50 border-red-200 text-red-700',
  }[flag] || 'bg-slate-50 border-slate-200 text-slate-600'
}

function FlagIcon({ flag }) {
  if (flag === 'normal') return <CheckCircle className="h-3.5 w-3.5" />
  if (flag === 'low') return <TrendingDown className="h-3.5 w-3.5" />
  if (flag === 'critical') return <AlertTriangle className="h-3.5 w-3.5" />
  return <TrendingUp className="h-3.5 w-3.5" />
}

export default function PublicBriefPage({ params }) {
  const { token } = use(params)
  const [state, setState] = useState({ loading: true, error: null, brief: null })

  useEffect(() => {
    fetch(`/api/clinic/public/brief/${token}`)
      .then(async r => {
        const d = await r.json()
        if (!r.ok) throw new Error('invalid')
        setState({ loading: false, error: null, brief: d.brief })
      })
      .catch(() => setState({ loading: false, error: 'invalid', brief: null }))
  }, [token])

  const locale = state.brief?.language || 'de'
  const isRTL = RTL_LOCALES.includes(locale)
  const t = key => ct(locale, key)

  if (state.loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="h-7 w-7 text-indigo-500 animate-spin" />
      </div>
    )
  }

  if (state.error || !state.brief) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
            <Link2Off className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">{ct('de', 'invalidLink')}</p>
          <p className="text-slate-400 text-sm mt-1">{ct('en', 'invalidLink')}</p>
        </div>
      </div>
    )
  }

  const { letter, practice, createdAt, expiresAt } = state.brief
  const dateStr = new Date(createdAt).toLocaleDateString(locale === 'de' ? 'de-DE' : undefined, {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-100 print:bg-white" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-plain { box-shadow: none !important; border: none !important; margin: 0 !important; border-radius: 0 !important; }
        }
      `}</style>

      {/* Top bar (screen only) */}
      <div className="no-print sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-extrabold">Medyra <span className="text-indigo-500 text-[10px] font-bold tracking-widest uppercase">Clinic</span></span>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> {t('print')}
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 print:py-0 print:px-0">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/60 overflow-hidden print-plain"
        >
          {/* Letterhead */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-7 sm:px-10 py-7">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-lg font-extrabold">{practice?.name || 'Ihre Praxis'}</div>
                {practice?.doctorName && <div className="text-sm text-indigo-200 mt-0.5">{practice.doctorName}</div>}
                {(practice?.street || practice?.city) && (
                  <div className="text-[11px] text-indigo-300/70 mt-2">
                    {[practice.street, practice.city].filter(Boolean).join(' · ')}
                    {practice.phone ? ` · ${practice.phone}` : ''}
                  </div>
                )}
              </div>
              <div className={isRTL ? 'text-left' : 'text-right'}>
                <div className="text-[10px] font-bold tracking-[0.2em] text-indigo-300 uppercase">{t('briefTitle')}</div>
                <div className="text-xs text-indigo-200/80 mt-1">{dateStr}</div>
              </div>
            </div>
          </div>

          <div className="px-7 sm:px-10 py-8 space-y-7">
            {/* Title + greeting */}
            <div>
              {letter.title && <h1 className="text-2xl font-bold text-slate-900 mb-4">{letter.title}</h1>}
              {letter.greeting && <p className="text-slate-800 font-medium">{letter.greeting}</p>}
              {letter.intro && <p className="text-slate-600 mt-2 leading-relaxed">{letter.intro}</p>}
            </div>

            {/* Core message */}
            {letter.summary && (
              <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50/60 border border-indigo-100 p-5">
                <p className="text-slate-800 leading-relaxed font-medium">{letter.summary}</p>
              </div>
            )}

            {/* Values table */}
            {letter.values?.length > 0 && (
              <div>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs">
                        <th className={`px-4 py-3 font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('testCol')}</th>
                        <th className={`px-4 py-3 font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('valueCol')}</th>
                        <th className={`px-4 py-3 font-semibold ${isRTL ? 'text-right' : 'text-left'} hidden sm:table-cell`}>{t('rangeCol')}</th>
                        <th className={`px-4 py-3 font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>{t('meaningCol')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {letter.values.map((v, i) => (
                        <tr key={i} className="align-top">
                          <td className="px-4 py-3 font-semibold text-slate-800">{v.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${flagStyle(v.flag)}`}>
                              <FlagIcon flag={v.flag} /> {v.value}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 hidden sm:table-cell whitespace-nowrap">{v.normalRange}</td>
                          <td className="px-4 py-3 text-slate-600 leading-relaxed">{v.meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sections */}
            {letter.sections?.map((s, i) => (
              <div key={i}>
                <h2 className="font-bold text-slate-900 mb-2">{s.title}</h2>
                <p className="text-slate-600 leading-relaxed">{s.content}</p>
              </div>
            ))}

            {/* Next steps */}
            {letter.nextSteps?.length > 0 && (
              <div className="rounded-2xl border border-slate-200 p-5">
                <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-indigo-500" />
                  {t('nextStepsTitle')}
                </h2>
                <ul className="space-y-2.5">
                  {letter.nextSteps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-slate-700 leading-relaxed">
                      <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Questions for the doctor */}
            {letter.questionsForDoctor?.length > 0 && (
              <div className="rounded-2xl bg-violet-50/60 border border-violet-100 p-5">
                <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <MessageCircleQuestion className="h-5 w-5 text-violet-500" />
                  {t('questionsTitle')}
                </h2>
                <ul className="space-y-2">
                  {letter.questionsForDoctor.map((q, i) => (
                    <li key={i} className="text-slate-700 leading-relaxed flex gap-2">
                      <span className="text-violet-400 font-bold shrink-0">?</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Closing */}
            {letter.closing && (
              <div className="flex items-start gap-3 pt-2">
                <HeartHandshake className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-slate-700 leading-relaxed font-medium">{letter.closing}</p>
              </div>
            )}

            {/* Disclaimer */}
            {letter.disclaimer && (
              <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
                {letter.disclaimer}
              </p>
            )}
          </div>
        </motion.div>

        <div className="no-print text-center mt-6 space-y-1">
          {expiresAt && (
            <p className="text-[11px] text-slate-400">
              {t('expiresNote')} {new Date(expiresAt).toLocaleDateString(locale === 'de' ? 'de-DE' : undefined)}
            </p>
          )}
          <p className="text-[11px] text-slate-400">{t('poweredBy')} · medyra.de</p>
        </div>
      </main>
    </div>
  )
}
