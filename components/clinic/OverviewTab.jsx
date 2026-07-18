'use client'

import { useEffect, useState } from 'react'
import { motion, animate } from 'framer-motion'
import {
  Users, FileHeart, Eye, ClipboardList, ClipboardCheck,
  Plus, ArrowRight, Activity, Globe2, Loader2,
} from 'lucide-react'
import { CLINIC_LANGUAGES } from '@/lib/clinicI18n'
import { useClinicT } from '@/components/clinic/ui'
import { Card, SectionTitle, fadeUp, formatDate, LangBadge } from '@/components/clinic/shared'

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const controls = animate(0, value || 0, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate: v => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [value])
  return <>{display}</>
}

function StatCard({ icon: Icon, label, value, tint, index }) {
  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="show">
      <Card className="p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${tint}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
          <AnimatedNumber value={value} />
        </div>
        <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
      </Card>
    </motion.div>
  )
}

export default function OverviewTab({ goToTab }) {
  const { t, lang } = useClinicT()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/clinic/overview')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = data?.stats || {}
  const activity = data?.activity || []
  const languages = Object.entries(stats.languages || {}).sort((a, b) => b[1] - a[1])
  const langTotal = languages.reduce((s, [, n]) => s + n, 0) || 1

  const quickActions = [
    { icon: FileHeart, title: t('ovQaLetter'), sub: t('ovQaLetterSub'), tab: 'letters', grad: 'from-indigo-600 to-violet-600' },
    { icon: ClipboardList, title: t('ovQaAnamnese'), sub: t('ovQaAnamneseSub'), tab: 'anamnese', grad: 'from-violet-600 to-fuchsia-600' },
    { icon: Plus, title: t('ovQaPatient'), sub: t('ovQaPatientSub'), tab: 'patients', grad: 'from-slate-700 to-slate-900' },
  ]

  const activityLabel = type =>
    type === 'letter' ? t('ovActLetter') : type === 'anamnese_done' ? t('ovActAnamDone') : t('ovActAnamSent')

  return (
    <div className="space-y-7">
      <SectionTitle title={t('ovTitle')} subtitle={t('ovSubtitle')} />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 text-indigo-400 animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <StatCard index={0} icon={Users} label={t('ovPatients')} value={stats.patients} tint="bg-indigo-50 text-indigo-600" />
            <StatCard index={1} icon={FileHeart} label={t('ovLetters')} value={stats.letters} tint="bg-violet-50 text-violet-600" />
            <StatCard index={2} icon={Eye} label={t('ovViews')} value={stats.letterViews} tint="bg-fuchsia-50 text-fuchsia-600" />
            <StatCard index={3} icon={ClipboardList} label={t('ovAnamPending')} value={stats.anamnesisPending} tint="bg-amber-50 text-amber-600" />
            <StatCard index={4} icon={ClipboardCheck} label={t('ovAnamDone')} value={stats.anamnesisCompleted} tint="bg-emerald-50 text-emerald-600" />
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-sm font-bold text-slate-700 mb-3">{t('ovQuick')}</h2>
            <div className="grid sm:grid-cols-3 gap-3.5">
              {quickActions.map((qa, i) => (
                <motion.button
                  key={qa.tab + qa.title}
                  custom={i} variants={fadeUp} initial="hidden" animate="show"
                  onClick={() => goToTab(qa.tab)}
                  className={`group relative overflow-hidden text-left rounded-2xl p-5 text-white bg-gradient-to-br ${qa.grad} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all`}
                >
                  <qa.icon className="h-6 w-6 mb-3 opacity-90" />
                  <div className="font-bold text-sm">{qa.title}</div>
                  <div className="text-[11px] text-white/70 mt-0.5">{qa.sub}</div>
                  <ArrowRight className="absolute right-4 bottom-4 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </motion.button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-3.5">
            {/* Activity feed */}
            <Card className="lg:col-span-3 p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-500" /> {t('ovActivity')}
              </h2>
              {activity.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">{t('ovNoActivity')}</p>
              ) : (
                <ul className="space-y-1">
                  {activity.map((a, i) => (
                    <motion.li
                      key={a.type + a.id}
                      custom={i} variants={fadeUp} initial="hidden" animate="show"
                      className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        a.type === 'letter' ? 'bg-violet-50 text-violet-600'
                          : a.type === 'anamnese_done' ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {a.type === 'letter' ? <FileHeart className="h-4 w-4" />
                          : a.type === 'anamnese_done' ? <ClipboardCheck className="h-4 w-4" />
                          : <ClipboardList className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-slate-800 truncate">
                          {activityLabel(a.type)}
                          {a.patientName ? <span className="text-slate-400 font-normal"> · {a.patientName}</span> : null}
                        </div>
                        <div className="text-[11px] text-slate-400">{formatDate(a.date, lang)}</div>
                      </div>
                      {a.language && <LangBadge code={a.language} />}
                    </motion.li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Language distribution */}
            <Card className="lg:col-span-2 p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-indigo-500" /> {t('ovLangTitle')}
              </h2>
              {languages.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">—</p>
              ) : (
                <div className="space-y-3">
                  {languages.slice(0, 8).map(([code, count], i) => (
                    <div key={code}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{CLINIC_LANGUAGES[code] || code}</span>
                        <span className="text-slate-400 tabular-nums">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round((count / langTotal) * 100)}%` }}
                          transition={{ delay: 0.15 + i * 0.07, duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
