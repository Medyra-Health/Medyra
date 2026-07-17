'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Upload, Clock, AlertCircle, ChevronRight, Infinity, FileText,
  TrendingUp, Crown, Zap, Star, Stethoscope, Users, Plus,
  ChevronDown, Shield, Sparkles, Activity, User, RefreshCw,
  ArrowRight, Lock, Settings,
} from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import MedyraUserButton from '@/components/MedyraUserButton'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import MedyraLogo, { MedyraIcon } from '@/components/MedyraLogo'
import AppHeader, { HeaderButton } from '@/components/AppHeader'
import ReferralCard from '@/components/dashboard/ReferralCard'
import DataPrivacyCard from '@/components/DataPrivacyCard'

// Lazy-load recharts to avoid SSR issues
function ChartLoading() {
  const t = useTranslations()
  return <div className="h-48 flex items-center justify-center text-sm text-gray-400">{t('dashboard.loadingChart')}</div>
}

const HealthTimeline = dynamic(() => import('@/components/HealthTimeline'), {
  ssr: false,
  loading: () => <ChartLoading />,
})

const PLAN_META = {
  free:     { label: 'Free',      color: 'text-gray-600',    bg: 'bg-gray-100',    border: 'border-gray-200',    icon: null,  profileLimit: 0 },
  personal: { label: 'Personal',  color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', icon: Star,  profileLimit: 2 },
  family:   { label: 'Family',    color: 'text-purple-700',  bg: 'bg-purple-100',  border: 'border-purple-200',  icon: Users, profileLimit: 5 },
  clinic:   { label: 'Clinic',    color: 'text-indigo-700',  bg: 'bg-indigo-100',  border: 'border-indigo-200',  icon: Crown, profileLimit: null },
  admin:    { label: 'Admin',     color: 'text-orange-700',  bg: 'bg-orange-100',  border: 'border-orange-200',  icon: Crown, profileLimit: null },
}

const COLOR_DOT = {
  emerald: 'bg-emerald-500', blue: 'bg-blue-500', violet: 'bg-violet-500',
  rose: 'bg-rose-500', amber: 'bg-amber-500', teal: 'bg-teal-500',
}
const REL_ICONS = { self: User, partner: '❤️', child: '👶', parent: '👴' }

function ManageSubscriptionButton() {
  const t = useTranslations()
  const [loading, setLoading] = useState(false)

  async function handleManage() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: window.location.origin }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors disabled:opacity-50"
    >
      {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Settings className="h-3 w-3" />}
      {t('dashboard.managePlanButton')}
    </button>
  )
}

