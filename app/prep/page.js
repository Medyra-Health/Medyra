'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import {
  ArrowLeft, Printer, Loader2, FileText, AlertTriangle,
  Sparkles, ChevronRight, Lock, Clock, ChevronDown,
  Stethoscope, Pill, FlaskConical, HelpCircle, Send, RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import MedyraLogo from '@/components/MedyraLogo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations, useLocale } from 'next-intl'

// ── Categories ────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'symptoms',
    icon: Stethoscope,
    label: 'I have symptoms',
    labelDe: 'Ich habe Symptome',
    desc: "Describe what you're feeling to get a structured summary",
    descDe: 'Beschreiben Sie Ihre Beschwerden für eine strukturierte Zusammenfassung',
    color: 'emerald',
  },
  {
    id: 'diagnosis',
    icon: Pill,
    label: 'I have a diagnosis',
    labelDe: 'Ich habe eine Diagnose',
    desc: 'Already diagnosed? Prepare questions for your follow-up',
    descDe: 'Bereits diagnostiziert? Bereiten Sie Fragen für Ihre Nachsorge vor',
    color: 'blue',
  },
  {
    id: 'results',
    icon: FlaskConical,
    label: 'I have test results',
    labelDe: 'Ich habe Testergebnisse',
    desc: 'Lab work, scans, or reports — understand what to ask',
    descDe: 'Labor, Scans oder Berichte — verstehen Sie, was Sie fragen sollen',
    color: 'violet',
  },
  {
    id: 'general',
    icon: HelpCircle,
    label: 'General question',
    labelDe: 'Allgemeine Frage',
    desc: 'Find a doctor, understand the system, or get advice',
    descDe: 'Arzt finden, System verstehen oder Rat einholen',
    color: 'amber',
  },
]

const COLOR_MAP = {
  emerald: {
    bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600',
    selected: 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-50',
  },
  blue: {
    bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600',
    selected: 'ring-2 ring-blue-400 border-blue-400 bg-blue-50',
  },
  violet: {
    bg: 'bg-violet-50', border: 'border-violet-200', icon: 'bg-violet-100 text-violet-600',
    selected: 'ring-2 ring-violet-400 border-violet-400 bg-violet-50',
  },
  amber: {
    bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600',
    selected: 'ring-2 ring-amber-400 border-amber-400 bg-amber-50',
  },
}

// ── Parse output into structured sections ─────────────────────────────────
function parseOutput(text) {
  if (!text) return []
  const lines = text.split('\n')
  const sections = []
  let current = null

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('**Patientenzusammenfassung') || line.startsWith('**Patient Summary')) {
      sections.push({ type: 'title', text: line.replace(/\*\*/g, '').trim() })
      current = null; continue
    }
    if (line.startsWith('Datum:') || line.startsWith('Date:')) {
      sections.push({ type: 'date', text: line })
      current = null; continue
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      current = { type: 'section', heading: line.replace(/\*\*/g, '').trim(), items: [] }
      sections.push(current); continue
    }
    if ((line.startsWith('- ') || line.startsWith('• ')) && current?.type === 'section') {
      current.items.push({ type: 'bullet', text: line.replace(/^[-•]\s*/, '') }); continue
    }
    if (/^\d+\.\s/.test(line) && current?.type === 'section') {
      current.items.push({ type: 'numbered', text: line.replace(/^\d+\.\s*/, '') }); continue
    }
    if (line.includes('Kommunikation erstellt') || line.includes('keine medizinische Diagnose') ||
        line.includes('communication purposes') || line.includes('medical diagnosis')) {
      sections.push({ type: 'disclaimer', text: line }); current = null; continue
    }
    if (current?.type === 'section') {
      current.items.push({ type: 'text', text: line })
    } else {
      sections.push({ type: 'text', text: line })
    }
  }
  return sections
}

