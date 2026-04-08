'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Upload, Clock, AlertCircle, ChevronRight, Infinity, FileText, TrendingUp, Crown, Zap, Star } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import MedyraUserButton from '@/components/MedyraUserButton'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import MedyraLogo, { MedyraIcon } from '@/components/MedyraLogo'

const PLAN_META = {
  free:     { label: 'Free',     color: 'bg-gray-100 text-gray-700',       border: 'border-gray-200',    icon: null,    limit: 3,      features: ['3 free reports', 'Plain language explanation', 'Flagged abnormal values'] },
  onetime:  { label: 'One-Time', color: 'bg-blue-100 text-blue-700',       border: 'border-blue-200',    icon: Zap,     limit: 2,      features: ['Full AI explanation', 'Follow up chat', 'PDF export'] },
  personal: { label: 'Personal', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', icon: Star,    limit: 999999, features: ['Unlimited reports', 'Full history', 'Follow up chat', 'PDF export'] },
  family:   { label: 'Family',   color: 'bg-purple-100 text-purple-700',   border: 'border-purple-200',  icon: Star,    limit: 999999, features: ['Unlimited reports', 'Full history', 'Follow up chat', 'Priority support'] },
  clinic:   { label: 'Clinic',   color: 'bg-indigo-100 text-indigo-700',   border: 'border-indigo-200',  icon: Crown,   limit: 999999, features: ['Unlimited patients', 'API access', 'Custom branding', 'Dedicated support'] },
  admin:    { label: 'Admin',    color: 'bg-orange-100 text-orange-700',   border: 'border-orange-200',  icon: Crown,   limit: 999999, features: ['Unlimited everything', 'Full access', 'Admin dashboard'] },
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const t = useTranslations()
  const [subscription, setSubscription] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) fetchData()
  }, [isLoaded, user])

  async function fetchData() {
    try {
      const [subRes, reportsRes] = await Promise.all([
        fetch('/api/subscription'),
        fetch('/api/reports')
      ])
      const subData = await subRes.json()
      const reportsData = await reportsRes.json()
      setSubscription(subData)
      setReports(reportsData.reports || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  const tier = subscription?.tier || 'free'
  const meta = PLAN_META[tier] || PLAN_META.free
  const used = subscription?.currentUsage || 0
  const limit = subscription?.usageLimit || 1
  const remaining = subscription?.remaining ?? Math.max(0, limit - used)
  const isUnlimited = limit >= 999999
  const usagePct = isUnlimited ? 0 : Math.min(100, (used / limit) * 100)
  const PlanIcon = meta.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/"><MedyraLogo size="md" /></Link>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="hidden sm:block text-sm text-gray-500 truncate max-w-[140px]">
                {t('dashboard.welcome')}, {user?.firstName || 'User'}
              </span>
              <LanguageSwitcher />
              <MedyraUserButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <p className="sm:hidden text-sm text-gray-500 mb-4">
          {t('dashboard.welcome')}, {user?.firstName || 'User'}
        </p>

        {/* ── PLAN CARD ── */}
        <Card className={`mb-5 border-2 ${meta.border}`}>
          <CardContent className="pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Plan info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {PlanIcon && <PlanIcon className="h-4 w-4 text-current opacity-70" />}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label.toUpperCase()}</span>
                  <span className="text-xs text-gray-400">plan</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {meta.features.map(f => (
                    <span key={f} className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Usage */}
              <div className="sm:text-right sm:min-w-[160px]">
                {isUnlimited ? (
                  <div className="flex sm:justify-end items-center gap-2">
                    <Infinity className="h-5 w-5 text-emerald-500" />
                    <span className="text-lg font-bold text-emerald-600">Unlimited</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex sm:justify-end items-baseline gap-1 mb-1">
                      <span className={`text-3xl font-bold ${remaining === 0 ? 'text-red-600' : remaining <= 1 ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {remaining}
                      </span>
                      <span className="text-sm text-gray-400">/ {limit} remaining</span>
                    </div>
                    <Progress value={usagePct} className="h-1.5 w-full sm:w-40" />
                    {usagePct >= 80 && (
                      <p className="text-xs text-orange-600 mt-1 flex items-center gap-1 sm:justify-end">
                        <AlertCircle className="h-3 w-3" /> {t('dashboard.approachingLimit')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Upgrade CTA */}
            {(tier === 'free' || tier === 'onetime') && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-xs text-gray-500 flex-1">
                  {remaining === 0
                    ? 'You\'ve used all your reports this month. Upgrade to continue.'
                    : 'Upgrade for unlimited reports, chat history, and more.'}
                </p>
                <Link href="/pricing">
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold w-full sm:w-auto">
                    <TrendingUp className="mr-1.5 h-3.5 w-3.5" /> Upgrade Plan
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-5">
          <Card>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{reports.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('dashboard.totalReports')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{used}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('dashboard.thisMonth')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
              {isUnlimited
                ? <p className="text-xl sm:text-2xl font-bold text-emerald-600">∞</p>
                : <p className={`text-xl sm:text-2xl font-bold ${remaining === 0 ? 'text-red-600' : 'text-emerald-600'}`}>{remaining}</p>
              }
              <p className="text-xs text-gray-500 mt-0.5">{t('dashboard.remaining')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{reports.filter(r => {
                const d = new Date(r.createdAt)
                const now = new Date()
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
              }).length}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('dashboard.thisMonth')}</p>
            </CardContent>
          </Card>
        </div>

        {/* ── ACTIONS + RECENT ── */}
        <div className="grid md:grid-cols-3 gap-3 sm:gap-4">
          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/upload">
                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-11 shadow-sm shadow-emerald-200"
                  disabled={!isUnlimited && remaining === 0}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t('dashboard.uploadNew')}
                </Button>
              </Link>
              <Link href="/reports">
                <Button className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-sm shadow-blue-200 border-0">
                  <FileText className="mr-2 h-4 w-4" />
                  {t('dashboard.viewAllReports')}
                </Button>
              </Link>
              <Link href="/prep">
                <Button className="w-full h-11 bg-violet-500 hover:bg-violet-600 text-white font-semibold shadow-sm shadow-violet-200 border-0">
                  <FileText className="mr-2 h-4 w-4" />
                  {t('dashboard.prepButton')}
                </Button>
              </Link>
              {(tier === 'free' || tier === 'onetime') && (
                <Link href="/pricing">
                  <Button className="w-full h-10" variant="ghost">
                    <TrendingUp className="mr-2 h-3.5 w-3.5" /> {t('dashboard.upgradePlan')}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Recent reports */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">{t('dashboard.recentReports')}</CardTitle>
                <Link href="/reports">
                  <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700">
                    {t('dashboard.viewAll')} <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <MedyraIcon size={36} className="mx-auto opacity-20" />
                  <h3 className="mt-3 text-sm font-medium text-gray-900">{t('dashboard.noReports')}</h3>
                  <p className="mt-1 text-xs text-gray-400">{t('dashboard.uploadFirst')}</p>
                  <Link href="/upload" className="mt-4 inline-block">
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                      <Upload className="mr-2 h-4 w-4" /> {t('dashboard.uploadNew')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {reports.slice(0, 5).map((report) => (
                    <Link key={report.id} href={`/reports/${report.id}`}>
                      <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-emerald-200 transition-all">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <MedyraIcon size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{report.fileName}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
