'use client'

// Shared building blocks for the Clinic dashboard: animated cards, badges,
// copy button, QR dialog. Clinic identity = indigo/violet on slate.

import { useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, X, QrCode } from 'lucide-react'
import { CLINIC_LANGUAGES } from '@/lib/clinicI18n'
import { useClinicT } from '@/components/clinic/ui'

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' } }),
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SectionTitle({ title, subtitle }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </motion.div>
  )
}

export function LangBadge({ code }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
      {code}
      <span className="normal-case font-medium text-indigo-400 hidden sm:inline">{CLINIC_LANGUAGES[code] || ''}</span>
    </span>
  )
}

export function StatusBadge({ status }) {
  const { t } = useClinicT()
  const done = status === 'completed'
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
      done ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
           : 'bg-amber-50 text-amber-700 border border-amber-200'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${done ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
      {done ? t('completed') : t('pending')}
    </span>
  )
}

export function CopyButton({ text, label, className = '' }) {
  const { t } = useClinicT()
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1800)
        } catch {}
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
        copied
          ? 'bg-emerald-500 text-white'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg hover:shadow-indigo-200'
      } ${className}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? t('copied') : (label || t('copy'))}
    </button>
  )
}

// Lightweight modal (no portal needed for this admin area).
export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[88vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </motion.div>
    </div>
  )
}

export function QRBlock({ url, size = 168 }) {
  const { t } = useClinicT()
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-4 bg-white rounded-2xl border-2 border-indigo-100 shadow-sm">
        <QRCodeSVG value={url} size={size} fgColor="#312e81" level="M" />
      </div>
      <p className="text-[11px] text-slate-400 text-center max-w-[220px] leading-relaxed">
        <QrCode className="h-3 w-3 inline mr-1 -mt-0.5" />
        {t('qrHint')}
      </p>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

export const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow'

export function LanguageSelect({ value, onChange, allowEmpty = false, emptyLabel = '' }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {Object.entries(CLINIC_LANGUAGES).map(([code, name]) => (
        <option key={code} value={code}>{name}</option>
      ))}
    </select>
  )
}

export function EmptyState({ icon: Icon, text, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-14 px-6 text-center"
    >
      <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-indigo-400" />
      </div>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-sm hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function formatDate(d, lang = 'de') {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
