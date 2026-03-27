'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Upload, Clock, AlertCircle, ChevronRight } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { UserButton } from '@clerk/nextjs'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const t = useTranslations()
  const [subscription, setSubscription] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetchData()
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const usagePercentage = subscription ? (subscription.currentUsage / subscription.usageLimit) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Medyra</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{t('dashboard.welcome')}, {user?.firstName || 'User'}</span>
            <LanguageSwitcher />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.yourPlan')}</CardTitle>
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
                  <p className="text-sm text-orange-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {t('dashboard.approachingLimit')}
                  </p>
                )}
              </div>
              {subscription?.tier === 'free' && (
                <Link href="/pricing" className="mt-4 block">
                  <Button className="w-full" size="sm">{t('dashboard.upgradePlan')}</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/upload">
                <Button className="w-full" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  {t('dashboard.uploadNew')}
                </Button>
              </Link>
              <Link href="/reports">
                <Button className="w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  {t('dashboard.viewAllReports')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.stats')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('dashboard.totalReports')}</span>
                  <span className="font-semibold">{reports.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t('dashboard.thisMonth')}</span>
                  <span className="font-semibold">{subscription?.currentUsage || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t('dashboard.recentReports')}</CardTitle>
              <Link href="/reports">
                <Button variant="ghost" size="sm">
                  {t('dashboard.viewAll')} <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">{t('dashboard.noReports')}</h3>
                <p className="mt-2 text-sm text-gray-500">{t('dashboard.uploadFirst')}</p>
                <Link href="/upload" className="mt-4 inline-block">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    {t('dashboard.uploadNew')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.slice(0, 5).map((report) => (
                  <Link key={report.id} href={`/reports/${report.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">{report.fileName}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
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
