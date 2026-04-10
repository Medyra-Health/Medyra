'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── Brand ─────────────────────────────────────────────────────────────────
const BG      = '#040C08'
const ACCENT  = '#10B981'
const TEXT    = '#E8F5F0'
const MUTED   = 'rgba(232,245,240,0.45)'
const CARD_BG = 'rgba(16,185,129,0.06)'
const BORDER  = 'rgba(16,185,129,0.18)'

// ── Document mock data ─────────────────────────────────────────────────────
const DOCS = {
  insurance: {
    label: 'Health Insurance Letter',
    redacted: [
      'Techniker Krankenkasse',
      'Versicherungsnummer: ██████████',
      'Sehr geehrte/r ██████████,',
      'wir bestätigen Ihren Versicherungsschutz',
      'ab dem 01.04.2024 mit dem Tarif',
      '████████████████████████████.',
      'Beitrag: ██,██ € monatlich',
      'Gültig bis: ██.██.████',
    ],
    title: 'What this means',
    points: [
      '✅ You\'re covered starting April 1st',
      '💳 Your monthly premium is confirmed',
      '📋 This is your proof of insurance for university enrollment',
      '💡 Keep this letter — you\'ll need it for your Anmeldung',
    ],
  },
  lab: {
    label: 'Lab Results',
    redacted: [
      'Laborwerte — Befundbericht',
      'Patient: ██████████████',
      'Datum: ██.██.████',
      '',
      'Hämoglobin      11.8 g/dL   ↓',
      'MCV             72 fL        ↓',
      'Ferritin        8 µg/L       ↓',
      'TSH             2.1 mIU/L    ✓',
      'Cholesterin     195 mg/dL    ✓',
    ],
    title: 'Plain-language summary',
    points: [
      '⚠️ Your iron levels are low — common in students',
      '🩸 Hemoglobin and MCV suggest mild iron-deficiency anemia',
      '✅ Thyroid (TSH) and cholesterol are completely normal',
      '💡 Ask your doctor about iron supplements — easy fix',
    ],
  },
  prescription: {
    label: 'Prescription',
    redacted: [
      'Kassenrezept (Muster 16)',
      'Arzt: Dr. ████████████',
      'LANR: ██████████',
      '',
      'Rx  Ibuprofen 400mg',
      '    N3 — 50 Stück',
      '    1-1-1 nach dem Essen',
      '',
      'Rx  Omeprazol 20mg',
      '    N2 — 30 Stück',
    ],
    title: 'What to do',
    points: [
      '💊 Ibuprofen 400mg: take 3× daily with food (morning, noon, night)',
      '🛡️ Omeprazol protects your stomach while taking Ibuprofen',
      '🏥 Take to any German pharmacy — it\'s covered by your Kasse',
      '📅 N3 = largest pack size, N2 = medium — no need to worry',
    ],
  },
} as const

type DocKey = keyof typeof DOCS

const LANGUAGES = [
  'English','Deutsch','Français','Español','Türkçe','Русский',
  'العربية','中文','Polski','Română','Italiano','Português',
  'Українська','हिन्दी','Bahasa','Tagalog',
]

