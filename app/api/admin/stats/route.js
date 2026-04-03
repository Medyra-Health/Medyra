import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

const ADMIN_EMAIL = 'abralur28@gmail.com'

let mongoClient = null
let db = null
let isConnecting = false

async function connectToMongo() {
  if (db && mongoClient) {
    try {
      await db.admin().ping()
      return db
    } catch {
      mongoClient = null
      db = null
    }
  }
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 100))
    return connectToMongo()
  }
  try {
    isConnecting = true
    if (!process.env.MONGO_URL) throw new Error('MONGO_URL not set')
    mongoClient = new MongoClient(process.env.MONGO_URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    })
    await mongoClient.connect()
    db = mongoClient.db(process.env.DB_NAME || 'medyra')
    return db
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`)
  } finally {
    isConnecting = false
  }
}

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = user.emailAddresses?.[0]?.emailAddress
    if (email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const database = await connectToMongo()

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 7)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const [
      totalUsers,
      usersToday,
      usersThisWeek,
      usersThisMonth,
      totalReports,
      reportsToday,
      reportsThisWeek,
      totalRevenue,
      monthlyRevenue,
      subscriptionBreakdown,
      recentUsers,
      recentReports,
      chartData,
      chatTotalArr,
      chatTodayArr,
      chatMonthArr,
      topChatters,
    ] = await Promise.all([
      // User stats
      database.collection('users').countDocuments(),
      database.collection('users').countDocuments({ createdAt: { $gte: startOfToday } }),
      database.collection('users').countDocuments({ createdAt: { $gte: startOfWeek } }),
      database.collection('users').countDocuments({ createdAt: { $gte: startOfMonth } }),

      // Report stats
      database.collection('reports').countDocuments(),
      database.collection('reports').countDocuments({ createdAt: { $gte: startOfToday } }),
      database.collection('reports').countDocuments({ createdAt: { $gte: startOfWeek } }),

      // Revenue: total all-time
      database.collection('payments').aggregate([
        { $match: { status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).toArray(),

      // Revenue: this month
      database.collection('payments').aggregate([
        { $match: { status: 'succeeded', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).toArray(),

      // Subscription breakdown by tier
      database.collection('users').aggregate([
        { $group: { _id: '$tier', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),

      // Recent 10 users
      database.collection('users')
        .find({}, { projection: { clerkId: 1, email: 1, tier: 1, createdAt: 1 } })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray(),

      // Recent 10 reports
      database.collection('reports')
        .find({}, { projection: { userId: 1, fileName: 1, createdAt: 1, status: 1 } })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray(),

      // Chart data: signups + reports per day for last 30 days
      Promise.all([
        database.collection('users').aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]).toArray(),
        database.collection('reports').aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]).toArray(),
      ]),

      // Chat stats: total conversations across all reports
      database.collection('reports').aggregate([
        { $project: { chatCount: { $cond: { if: { $isArray: '$conversations' }, then: { $size: '$conversations' }, else: 0 } }, userId: 1, createdAt: 1 } },
        { $group: { _id: null, total: { $sum: '$chatCount' } } },
      ]).toArray(),

      // Chat messages sent today
      database.collection('reports').aggregate([
        { $match: { conversations: { $exists: true, $ne: [] } } },
        { $unwind: { path: '$conversations', preserveNullAndEmptyArrays: false } },
        { $match: { 'conversations.timestamp': { $gte: startOfToday } } },
        { $count: 'total' },
      ]).toArray(),

      // Chat messages sent this month
      database.collection('reports').aggregate([
        { $match: { conversations: { $exists: true, $ne: [] } } },
        { $unwind: { path: '$conversations', preserveNullAndEmptyArrays: false } },
        { $match: { 'conversations.timestamp': { $gte: startOfMonth } } },
        { $count: 'total' },
      ]).toArray(),

      // Top chatters: users with most chat messages
      database.collection('users')
        .find({}, { projection: { clerkId: 1, email: 1, totalChatMessages: 1 } })
        .sort({ totalChatMessages: -1 })
        .limit(5)
        .toArray(),
    ])

    // Build chart data: merge user signups and reports by date
    const [signupsByDay, reportsByDay] = chartData
    const dateMap = {}
    signupsByDay.forEach(d => {
      if (!dateMap[d._id]) dateMap[d._id] = { date: d._id, signups: 0, reports: 0 }
      dateMap[d._id].signups = d.count
    })
    reportsByDay.forEach(d => {
      if (!dateMap[d._id]) dateMap[d._id] = { date: d._id, signups: 0, reports: 0 }
      dateMap[d._id].reports = d.count
    })
    const mergedChartData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date))

    // Chat analytics
    const totalChatMessages = chatTotalArr[0]?.total || 0
    const chatToday = chatTodayArr[0]?.total || 0
    const chatThisMonth = chatMonthArr[0]?.total || 0
    // Estimated Anthropic cost: ~1200 input tokens + 350 output tokens per message
    // claude-sonnet-4-6: $3/M input, $15/M output
    const estimatedCostUSD = ((totalChatMessages * 1200 / 1000000) * 3 + (totalChatMessages * 350 / 1000000) * 15).toFixed(4)

    // Enrich recent users with report counts
    const userClerkIds = recentUsers.map(u => u.clerkId).filter(Boolean)
    const reportCounts = await database.collection('reports').aggregate([
      { $match: { userId: { $in: userClerkIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]).toArray()
    const reportCountMap = {}
    reportCounts.forEach(r => { reportCountMap[r._id] = r.count })

    // Enrich recent reports with user emails
    const reportUserIds = recentReports.map(r => r.userId).filter(Boolean)
    const reportUsers = await database.collection('users').find(
      { clerkId: { $in: reportUserIds } },
      { projection: { clerkId: 1, email: 1 } }
    ).toArray()
    const reportUserMap = {}
    reportUsers.forEach(u => { reportUserMap[u.clerkId] = u.email })

    // Active subscriptions (paid tiers)
    const paidTiers = ['personal', 'family', 'clinic', 'onetime']
    const activeSubscriptions = subscriptionBreakdown
      .filter(s => paidTiers.includes(s._id))
      .reduce((sum, s) => sum + s.count, 0)

    const avgReportsPerUser = totalUsers > 0 ? (totalReports / totalUsers).toFixed(1) : 0

    return NextResponse.json({
      users: {
        total: totalUsers,
        today: usersToday,
        thisWeek: usersThisWeek,
        thisMonth: usersThisMonth,
      },
      reports: {
        total: totalReports,
        today: reportsToday,
        thisWeek: reportsThisWeek,
        avgPerUser: Number(avgReportsPerUser),
      },
      revenue: {
        total: totalRevenue[0]?.total ? (totalRevenue[0].total / 100).toFixed(2) : '0.00',
        thisMonth: monthlyRevenue[0]?.total ? (monthlyRevenue[0].total / 100).toFixed(2) : '0.00',
        activeSubscriptions,
        paidUsers: activeSubscriptions,
        freeUsers: totalUsers - activeSubscriptions,
      },
      subscriptionBreakdown: subscriptionBreakdown.map(s => ({
        tier: s._id || 'free',
        count: s.count,
      })),
      recentUsers: recentUsers.map(u => ({
        id: u._id?.toString(),
        email: u.email || '—',
        tier: u.tier || 'free',
        createdAt: u.createdAt,
        reportCount: reportCountMap[u.clerkId] || 0,
      })),
      recentReports: recentReports.map(r => ({
        id: r._id?.toString(),
        fileName: r.fileName || 'Unnamed',
        createdAt: r.createdAt,
        status: r.status || 'completed',
        userEmail: reportUserMap[r.userId] || '—',
      })),
      chartData: mergedChartData,
      chatStats: {
        total: totalChatMessages,
        today: chatToday,
        thisMonth: chatThisMonth,
        estimatedCostUSD: Number(estimatedCostUSD),
        topChatters: topChatters.map(u => ({ email: u.email || '—', count: u.totalChatMessages || 0 })),
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
