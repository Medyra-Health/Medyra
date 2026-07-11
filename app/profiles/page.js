'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Trash2, User, Baby, Users, Heart,
  Crown, Lock, ChevronRight, Loader2, Check, X, Edit2,
  Shield, Sparkles, TrendingUp, GitCompareArrows, BarChart3,
  AlertTriangle, CheckCircle, Minus, FileText, ExternalLink
} from 'lucide-react'
import MedyraLogo from '@/components/MedyraLogo'
import { collectMarkers, latestValue, markerMeta } from '@/components/HealthTimeline'

const RELATIONSHIPS = [
  { value: 'self',    label: 'Myself',  icon: User,   color: 'emerald' },
  { value: 'partner', label: 'Partner', icon: Heart,  color: 'rose'    },
  { value: 'child',   label: 'Child',   icon: Baby,   color: 'blue'    },
  { value: 'parent',  label: 'Parent',  icon: Users,  color: 'amber'   },
]

const GENDERS = [
  { value: 'male',         label: 'Male'           },
  { value: 'female',       label: 'Female'         },
  { value: 'other',        label: 'Other'          },
  { value: 'prefer_not',   label: 'Prefer not to say' },
]

const COLORS = [
  { value: 'emerald', cls: 'bg-emerald-500' },
  { value: 'blue',    cls: 'bg-blue-500'    },
  { value: 'violet',  cls: 'bg-violet-500'  },
  { value: 'rose',    cls: 'bg-rose-500'    },
  { value: 'amber',   cls: 'bg-amber-500'   },
  { value: 'teal',    cls: 'bg-teal-500'    },
]

const COLOR_THEME = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: 'bg-emerald-100 text-emerald-600' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    dot: 'bg-blue-500',    icon: 'bg-blue-100 text-blue-600'       },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-700',  dot: 'bg-violet-500',  icon: 'bg-violet-100 text-violet-600'   },
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    dot: 'bg-rose-500',    icon: 'bg-rose-100 text-rose-600'       },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-500',   icon: 'bg-amber-100 text-amber-600'     },
  teal:    { bg: 'bg-teal-50',    border: 'border-teal-200',    text: 'text-teal-700',    dot: 'bg-teal-500',    icon: 'bg-teal-100 text-teal-600'       },
}

const TIER_LABELS = {
  free: 'Free', personal: 'Personal', family: 'Family', clinic: 'Clinic', admin: 'Admin',
}

