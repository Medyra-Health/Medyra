'use client'

// Medikationsplan — daily medication tracker. Slots follow the German
// 1-0-1-0 scheme (morgens/mittags/abends/nachts). Free tier tracks "myself";
// paid tiers add family profiles (reusing the existing profiles feature).

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import {
  Sunrise, Sun, Sunset, Moon, Plus, Flame, CalendarCheck2, Printer,
  AlarmClock, Mail, Loader2, Check, X, Pill, Lock, ChevronDown,
  History, LayoutList, PartyPopper, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import MedModal, { MED_COLORS, FORM_ICONS } from '@/components/medplan/MedModal'

export const SLOTS = [
  { id: 'morning', icon: Sunrise, grad: 'from-amber-400 to-orange-500', soft: 'bg-amber-50 text-amber-600', ring: 'ring-amber-200' },
  { id: 'noon', icon: Sun, grad: 'from-sky-400 to-blue-500', soft: 'bg-sky-50 text-sky-600', ring: 'ring-sky-200' },
  { id: 'evening', icon: Sunset, grad: 'from-violet-500 to-purple-600', soft: 'bg-violet-50 text-violet-600', ring: 'ring-violet-200' },
  { id: 'night', icon: Moon, grad: 'from-indigo-600 to-slate-800', soft: 'bg-indigo-50 text-indigo-600', ring: 'ring-indigo-200' },
]

function ProgressRing({ pct, size = 92 }) {
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#medplanRing)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * pct) / 100 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="medplanRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-extrabold text-slate-800 tabular-nums">{pct}%</span>
      </div>
    </div>
  )
}

