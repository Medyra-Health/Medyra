import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Medyra — Understand Your Medical Reports in Plain Language'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              background: 'white',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ fontSize: '44px', fontWeight: '900', color: '#2563eb' }}>M</span>
          </div>
          <span style={{ fontSize: '52px', fontWeight: '800', color: 'white', letterSpacing: '-1px' }}>
            Medyra
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: '52px',
            fontWeight: '800',
            color: 'white',
            textAlign: 'center',
            margin: '0 0 20px',
            lineHeight: 1.15,
            maxWidth: '900px',
          }}
        >
          Your Medical Report,{' '}
          <span style={{ color: '#bfdbfe' }}>Finally in Plain Language</span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: '24px',
            color: 'rgba(255,255,255,0.75)',
            textAlign: 'center',
            margin: '0 0 48px',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          AI-powered explanations · GDPR Compliant · 16 Languages · Made in Germany
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['60-second results', 'Flags abnormal values', 'Follow-up chat', 'Free to start'].map((text) => (
            <div
              key={text}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '100px',
                padding: '10px 24px',
                fontSize: '18px',
                color: 'white',
                fontWeight: '500',
              }}
            >
              ✓ {text}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            right: '60px',
            fontSize: '18px',
            color: 'rgba(255,255,255,0.5)',
            fontWeight: '500',
          }}
        >
          medyra.de
        </div>
      </div>
    ),
    { ...size }
  )
}