// ── Rendered output card ──────────────────────────────────────────────────
function OutputCard({ text, onPrint, t }) {
  const sections = parseOutput(text)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-semibold text-gray-700">{t('prep.outputLabel')}</span>
        </div>
        <Button variant="outline" size="sm" onClick={onPrint}
          className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 print:hidden">
          <Printer className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('prep.printFull')}</span>
          <span className="sm:hidden">{t('prep.print')}</span>
        </Button>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-7 space-y-5 text-sm leading-relaxed" id="prep-output">
        {sections.map((sec, i) => {
          if (sec.type === 'title') return <h2 key={i} className="text-base font-bold text-[#040C08] border-b border-gray-100 pb-2">{sec.text}</h2>
          if (sec.type === 'date') return <p key={i} className="text-xs text-gray-500">{sec.text}</p>
          if (sec.type === 'section') return (
            <div key={i} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#10B981]">{sec.heading}</h3>
              {sec.items.length === 0 && <p className="text-gray-400 italic text-xs">Keine Angaben</p>}
              {sec.items.map((item, j) => {
                if (item.type === 'bullet') return (
                  <div key={j} className="flex items-start gap-2">
                    <span className="text-[#10B981] font-bold mt-0.5 flex-shrink-0">·</span>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                )
                if (item.type === 'numbered') return (
                  <div key={j} className="flex items-start gap-2">
                    <span className="text-[#10B981] font-semibold flex-shrink-0 w-4 text-right">{j + 1}.</span>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                )
                return <p key={j} className="text-gray-700">{item.text}</p>
              })}
            </div>
          )
          if (sec.type === 'disclaimer') return <p key={i} className="text-[11px] text-gray-400 border-t border-gray-100 pt-4 mt-4 italic">{sec.text}</p>
          return <p key={i} className="text-gray-700">{sec.text}</p>
        })}
      </div>
    </div>
  )
}

// ── Print styles ──────────────────────────────────────────────────────────
const PRINT_STYLES = `
@media print {
  body * { visibility: hidden !important; }
  #print-area, #print-area * { visibility: visible !important; }
  #print-area {
    position: fixed !important; inset: 0 !important;
    width: 210mm !important; min-height: 297mm !important;
    padding: 18mm 20mm 22mm 20mm !important;
    background: white !important;
    font-family: 'Helvetica Neue', Arial, sans-serif !important;
    font-size: 10pt !important; color: #040C08 !important; box-sizing: border-box !important;
  }
  .print-header { display: flex !important; justify-content: space-between !important; align-items: flex-start !important; border-bottom: 2px solid #10B981 !important; padding-bottom: 8pt !important; margin-bottom: 14pt !important; }
  .print-logo-text { font-size: 20pt !important; font-weight: 900 !important; color: #040C08 !important; }
  .print-logo-accent { color: #10B981 !important; }
  .print-logo-sub { font-size: 7pt !important; color: #10B981 !important; display: block !important; }
  .print-meta { text-align: right !important; font-size: 8pt !important; color: #6b7280 !important; }
  .print-doc-title { font-size: 13pt !important; font-weight: 700 !important; margin-bottom: 4pt !important; }
  .print-section { margin-top: 12pt !important; }
  .print-section-heading { font-size: 7.5pt !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.08em !important; color: #10B981 !important; border-bottom: 0.5pt solid #d1fae5 !important; padding-bottom: 2pt !important; margin-bottom: 5pt !important; }
  .print-bullet { display: flex !important; gap: 6pt !important; margin-bottom: 3pt !important; }
  .print-bullet-dot { color: #10B981 !important; font-weight: 700 !important; flex-shrink: 0 !important; }
  .print-text { line-height: 1.55 !important; color: #1f2937 !important; }
  .print-footer { position: fixed !important; bottom: 12mm !important; left: 20mm !important; right: 20mm !important; font-size: 7pt !important; color: #9ca3af !important; text-align: center !important; border-top: 0.5pt solid #e5e7eb !important; padding-top: 4pt !important; }
  @page { size: A4; margin: 0; }
}
`

