'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

function formatShortDate(str) {
  if (!str) return ''
  const [, m, d] = str.split('-')
  return `${d}/${m}`
}

export default function AdminChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
        No data for the last 30 days
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
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
        <Line type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2} dot={false} name="New Users" />
        <Line type="monotone" dataKey="reports" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Reports" />
      </LineChart>
    </ResponsiveContainer>
  )
}
