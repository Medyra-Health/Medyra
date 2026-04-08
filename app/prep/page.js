'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, Printer, Loader2, FileText, AlertTriangle, Sparkles, ChevronRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import MedyraLogo from '@/components/MedyraLogo'
import LanguageSwitcher from '@/components/LanguageSwitcher'

// ── Parse the Claude markdown-like output into structured sections ──────────
function parseOutput(text) {
  if (!text) return []
  const lines = text.split('\n')
  const sections = []
  let current = null

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    // Top-level title: **Patientenzusammenfassung…**
    if (line.startsWith('**Patientenzusammenfassung')) {
      const title = line.replace(/\*\*/g, '').trim()
      sections.push({ type: 'title', text: title })
      current = null
      continue
    }

    // Date line
    if (line.startsWith('Datum:')) {
      sections.push({ type: 'date', text: line })
      current = null
      continue
    }

    // Section header: **Heading**
    if (line.startsWith('**') && line.endsWith('**')) {
      const heading = line.replace(/\*\*/g, '').trim()
      current = { type: 'section', heading, items: [] }
      sections.push(current)
      continue
    }

    // Bullet point
    if ((line.startsWith('- ') || line.startsWith('• ')) && current?.type === 'section') {
      current.items.push({ type: 'bullet', text: line.replace(/^[-•]\s*/, '') })
      continue
    }

    // Numbered item (1. 2. 3.)
    if (/^\d+\.\s/.test(line) && current?.type === 'section') {
      current.items.push({ type: 'numbered', text: line.replace(/^\d+\.\s*/, '') })
      continue
    }

    // Disclaimer line
    if (line.includes('Kommunikation erstellt') || line.includes('keine medizinische Diagnose')) {
      sections.push({ type: 'disclaimer', text: line })
      current = null
      continue
    }

    // Plain text inside a section
    if (current?.type === 'section') {
      current.items.push({ type: 'text', text: line })
    } else {
      sections.push({ type: 'text', text: line })
    }
  }

  return sections
}

// ── Render parsed sections as React elements ───────────────────────────────
function OutputCard({ text, onPrint }) {
  const sections = parseOutput(text)
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="space-y-1">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-semibold text-gray-700">Arztbesuch-Zusammenfassung</span>
          <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-200">Deutsch</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 print:hidden"
        >
          <Printer className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Drucken / Speichern</span>
          <span className="sm:hidden">Drucken</span>
        </Button>
      </div>

      {/* Rendered output */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-7 space-y-5 text-sm leading-relaxed" id="prep-output">
        {sections.map((sec, i) => {
          if (sec.type === 'title') {
            return (
              <h2 key={i} className="text-base font-bold text-[#040C08] border-b border-gray-100 pb-2">
                {sec.text}
              </h2>
            )
          }
          if (sec.type === 'date') {
            return (
              <p key={i} className="text-xs text-gray-500">{sec.text}</p>
            )
          }
          if (sec.type === 'section') {
            return (
              <div key={i} className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#10B981]">{sec.heading}</h3>
                {sec.items.length === 0 && (
                  <p className="text-gray-400 italic text-xs">Keine Angaben</p>
                )}
                {sec.items.map((item, j) => {
                  if (item.type === 'bullet') {
                    return (
                      <div key={j} className="flex items-start gap-2">
                        <span className="text-[#10B981] font-bold mt-0.5 flex-shrink-0">·</span>
                        <span className="text-gray-700">{item.text}</span>
                      </div>
                    )
                  }
                  if (item.type === 'numbered') {
                    return (
                      <div key={j} className="flex items-start gap-2">
                        <span className="text-[#10B981] font-semibold flex-shrink-0 w-4 text-right">{j + 1}.</span>
                        <span className="text-gray-700">{item.text}</span>
                      </div>
                    )
                  }
                  return (
                    <p key={j} className="text-gray-700">{item.text}</p>
                  )
                })}
              </div>
            )
          }
          if (sec.type === 'disclaimer') {
            return (
              <p key={i} className="text-[11px] text-gray-400 border-t border-gray-100 pt-4 mt-4 italic">
                {sec.text}
              </p>
            )
          }
          return (
            <p key={i} className="text-gray-700">{sec.text}</p>
          )
        })}
      </div>
    </div>
  )
}

