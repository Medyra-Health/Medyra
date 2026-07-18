'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser, UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, FileHeart, ClipboardList, Building2,
  Printer, Lock, Loader2, Stethoscope, ArrowLeft,
} from 'lucide-react'
import { ClinicLangProvider, useClinicT, CLINIC_ADMIN_EMAILS } from '@/components/clinic/ui'
import OverviewTab from '@/components/clinic/OverviewTab'
import PatientsTab from '@/components/clinic/PatientsTab'
import LettersTab from '@/components/clinic/LettersTab'
import AnamneseTab from '@/components/clinic/AnamneseTab'
import SettingsTab from '@/components/clinic/SettingsTab'

const TABS = [
  { id: 'overview', icon: LayoutDashboard, labelKey: 'navOverview' },
  { id: 'patients', icon: Users, labelKey: 'navPatients' },
  { id: 'letters', icon: FileHeart, labelKey: 'navLetters' },
  { id: 'anamnese', icon: ClipboardList, labelKey: 'navAnamnese' },
  { id: 'settings', icon: Building2, labelKey: 'navSettings' },
]

function LangToggle() {
  const { lang, setLang } = useClinicT()
  return (
    <div className="flex rounded-lg bg-white/10 p-0.5">
      {['de', 'en'].map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition-colors ${
            lang === l ? 'bg-white text-indigo-900' : 'text-indigo-200 hover:text-white'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function AccessGate({ children }) {
  const { user, isLoaded } = useUser()
  const { t } = useClinicT()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-7 w-7 text-indigo-400 animate-spin" />
      </div>
    )
  }

  const isAdmin = user?.emailAddresses?.some(e => CLINIC_ADMIN_EMAILS.includes(e.emailAddress))
  if (isAdmin) return children

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full text-center bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-10"
      >
        <div className="h-14 w-14 mx-auto rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-5">
          <Lock className="h-7 w-7 text-indigo-300" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">{t('accessDeniedTitle')}</h1>
        <p className="text-sm text-indigo-200/70 leading-relaxed mb-7">{t('accessDeniedBody')}</p>
        <div className="flex flex-col gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold transition-colors">
                {t('signIn')}
              </button>
            </SignInButton>
          </SignedOut>
          <Link href="/" className="w-full py-2.5 rounded-xl border border-white/15 text-indigo-100 text-sm font-semibold hover:bg-white/5 transition-colors inline-flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> {t('backHome')}
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

function ClinicDashboard() {
  const { t } = useClinicT()
  const [tab, setTab] = useState('overview')
  const [patients, setPatients] = useState([])
  const [patientsLoading, setPatientsLoading] = useState(true)

  const refreshPatients = useCallback(async () => {
    try {
      const res = await fetch('/api/clinic/patients')
      if (res.ok) {
        const d = await res.json()
        setPatients(d.patients || [])
      }
    } catch {}
    finally { setPatientsLoading(false) }
  }, [])

  useEffect(() => { refreshPatients() }, [refreshPatients])

  const tabProps = { patients, patientsLoading, refreshPatients, goToTab: setTab }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white sticky top-0 h-screen">
        <div className="px-6 pt-7 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-900/50">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-[17px] leading-tight tracking-tight">Medyra</div>
              <div className="text-[10px] font-bold tracking-[0.22em] text-indigo-300 uppercase">Clinic</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {TABS.map(({ id, icon: Icon, labelKey }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                tab === id ? 'text-white' : 'text-indigo-200/60 hover:text-indigo-100 hover:bg-white/5'
              }`}
            >
              {tab === id && (
                <motion.span
                  layoutId="clinic-nav-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/80 to-violet-600/60 shadow-lg shadow-indigo-950/40"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="h-[18px] w-[18px] relative z-10" />
              <span className="relative z-10">{t(labelKey)}</span>
            </button>
          ))}
          <Link
            href="/clinic/poster"
            target="_blank"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-indigo-200/60 hover:text-indigo-100 hover:bg-white/5 transition-colors"
          >
            <Printer className="h-[18px] w-[18px]" />
            {t('navPoster')}
          </Link>
        </nav>

        <div className="px-6 py-5 border-t border-white/10 flex items-center justify-between gap-3">
          <UserButton afterSignOutUrl="/" />
          <LangToggle />
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-40 bg-slate-950/95 backdrop-blur text-white">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-sm">Medyra <span className="text-indigo-300 font-bold text-[10px] tracking-widest uppercase ml-0.5">Clinic</span></span>
          </div>
          <div className="flex items-center gap-3">
            <LangToggle />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        <div className="flex overflow-x-auto px-2 pb-2 gap-1 scrollbar-none">
          {TABS.map(({ id, icon: Icon, labelKey }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                tab === id ? 'bg-indigo-500 text-white' : 'text-indigo-200/70 bg-white/5'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {t(labelKey)}
            </button>
          ))}
          <Link href="/clinic/poster" target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap text-indigo-200/70 bg-white/5">
            <Printer className="h-3.5 w-3.5" /> {t('navPoster')}
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-7 lg:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {tab === 'overview' && <OverviewTab {...tabProps} />}
              {tab === 'patients' && <PatientsTab {...tabProps} />}
              {tab === 'letters' && <LettersTab {...tabProps} />}
              {tab === 'anamnese' && <AnamneseTab {...tabProps} />}
              {tab === 'settings' && <SettingsTab {...tabProps} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default function ClinicPage() {
  return (
    <ClinicLangProvider>
      <AccessGate>
        <ClinicDashboard />
      </AccessGate>
    </ClinicLangProvider>
  )
}
