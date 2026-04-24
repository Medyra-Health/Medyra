import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

const ADMIN_EMAIL = 'abralur28@gmail.com'

function getAnalyticsClient() {
  const credsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  const propertyId = process.env.GA4_PROPERTY_ID
  if (!credsJson || !propertyId) return null

  let credentials
  try {
    credentials = JSON.parse(credsJson)
  } catch {
    return null
  }

  return {
    client: new BetaAnalyticsDataClient({ credentials }),
    propertyId: `properties/${propertyId}`,
  }
}

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const email = user.emailAddresses?.[0]?.emailAddress
    if (email !== ADMIN_EMAIL) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const ga = getAnalyticsClient()
    if (!ga) {
      return NextResponse.json({ configured: false })
    }

    const { client, propertyId } = ga

    // Run all GA4 queries in parallel
    const [
      last30Summary,
      last7Summary,
      todaySummary,
      topPages,
      trafficSources,
      countries,
      dailyUsers,
      deviceBreakdown,
    ] = await Promise.all([
      // Last 30 days: sessions, users, new users, page views, avg session duration
      client.runReport({
        property: propertyId,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'newUsers' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
      }),

      // Last 7 days summary
      client.runReport({
        property: propertyId,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'newUsers' },
        ],
      }),

      // Today summary
      client.runReport({
        property: propertyId,
        dateRanges: [{ startDate: 'today', endDate: 'today' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
        ],
      }),

      // Top 8 pages by views
      client.runReport({
        property: propertyId,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 8,
      }),

      // Traffic sources
      client.runReport({
        property: propertyId,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }, { name: 'newUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 6,
      }),

      // Top countries
      client.runReport({
        property: propertyId,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 8,
      }),

      // Daily active users for last 30 days (for chart)
      client.runReport({
        property: propertyId,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }, { name: 'newUsers' }, { name: 'sessions' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),

      // Device category breakdown
      client.runReport({
        property: propertyId,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      }),
    ])

    function metricVal(report, index = 0) {
      return Number(report[0]?.rows?.[0]?.metricValues?.[index]?.value || 0)
    }

    const l30 = last30Summary[0]?.rows?.[0]?.metricValues || []
    const l7 = last7Summary[0]?.rows?.[0]?.metricValues || []
    const td = todaySummary[0]?.rows?.[0]?.metricValues || []

    return NextResponse.json({
      configured: true,
      summary: {
        last30: {
          sessions: Number(l30[0]?.value || 0),
          users: Number(l30[1]?.value || 0),
          newUsers: Number(l30[2]?.value || 0),
          pageViews: Number(l30[3]?.value || 0),
          avgSessionDuration: Math.round(Number(l30[4]?.value || 0)),
          bounceRate: Number((Number(l30[5]?.value || 0) * 100).toFixed(1)),
        },
        last7: {
          sessions: Number(l7[0]?.value || 0),
          users: Number(l7[1]?.value || 0),
          newUsers: Number(l7[2]?.value || 0),
        },
        today: {
          sessions: Number(td[0]?.value || 0),
          users: Number(td[1]?.value || 0),
        },
      },
      topPages: (topPages[0]?.rows || []).map(r => ({
        path: r.dimensionValues[0]?.value,
        views: Number(r.metricValues[0]?.value || 0),
        users: Number(r.metricValues[1]?.value || 0),
      })),
      trafficSources: (trafficSources[0]?.rows || []).map(r => ({
        channel: r.dimensionValues[0]?.value,
        sessions: Number(r.metricValues[0]?.value || 0),
        newUsers: Number(r.metricValues[1]?.value || 0),
      })),
      countries: (countries[0]?.rows || []).map(r => ({
        country: r.dimensionValues[0]?.value,
        users: Number(r.metricValues[0]?.value || 0),
      })),
      dailyChart: (dailyUsers[0]?.rows || []).map(r => {
        const raw = r.dimensionValues[0]?.value || ''
        const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
        return {
          date,
          users: Number(r.metricValues[0]?.value || 0),
          newUsers: Number(r.metricValues[1]?.value || 0),
          sessions: Number(r.metricValues[2]?.value || 0),
        }
      }),
      devices: (deviceBreakdown[0]?.rows || []).map(r => ({
        device: r.dimensionValues[0]?.value,
        users: Number(r.metricValues[0]?.value || 0),
      })),
    })
  } catch (error) {
    console.error('GA4 analytics error:', error)
    return NextResponse.json({ error: error.message || 'GA4 error', configured: true }, { status: 500 })
  }
}