// ── Inline SVG logo ────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <svg width="28" height="33" viewBox="0 0 88 104" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="2" width="52" height="68" rx="7" stroke="rgba(16,185,129,0.58)" strokeWidth="1.5" fill="#040C08"/>
        <line x1="15" y1="18" x2="47" y2="18" stroke="rgba(16,185,129,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="15" y1="27" x2="47" y2="27" stroke="rgba(16,185,129,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="15" y1="36" x2="34" y2="36" stroke="rgba(16,185,129,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M31 53 L35 53 L38 45 L42 65 L46 35 L50 53 L54 47 L58 53 L86 53" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="35" cy="53" r="2.6" fill="#10B981" opacity="0.9"/>
      </svg>
      <span style={{ fontFamily: '"Playfair Display", serif', fontWeight: 800, fontSize: '1.15rem', color: TEXT, letterSpacing: '-0.01em' }}>
        <span style={{ color: ACCENT }}>M</span>edyra
      </span>
    </Link>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function StudentsPage() {
  const [active, setActive] = useState<DocKey>('insurance')
  const [fading, setFading] = useState(false)
  const doc = DOCS[active]

  function switchDoc(key: DocKey) {
    if (key === active) return
    setFading(true)
    setTimeout(() => { setActive(key); setFading(false) }, 180)
  }

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp2 {
          0%   { opacity: 0; transform: translateY(24px); }
          40%  { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp3 {
          0%   { opacity: 0; transform: translateY(24px); }
          60%  { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .anim-1 { animation: fadeSlideUp  0.7s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-2 { animation: fadeSlideUp2 0.9s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-3 { animation: fadeSlideUp3 1.1s cubic-bezier(.22,.68,0,1.2) both; }
        .marquee-track {
          display: flex;
          gap: 2.5rem;
          white-space: nowrap;
          animation: marquee 28s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover { animation-play-state: paused; }
        .marquee-wrap { overflow: hidden; }
        .doc-card {
          transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .doc-card.fading {
          opacity: 0;
          transform: translateY(6px);
        }
        .mock-glow:hover {
          box-shadow: 0 0 28px rgba(16,185,129,0.18);
        }
      `}</style>

      <div style={{ minHeight: '100dvh', background: BG, color: TEXT, fontFamily: '"DM Sans", sans-serif', overflowX: 'hidden' }}>

        {/* ── Nav ── */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', maxWidth: '960px', margin: '0 auto' }}>
          <Logo />
          <Link
            href="/sign-up"
            style={{
              background: ACCENT, color: '#040C08', fontWeight: 700, fontSize: '0.85rem',
              padding: '0.55rem 1.25rem', borderRadius: '12px', textDecoration: 'none',
              letterSpacing: '0.01em', transition: 'opacity 0.15s',
            }}
            onMouseOver={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseOut={e => (e.currentTarget.style.opacity = '1')}
          >
            Start free
          </Link>
        </nav>

        {/* ── Hero ── */}
        <main style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem 0' }}>

          {/* Trust pill */}
          <div className="anim-1" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(16,185,129,0.1)', border: `1px solid ${BORDER}`,
              color: ACCENT, fontSize: '0.75rem', fontWeight: 600,
              padding: '0.35rem 0.9rem', borderRadius: '999px', letterSpacing: '0.04em',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, display: 'inline-block' }} />
              FREE FOR STUDENTS
            </span>
          </div>

          {/* Headline */}
          <h1 className="anim-1" style={{
            fontFamily: '"Playfair Display", serif', fontWeight: 800,
            fontSize: 'clamp(2rem, 5.5vw, 3.1rem)', lineHeight: 1.15,
            textAlign: 'center', marginBottom: '1.25rem', color: TEXT,
          }}>
            Your first semester shouldn't come with a{' '}
            <span style={{ color: ACCENT, fontStyle: 'italic' }}>medical dictionary.</span>
          </h1>

          {/* Subheadline */}
          <p className="anim-2" style={{
            textAlign: 'center', color: MUTED, fontWeight: 300,
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', lineHeight: 1.65,
            maxWidth: '540px', margin: '0 auto 2rem',
          }}>
            Understand your health insurance letter, your lab results, your prescription —{' '}
            <span style={{ color: TEXT, fontWeight: 400 }}>in your language.</span>
          </p>

          {/* CTA */}
          <div className="anim-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '3.5rem' }}>
            <Link
              href="/sign-up"
              style={{
                background: ACCENT, color: '#040C08', fontWeight: 700,
                fontSize: '1rem', padding: '0.85rem 2.2rem', borderRadius: '14px',
                textDecoration: 'none', letterSpacing: '0.01em',
                boxShadow: '0 4px 24px rgba(16,185,129,0.3)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(16,185,129,0.4)' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(16,185,129,0.3)' }}
            >
              Start free — no credit card
            </Link>
            <p style={{ fontSize: '0.75rem', color: MUTED, textAlign: 'center', fontWeight: 300 }}>
              Used by students at HPI, TU Berlin, Charité and more.
            </p>
          </div>

          {/* ── Document demo ── */}
          <div className="anim-3">
            {/* Pill selector */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {(Object.keys(DOCS) as DocKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => switchDoc(key)}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: '999px', border: `1px solid`,
                    borderColor: active === key ? ACCENT : BORDER,
                    background: active === key ? 'rgba(16,185,129,0.15)' : 'transparent',
                    color: active === key ? ACCENT : MUTED,
                    fontSize: '0.8rem', fontWeight: active === key ? 600 : 400,
                    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                    fontFamily: '"DM Sans", sans-serif',
                  }}
                >
                  {DOCS[key].label}
                </button>
              ))}
            </div>

            {/* Mock card */}
            <div
              className={`doc-card mock-glow${fading ? ' fading' : ''}`}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '0', border: `1px solid ${BORDER}`,
                borderRadius: '20px', overflow: 'hidden',
                background: CARD_BG, transition: 'box-shadow 0.3s',
              }}
            >
              {/* Left — redacted document */}
              <div style={{
                padding: '1.5rem 1.25rem',
                borderRight: `1px solid ${BORDER}`,
                background: 'rgba(16,185,129,0.03)',
              }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, color: ACCENT, letterSpacing: '0.08em', marginBottom: '0.85rem', textTransform: 'uppercase' }}>
                  Original document
                </p>
                <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', lineHeight: 1.9, color: MUTED }}>
                  {doc.redacted.map((line, i) => (
                    <div key={i} style={{ userSelect: 'none' }}>
                      {line || '\u00A0'}
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: '0.75rem', padding: '0.4rem 0.6rem',
                  background: 'rgba(16,185,129,0.08)', borderRadius: '8px',
                  display: 'inline-block',
                }}>
                  <span style={{ fontSize: '0.65rem', color: ACCENT, fontWeight: 500 }}>🔒 Encrypted · Not stored</span>
                </div>
              </div>

              {/* Right — plain language */}
              <div style={{ padding: '1.5rem 1.25rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, color: ACCENT, letterSpacing: '0.08em', marginBottom: '0.85rem', textTransform: 'uppercase' }}>
                  {doc.title}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {doc.points.map((pt, i) => (
                    <li key={i} style={{ fontSize: '0.78rem', fontWeight: 300, color: TEXT, lineHeight: 1.5 }}>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Language strip ── */}
          <div style={{ marginTop: '3.5rem' }}>
            <p style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Available in 16 languages
            </p>
            <div className="marquee-wrap" style={{ maskImage: 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)' }}>
              <div className="marquee-track" style={{ fontSize: '0.9rem', fontWeight: 300, color: MUTED }}>
                {/* Duplicated for seamless loop */}
                {[...LANGUAGES, ...LANGUAGES].map((lang, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                    {lang}
                    <span style={{ opacity: 0.25, fontSize: '0.6rem' }}>◆</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Trust row ── */}
          <div style={{
            display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
            gap: '1.5rem', marginTop: '3rem', marginBottom: '4rem',
          }}>
            {[
              { icon: '🔒', label: 'GDPR compliant' },
              { icon: '⚡', label: 'Results in 30 seconds' },
              { icon: '🌍', label: '16 languages' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontSize: '0.85rem' }}>{icon}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 400, color: ACCENT, opacity: 0.7 }}>{label}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  )
}