function ProfileCard({ profile, onDelete, onEdit }) {
  const rel = RELATIONSHIPS.find(r => r.value === profile.relationship) || RELATIONSHIPS[0]
  const RelIcon = rel.icon
  const theme = COLOR_THEME[profile.color] || COLOR_THEME.emerald
  const [confirming, setConfirming] = useState(false)

  return (
    <div className={`rounded-2xl border-2 ${theme.border} ${theme.bg} p-5 relative group transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${theme.icon} flex items-center justify-center`}>
            <RelIcon className="h-5 w-5" />
          </div>
          <div>
            <p className={`font-bold text-base ${theme.text}`}>{profile.name}</p>
            <p className="text-xs text-gray-500 capitalize">{rel.label} · {profile.gender?.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(profile)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-gray-300 transition-colors">
            <Edit2 className="h-3.5 w-3.5 text-gray-500" />
          </button>
          {confirming ? (
            <div className="flex gap-1">
              <button onClick={() => onDelete(profile.id)} className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Check className="h-3.5 w-3.5 text-white" />
              </button>
              <button onClick={() => setConfirming(false)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-red-200 hover:text-red-500 transition-colors">
              <Trash2 className="h-3.5 w-3.5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {profile.dob && (
        <p className="text-xs text-gray-500 mb-3">
          DOB: {new Date(profile.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${theme.dot}`} />
          <span className="text-xs text-gray-500">{profile.biomarkers?.length || 0} biomarker entries</span>
        </div>
        <Link href={`/profiles/${profile.id}`} className={`text-xs font-semibold ${theme.text} flex items-center gap-0.5 hover:underline`}>
          View profile <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <ProfileReportsList profile={profile} />
    </div>
  )
}

function CreateModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [relationship, setRelationship] = useState('self')
  const [gender, setGender] = useState('prefer_not')
  const [color, setColor] = useState('emerald')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function submit() {
    if (!name.trim()) return setError('Name is required')
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dob, relationship, gender, color }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || data.error); return }
      onCreated(data.profile)
    } catch { setError('Something went wrong') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">New Health Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Akash, Baby Lena..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>

          {/* DOB */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date of Birth</label>
            <input
              type="date" value={dob} onChange={e => setDob(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Relationship</label>
            <div className="grid grid-cols-2 gap-2">
              {RELATIONSHIPS.map(r => {
                const Icon = r.icon
                return (
                  <button key={r.value} onClick={() => setRelationship(r.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${relationship === r.value ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <Icon className="h-4 w-4" /> {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
              {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Profile Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c.value} onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full ${c.cls} transition-all ${color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-70 hover:opacity-100'}`} />
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </button>
          <button onClick={submit} disabled={saving || !name.trim()}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {saving ? 'Creating…' : 'Create Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditModal({ profile, onClose, onSaved }) {
  const [name, setName] = useState(profile.name || '')
  const [dob, setDob] = useState(profile.dob ? String(profile.dob).slice(0, 10) : '')
  const [relationship, setRelationship] = useState(profile.relationship || 'self')
  const [gender, setGender] = useState(profile.gender || 'prefer_not')
  const [color, setColor] = useState(profile.color || 'emerald')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function submit() {
    if (!name.trim()) return setError('Name is required')
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profile.id, updates: { name, dob, relationship, gender, color } }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || data.error); return }
      onSaved({ ...profile, name: name.trim(), dob, relationship, gender, color })
    } catch { setError('Something went wrong') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Health Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date of Birth</label>
            <input
              type="date" value={dob} onChange={e => setDob(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Relationship</label>
            <div className="grid grid-cols-2 gap-2">
              {RELATIONSHIPS.map(r => {
                const Icon = r.icon
                return (
                  <button key={r.value} onClick={() => setRelationship(r.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${relationship === r.value ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <Icon className="h-4 w-4" /> {r.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
              {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Profile Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c.value} onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full ${c.cls} transition-all ${color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-70 hover:opacity-100'}`} />
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </button>
          <button onClick={submit} disabled={saving || !name.trim()}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Account-wide data retention + privacy control.
function DataPrivacyCard() {
  const [retention, setRetention] = useState(null)
  const [totalReports, setTotalReports] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setRetention(d.dataRetention || 'auto30')
      setTotalReports(d.totalReports || 0)
    }).catch(() => setRetention('auto30'))
  }, [])

  async function choose(value) {
    if (value === retention || saving) return
    setSaving(true)
    const prev = retention
    setRetention(value)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataRetention: value }),
      })
      if (!res.ok) setRetention(prev)
    } catch { setRetention(prev) }
    finally { setSaving(false) }
  }

  const options = [
    {
      value: 'keep',
      icon: Shield,
      title: 'Keep my data (encrypted backup)',
      desc: 'Your documents and lab history stay available any time, as your personal health archive. Everything is encrypted at rest. You can delete any document, or switch back, whenever you want.',
    },
    {
      value: 'auto30',
      icon: Trash2,
      title: 'Auto-delete after 30 days (GDPR)',
      desc: 'Every document is permanently deleted 30 days after upload. Maximum privacy, nothing kept longer than needed.',
    },
  ]

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mt-6">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <Shield className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">Data & Privacy</h3>
        {retention && <span className="text-xs text-gray-400 ml-1">{totalReports} document{totalReports === 1 ? '' : 's'} stored</span>}
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400 ml-auto" />}
      </div>
      <div className="p-5 space-y-3">
        {retention === null ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-gray-300" /></div>
        ) : (
          <>
            {options.map(o => {
              const Icon = o.icon
              const active = retention === o.value
              return (
                <button
                  key={o.value}
                  onClick={() => choose(o.value)}
                  className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${active ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${active ? 'text-emerald-800' : 'text-gray-800'}`}>{o.title}</p>
                      {active && <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{o.desc}</p>
                  </div>
                </button>
              )
            })}
            <p className="text-xs text-gray-400 leading-relaxed pt-1">
              Your health data is encrypted with AES 256 before it is stored, so it is unreadable in the
              database. You can export or permanently delete everything at any time under GDPR. Changing
              this setting applies to all your existing documents immediately.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// Flag a value against a marker's reference range (curated or the lab's own).
function flagValue(meta, sample) {
  if (sample?.flag && sample.flag !== 'normal') return sample.flag
  const v = sample ? parseFloat(sample.value) : null
  if (v == null || isNaN(v)) return 'none'
  const min = meta.normalMin, max = meta.normalMax
  if (min != null && v < min) return 'low'
  if (max != null && v > max) return 'high'
  return 'normal'
}

// All markers present across a set of profiles, deduped, known ones first.
function unionMarkers(profiles) {
  const map = new Map()
  for (const p of profiles) {
    for (const m of collectMarkers(p)) {
      if (!map.has(m.key)) map.set(m.key, m)
    }
  }
  return [...map.values()]
}

function CompareSection({ profiles }) {
  const [selA, setSelA] = useState(profiles[0]?.id || '')
  const [selB, setSelB] = useState(profiles[1]?.id || '')

  const pA = profiles.find(p => p.id === selA)
  const pB = profiles.find(p => p.id === selB)

  const rows = unionMarkers([pA, pB].filter(Boolean)).map(meta => {
    const sA = pA ? latestValue(pA, meta.key) : null
    const sB = pB ? latestValue(pB, meta.key) : null
    const vA = sA ? parseFloat(sA.value) : null
    const vB = sB ? parseFloat(sB.value) : null
    const fA = flagValue(meta, sA)
    const fB = flagValue(meta, sB)
    const diff = vA != null && vB != null ? +(vB - vA).toFixed(2) : null
    return { key: meta.key, label: meta.label, unit: meta.unit, vA, vB, fA, fB, diff }
  }).filter(r => r.vA != null || r.vB != null)

  const flagColor = f => f === 'high' ? 'text-orange-600' : f === 'low' ? 'text-yellow-600' : f === 'normal' ? 'text-emerald-600' : 'text-gray-400'
  const flagBg = f => f === 'high' ? 'bg-orange-50' : f === 'low' ? 'bg-yellow-50' : f === 'normal' ? 'bg-emerald-50' : 'bg-gray-50'
  const dotColor = p => `bg-${(p?.color || 'emerald')}-500`

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mt-6">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <GitCompareArrows className="h-4 w-4 text-emerald-600" />
        <h3 className="text-sm font-bold text-gray-800">Compare Profiles</h3>
      </div>

      {/* Profile selectors */}
      <div className="grid grid-cols-2 gap-3 px-5 py-4 bg-gray-50 border-b border-gray-100">
        {[{ sel: selA, set: setSelA, label: 'Profile A' }, { sel: selB, set: setSelB, label: 'Profile B' }].map(({ sel, set, label }) => (
          <div key={label}>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">{label}</p>
            <select
              value={sel}
              onChange={e => set(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-10 text-sm text-gray-400">
          No biomarker data yet. Upload reports assigned to these profiles to see comparison.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 w-32">Marker</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700">
                  <span className="flex items-center justify-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${pA ? dotColor(pA) : 'bg-gray-300'}`} />
                    {pA?.name || '—'}
                  </span>
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700">
                  <span className="flex items-center justify-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${pB ? dotColor(pB) : 'bg-gray-300'}`} />
                    {pB?.name || '—'}
                  </span>
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">Difference</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.key} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                  <td className="px-5 py-2.5">
                    <p className="text-xs font-semibold text-gray-700">{r.label}</p>
                    <p className="text-xs text-gray-400">{r.unit}</p>
                  </td>
                  <td className="text-center px-4 py-2.5">
                    {r.vA != null ? (
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${flagBg(r.fA)} ${flagColor(r.fA)}`}>
                        {r.vA}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="text-center px-4 py-2.5">
                    {r.vB != null ? (
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${flagBg(r.fB)} ${flagColor(r.fB)}`}>
                        {r.vB}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="text-center px-4 py-2.5 hidden sm:table-cell">
                    {r.diff !== null ? (
                      <span className={`text-xs font-semibold ${r.diff > 0 ? 'text-orange-500' : r.diff < 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                        {r.diff > 0 ? '+' : ''}{r.diff}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function OverviewSection({ profiles }) {
  const data = profiles.map(p => ({
    profile: p,
    markers: collectMarkers(p).map(meta => {
      const sample = latestValue(p, meta.key)
      return {
        key: meta.key,
        label: meta.label,
        unit: meta.unit,
        value: sample ? parseFloat(sample.value) : null,
        flag: flagValue(meta, sample),
      }
    }).filter(m => m.value != null),
  })).filter(d => d.markers.length > 0)

  if (data.length === 0) return null

  const flagIcon = f => f === 'high' ? <TrendingUp className="h-3 w-3" /> : f === 'low' ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />
  const flagColor = f => f === 'high' ? 'text-orange-500' : f === 'low' ? 'text-yellow-600' : 'text-emerald-600'

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mt-4">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <BarChart3 className="h-4 w-4 text-violet-600" />
        <h3 className="text-sm font-bold text-gray-800">Family Overview</h3>
        <span className="text-xs text-gray-400 ml-1">Latest values across all profiles</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
        {data.map(({ profile, markers }) => {
          const theme = COLOR_THEME[profile.color] || COLOR_THEME.emerald
          const abnormal = markers.filter(m => m.flag !== 'normal').length
          return (
            <div key={profile.id} className={`rounded-xl border-2 ${theme.border} ${theme.bg} p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                <p className={`text-sm font-bold ${theme.text}`}>{profile.name}</p>
                {abnormal > 0 && (
                  <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-semibold">
                    {abnormal} flagged
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {markers.slice(0, 6).map(m => (
                  <div key={m.key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{m.label}</span>
                    <span className={`flex items-center gap-1 text-xs font-semibold ${flagColor(m.flag)}`}>
                      {flagIcon(m.flag)}
                      {m.value} {m.unit}
                    </span>
                  </div>
                ))}
              </div>
              <Link href={`/dashboard?profile=${profile.id}`}
                className={`mt-3 text-xs font-semibold ${theme.text} flex items-center gap-0.5 hover:underline`}>
                View full timeline <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProfileReportsList({ profile }) {
  const [reports, setReports] = useState(null)
  const [open, setOpen] = useState(false)
  const theme = COLOR_THEME[profile.color] || COLOR_THEME.emerald

  async function load() {
    if (reports !== null) return
    try {
      const res = await fetch(`/api/reports?profileId=${profile.id}`)
      const json = await res.json()
      setReports(json.reports || [])
    } catch { setReports([]) }
  }

  function toggle() {
    setOpen(o => !o)
    if (!open) load()
  }

  const getFlagDot = flag => {
    if (flag === 'critical') return 'bg-red-500'
    if (flag === 'high' || flag === 'low') return 'bg-orange-400'
    return 'bg-emerald-500'
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={toggle}
        className={`w-full flex items-center justify-between text-xs font-semibold ${theme.text} hover:opacity-80 transition-opacity`}
      >
        <span className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Reports in this profile
        </span>
        <ChevronRight className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="mt-2 space-y-1.5">
          {reports === null ? (
            <div className="flex justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          ) : reports.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">No reports assigned yet</p>
          ) : (
            reports.map(r => {
              const exp = typeof r.explanation === 'object' ? r.explanation : {}
              const tests = exp.tests || []
              const criticals = tests.filter(t => t.flag === 'critical').length
              const highs = tests.filter(t => t.flag === 'high' || t.flag === 'low').length
              return (
                <Link
                  key={r.id}
                  href={`/reports/${r.id}`}
                  className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                >
                  <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{r.fileName || 'Report'}</p>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  {criticals > 0 && <span className="text-xs bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0">{criticals} critical</span>}
                  {!criticals && highs > 0 && <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0">{highs} flagged</span>}
                  <ExternalLink className="h-3 w-3 text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                </Link>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default function ProfilesPage() {
  const { user, isLoaded } = useUser()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editProfile, setEditProfile] = useState(null)

  useEffect(() => {
    if (isLoaded && user) load()
  }, [isLoaded, user])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/profiles')
      const json = await res.json()
      setData(json)
    } catch {}
    finally { setLoading(false) }
  }

  async function deleteProfile(id) {
    await fetch(`/api/profiles?id=${id}`, { method: 'DELETE' })
    setData(prev => ({ ...prev, profiles: prev.profiles.filter(p => p.id !== id) }))
  }

  const profiles = data?.profiles || []
  const tier = data?.tier || 'free'
  // limit is null for unlimited tiers (clinic/admin); keep it null, do not coerce to 0
  const limit = data?.limit === undefined ? 0 : data.limit
  const canCreate = data?.canCreate ?? false
  const isPaid = tier !== 'free'

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7FBFA] relative" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`.font-display { font-family: var(--font-playfair), Georgia, serif; }`}</style>
      <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-teal-100/60 rounded-full blur-3xl pointer-events-none" />
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b-2 border-teal-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
            <div className="w-px h-4 bg-gray-200" />
            <MedyraLogo size="sm" />
          </div>
          <Link href="/pricing" className="text-xs text-emerald-600 font-semibold hover:text-emerald-700">
            {TIER_LABELS[tier]} plan
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black text-[#0B1F17] mb-1">Health Profiles</h1>
            <p className="text-sm text-gray-500">
              {isPaid
                ? `Tracking health data for ${profiles.length}${limit ? ` of ${limit}` : ''} profile${profiles.length !== 1 ? 's' : ''}`
                : 'Upgrade to Personal or Family to create health profiles'}
            </p>
          </div>
          {canCreate && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-[0_0_20px_-4px_rgba(20,184,166,0.5)] text-white font-semibold px-4 py-2.5 rounded-xl transition-shadow shadow-sm shadow-teal-200 text-sm">
              <Plus className="h-4 w-4" /> New Profile
            </button>
          )}
        </div>

        {/* Upgrade gate for free/onetime */}
        {!isPaid && (
          <div className="bg-[#08130D] border border-teal-900/60 rounded-2xl p-8 text-center mb-8 shadow-2xl shadow-teal-900/20">
            <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-7 w-7 text-teal-300" />
            </div>
            <h2 className="font-display text-xl font-bold text-white mb-2">Your Health Vault</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Personal plans include 2 health profiles with longitudinal tracking, biomarker timelines, and AI-powered doctor summaries that pull from your medical history.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mb-6 max-w-lg mx-auto">
              {[
                { icon: TrendingUp, label: 'Biomarker timeline' },
                { icon: Sparkles,   label: 'AI delta analysis'  },
                { icon: Users,      label: 'Family profiles'    },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <Icon className="h-5 w-5 text-teal-300 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-300 font-medium">{label}</p>
                </div>
              ))}
            </div>
            <Link href="/pricing">
              <button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-[0_0_24px_-4px_rgba(20,184,166,0.6)] text-white font-bold px-8 py-3 rounded-xl transition-shadow">
                Upgrade to Personal, €4.99/mo
              </button>
            </Link>
          </div>
        )}

        {/* Profiles grid */}
        {isPaid && (
          <>
            {profiles.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-2">No profiles yet</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                  Create your first health profile to start tracking biomarkers and building your medical history.
                </p>
                <button onClick={() => setShowCreate(true)}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
                  <Plus className="h-4 w-4" /> Create First Profile
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {profiles.map(p => (
                  <ProfileCard key={p.id} profile={p} onDelete={deleteProfile} onEdit={setEditProfile} />
                ))}

                {/* Add more slot */}
                {canCreate && (
                  <button onClick={() => setShowCreate(true)}
                    className="rounded-2xl border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center gap-2 hover:border-emerald-300 hover:bg-emerald-50 transition-all group min-h-[140px]">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                      <Plus className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 group-hover:text-emerald-700 transition-colors">Add Profile</p>
                    {limit ? <p className="text-xs text-gray-400">{profiles.length}/{limit} used</p> : null}
                  </button>
                )}

                {/* Upgrade slot when at limit */}
                {!canCreate && limit !== null && (
                  <Link href="/pricing"
                    className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-5 flex flex-col items-center justify-center gap-2 hover:border-amber-300 transition-all min-h-[140px]">
                    <Crown className="h-8 w-8 text-amber-500" />
                    <p className="text-sm font-bold text-amber-700">Upgrade for more</p>
                    <p className="text-xs text-amber-600 text-center">Family plan: 5 profiles · Clinic: unlimited</p>
                  </Link>
                )}
              </div>
            )}

            {/* How it works */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-4">
              <h3 className="text-sm font-bold text-gray-800 mb-4">How health profiles work</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { step: '01', title: 'Create a profile', desc: 'Add a profile for yourself or a family member with name and date of birth.' },
                  { step: '02', title: 'Upload reports', desc: 'When uploading a health document, assign it to a profile. AI extracts biomarker values.' },
                  { step: '03', title: 'Track over time', desc: 'See biomarker trends, get AI delta analysis, and generate doctor-ready summaries from your history.' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{step}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-0.5">{title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Family overview, all profiles side by side */}
            {profiles.length >= 1 && <OverviewSection profiles={profiles} />}

            {/* Compare two profiles */}
            {profiles.length >= 2 && <CompareSection profiles={profiles} />}
          </>
        )}

        {/* Data & privacy — retention control, all users */}
        <DataPrivacyCard />
      </main>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={profile => {
            setData(prev => ({
              ...prev,
              profiles: [...(prev.profiles || []), profile],
              canCreate: prev.limit === null || [...(prev.profiles || []), profile].length < prev.limit,
            }))
            setShowCreate(false)
          }}
        />
      )}

      {editProfile && (
        <EditModal
          profile={editProfile}
          onClose={() => setEditProfile(null)}
          onSaved={updated => {
            setData(prev => ({
              ...prev,
              profiles: (prev.profiles || []).map(p => (p.id === updated.id ? updated : p)),
            }))
            setEditProfile(null)
          }}
        />
      )}
    </div>
  )
}
