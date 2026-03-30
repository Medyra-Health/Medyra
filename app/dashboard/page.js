'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Upload, Clock, AlertCircle, ChevronRight } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { UserButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import MedyraLogo, { MedyraIcon } from '@/components/MedyraLogo'

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  const usagePercentage = subscription ? (subscription.currentUsage / subscription.usageLimit) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/">
              <div className="bg-[#060D0B] rounded-xl px-3 py-2">
                <MedyraLogo size="sm" variant="dark" showTagline />
              </div>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="hidden sm:block text-sm text-gray-500 truncate max-w-[120px]">
                {t('dashboard.welcome')}, {user?.firstName || 'User'}
              </span>
              <LanguageSwitcher />
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <p className="sm:hidden text-sm text-gray-500 mb-4">
          {t('dashboard.welcome')}, {user?.firstName || 'User'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('dashboard.yourPlan')}</CardTitle>
              <CardDescription>
                <Badge variant={subscription?.tier === 'free' ? 'secondary' : 'default'}>
                  {subscription?.tier?.toUpperCase() || 'FREE'}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('dashboard.usage')}</span>
                  <span>{subscription?.currentUsage || 0} / {subscription?.usageLimit || 1}</span>
                </div>
                <Progress value={usagePercentage} className="h-2" />
                {usagePercentage >= 80 && (
                  <p className="text-xs text-orange-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {t('dashboard.approachingLimit')}
                  </p>
                )}
              </div>
              {subscription?.tier === 'free' && (
                <Link href="/pricing" className="mt-3 block">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold" size="sm">{t('dashboard.upgradePlan')}</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/upload">
                <Button className="w-full" variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  {t('dashboard.uploadNew')}
                </Button>
              </Link>
              <Link href="/reports">
                <Button className="w-full" variant="outline" size="sm">
                  <MedyraIcon size={16} className="mr-2" />
                  {t('dashboard.viewAllReports')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('dashboard.stats')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{t('dashboard.totalReports')}</span>
                  <span className="font-semibold">{reports.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{t('dashboard.thisMonth')}</span>
                  <span className="font-semibold">{subscription?.currentUsage || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">{t('dashboard.recentReports')}</CardTitle>
              <Link href="/reports">
                <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700">
                  {t('dashboard.viewAll')} <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-10">
                <MedyraIcon size={40} className="mx-auto opacity-30" />
                <h3 className="mt-3 text-base font-medium text-gray-900">{t('dashboard.noReports')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('dashboard.uploadFirst')}</p>
                <Link href="/upload" className="mt-4 inline-block">
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                    <Upload className="mr-2 h-4 w-4" />
                    {t('dashboard.uploadNew')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {reports.slice(0, 5).map((report) => (
                  <Link key={report.id} href={`/reports/${report.id}`}>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3 min-w-0">
                        <MedyraIcon size={28} className="flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{report.fileName}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