function PrintArea({ text }) {
  const sections = parseOutput(text)
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return (
    <div id="print-area" style={{ display: 'none' }}>
      <div className="print-header">
        <div>
          <div className="print-logo-text"><span className="print-logo-accent">M</span>edyra</div>
          <span className="print-logo-sub">Arztbesuch-Vorbereitung</span>
        </div>
        <div className="print-meta"><div>{today}</div><div style={{ marginTop: '2pt', color: '#9ca3af' }}>Erstellt mit Medyra</div></div>
      </div>
      <div>
        {sections.map((sec, i) => {
          if (sec.type === 'title') return <div key={i} className="print-doc-title">{sec.text}</div>
          if (sec.type === 'date') return <div key={i} style={{ fontSize: '8pt', color: '#6b7280', marginBottom: '10pt' }}>{sec.text}</div>
          if (sec.type === 'section') return (
            <div key={i} className="print-section">
              <div className="print-section-heading">{sec.heading}</div>
              {sec.items.map((item, j) => {
                if (item.type === 'bullet' || item.type === 'numbered') return (
                  <div key={j} className="print-bullet">
                    <span className="print-bullet-dot">{item.type === 'numbered' ? `${j + 1}.` : '·'}</span>
                    <span className="print-text">{item.text}</span>
                  </div>
                )
                return <div key={j} className="print-text">{item.text}</div>
              })}
            </div>
          )
          if (sec.type === 'disclaimer') return null
          return <div key={i} className="print-text">{sec.text}</div>
        })}
      </div>
      <div className="print-footer">Dieses Dokument wurde zur Kommunikation erstellt und stellt keine medizinische Diagnose dar. · medyra.de</div>
    </div>
  )
}

