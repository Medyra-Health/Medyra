'use client'

import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs'
import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import {
  Shield, Volume2, VolumeX, Loader2,
  CheckCircle, AlertCircle, AlertTriangle,
  FileText, Upload, Share2, Printer, ChevronDown,
} from 'lucide-react'
import MedyraLogo from '@/components/MedyraLogo'
import ConsentModal from '@/components/ConsentModal'

const MAX_BYTES = 4 * 1024 * 1024

async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      const MAX_DIM = 2000
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      const tryQuality = (q) => {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Fehler'))
          if (blob.size <= MAX_BYTES || q <= 0.3) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
          } else {
            tryQuality(Math.round((q - 0.1) * 10) / 10)
          }
        }, 'image/jpeg', q)
      }
      tryQuality(0.85)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Bild konnte nicht gelesen werden')) }
    img.src = url
  })
}

function buildSpeechText(report) {
  const parts = []
  const summary = report.analysis?.summary || report.explanation?.summary
  if (summary) {
    parts.push('Hier ist die Erklärung Ihres Dokuments.')
    parts.push(summary)
  }
  const findings = report.analysis?.findings || []
  if (findings.length > 0) {
    parts.push('Ihre Werte im Überblick.')
    findings.forEach(f => {
      const statusText =
        f.status === 'normal' ? 'ist in Ordnung' :
        f.status === 'high'   ? 'ist erhöht' :
        f.status === 'low'    ? 'ist zu niedrig' : ''
      parts.push(`${f.name} ${statusText}. ${f.explanation || ''}`)
    })
  }
  const questions = report.explanation?.questionsForDoctor || []
  if (questions.length > 0) {
    parts.push('Fragen für Ihren Arzt.')
    questions.forEach((q, i) => parts.push(`Frage ${i + 1}: ${q}`))
  }
  return parts.join(' ')
}

function StatusIcon({ status }) {
  if (status === 'normal') return <CheckCircle className="h-8 w-8 text-emerald-500 flex-shrink-0 mt-0.5" />
  if (status === 'high')   return <AlertCircle  className="h-8 w-8 text-orange-500 flex-shrink-0 mt-0.5" />
  if (status === 'low')    return <AlertTriangle className="h-8 w-8 text-blue-500 flex-shrink-0 mt-0.5" />
  return <AlertCircle className="h-8 w-8 text-gray-400 flex-shrink-0 mt-0.5" />
}

function statusLabel(status) {
  if (status === 'normal') return { text: 'In Ordnung',  color: 'bg-emerald-100 text-emerald-800' }
  if (status === 'high')   return { text: 'Erhöht',      color: 'bg-orange-100 text-orange-800' }
  if (status === 'low')    return { text: 'Zu niedrig',  color: 'bg-blue-100 text-blue-800' }
  return                          { text: 'Auffällig',   color: 'bg-gray-100 text-gray-700' }
}