function ProfileSwitcher({ profiles, selected, onChange, canCreate, tier }) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const current = profiles.find(p => p.id === selected) || profiles[0]

  if (!profiles.length) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors shadow-sm"
      >
        {current && (
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${COLOR_DOT[current.color] || 'bg-emerald-500'}`} />
        )}
        <span className="max-w-[120px] truncate">{current?.name || t('dashboard.selectProfilePlaceholder')}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => { onChange(p.id); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${selected === p.id ? 'bg-emerald-50' : ''}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${COLOR_DOT[p.color] || 'bg-emerald-500'}`} />
              <span className="font-medium text-gray-800 flex-1 truncate">{p.name}</span>
              <span className="text-[10px] text-gray-400 capitalize">{p.relationship}</span>
            </button>
          ))}
          <div className="border-t border-gray-100">
            <Link href="/profiles"
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors">
              <Plus className="h-3.5 w-3.5" />
              {canCreate ? t('dashboard.addProfile') : t('dashboard.manageProfiles')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function VaultSection({ profiles, selectedProfileId, onSelectProfile, tier, canCreate }) {
  const t = useTranslations()
  const isPaid = tier !== 'free'
  const selectedProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0]

  if (!isPaid) {
    const FEATURES = [
      { icon: TrendingUp, label: t('dashboard.vaultFeature1Label'), desc: t('dashboard.vaultFeature1Desc') },
      { icon: Sparkles,   label: t('dashboard.vaultFeature2Label'), desc: t('dashboard.vaultFeature2Desc') },
      { icon: Users,      label: t('dashboard.vaultFeature3Label'), desc: t('dashboard.vaultFeature3Desc') },
    ]
    return (
      <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{t('dashboard.vaultTitle')}</h2>
              <p className="text-xs text-gray-500">{t('dashboard.vaultSubtitle')}</p>
            </div>
          </div>
          <Lock className="h-4 w-4 text-gray-600" />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 text-center border border-white/8">
              <Icon className="h-4 w-4 text-gray-400 mx-auto mb-1.5" />
              <p className="text-[10px] font-semibold text-gray-300 mb-0.5">{label}</p>
              <p className="text-[10px] text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
        <Link href="/pricing">
          <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            {t('dashboard.unlockVaultButton')} <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
        <p className="text-center text-[10px] text-gray-600 mt-2">{t('dashboard.vaultPricingNote')}</p>
      </div>
    )
  }

  if (!profiles.length) {
    return (
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
          <User className="h-5 w-5 text-emerald-500" />
        </div>
        <p className="text-sm font-bold text-gray-700 mb-1">{t('dashboard.noProfilesTitle')}</p>
        <p className="text-xs text-gray-400 mb-4">{t('dashboard.noProfilesDesc')}</p>
        <Link href="/profiles">
          <button className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
            <Plus className="h-3.5 w-3.5" /> {t('dashboard.createProfileButton')}
          </button>
        </Link>
      </div>
    )
  }

  const QUICK_STATS = [
    { label: t('dashboard.statReportsLabel'),   value: selectedProfile?.biomarkers?.length || 0 },
    { label: t('dashboard.statBiomarkersLabel'), value: selectedProfile?.biomarkers?.reduce((n, e) => n + (e.values?.length || e.key ? 1 : 0), 0) || 0 },
    { label: t('dashboard.statTrackedSinceLabel'), value: selectedProfile?.createdAt ? new Date(selectedProfile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }) : '—' },
  ]

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Vault header */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">{t('dashboard.healthTimelineTitle')}</h2>
            <p className="text-xs text-gray-400">{t('dashboard.viewingLabel')} <span className="font-semibold text-gray-600">{selectedProfile?.name}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ProfileSwitcher
            profiles={profiles}
            selected={selectedProfileId}
            onChange={onSelectProfile}
            canCreate={canCreate}
            tier={tier}
          />
          <Link href={selectedProfile ? `/profiles/${selectedProfile.id}` : '/profiles'} className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
            {t('dashboard.viewProfileLink')}
          </Link>
        </div>
      </div>

      {/* Timeline chart */}
      <div className="p-5">
        <HealthTimeline profile={selectedProfile} />
      </div>

      {/* Quick profile stats */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-3 gap-3">
          {QUICK_STATS.map(({ label, value }) => (
            <div key={label} className="text-center bg-gray-50 rounded-xl p-3">
              <p className="text-lg font-black text-gray-800">{value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const t = useTranslations()
  const [subscription, setSubscription] = useState(null)
  const [reports, setReports] = useState([])
  const [prepHistory, setPrepHistory] = useState([])
  const [profiles, setProfiles] = useState([])
  const [selectedProfileId, setSelectedProfileId] = useState(null)
  const [profileMeta, setProfileMeta] = useState({ canCreate: false })
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [subRes, reportsRes, prepRes, profilesRes] = await Promise.all([
        fetch('/api/subscription'),
        fetch('/api/reports'),
        fetch('/api/prep'),
        fetch('/api/profiles'),
      ])
      const [subData, reportsData, prepData, profilesData] = await Promise.all([
        subRes.json(), reportsRes.json(), prepRes.json(), profilesRes.json(),
      ])
      setSubscription(subData)
      setReports(reportsData.reports || [])
      setPrepHistory(prepData.history || [])
      setProfiles(profilesData.profiles || [])
      setProfileMeta({ canCreate: profilesData.canCreate, limit: profilesData.limit })
      if (profilesData.profiles?.length && !selectedProfileId) {
        setSelectedProfileId(profilesData.profiles[0].id)
      }
    } catch (error) { console.error('Dashboard fetch error:', error) }
    finally { setLoading(false) }
  }, [selectedProfileId])

  useEffect(() => {
    if (isLoaded && user) fetchData()
  }, [isLoaded, user])

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">{t('dashboard.loadingDashboard')}</p>
        </div>
      </div>
    )
  }

  const tier = subscription?.tier || 'free'
  const meta = PLAN_META[tier] || PLAN_META.free
  const used = subscription?.currentUsage || 0
  const limit = subscription?.usageLimit || 2
  const remaining = subscription?.remaining ?? Math.max(0, limit - used)
  const isUnlimited = limit >= 999999
  const usagePct = isUnlimited ? 0 : Math.min(100, (used / limit) * 100)
  const PlanIcon = meta.icon
  const isPaid = tier !== 'free' && tier !== 'onetime'

  const thisMonthReports = reports.filter(r => {
    const d = new Date(r.createdAt), now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  return (
    <div className="min-h-screen bg-[#F7FBF9] overflow-x-hidden" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`.font-display { font-family: var(--font-playfair), Georgia, serif; }`}</style>
      {/* Header */}
      <AppHeader user tone="emerald" homeHref="/">
        <HeaderButton href="/profiles" variant="soft" icon={<Users className="h-4 w-4" />} className="hidden sm:inline-flex">
          {t('dashboard.profilesNavLabel')}
        </HeaderButton>
      </AppHeader>

      <div className="container mx-auto px-4 py-6 max-w-6xl">

        {/* Welcome + plan bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-xl md:text-2xl font-black text-[#0B1F17]">
              {t('dashboard.welcome')}, {user?.firstName || t('dashboard.greetingFallbackName')} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{t('dashboard.heroSubtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${meta.bg} ${meta.color}`}>
              {PlanIcon && <PlanIcon className="h-3.5 w-3.5" />}
              {meta.label} {t('dashboard.planLabelSuffix')}
            </span>
            {!isPaid ? (
              <Link href="/pricing">
                <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                  {t('dashboard.upgradeButton')} <ArrowRight className="h-3 w-3" />
                </button>
              </Link>
            ) : (
              <ManageSubscriptionButton />
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: t('dashboard.statReportsThisMonth'), value: thisMonthReports.length,
              sub: isUnlimited ? t('dashboard.statUnlimited') : t('dashboard.statRemaining', { count: remaining }),
              color: remaining === 0 && !isUnlimited ? 'text-red-600' : 'text-emerald-600',
            },
            { label: t('dashboard.statTotalReports'), value: reports.length, color: 'text-gray-800' },
            { label: t('dashboard.statDoctorSummaries'), value: prepHistory.length, color: 'text-violet-700' },
            { label: t('dashboard.statProfiles'), value: profiles.length, color: 'text-blue-700', sub: isPaid ? `/ ${meta.profileLimit ?? '∞'}` : t('dashboard.statUpgradeToUnlock') },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Usage bar for free/onetime */}
        {!isUnlimited && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600">{t('dashboard.monthlyUsage')}</p>
              <p className="text-xs text-gray-400">{t('dashboard.usedOfLimit', { used, limit })}</p>
            </div>
            <Progress value={usagePct} className="h-2" />
            {usagePct >= 100 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {t('dashboard.limitReachedMsg')}
                </p>
                <Link href="/pricing"><Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-7">{t('dashboard.upgradeButton')}</Button></Link>
              </div>
            )}
          </div>
        )}

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-5 mb-5">

          {/* Left, actions + recent reports */}
          <div className="space-y-4 min-w-0">
            {/* Quick actions */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('dashboard.quickActions')}</p>
              <div className="space-y-2">
                <Link href="/upload">
                  <button className="w-full flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-200 disabled:opacity-50"
                    disabled={!isUnlimited && remaining === 0}>
                    <Upload className="h-4 w-4 flex-shrink-0" /> {t('dashboard.analyseReportButton')}
                  </button>
                </Link>
                <Link href="/prep">
                  <button className="w-full flex items-center gap-2.5 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-violet-200">
                    <Stethoscope className="h-4 w-4 flex-shrink-0" /> {t('dashboard.doctorVisitPrepButton')}
                  </button>
                </Link>
                <Link href="/profiles">
                  <button className="w-full flex items-center gap-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200">
                    <Users className="h-4 w-4 flex-shrink-0" /> {t('dashboard.healthProfilesButton')}
                  </button>
                </Link>
                <Link href="/reports">
                  <button className="w-full flex items-center gap-2.5 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors bg-white">
                    <FileText className="h-4 w-4 flex-shrink-0" /> {t('dashboard.allReportsButton')}
                  </button>
                </Link>
              </div>
            </div>

            {/* Invite friends, earn free reports */}
            <ReferralCard />

            {/* Recent reports */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('dashboard.recentReports')}</p>
                <Link href="/reports"><button className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">{t('dashboard.viewAll')}</button></Link>
              </div>
              {reports.length === 0 ? (
                <div className="text-center py-6">
                  <MedyraIcon size={32} className="mx-auto opacity-20 mb-2" />
                  <p className="text-xs text-gray-400">{t('dashboard.noReports')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {reports.slice(0, 4).map(report => (
                    <Link key={report.id} href={`/reports/${report.id}`}>
                      <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <MedyraIcon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{report.fileName}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-2.5 w-2.5" /> {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right, vault / timeline (2/3 width) */}
          <div className="lg:col-span-2 min-w-0">
            <VaultSection
              profiles={profiles}
              selectedProfileId={selectedProfileId}
              onSelectProfile={setSelectedProfileId}
              tier={tier}
              canCreate={profileMeta.canCreate}
            />
          </div>
        </div>

        {/* Data & privacy: every user picks keep vs auto delete after 30 days */}
        <div className="mb-5 shadow-sm rounded-2xl">
          <DataPrivacyCard />
        </div>

        {/* Doctor prep history */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <Stethoscope className="h-3.5 w-3.5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800">{t('dashboard.doctorSummariesTitle')}</h2>
                <p className="text-xs text-gray-400">{t('dashboard.doctorSummariesSubtitle')}</p>
              </div>
            </div>
            <Link href="/prep">
              <button className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">
                {t('dashboard.newSummaryButton')} <Plus className="h-3 w-3" />
              </button>
            </Link>
          </div>
          {prepHistory.length === 0 ? (
            <div className="text-center py-10">
              <Stethoscope className="h-10 w-10 mx-auto text-gray-200 mb-3" />
              <p className="text-sm font-semibold text-gray-500 mb-1">{t('dashboard.noSummariesTitle')}</p>
              <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto">{t('dashboard.noSummariesDesc')}</p>
              <Link href="/prep">
                <button className="inline-flex items-center gap-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                  <Stethoscope className="h-4 w-4" /> {t('dashboard.prepareVisitButton')}
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {prepHistory.slice(0, 4).map(doc => (
                <Link key={doc.id} href="/prep">
                  <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-violet-50 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
                      <Stethoscope className="h-3.5 w-3.5 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {doc.input?.slice(0, 80)}{(doc.input?.length || 0) > 80 ? '…' : ''}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0 group-hover:text-violet-400 transition-colors" />
                  </div>
                </Link>
              ))}
              {prepHistory.length > 4 && (
                <div className="px-5 py-3 text-center">
                  <Link href="/prep"><span className="text-xs text-violet-600 font-semibold hover:underline">{t('dashboard.viewAllSummaries', { count: prepHistory.length })}</span></Link>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