// ── Print layout (hidden until print, injected into DOM) ───────────────────
const PRINT_STYLES = `
@media print {
  body * { visibility: hidden !important; }
  #print-area, #print-area * { visibility: visible !important; }
  #print-area {
    position: fixed !important;
    inset: 0 !important;
    width: 210mm !important;
    min-height: 297mm !important;
    padding: 18mm 20mm 22mm 20mm !important;
    background: white !important;
    font-family: 'Helvetica Neue', Arial, sans-serif !important;
    font-size: 10pt !important;
    color: #040C08 !important;
    box-sizing: border-box !important;
  }
  .print-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    border-bottom: 2px solid #10B981 !important;
    padding-bottom: 8pt !important;
    margin-bottom: 14pt !important;
  }
  .print-logo-text { font-size: 20pt !important; font-weight: 900 !important; color: #040C08 !important; }
  .print-logo-accent { color: #10B981 !important; }
  .print-logo-sub { font-size: 7pt !important; color: #10B981 !important; display: block !important; }
  .print-meta { text-align: right !important; font-size: 8pt !important; color: #6b7280 !important; }
  .print-doc-title { font-size: 13pt !important; font-weight: 700 !important; margin-bottom: 4pt !important; color: #040C08 !important; }
  .print-section { margin-top: 12pt !important; }
  .print-section-heading {
    font-size: 7.5pt !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
    color: #10B981 !important;
    border-bottom: 0.5pt solid #d1fae5 !important;
    padding-bottom: 2pt !important;
    margin-bottom: 5pt !important;
  }
  .print-bullet { display: flex !important; gap: 6pt !important; margin-bottom: 3pt !important; }
  .print-bullet-dot { color: #10B981 !important; font-weight: 700 !important; flex-shrink: 0 !important; }
  .print-text { line-height: 1.55 !important; color: #1f2937 !important; }
  .print-footer {
    position: fixed !important;
    bottom: 12mm !important;
    left: 20mm !important;
    right: 20mm !important;
    font-size: 7pt !important;
    color: #9ca3af !important;
    text-align: center !important;
    border-top: 0.5pt solid #e5e7eb !important;
    padding-top: 4pt !important;
  }
  @page { size: A4; margin: 0; }
}
`

