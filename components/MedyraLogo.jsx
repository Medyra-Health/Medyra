'use client'

export function MedyraIcon({ size = 48, className = '' }) {
  const h = Math.round(size * 104 / 88)
  return (
    <svg width={size} height={h} viewBox="0 0 88 104" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="26" y="16" width="48" height="62" rx="7" stroke="rgba(16,185,129,0.1)" strokeWidth="1.2" fill="rgba(16,185,129,0.015)"/>
      <rect x="16" y="9" width="48" height="62" rx="7" stroke="rgba(16,185,129,0.22)" strokeWidth="1.4" fill="rgba(4,12,8,0.85)"/>
      <line x1="26" y1="26" x2="54" y2="26" stroke="rgba(16,185,129,0.12)" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="26" y1="34" x2="54" y2="34" stroke="rgba(16,185,129,0.12)" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="26" y1="42" x2="42" y2="42" stroke="rgba(16,185,129,0.12)" strokeWidth="1.1" strokeLinecap="round"/>
      <rect x="5" y="2" width="52" height="68" rx="7" stroke="rgba(16,185,129,0.58)" strokeWidth="1.5" fill="#040C08"/>
      <line x1="15" y1="18" x2="47" y2="18" stroke="rgba(16,185,129,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="15" y1="27" x2="47" y2="27" stroke="rgba(16,185,129,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="15" y1="36" x2="34" y2="36" stroke="rgba(16,185,129,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M8 53 L17 53 L20 46 L23 60 L27 40 L31 53" stroke="rgba(16,185,129,0.2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M31 53 L35 53 L38 45 L42 65 L46 35 L50 53 L54 47 L58 53 L86 53" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M70 53 L86 53" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" opacity="0.15"/>
      <circle cx="35" cy="53" r="2.6" fill="#10B981" opacity="0.9"/>
      <circle cx="35" cy="53" r="6.5" fill="#10B981" opacity="0.07"/>
    </svg>
  )
}

// variant: 'light' = dark text (for white/light backgrounds)
//          'dark'  = light text (for dark backgrounds)
export default function MedyraLogo({ size = 'md', showTagline = false, variant = 'light', className = '' }) {
  const sizes = {
    sm: { icon: 26, fontSize: '18px' },
    md: { icon: 34, fontSize: '24px' },
    lg: { icon: 48, fontSize: '34px' },
  }
  const s = sizes[size] || sizes.md
  const textColor = variant === 'dark' ? '#E8F5F0' : '#0D1F19'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <MedyraIcon size={s.icon} />
      <div className="flex flex-col">
        <span
          translate="no"
          style={{
            fontFamily: 'var(--font-playfair, "Playfair Display", Georgia, serif)',
            fontWeight: 700,
            fontSize: s.fontSize,
            letterSpacing: '0.04em',
            color: textColor,
            lineHeight: 1,
          }}
        >
          <span style={{ fontWeight: 800, color: '#10B981' }}>M</span>edyra
        </span>
        {showTagline && (
          <span style={{
            fontFamily: 'sans-serif',
            fontWeight: 300,
            fontSize: '7px',
            letterSpacing: '0.28em',
            color: 'rgba(16,185,129,0.6)',
            textTransform: 'uppercase',
            marginTop: '5px',
            whiteSpace: 'nowrap',
          }}>
            Understand Your Medical Reports
          </span>
        )}
      </div>
    </div>
  )
}
