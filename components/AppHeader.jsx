'use client'

import Link from 'next/link'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import MedyraLogo from '@/components/MedyraLogo'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import MedyraUserButton from '@/components/MedyraUserButton'

// Per-page accent tones. Match the feature colour system so each area of the
// product has its own identity while sharing one header.
const TONES = {
  emerald: { grad: 'from-emerald-500 to-teal-500', ring: 'focus-visible:ring-emerald-400/50', soft: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200', line: '#10B981,#14b8a6' },
  teal:    { grad: 'from-teal-500 to-cyan-500',    ring: 'focus-visible:ring-teal-400/50',    soft: 'text-teal-700 bg-teal-50 hover:bg-teal-100 border-teal-200',       line: '#14b8a6,#06b6d4' },
  violet:  { grad: 'from-violet-500 to-fuchsia-500', ring: 'focus-visible:ring-violet-400/50', soft: 'text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200', line: '#8b5cf6,#d946ef' },
  blue:    { grad: 'from-blue-500 to-indigo-500',  ring: 'focus-visible:ring-blue-400/50',    soft: 'text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200',       line: '#3b82f6,#6366f1' },
  amber:   { grad: 'from-amber-500 to-orange-500', ring: 'focus-visible:ring-amber-400/50',   soft: 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200',   line: '#f59e0b,#f97316' },
}

/**
 * Premium header button. Renders as a Link (href) or button (onClick).
 * variant: 'primary' (gradient), 'soft' (tinted), 'ghost' (subtle).
 * icon is a rendered node, e.g. <Download className="h-4 w-4" />.
 */
export function HeaderButton({ href, onClick, variant = 'primary', tone = 'emerald', icon, children, disabled, className = '', ...rest }) {
  const t = TONES[tone] || TONES.emerald
  const base =
    'group inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] ' + t.ring
  const styles = {
    primary: `text-white bg-gradient-to-r ${t.grad} shadow-sm hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5`,
    soft: `border ${t.soft}`,
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  }
  const cls = `${base} ${styles[variant] || styles.primary} ${className}`
  const inner = (
    <>
      {icon}
      {children && <span className="whitespace-nowrap">{children}</span>}
    </>
  )
  if (href) {
    return <Link href={href} className={cls} {...rest}>{inner}</Link>
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls} {...rest}>
      {inner}
    </button>
  )
}

/**
 * Shared app header used across every page.
 * - back: { href, label } renders an animated back pill
 * - title: current page name (breadcrumb tail)
 * - tone: accent colour for this page
 * - children: right-side page actions (compose HeaderButton)
 * - user: show the Clerk user menu (signed-in app pages)
 * - homeHref: where the logo links (default /dashboard for app, / for content)
 */
export default function AppHeader({
  back,
  title,
  tone = 'emerald',
  children,
  user = false,
  showLanguage = true,
  homeHref,
  logoVariant = 'light',
}) {
  const t = TONES[tone] || TONES.emerald
  const home = homeHref || (user ? '/dashboard' : '/')

  return (
    <header className="sticky top-0 z-40 no-print">
      <div className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/70">
        {/* Animated pulse accent line */}
        <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden">
          <div
            className="h-full w-[200%] medyra-pulse-line"
            style={{ background: `linear-gradient(90deg, transparent, ${t.line.split(',')[0]}, ${t.line.split(',')[1]}, transparent)` }}
          />
        </div>

        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Left: back + brand + breadcrumb */}
            <div className="flex items-center gap-2 min-w-0">
              {back && (
                <Link
                  href={back.href}
                  className="group hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  <span className="hidden md:inline">{back.label}</span>
                </Link>
              )}
              <Link href={home} className="shrink-0 transition-transform hover:scale-[1.02] active:scale-95">
                <MedyraLogo size="md" variant={logoVariant} />
              </Link>
              {title && (
                <div className="hidden md:flex items-center gap-1.5 min-w-0 pl-1">
                  <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                  <span className="truncate font-display text-[15px] font-bold text-gray-800" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                    {title}
                  </span>
                </div>
              )}
            </div>

            {/* Right: actions + language + user */}
            <div className="flex items-center gap-2">
              {children}
              {showLanguage && <LanguageSwitcher />}
              {user && (
                <div className="pl-1">
                  <MedyraUserButton />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .medyra-pulse-line {
          animation: medyra-pulse 3.2s linear infinite;
        }
        @keyframes medyra-pulse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .medyra-pulse-line { animation: none; }
        }
      `}</style>
    </header>
  )
}
