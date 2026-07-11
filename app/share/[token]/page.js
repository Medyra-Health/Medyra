'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, ArrowRight, Lock, Clock } from 'lucide-react'
import MedyraLogo from '@/components/MedyraLogo'

// Public, read-only view of a shared explanation. No auth, no personal data:
// the API returns only the sanitized explanation + expiry + owner ref code.
export default function SharedReportPage({ params }) {
  const { token } = use(params)
  const [state, setState] = useState({ loading: true, error: null, shared: null })

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then(async r => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || 'Link invalid')
        setState({ loading: false, error: null, shared: d.shared })
      })
      .catch(err => setState({ loading: false, error: err.message, shared: null }))
  }, [token])

  const flagStyle = flag => ({
    normal: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    low: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    high: 'bg-orange-50 border-orange-200 text-orange-700',
    critical: 'bg-red-50 border-red-200 text-red-700',
  }[flag] || 'bg-gray-50 border-gray-200 text-gray-600')

  const flagIcon = flag =>
    flag === 'normal' ? <CheckCircle className="h-3.5 w-3.5" />
      : flag === 'low' ? <TrendingDown className="h-3.5 w-3.5" />
      : <TrendingUp className="h-3.5 w-3.5" />

  const signupHref = state.shared?.refCode ? `/?ref=${state.shared.refCode}` : '/'

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <style>{`.font-display { font-family: var(--font-playfair), Georgia, serif; }`}</style>

      {/* Minimal public header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/70 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex-shrink-0"><MedyraLogo size="md" variant="light" /></Link>
          <Link
            href={signupHref}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline">Eigenen Befund verstehen</span>
            <span className="sm:hidden">Selbst testen</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {state.loading ? (
          <div className="text-center py-24 text-gray-400">Wird geladen…</div>
        ) : state.error ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-gray-400" />
            </div>
            <h1 className="font-display text-xl font-bold text-gray-900 mb-2">Dieser Link ist nicht mehr gültig</h1>
            <p className="text-sm text-gray-500 mb-6">Der Link ist abgelaufen oder wurde widerrufen. Geteilte Befunde sind aus Datenschutzgründen maximal 7 Tage abrufbar.</p>
            <Link href="/" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Zu Medyra →</Link>
          </div>
        ) : (
          <>
            {/* Shared banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-2.5 text-sm text-emerald-800">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                Geteilte, schreibgeschützte Ansicht · verfügbar bis {new Date(state.shared.expiresAt).toLocaleDateString('de-DE')}
              </span>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-5 flex gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">
                <span className="font-bold">Hinweis: </span>
                {state.shared.explanation?.disclaimer || 'Dies ist eine verständliche Aufbereitung, keine medizinische Beratung. Besprechen Sie Befunde immer mit Ärztin oder Arzt.'}
              </p>
            </div>

            {/* Summary */}
            {(state.shared.explanation?.inShort || state.shared.explanation?.summary) && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 shadow-sm">
                {state.shared.explanation.inShort && (
                  <p className="font-display text-lg font-bold text-[#0B1F17] mb-2">{state.shared.explanation.inShort}</p>
                )}
                {state.shared.explanation.summary && (
                  <p className="text-sm text-gray-600 leading-relaxed">{state.shared.explanation.summary}</p>
                )}
              </div>
            )}

            {/* Tests */}
            {state.shared.explanation?.tests?.length > 0 && (
              <div className="space-y-3 mb-5">
                <h2 className="text-base font-bold text-gray-900">Werte</h2>
                {state.shared.explanation.tests.map((tt, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                      <p className="font-semibold text-sm text-gray-900">{tt.name}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${flagStyle(tt.flag)}`}>
                        {flagIcon(tt.flag)} {tt.value}
                      </span>
                    </div>
                    {tt.normalRange && <p className="text-xs text-gray-400 mb-1.5">Normalbereich: {tt.normalRange}</p>}
                    {tt.interpretation && <p className="text-sm text-gray-600 leading-relaxed">{tt.interpretation}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Sections */}
            {state.shared.explanation?.sections?.length > 0 && (
              <div className="space-y-3 mb-5">
                {state.shared.explanation.sections.map((s, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="font-bold text-sm text-gray-900 mb-2">{s.title}</h3>
                    {s.content && <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>}
                    {s.items?.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {s.items.map((it, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            {it}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Questions for doctor */}
            {state.shared.explanation?.questionsForDoctor?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8 shadow-sm">
                <h3 className="font-bold text-sm text-gray-900 mb-3">Fragen für das Arztgespräch</h3>
                <ul className="space-y-2">
                  {state.shared.explanation.questionsForDoctor.map((q, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="font-black text-emerald-500 flex-shrink-0">→</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Viral CTA */}
            <div className="rounded-2xl bg-[#040C08] p-8 text-center">
              <h2 className="font-display text-xl md:text-2xl font-bold text-[#E8F5F0] mb-2">
                Auch einen Befund, den Sie nicht verstehen?
              </h2>
              <p className="text-sm text-[#E8F5F0]/55 mb-6 max-w-md mx-auto">
                Medyra erklärt Laborwerte, Arztbriefe und Medikationspläne in verständlicher Sprache. 3 Dokumente pro Monat kostenlos.
              </p>
              <Link
                href={signupHref}
                className="inline-flex items-center gap-2 px-7 h-11 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-sm font-bold shadow-lg shadow-emerald-500/30"
              >
                Kostenlos ausprobieren <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
