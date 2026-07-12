'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

// Floating back-to-top button with a scroll progress ring.
// Fades in after the user scrolls past the hero; smooth scrolls to top.
// Raised on mobile so it clears the bottom tab bar.
export default function ScrollToTop() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let raf = 0
    function onScroll() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement
        const max = doc.scrollHeight - window.innerHeight
        const y = window.scrollY
        setProgress(max > 0 ? Math.min(1, y / max) : 0)
        setVisible(y > 600)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const R = 20
  const C = 2 * Math.PI * R

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className={`fixed right-4 md:right-6 bottom-24 md:bottom-8 z-40 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-emerald-200/70 shadow-lg shadow-emerald-900/10 flex items-center justify-center transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20 hover:border-emerald-300 active:scale-95 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
      }`}
    >
      {/* Scroll progress ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r={R} stroke="rgba(16,185,129,0.15)" strokeWidth="2.5" />
        <circle
          cx="24" cy="24" r={R}
          stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 0.15s linear' }}
        />
      </svg>
      <ArrowUp className="h-5 w-5 text-emerald-600 relative" />
    </button>
  )
}