function PrintArea({ text }) {
  const sections = parseOutput(text)
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div id="print-area" style={{ display: 'none' }}>
      {/* Header */}
      <div className="print-header">
        <div>
          <div className="print-logo-text">
            <span className="print-logo-accent">M</span>edyra
          </div>
          <span className="print-logo-sub">Arztbesuch-Vorbereitung</span>
        </div>
        <div className="print-meta">
          <div>{today}</div>
          <div style={{ marginTop: '2pt', color: '#9ca3af' }}>Erstellt mit Medyra</div>
        </div>
      </div>

      {/* Content */}
      <div>
        {sections.map((sec, i) => {
          if (sec.type === 'title') {
            return <div key={i} className="print-doc-title">{sec.text}</div>
          }
          if (sec.type === 'date') {
            return <div key={i} style={{ fontSize: '8pt', color: '#6b7280', marginBottom: '10pt' }}>{sec.text}</div>
          }
          if (sec.type === 'section') {
            return (
              <div key={i} className="print-section">
                <div className="print-section-heading">{sec.heading}</div>
                {sec.items.map((item, j) => {
                  if (item.type === 'bullet' || item.type === 'numbered') {
                    return (
                      <div key={j} className="print-bullet">
                        <span className="print-bullet-dot">{item.type === 'numbered' ? `${j + 1}.` : '·'}</span>
                        <span className="print-text">{item.text}</span>
                      </div>
                    )
                  }
                  return <div key={j} className="print-text">{item.text}</div>
                })}
              </div>
            )
          }
          if (sec.type === 'disclaimer') {
            return null // shown in footer
          }
          return <div key={i} className="print-text">{sec.text}</div>
        })}
      </div>

      {/* Footer */}
      <div className="print-footer">
        Dieses Dokument wurde zur Kommunikation erstellt und stellt keine medizinische Diagnose dar. · medyra.de
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function PrepPage() {
  const { user, isLoaded } = useUser()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')
  const [usage, setUsage] = useState(null) // { tier, limit, used, unlimited, canUse }
  const outputRef = useRef(null)

  // Fetch current usage on mount
  useEffect(() => {
    if (isLoaded && user) {
      fetch('/api/prep')
        .then(r => r.json())
        .then(data => setUsage(data))
        .catch(() => {})
    }
  }, [isLoaded, user])

  // Scroll to output when it appears
  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [output])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    setLoading(true)
    setOutput('')

    try {
      const res = await fetch('/api/prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'limit_reached') {
          toast.error(
            usage?.tier === 'free' || usage?.tier === 'onetime'
              ? 'Limit für diesen Monat erreicht. Upgrade auf Personal für unbegrenzte Nutzung.'
              : 'Limit erreicht.'
          )
        } else {
          toast.error(data.error || 'Ein Fehler ist aufgetreten.')
        }
        return
      }

      setOutput(data.output)
      // Refresh usage
      setUsage(prev => prev ? { ...prev, used: (prev.used || 0) + 1, canUse: prev.unlimited || (prev.used + 1) < prev.limit } : prev)
    } catch {
      toast.error('Verbindungsfehler. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    // Show print area, print, then hide
    const el = document.getElementById('print-area')
    if (el) {
      el.style.display = 'block'
      window.print()
      setTimeout(() => { el.style.display = 'none' }, 500)
    }
  }

  const isLimitReached = usage && !usage.unlimited && usage.used >= usage.limit
  const isUnlimited = usage?.unlimited
  const charCount = input.length
  const softCap = 3200

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <>
      {/* Print styles */}
      <style>{PRINT_STYLES}</style>

      {/* Print-only area — hidden until window.print() */}
      {output && <PrintArea text={output} />}

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 print:hidden">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <Link href="/dashboard"><MedyraLogo size="md" /></Link>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-700 hover:bg-gray-50">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
                  </Button>
                  <Button variant="ghost" size="sm" className="flex sm:hidden">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">

          {/* Hero */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-emerald-600" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                Arztbesuch-Vorbereitung
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#040C08] mb-2">
              Arztbesuch-Vorbereitung
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Beschreibe deine Beschwerden in beliebiger Sprache. Wir erstellen eine strukturierte,
              professionelle Zusammenfassung auf Deutsch — die du direkt deinem Arzt zeigen kannst.
            </p>
          </div>

          {/* Usage indicator */}
          {user && usage && (
            <div className={`flex items-center justify-between text-xs px-4 py-2.5 rounded-xl mb-6 border ${
              isLimitReached
                ? 'bg-red-50 border-red-200 text-red-700'
                : isUnlimited
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="flex items-center gap-2">
                {isUnlimited ? (
                  <><Sparkles className="h-3.5 w-3.5" /> Unbegrenzte Nutzung</>
                ) : isLimitReached ? (
                  <><Lock className="h-3.5 w-3.5" /> Monatliches Limit erreicht</>
                ) : (
                  <><FileText className="h-3.5 w-3.5" /> {usage.used}/{usage.limit} diesen Monat genutzt</>
                )}
              </div>
              {isLimitReached && (
                <Link href="/pricing" className="font-semibold underline underline-offset-2 hover:no-underline flex items-center gap-1">
                  Upgrade <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}

          {/* Not signed in */}
          {!user && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="pt-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Bitte anmelden</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Du musst eingeloggt sein, um die Arztbesuch-Vorbereitung zu nutzen.{' '}
                    <Link href="/sign-in" className="underline font-semibold">Jetzt anmelden</Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Section 1: Input form ── */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-900">Beschreibe deine Beschwerden</CardTitle>
              <CardDescription className="text-xs">
                Schreibe in beliebiger Sprache. Erwähne: Symptome, wann sie begannen, Medikamente, Allergien.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={!user || isLimitReached || loading}
                    rows={7}
                    placeholder="Beispiel: Ich habe seit 3 Tagen Kopfschmerzen, die morgens schlimmer werden. Mir wird schwindelig wenn ich aufstehe. Ich nehme täglich Metformin."
                    className={`w-full resize-none rounded-xl border text-sm leading-relaxed px-4 py-3 pr-16 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 ${
                      !user || isLimitReached
                        ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white border-gray-200 text-gray-800 placeholder:text-gray-400'
                    }`}
                  />
                  {/* Char counter */}
                  <span className={`absolute bottom-3 right-3 text-[10px] font-mono ${
                    charCount > softCap ? 'text-amber-500' : 'text-gray-300'
                  }`}>
                    {charCount}/{softCap}
                  </span>
                </div>

                {charCount > softCap && (
                  <p className="text-[11px] text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Text wird auf {softCap} Zeichen begrenzt.
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={!user || !input.trim() || loading || isLimitReached}
                  className="w-full bg-[#10B981] hover:bg-emerald-600 text-white font-semibold h-11 transition-all"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Zusammenfassung wird erstellt…</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /> Arztbrief erstellen</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* ── Section 2: Output card ── */}
          {output && (
            <div ref={outputRef} className="mb-6">
              <OutputCard text={output} onPrint={handlePrint} />
            </div>
          )}

          {/* ── Section 3: Disclaimer strip ── */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 print:hidden">
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Dieses Dokument wurde erstellt, um die Kommunikation mit deinem Arzt zu erleichtern.
              Es ist keine medizinische Diagnose. ·{' '}
              <span className="text-emerald-600 font-medium">Medyra</span>
            </p>
          </div>

          {/* Upgrade CTA for limited tiers */}
          {usage && !isUnlimited && (
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>Personal &amp; Family Plan: unbegrenzte Arztbriefe</span>
              <Link href="/pricing" className="text-emerald-600 font-semibold hover:underline flex items-center gap-0.5">
                Upgrade <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
