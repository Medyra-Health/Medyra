'use client'

// Printable A4 waiting-room poster with QR code. Admin-only (gated client-side
// like the dashboard; contains no sensitive data either way).

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useUser } from '@clerk/nextjs'
import { Printer, Stethoscope, Loader2 } from 'lucide-react'
import { CLINIC_ADMIN_EMAILS } from '@/components/clinic/ui'

const LANGS = ['Deutsch', 'Türkçe', 'العربية', 'English', 'Русский', 'Polski', 'Français', 'Español', 'Italiano', '中文', 'हिन्दी', 'اردو']

export default function ClinicPosterPage() {
  const { user, isLoaded } = useUser()
  const [practiceName, setPracticeName] = useState('')

  const isAdmin = user?.emailAddresses?.some(e => CLINIC_ADMIN_EMAILS.includes(e.emailAddress))

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/clinic/settings')
      .then(r => r.ok ? r.json() : null)
      .then(d => setPracticeName(d?.settings?.name || ''))
      .catch(() => {})
  }, [isAdmin])

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
  }
  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-500 text-sm">Zugriff eingeschränkt.</div>
  }

  return (
    <div className="min-h-screen bg-slate-200 py-8 print:py-0 print:bg-white" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .poster { box-shadow: none !important; margin: 0 !important; width: 100% !important; min-height: 100vh !important; border-radius: 0 !important; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      <div className="no-print flex justify-center mb-6">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors shadow-lg"
        >
          <Printer className="h-4 w-4" /> Poster drucken (A4)
        </button>
      </div>

      {/* A4-ish poster */}
      <div className="poster mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col" style={{ width: 794, minHeight: 1123 }}>
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white px-14 pt-14 pb-12 text-center">
          {practiceName && (
            <div className="text-sm font-semibold text-indigo-300 mb-6 tracking-wide">{practiceName}</div>
          )}
          <h1 className="text-[44px] leading-[1.15] font-extrabold mb-5">
            Verstehen Sie Ihren<br />Befund nicht?
          </h1>
          <p className="text-lg text-indigo-200/90 leading-relaxed max-w-xl mx-auto">
            Arztbrief, Laborwerte oder Medikationsplan — Medyra erklärt Ihre
            medizinischen Dokumente in einfacher Sprache. Kostenlos starten.
          </p>
        </div>

        {/* QR */}
        <div className="flex-1 flex flex-col items-center justify-center px-14 py-12">
          <div className="p-6 rounded-3xl border-4 border-indigo-100 shadow-lg mb-6">
            <QRCodeSVG value="https://medyra.de/upload" size={300} fgColor="#1e1b4b" level="M" />
          </div>
          <p className="text-slate-700 font-bold text-xl mb-1.5">Einfach QR-Code scannen</p>
          <p className="text-slate-400 text-sm">oder besuchen Sie <span className="font-bold text-indigo-600">medyra.de</span></p>
        </div>

        {/* Languages */}
        <div className="px-14 pb-10">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
            In Ihrer Sprache — 18 Sprachen verfügbar
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {LANGS.map(l => (
              <span key={l} className="px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[13px] font-semibold border border-indigo-100">
                {l}
              </span>
            ))}
            <span className="px-3.5 py-1.5 rounded-full bg-slate-50 text-slate-400 text-[13px] font-semibold border border-slate-100">
              + weitere
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-14 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-slate-900">Medyra</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-sm text-right leading-relaxed">
            Medyra erklärt — sie diagnostiziert nicht. Bei medizinischen Fragen
            wenden Sie sich bitte an Ihre Ärztin oder Ihren Arzt.
          </p>
        </div>
      </div>
    </div>
  )
}