// ── Chat bubble ───────────────────────────────────────────────────────────
function ChatBubble({ role, text, isLoading }) {
  const isAI = role === 'assistant'
  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      {isAI && (
        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isAI
          ? 'bg-white border border-gray-100 text-gray-800 shadow-sm'
          : 'bg-[#10B981] text-white'
      }`}>
        {isLoading ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{text}</p>
        )}
      </div>
    </div>
  )
}

// ── Suggestion chips ──────────────────────────────────────────────────────
function SuggestionChips({ suggestions, onSelect }) {
  if (!suggestions?.length) return null
  return (
    <div className="flex flex-wrap gap-2 mt-3 ml-10">
      {suggestions.map((s, i) => (
        <button key={i} onClick={() => onSelect(s)}
          className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium">
          {s}
        </button>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function PrepPage() {
  const { user, isLoaded } = useUser()
  const t = useTranslations()
  const locale = useLocale()

  // Flow: 'category' | 'chat' | 'summary'
  const [step, setStep] = useState('category')
  const [category, setCategory] = useState(null)

  // Chat state
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [readyToGenerate, setReadyToGenerate] = useState(false)

  // Summary state
  const [output, setOutput] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Usage + history
  const [usage, setUsage] = useState(null)
  const [history, setHistory] = useState([])
  const [historyOpen, setHistoryOpen] = useState(null)
  const [printDoc, setPrintDoc] = useState(null)

  // Profile context
  const [profiles, setProfiles] = useState([])
  const [selectedProfileId, setSelectedProfileId] = useState(null)

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isLoaded && user) {
      fetch('/api/prep').then(r => r.json()).then(data => {
        setUsage(data)
        if (data.history) setHistory(data.history)
      }).catch(() => {})
      fetch('/api/profiles').then(r => r.json()).then(data => {
        if (data.profiles?.length) {
          setProfiles(data.profiles)
          setSelectedProfileId(data.profiles[0].id)
        }
      }).catch(() => {})
    }
  }, [isLoaded, user])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  async function selectCategory(cat) {
    setCategory(cat)
    setStep('chat')
    setChatLoading(true)
    setSuggestions([])
    setReadyToGenerate(false)

    try {
      const res = await fetch('/api/prep/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Category: ${cat.id}` }],
          category: cat.id,
          locale,
          profileId: selectedProfileId,
        }),
      })
      const data = await res.json()
      setMessages([{ role: 'assistant', text: data.message, id: Date.now() }])
      setSuggestions(data.suggestions || [])
      setReadyToGenerate(data.readyToGenerate || false)
    } catch {
      toast.error('Failed to start session. Please try again.')
    } finally {
      setChatLoading(false)
    }
  }

  async function sendMessage(text) {
    const userText = (text || chatInput).trim()
    if (!userText || chatLoading) return
    setChatInput('')
    setSuggestions([])

    const newMsg = { role: 'user', text: userText, id: Date.now() }
    const updatedMessages = [...messages, newMsg]
    setMessages(updatedMessages)
    setChatLoading(true)

    const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.text }))

    try {
      const res = await fetch('/api/prep/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, category: category.id, locale, profileId: selectedProfileId }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', text: data.message, id: Date.now() + 1 }])
      setSuggestions(data.suggestions || [])
      setReadyToGenerate(data.readyToGenerate || false)
    } catch {
      toast.error('Failed to send message.')
    } finally {
      setChatLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  async function generateSummary() {
    setSummaryLoading(true)
    setStep('summary')

    const fullContext = `Category: ${category.id}\n\nConversation:\n${messages.map(m => `${m.role === 'user' ? 'Patient' : 'Assistant'}: ${m.text}`).join('\n')}`

    try {
      const res = await fetch('/api/prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: fullContext, locale, profileId: selectedProfileId }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'limit_reached') {
          toast.error(t('prep.usageLimitReached'))
        } else {
          toast.error(data.error || t('errors.analysisFailed'))
        }
        setStep('chat')
        return
      }
      setOutput(data.output)
      setUsage(prev => prev ? { ...prev, used: (prev.used || 0) + 1, canUse: prev.unlimited || (prev.used + 1) < prev.limit } : prev)
      const conversationText = messages.filter(m => m.role === 'user').map(m => m.text).join('\n')
      setHistory(prev => [{ id: Date.now().toString(), createdAt: new Date().toISOString(), input: conversationText, output: data.output }, ...prev].slice(0, 20))
    } catch {
      toast.error(t('errors.uploadFailed'))
      setStep('chat')
    } finally {
      setSummaryLoading(false)
    }
  }

  function reset() {
    setStep('category')
    setCategory(null)
    setMessages([])
    setChatInput('')
    setSuggestions([])
    setReadyToGenerate(false)
    setOutput('')
  }

  function handlePrint(text) {
    setPrintDoc(text)
    setTimeout(() => {
      const el = document.getElementById('print-area')
      if (el) {
        el.style.display = 'block'
        window.print()
        setTimeout(() => { el.style.display = 'none'; setPrintDoc(null) }, 800)
      }
    }, 50)
  }

  const isLimitReached = usage && !usage.unlimited && usage.used >= usage.limit
  const isUnlimited = usage?.unlimited

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <>
      <style>{PRINT_STYLES}</style>
      {(printDoc || output) && <PrintArea text={printDoc || output} />}

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b-2 border-violet-100 sticky top-0 z-40 print:hidden">
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
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-emerald-600" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                {t('prep.sectionLabel')}
              </Badge>
              {step !== 'category' && (
                <button onClick={reset} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  <RotateCcw className="h-3 w-3" /> {locale === 'de' ? 'Neu starten' : 'Start over'}
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#040C08] mb-1">{t('prep.title')}</h1>
            <p className="text-gray-500 text-sm leading-relaxed">{t('prep.description')}</p>
          </div>

          {/* Usage badge */}
          {user && usage && (
            <div className={`flex items-center justify-between text-xs px-4 py-2.5 rounded-xl mb-6 border ${
              isLimitReached ? 'bg-red-50 border-red-200 text-red-700'
              : isUnlimited ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="flex items-center gap-2">
                {isUnlimited ? (
                  <><Sparkles className="h-3.5 w-3.5" /> {t('prep.usageUnlimited')}</>
                ) : isLimitReached ? (
                  <><Lock className="h-3.5 w-3.5" /> {t('prep.usageLimitReached')}</>
                ) : (
                  <><FileText className="h-3.5 w-3.5" />
                    {t('prep.usageCount').replace('{used}', usage.used).replace('{limit}', usage.limit)}
                  </>
                )}
              </div>
              {isLimitReached && (
                <Link href="/pricing" className="font-semibold underline underline-offset-2 hover:no-underline flex items-center gap-1">
                  {t('prep.upgrade')} <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}

          {/* Not signed in */}
          {!user && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">{t('prep.notSignedIn')}</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {t('prep.notSignedInDesc')}{' '}
                  <Link href="/sign-in" className="underline font-semibold">{t('prep.signIn')}</Link>
                </p>
              </div>
            </div>
          )}

          {/* ── Profile selector ── */}
          {profiles.length > 0 && step === 'category' && (
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                {locale === 'de' ? 'Für wen ist dieser Arztbrief?' : 'Who is this prep for?'}
              </p>
              <div className="flex flex-wrap gap-2">
                {profiles.map(p => {
                  const COLORS = {
                    emerald: 'bg-emerald-500', blue: 'bg-blue-500', violet: 'bg-violet-500',
                    amber: 'bg-amber-500', rose: 'bg-rose-500', sky: 'bg-sky-500',
                  }
                  const dot = COLORS[p.color] || 'bg-emerald-500'
                  const isSelected = selectedProfileId === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProfileId(p.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-300/50'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-800'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                      {p.name}
                      {isSelected && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                          {locale === 'de' ? 'Gewählt' : 'Selected'}
                        </span>
                      )}
                    </button>
                  )
                })}
                <button
                  onClick={() => setSelectedProfileId(null)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    !selectedProfileId
                      ? 'border-gray-400 bg-gray-50 text-gray-800 ring-2 ring-gray-300/50'
                      : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {locale === 'de' ? 'Kein Profil' : 'No profile'}
                </button>
              </div>
              {selectedProfileId && (
                <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {locale === 'de'
                    ? 'Laborwerte aus dem Health Vault werden automatisch einbezogen'
                    : 'Lab values from Health Vault will be included automatically'}
                </p>
              )}
            </div>
          )}

          {/* ── STEP 1: Category selection ── */}
          {step === 'category' && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-4">
                {locale === 'de' ? 'Was führt Sie heute her?' : "What brings you in today?"}
              </p>
              {CATEGORIES.map(cat => {
                const Icon = cat.icon
                const colors = COLOR_MAP[cat.color]
                const isDE = locale === 'de'
                return (
                  <button
                    key={cat.id}
                    onClick={() => user && !isLimitReached && selectCategory(cat)}
                    disabled={!user || isLimitReached}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border border-gray-200 bg-white text-left transition-all hover:shadow-sm hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                        {isDE ? cat.labelDe : cat.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        {isDE ? cat.descDe : cat.desc}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                  </button>
                )
              })}
            </div>
          )}

          {/* ── STEP 2: Guided chat ── */}
          {step === 'chat' && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
                {category && (() => {
                  const Icon = category.icon
                  const colors = COLOR_MAP[category.color]
                  return (
                    <>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors.icon}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {locale === 'de' ? category.labelDe : category.label}
                      </span>
                    </>
                  )
                })()}
                <div className="ml-auto flex items-center gap-3">
                  {selectedProfileId && profiles.find(p => p.id === selectedProfileId) && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                      {profiles.find(p => p.id === selectedProfileId).name}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-gray-400">AI Guide</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="px-4 py-5 space-y-4 min-h-[200px] max-h-[420px] overflow-y-auto">
                {messages.map(msg => (
                  <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
                ))}
                {chatLoading && <ChatBubble role="assistant" isLoading />}
                {suggestions.length > 0 && !chatLoading && (
                  <SuggestionChips suggestions={suggestions} onSelect={s => sendMessage(s)} />
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 px-4 py-3">
                {readyToGenerate ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-500 text-center">
                      {locale === 'de' ? 'Bereit, Ihre strukturierte Zusammenfassung zu erstellen' : 'Ready to generate your structured summary'}
                    </p>
                    <Button
                      onClick={generateSummary}
                      disabled={summaryLoading}
                      className="w-full bg-[#10B981] hover:bg-emerald-600 text-white font-semibold h-11"
                    >
                      {summaryLoading ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {locale === 'de' ? 'Zusammenfassung wird erstellt...' : 'Generating summary...'}</>
                      ) : (
                        <><Sparkles className="h-4 w-4 mr-2" /> {locale === 'de' ? 'Arztbrief erstellen' : 'Generate doctor summary'}</>
                      )}
                    </Button>
                    <button onClick={() => setReadyToGenerate(false)} className="text-xs text-gray-400 hover:text-gray-600 text-center">
                      {locale === 'de' ? 'Weitere Fragen beantworten' : 'Continue answering questions instead'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); sendMessage() }} className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      disabled={chatLoading}
                      placeholder={locale === 'de' ? 'Ihre Antwort eingeben...' : 'Type your answer...'}
                      className="flex-1 text-sm rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 disabled:opacity-50"
                    />
                    <Button type="submit" disabled={!chatInput.trim() || chatLoading}
                      className="bg-[#10B981] hover:bg-emerald-600 text-white h-10 w-10 p-0 rounded-xl flex-shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: Summary ── */}
          {step === 'summary' && (
            <div className="space-y-6">
              {summaryLoading ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  <p className="text-sm text-gray-500">
                    {locale === 'de' ? 'Arztbrief wird erstellt...' : 'Generating your doctor summary...'}
                  </p>
                </div>
              ) : output ? (
                <>
                  <OutputCard text={output} onPrint={() => handlePrint(output)} t={t} />
                  <div className="flex gap-3">
                    <Button onClick={reset} variant="outline" className="flex-1">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {locale === 'de' ? 'Neue Sitzung' : 'Start new session'}
                    </Button>
                    <Button onClick={() => setStep('chat')} variant="outline" className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {locale === 'de' ? 'Zurück zum Chat' : 'Back to chat'}
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Disclaimer */}
          {step !== 'chat' && (
            <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 print:hidden">
              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                {t('prep.disclaimer')} · <span className="text-emerald-600 font-medium">Medyra</span>
              </p>
            </div>
          )}

          {/* Upgrade CTA */}
          {usage && !isUnlimited && step === 'category' && (
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>{t('prep.upgradeCta')}</span>
              <Link href="/pricing" className="text-emerald-600 font-semibold hover:underline flex items-center gap-0.5">
                {t('prep.upgrade')} <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* ── History ── */}
          <div className="mt-10 print:hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-violet-500" />
                <h2 className="text-base font-bold text-gray-800">
                  {locale === 'de' ? 'Frühere Zusammenfassungen' : 'Previous Summaries'}
                </h2>
                {history.length > 0 && (
                  <span className="text-xs text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full font-semibold">{history.length}</span>
                )}
              </div>
            </div>

            {history.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-5 w-5 text-violet-400" />
                </div>
                <p className="text-sm font-semibold text-gray-500">
                  {locale === 'de' ? 'Noch keine Zusammenfassungen' : 'No summaries yet'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {locale === 'de' ? 'Ihre erstellten Arztbriefe erscheinen hier' : 'Your generated doctor summaries will appear here'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((doc) => {
                  const isOpen = historyOpen === doc.id
                  const date = new Date(doc.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
                  const time = new Date(doc.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                  const inputPreview = doc.input ? doc.input.slice(0, 140) + (doc.input.length > 140 ? '…' : '') : ''
                  return (
                    <div key={doc.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:border-violet-200 transition-colors">
                      <button onClick={() => setHistoryOpen(isOpen ? null : doc.id)}
                        className="w-full flex items-start gap-3 px-4 py-4 text-left">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-gray-800">
                              {locale === 'de' ? 'Arztbrief' : 'Doctor Summary'}
                            </span>
                            {doc.profileName && (
                              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">{doc.profileName}</span>
                            )}
                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{date} · {time}</span>
                          </div>
                          {inputPreview && (
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                              <span className="font-medium text-gray-400">{locale === 'de' ? 'Sie: ' : 'You: '}</span>{inputPreview}
                            </p>
                          )}
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="border-t border-gray-100">
                          {doc.input && (
                            <div className="px-4 pt-4 pb-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                {locale === 'de' ? 'Ihre Beschreibung' : 'Your Description'}
                              </p>
                              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{doc.input}</p>
                              </div>
                            </div>
                          )}
                          <div className="px-4 pb-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-2">
                              {locale === 'de' ? 'Medyra Zusammenfassung' : 'Medyra Summary'}
                            </p>
                            <OutputCard text={doc.output} onPrint={() => handlePrint(doc.output)} t={t} />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