// Satisfying check button: none -> taken (burst) -> skipped -> none
function CheckButton({ status, onCycle }) {
  const [burst, setBurst] = useState(0)
  const handle = () => {
    if (!status) setBurst(b => b + 1)
    onCycle()
  }
  return (
    <button onClick={handle} className="relative h-9 w-9 shrink-0 select-none" aria-label="toggle intake">
      {/* burst particles */}
      <AnimatePresence>
        {burst > 0 && status === 'taken' && (
          <motion.span key={burst} className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-teal-400"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((i / 6) * Math.PI * 2) * 22,
                  y: Math.sin((i / 6) * Math.PI * 2) * 22,
                  opacity: 0, scale: 0.4,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            ))}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.span
        key={status || 'none'}
        initial={{ scale: status === 'taken' ? 0.5 : 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
          status === 'taken' ? 'bg-gradient-to-br from-teal-400 to-cyan-500 border-transparent text-white shadow-md shadow-teal-200'
            : status === 'skipped' ? 'bg-slate-100 border-slate-200 text-slate-400'
            : 'bg-white border-slate-200 hover:border-teal-300 text-transparent hover:text-teal-200'
        }`}
      >
        {status === 'skipped' ? <X className="h-4 w-4" /> : <Check className="h-5 w-5" />}
      </motion.span>
    </button>
  )
}

export default function Planner() {
  const t = useTranslations('medplan')
  const locale = useLocale()

  const [profileId, setProfileId] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [profilesAllowed, setProfilesAllowed] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('today') // today | history
  const [modal, setModal] = useState(null) // { med } | { med: null } | null
  const [emailSaving, setEmailSaving] = useState(false)

  const load = useCallback(async (pid = profileId) => {
    try {
      const res = await fetch(`/api/medplan${pid ? `?profileId=${pid}` : ''}`)
      const d = await res.json()
      if (res.ok) {
        setData(d)
        setProfilesAllowed(d.profilesAllowed)
      }
    } catch {}
    finally { setLoading(false) }
  }, [profileId])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    fetch('/api/profiles').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.profiles) setProfiles(d.profiles)
    }).catch(() => {})
  }, [])

  const meds = data?.medications || []
  const weekday = data?.weekday ?? new Date().getDay()
  const todayIntakes = data?.todayIntakes || []

  // Medications actually due today (weekday filter, active only)
  const dueToday = useMemo(
    () => meds.filter(m => m.active && (!m.days.length || m.days.includes(weekday))),
    [meds, weekday]
  )

  const intakeOf = (medId, slot) => todayIntakes.find(i => i.medicationId === medId && i.slot === slot)?.status || null

  const dueCount = dueToday.reduce((a, m) => a + SLOTS.filter(s => m.slots[s.id]).length, 0)
  const takenCount = dueToday.reduce(
    (a, m) => a + SLOTS.filter(s => m.slots[s.id] && intakeOf(m.id, s.id) === 'taken').length, 0
  )
  const pct = dueCount ? Math.round((takenCount / dueCount) * 100) : 0
  const allDone = dueCount > 0 && takenCount === dueCount

  const cycleIntake = async (med, slot) => {
    const current = intakeOf(med.id, slot)
    const next = current === null ? 'taken' : current === 'taken' ? 'skipped' : 'clear'
    // optimistic update
    setData(d => {
      const others = (d.todayIntakes || []).filter(i => !(i.medicationId === med.id && i.slot === slot))
      return {
        ...d,
        todayIntakes: next === 'clear' ? others
          : [...others, { medicationId: med.id, slot, date: d.today, status: next }],
      }
    })
    try {
      await fetch('/api/medplan/intakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicationId: med.id, slot, status: next === 'clear' ? null : next }),
      })
    } catch { load() }
  }

  const toggleEmail = async () => {
    setEmailSaving(true)
    try {
      const next = !data.emailReminders
      const res = await fetch('/api/medplan/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailReminders: next }),
      })
      if (res.ok) setData(d => ({ ...d, emailReminders: next }))
    } catch {}
    finally { setEmailSaving(false) }
  }

  const downloadIcs = () => {
    window.location.href = `/api/medplan/ics${profileId ? `?profileId=${profileId}` : ''}`
  }

  const switchProfile = pid => {
    setProfileMenuOpen(false)
    setProfileId(pid)
    setLoading(true)
    setData(null)
    load(pid)
  }

  const currentProfileName = profileId
    ? (profiles.find(p => p.id === profileId)?.name || '—')
    : t('profileSelf')

  const dayLabel = d =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, 7 + d))

  // last 7 day dots for the week strip
  const weekStrip = useMemo(() => {
    const out = []
    const stats = data?.stats?.dayStats || {}
    for (let d = 6; d >= 0; d--) {
      const dt = new Date(Date.now() - d * 24 * 3600 * 1000)
      const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt)
      const s = stats[key]
      out.push({
        key,
        label: new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(dt),
        pct: s && s.due ? Math.min(1, s.taken / s.due) : null,
        isToday: d === 0,
      })
    }
    return out
  }, [data, locale])

  if (loading && !data) {
    return <div className="flex justify-center py-24"><Loader2 className="h-7 w-7 text-teal-500 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Top row: profile + stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Profile switcher */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(o => !o)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm hover:border-teal-300 transition-colors"
          >
            <span className="h-6 w-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-white text-[11px] font-bold flex items-center justify-center">
              {currentProfileName.charAt(0).toUpperCase()}
            </span>
            {currentProfileName}
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute z-30 mt-2 w-60 rounded-2xl border border-slate-200 bg-white shadow-xl p-1.5"
              >
                <button
                  onClick={() => switchProfile(null)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${!profileId ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {t('profileSelf')}
                </button>
                {profilesAllowed ? (
                  profiles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => switchProfile(p.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${profileId === p.id ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      {p.name}
                    </button>
                  ))
                ) : (
                  <div className="px-3.5 py-3 border-t border-slate-100 mt-1">
                    <div className="flex items-start gap-2">
                      <Lock className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-slate-500 leading-relaxed">{t('profileLocked')}</p>
                    </div>
                    <Link href="/pricing" className="mt-2 inline-block text-xs font-bold text-teal-600 hover:text-teal-700">
                      {t('upgradeCta')} →
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View toggle + add */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setView('today')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'today' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              <LayoutList className="h-3.5 w-3.5" /> {t('todayTab')}
            </button>
            <button
              onClick={() => setView('history')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${view === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
            >
              <History className="h-3.5 w-3.5" /> {t('historyTab')}
            </button>
          </div>
          <button
            onClick={() => setModal({ med: null })}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold shadow-sm hover:shadow-lg hover:shadow-teal-200 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">{t('addMed')}</span>
          </button>
        </div>
      </div>

      {/* Stats hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white border border-slate-200/80 shadow-sm p-6 flex flex-wrap items-center gap-6"
      >
        <div className="flex items-center gap-5">
          <ProgressRing pct={pct} />
          <div>
            <div className="text-sm font-bold text-slate-800">{t('todayProgress')}</div>
            <div className="text-xs text-slate-400 tabular-nums">{takenCount}/{dueCount} {t('dosesLabel')}</div>
            <div className="flex gap-1.5 mt-3">
              {weekStrip.map(d => (
                <div key={d.key} className="flex flex-col items-center gap-1">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${d.isToday ? 'ring-2 ring-teal-300 ring-offset-1' : ''} ${
                      d.pct === null ? 'bg-slate-200'
                        : d.pct >= 1 ? 'bg-teal-500'
                        : d.pct > 0 ? 'bg-amber-400'
                        : 'bg-rose-300'
                    }`}
                  />
                  <span className="text-[9px] text-slate-400 font-semibold">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:ml-auto">
          <motion.div
            key={data?.stats?.streak}
            initial={{ scale: 0.85 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 px-4 py-3"
          >
            <Flame className="h-6 w-6 text-orange-500" />
            <div>
              <div className="text-lg font-extrabold text-slate-800 tabular-nums leading-none">{data?.stats?.streak ?? 0}</div>
              <div className="text-[10px] font-semibold text-slate-500 mt-0.5">{t('streakLabel')}</div>
            </div>
          </motion.div>
          {data?.stats?.adherence7 !== null && (
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 px-4 py-3">
              <CalendarCheck2 className="h-6 w-6 text-teal-500" />
              <div>
                <div className="text-lg font-extrabold text-slate-800 tabular-nums leading-none">{data?.stats?.adherence7}%</div>
                <div className="text-[10px] font-semibold text-slate-500 mt-0.5">{t('adherenceLabel')}</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* All done celebration */}
      <AnimatePresence>
        {allDone && view === 'today' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-5 py-4 flex items-center gap-3 shadow-lg shadow-teal-200/60"
          >
            <PartyPopper className="h-5 w-5" />
            <span className="text-sm font-bold">{t('allDone')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {view === 'today' ? (
        dueToday.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white border border-slate-200/80 py-16 px-6 text-center"
          >
            <div className="h-16 w-16 mx-auto rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center mb-5">
              <Pill className="h-8 w-8 text-teal-400" />
            </div>
            <h3 className="font-bold text-slate-800 mb-1.5">{t('emptyTitle')}</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed mb-6">{t('emptyText')}</p>
            <button
              onClick={() => setModal({ med: null })}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-teal-200/60 hover:-translate-y-0.5 transition-all"
            >
              <Sparkles className="h-4 w-4" /> {t('addMed')}
            </button>
          </motion.div>
        ) : (
          /* Slot cards */
          <div className="grid sm:grid-cols-2 gap-4">
            {SLOTS.map((slot, si) => {
              const slotMeds = dueToday.filter(m => m.slots[slot.id])
              if (!slotMeds.length) return null
              const slotTaken = slotMeds.filter(m => intakeOf(m.id, slot.id) === 'taken').length
              const SlotIcon = slot.icon
              return (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.07, duration: 0.35, ease: 'easeOut' }}
                  className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden"
                >
                  <div className={`bg-gradient-to-r ${slot.grad} px-5 py-3.5 flex items-center justify-between text-white`}>
                    <div className="flex items-center gap-2.5">
                      <SlotIcon className="h-5 w-5" />
                      <span className="font-bold text-sm">{t(`slot_${slot.id}`)}</span>
                      <span className="text-[11px] text-white/70 font-semibold">{slotMeds[0].times?.[slot.id]}</span>
                    </div>
                    <span className="text-[11px] font-bold bg-white/20 rounded-full px-2.5 py-1 tabular-nums">
                      {slotTaken}/{slotMeds.length}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {slotMeds.map(m => {
                      const status = intakeOf(m.id, slot.id)
                      const FormIcon = FORM_ICONS[m.form] || Pill
                      return (
                        <div key={m.id} className={`flex items-center gap-3 px-5 py-3 transition-colors ${status === 'taken' ? 'bg-teal-50/40' : ''}`}>
                          <button onClick={() => setModal({ med: m })} className="flex items-center gap-3 min-w-0 flex-1 text-left group">
                            <span className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${MED_COLORS[m.color]?.soft || 'bg-emerald-50 text-emerald-600'}`}>
                              <FormIcon className="h-5 w-5" />
                            </span>
                            <span className="min-w-0">
                              <span className={`block text-sm font-bold truncate transition-colors group-hover:text-teal-700 ${status === 'taken' ? 'text-slate-400 line-through decoration-teal-300' : 'text-slate-800'}`}>
                                {m.name}
                              </span>
                              {m.dose && <span className="block text-[11px] text-slate-400 truncate">{m.dose}</span>}
                            </span>
                          </button>
                          <CheckButton status={status} onCycle={() => cycleIntake(m, slot.id)} />
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )
      ) : (
        /* History heatmap */
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-5">{t('last4Weeks')}</h3>
          <div className="grid grid-cols-7 gap-2 max-w-md">
            {[...Array(28)].map((_, i) => {
              const d = 27 - i
              const dt = new Date(Date.now() - d * 24 * 3600 * 1000)
              const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt)
              const s = data?.stats?.dayStats?.[key]
              const ratio = s && s.due ? Math.min(1, s.taken / s.due) : null
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.012 }}
                  title={`${key}${s ? ` · ${s.taken}/${s.due}` : ''}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    ratio === null ? 'bg-slate-100 text-slate-300'
                      : ratio >= 1 ? 'bg-teal-500 text-white'
                      : ratio >= 0.5 ? 'bg-teal-300 text-white'
                      : ratio > 0 ? 'bg-amber-300 text-white'
                      : 'bg-rose-200 text-rose-500'
                  }`}
                >
                  {dt.getDate()}
                </motion.div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-5 text-[11px] text-slate-400 font-semibold">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-teal-500" /> 100%</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-teal-300" /> ≥50%</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-300" /> &lt;50%</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-slate-100" /> —</span>
          </div>
        </motion.div>
      )}

      {/* Tools row */}
      {meds.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-3">
          <button
            onClick={downloadIcs}
            className="group rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-teal-300 hover:shadow-md transition-all"
          >
            <AlarmClock className="h-5 w-5 text-teal-500 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-slate-800">{t('alarmExport')}</div>
            <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{t('alarmExportHint')}</div>
          </button>
          <button
            onClick={toggleEmail}
            disabled={emailSaving}
            className={`group rounded-2xl border p-4 text-left transition-all hover:shadow-md ${
              data?.emailReminders ? 'border-teal-300 bg-teal-50/50' : 'border-slate-200 bg-white hover:border-teal-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Mail className={`h-5 w-5 ${data?.emailReminders ? 'text-teal-600' : 'text-teal-500'}`} />
              <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${data?.emailReminders ? 'bg-teal-500' : 'bg-slate-200'}`}>
                <motion.span
                  animate={{ x: data?.emailReminders ? 16 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="block h-4 w-4 rounded-full bg-white shadow"
                />
              </span>
            </div>
            <div className="text-sm font-bold text-slate-800">{t('emailReminders')}</div>
            <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{t('emailRemindersHint')}</div>
          </button>
          <button
            onClick={() => window.print()}
            className="group rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-teal-300 hover:shadow-md transition-all"
          >
            <Printer className="h-5 w-5 text-teal-500 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-bold text-slate-800">{t('printPlan')}</div>
            <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{t('printPlanHint')}</div>
          </button>
        </div>
      )}

      {/* Printable plan (print only) */}
      <div className="hidden print:block">
        <h1 className="text-xl font-bold mb-1">Medikationsplan — {currentProfileName}</h1>
        <p className="text-xs text-gray-500 mb-4">{new Date().toLocaleDateString('de-DE')} · Medyra (medyra.de)</p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-1.5 text-left">Medikament</th>
              {SLOTS.map(s => <th key={s.id} className="border border-gray-300 px-2 py-1.5">{t(`slot_${s.id}`)}</th>)}
              <th className="border border-gray-300 px-2 py-1.5 text-left">Hinweise</th>
            </tr>
          </thead>
          <tbody>
            {meds.filter(m => m.active).map(m => (
              <tr key={m.id}>
                <td className="border border-gray-300 px-2 py-1.5 font-semibold">{m.name}{m.dose ? ` (${m.dose})` : ''}</td>
                {SLOTS.map(s => (
                  <td key={s.id} className="border border-gray-300 px-2 py-1.5 text-center font-bold">
                    {m.slots[s.id] ? '1' : '0'}
                  </td>
                ))}
                <td className="border border-gray-300 px-2 py-1.5 text-xs">{m.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / edit modal */}
      {modal && (
        <MedModal
          med={modal.med}
          profileId={profileId}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
