'use client'

import { useEffect, useState, useCallback } from 'react'

export default function AccessAttemptsPanel() {
  const [data,setData] = useState(null)
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)
  const refresh = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/admin/access-attempts',{ cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to load access logs')
      setData(result)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  },[])
  useEffect(() => { refresh() },[refresh])
  return <section className="space-y-5">
    <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold text-gray-900">Private access attempts</h2><p className="text-sm text-gray-500 mt-1">Password submissions during the last 30 days. Logging starts with this update.</p></div><button onClick={refresh} disabled={loading} className="px-4 py-2 rounded-lg border bg-white text-sm disabled:opacity-50">{loading ? 'Loading?' : 'Refresh'}</button></div>
    <p className="bg-blue-50 border border-blue-100 text-blue-900 rounded-xl p-4 text-sm">Entered passwords are never stored. IP addresses can be shared or hidden by VPNs; locations are approximate. These logs do not identify individuals or link them to phishing emails.</p>
    {error && <p role="alert" className="bg-red-50 text-red-700 p-4 rounded-xl">{error}</p>}
    {data && <><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[['Total submissions',data.total],['Failed attempts',data.failed],['Successful logins',data.success],['Distinct IP addresses',data.sources]].map(([label,value]) => <div key={label} className="bg-white border rounded-xl p-5"><p className="text-sm text-gray-500">{label}</p><p className="text-3xl font-bold mt-2">{value}</p></div>)}</div>
    <div className="bg-white border rounded-xl overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500"><tr>{['Time (Berlin)','Result','IP address','Approximate location','Browser / device'].map(label => <th key={label} className="p-4 font-medium">{label}</th>)}</tr></thead><tbody>{data.attempts.map(attempt => <tr key={attempt._id} className="border-t"><td className="p-4 whitespace-nowrap">{new Date(attempt.createdAt).toLocaleString('en-GB',{timeZone:'Europe/Berlin'})}</td><td className="p-4"><span className={attempt.result === 'success' ? 'text-emerald-700' : 'text-red-700'}>{({success:'Successful login',incorrect_password:'Incorrect password',cross_site_rejected:'Cross-site request rejected',invalid_request:'Invalid request'})[attempt.result] || 'Rejected'}</span></td><td className="p-4 whitespace-nowrap font-mono text-xs">{attempt.ip || 'Unavailable'}</td><td className="p-4">{[attempt.city,attempt.region,attempt.country].filter(Boolean).join(', ') || 'Unavailable'}</td><td className="p-4 text-xs text-gray-500 max-w-sm break-words">{attempt.userAgent || 'Unavailable'}</td></tr>)}{data.attempts.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-gray-500">No access attempts recorded yet.</td></tr>}</tbody></table></div><p className="text-xs text-gray-500">Showing the latest 100 submissions. Records expire automatically after 30 days. Only authorized admin accounts can view this data.</p></>}
  </section>
}