export default function VerstehensPage() {
  const { isLoaded } = useUser()
  const [stage, setStage] = useState('upload') // upload | analyzing | result | error
  const [report, setReport] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [consentStatus, setConsentStatus] = useState('loading')
  const [pendingFile, setPendingFile] = useState(null)
  const [speaking, setSpeaking] = useState(false)
  const resultRef = useRef(null)

  useEffect(() => {
    if (!isLoaded) return
    fetch('/api/consent')
      .then(r => r.json())
      .then(d => setConsentStatus(d.consented ? 'consented' : 'needed'))
      .catch(() => setConsentStatus('needed'))
  }, [isLoaded])

  useEffect(() => {
    return () => { if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel() }
  }, [])

  async function processFile(file) {
    setStage('analyzing')
    try {
      if (file.type.startsWith('image/') && file.size > MAX_BYTES) {
        try { file = await compressImage(file) } catch { /* continue */ }
      }
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/reports/analyze', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (res.status === 429) throw new Error('Sie haben Ihr monatliches Limit erreicht. Bitte wenden Sie sich an Ihre Familie oder upgraden Sie Ihren Plan.')
        if (res.status === 401) throw new Error('Bitte melden Sie sich zuerst an.')
        throw new Error(err.error || 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.')
      }
      const { reportId } = await res.json()

      const reportRes = await fetch(`/api/reports/${reportId}`)
      const data = await reportRes.json()
      const r = data.report
      if (r && typeof r.explanation === 'string') {
        try { r.explanation = JSON.parse(r.explanation) } catch {
          r.explanation = { summary: r.explanation, tests: [], questionsForDoctor: [] }
        }
      }
      setReport(r)
      setStage('result')
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    } catch (e) {
      setErrorMsg(e.message || 'Unbekannter Fehler')
      setStage('error')
    }
  }

  const onDrop = useCallback((acceptedFiles) => {
    if (!acceptedFiles.length) return
    const file = acceptedFiles[0]
    if (consentStatus === 'consented') {
      processFile(file)
    } else {
      setPendingFile(file)
      setConsentStatus('needed')
    }
  }, [consentStatus])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    disabled: stage === 'analyzing',
  })

  function handleVorlesen() {
    if (!window.speechSynthesis) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const text = buildSpeechText(report)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'de-DE'
    utterance.rate = 0.82
    utterance.pitch = 1.0
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  function handleReset() {
    setStage('upload')
    setReport(null)
    setSpeaking(false)
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
  }

  function handleShare() {
    if (typeof navigator === 'undefined') return
    const url = window.location.origin + '/verstehen'
    if (navigator.share) {
      navigator.share({ title: 'Medyra – Arztbrief auf Deutsch erklärt', url })
    } else {
      navigator.clipboard.writeText(url).then(() => alert('Link kopiert!'))
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-large { font-size: 14pt; line-height: 1.7; }
        }
      `}</style>

      {consentStatus === 'needed' && pendingFile && (
        <ConsentModal
          onAccept={() => {
            setConsentStatus('consented')
            const f = pendingFile
            setPendingFile(null)
            processFile(f)
          }}
          onDecline={() => {
            setPendingFile(null)
            setConsentStatus('declined')
          }}
        />
      )}

      {/* ── Header ── */}
      <header className="no-print bg-white border-b-2 border-teal-100 py-4 px-6 flex items-center justify-between sticky top-0 z-40">
        <Link href="/"><MedyraLogo size="md" /></Link>
        <Link href="/" className="text-base text-gray-400 hover:text-gray-600 transition-colors">
          Zurück zur Startseite
        </Link>
      </header>

      {/* ══════════════════════════════════════════════════
          UPLOAD / ERROR STAGE
      ══════════════════════════════════════════════════ */}
      {(stage === 'upload' || stage === 'error') && (
        <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center px-6 py-16">
          <div className="w-full max-w-lg text-center">

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] mb-5">
              Ihr Arztbrief,<br />
              <span className="text-emerald-600">einfach erklärt.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed mb-12 max-w-md mx-auto">
              Laden Sie Ihren Befund hoch — wir erklären alles auf Deutsch, ohne Fachbegriffe.
            </p>

            {/* Error banner */}
            {stage === 'error' && (
              <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-left">
                <p className="text-lg font-semibold text-red-700 mb-2">Ein Fehler ist aufgetreten</p>
                <p className="text-base text-red-600 leading-relaxed">{errorMsg}</p>
                <button onClick={() => setStage('upload')} className="mt-4 text-base text-red-700 underline font-medium">
                  Nochmal versuchen
                </button>
              </div>
            )}

            {/* Upload zone — signed out */}
            <SignedOut>
              <div className="border-4 border-dashed border-gray-200 rounded-3xl p-12 bg-gray-50 text-center">
                <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                  <Upload className="h-11 w-11 text-emerald-600" />
                </div>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Um Ihr Dokument zu erklären,<br />
                  melden Sie sich kurz an.
                </p>
                <SignInButton mode="modal">
                  <button className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xl px-10 py-5 rounded-2xl transition-all shadow-lg shadow-emerald-200 cursor-pointer">
                    Anmelden und Dokument hochladen
                  </button>
                </SignInButton>
              </div>
            </SignedOut>

            {/* Upload zone — signed in */}
            <SignedIn>
              <div
                {...getRootProps()}
                className={`border-4 border-dashed rounded-3xl p-12 md:p-16 cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-emerald-500 bg-emerald-50 scale-[1.02]'
                    : 'border-gray-200 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/40'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                  {isDragActive
                    ? <CheckCircle className="h-11 w-11 text-emerald-600" />
                    : <Upload className="h-11 w-11 text-emerald-600" />
                  }
                </div>

                {isDragActive ? (
                  <p className="text-2xl font-bold text-emerald-700">Jetzt loslassen</p>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-800 mb-3">
                      Dokument hier hinziehen
                    </p>
                    <p className="text-lg text-gray-400 mb-8">oder</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        type="button"
                        className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xl px-10 py-5 rounded-2xl transition-all shadow-lg shadow-emerald-200"
                      >
                        Datei auswählen
                      </button>
                      <label
                        onClick={e => e.stopPropagation()}
                        className="flex items-center justify-center gap-2 border-2 border-gray-200 bg-white hover:border-emerald-300 text-gray-600 font-semibold text-lg px-7 py-5 rounded-2xl transition-all cursor-pointer"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="sr-only"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) onDrop([file])
                          }}
                        />
                        Foto aufnehmen
                      </label>
                    </div>
                    <p className="text-base text-gray-400 mt-6">PDF, Foto (JPG/PNG) oder Text · bis zu 4 MB</p>
                  </>
                )}
              </div>
            </SignedIn>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-base text-gray-400">
              <span className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                DSGVO-konform
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                Verschlüsselt
              </span>
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-500" />
                Keine Weitergabe
              </span>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="mt-16 text-gray-300 animate-bounce">
            <ChevronDown className="h-7 w-7 mx-auto" />
          </div>

          {/* Share tip for adult children */}
          <div className="mt-10 max-w-md mx-auto bg-blue-50 border border-blue-100 rounded-2xl px-8 py-6 text-center">
            <p className="text-base font-semibold text-blue-800 mb-1">Für Kinder und Angehörige</p>
            <p className="text-sm text-blue-600 leading-relaxed">
              Schicken Sie diesen Link an Ihre Eltern:{' '}
              <span className="font-mono font-bold">medyra.de/verstehen</span>
            </p>
            <button
              onClick={handleShare}
              className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              <Share2 className="h-4 w-4" /> Link teilen
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          ANALYZING STAGE
      ══════════════════════════════════════════════════ */}
      {stage === 'analyzing' && (
        <div className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center px-6 text-center">
          <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center mb-8">
            <Loader2 className="h-16 w-16 text-emerald-500 animate-spin" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Wir lesen Ihr Dokument …
          </h2>
          <p className="text-xl text-gray-500 max-w-sm leading-relaxed mb-12">
            Das dauert etwa 30 Sekunden.<br />Bitte warten Sie kurz.
          </p>
          <div className="space-y-5 text-left max-w-xs w-full">
            {[
              'Text aus dem Dokument lesen …',
              'Fachbegriffe erkennen …',
              'Verständliche Erklärung erstellen …',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4 text-lg text-gray-500">
                <div
                  className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"
                  style={{ animationDelay: `${i * 450}ms` }}
                />
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          RESULT STAGE
      ══════════════════════════════════════════════════ */}
      {stage === 'result' && report && (
        <div ref={resultRef} className="max-w-2xl mx-auto px-5 py-12 md:py-20 print-large">

          {/* Success header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Ihr Dokument wurde erklärt
            </h2>
            <p className="text-xl text-gray-500">Hier ist alles in einfacher Sprache</p>
          </div>

          {/* ── VORLESEN BUTTON ── */}
          <div className="no-print mb-10">
            <button
              onClick={handleVorlesen}
              className={`w-full flex items-center justify-center gap-4 py-6 px-8 rounded-2xl text-2xl font-bold transition-all shadow-lg active:scale-95 ${
                speaking
                  ? 'bg-gray-900 text-white shadow-gray-200'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
              }`}
            >
              {speaking ? (
                <><VolumeX className="h-8 w-8" /> Vorlesen stoppen</>
              ) : (
                <><Volume2 className="h-8 w-8" /> Vorlesen lassen</>
              )}
            </button>
            {speaking && (
              <p className="text-center text-base text-gray-400 mt-3 animate-pulse">
                Wird gerade vorgelesen …
              </p>
            )}
          </div>

          {/* ── Summary ── */}
          {(report.analysis?.summary || report.explanation?.summary) && (
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-7 mb-8">
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-3">Zusammenfassung</p>
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed">
                {report.analysis?.summary || report.explanation?.summary}
              </p>
            </div>
          )}

          {/* ── Findings ── */}
          {report.analysis?.findings?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-5">Ihre Werte erklärt</h3>
              <div className="space-y-4">
                {report.analysis.findings.map((f, i) => {
                  const { text, color } = statusLabel(f.status)
                  return (
                    <div key={i} className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
                      <div className="flex items-start gap-4">
                        <StatusIcon status={f.status} />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="text-xl font-bold text-gray-900">{f.name}</span>
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${color}`}>{text}</span>
                            {f.value && (
                              <span className="text-base font-mono text-gray-400">{f.value}</span>
                            )}
                          </div>
                          {f.explanation && (
                            <p className="text-lg text-gray-600 leading-relaxed">{f.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Questions for doctor ── */}
          {report.explanation?.questionsForDoctor?.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-7 mb-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-5">Fragen für Ihren Arzt</h3>
              <ul className="space-y-4">
                {report.explanation.questionsForDoctor.map((q, i) => (
                  <li key={i} className="flex gap-3 text-xl text-blue-800 leading-relaxed">
                    <span className="font-bold text-blue-400 flex-shrink-0 pt-0.5">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="no-print grid grid-cols-2 gap-4 mb-10">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 py-5 rounded-2xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-lg transition-all"
            >
              <Printer className="h-6 w-6" /> Drucken
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-lg transition-all"
            >
              <Share2 className="h-6 w-6" /> Teilen
            </button>
          </div>

          {/* Upload another */}
          <div className="no-print text-center border-t border-gray-100 pt-8">
            <button
              onClick={handleReset}
              className="text-lg text-gray-500 hover:text-emerald-600 underline transition-colors"
            >
              Ein weiteres Dokument hochladen
            </button>
          </div>

          {/* Trust reminder */}
          <div className="mt-10 text-center text-base text-gray-400">
            <Shield className="h-5 w-5 inline mr-2 text-emerald-400" />
            Ihre Daten sind verschlüsselt und werden nicht weitergegeben.
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="no-print border-t border-gray-100 py-8 text-center text-base text-gray-400 mt-10">
        <p className="mb-3 text-gray-500">
          Medyra ist kein Arzt und ersetzt keine medizinische Beratung.
        </p>
        <div className="flex justify-center gap-6">
          <Link href="/privacy" className="hover:text-gray-700 transition-colors">Datenschutz</Link>
          <Link href="/terms"   className="hover:text-gray-700 transition-colors">Nutzungsbedingungen</Link>
          <Link href="/contact" className="hover:text-gray-700 transition-colors">Kontakt</Link>
        </div>
      </footer>
    </div>
  )
}
