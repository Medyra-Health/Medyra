'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

function formatShortDate(str) {
  if (!str) return ''
  const [, m, d] = str.split('-')
  return `${d}/${m}`
}

export default function GAChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center text-gray-400 text-sm">
        No GA data for the last 30 days
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <defs>
          <linearGradient id="gaUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gaNewUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={28} />
        <Tooltip
          labelFormatter={l => `Date: ${l}`}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fill="url(#gaUsers)" dot={false} name="Active Users" />
        <Area type="monotone" dataKey="newUsers" stroke="#10b981" strokeWidth={2} fill="url(#gaNewUsers)" dot={false} name="New Users" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
