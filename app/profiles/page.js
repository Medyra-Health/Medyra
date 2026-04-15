'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Trash2, User, Baby, Users, Heart,
  Crown, Lock, ChevronRight, Loader2, Check, X, Edit2,
  Shield, Sparkles, TrendingUp
} from 'lucide-react'
import MedyraLogo from '@/components/MedyraLogo'

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
  free: 'Free', onetime: 'One-Time', personal: 'Personal', family: 'Family', clinic: 'Clinic', admin: 'Admin',
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
        <Link href={`/dashboard?profile=${profile.id}`} className={`text-xs font-semibold ${theme.text} flex items-center gap-0.5 hover:underline`}>
          View timeline <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
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
  const limit = data?.limit ?? 0
  const canCreate = data?.canCreate ?? false
  const isPaid = tier !== 'free' && tier !== 'onetime'

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
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
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Health Profiles</h1>
            <p className="text-sm text-gray-500">
              {isPaid
                ? `Tracking health data for ${profiles.length}${limit ? ` of ${limit}` : ''} profile${profiles.length !== 1 ? 's' : ''}`
                : 'Upgrade to Personal or Family to create health profiles'}
            </p>
          </div>
          {canCreate && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-200 text-sm">
              <Plus className="h-4 w-4" /> New Profile
            </button>
          )}
        </div>

        {/* Upgrade gate for free/onetime */}
        {!isPaid && (
          <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-2xl p-8 text-center mb-8">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Your Health Vault</h2>
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
                  <Icon className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-300 font-medium">{label}</p>
                </div>
              ))}
            </div>
            <Link href="/pricing">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl transition-colors">
                Upgrade to Personal — €9/mo
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
                    {limit && <p className="text-xs text-gray-400">{profiles.length}/{limit} used</p>}
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
          </>
        )}
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
    </div>
  )
}
