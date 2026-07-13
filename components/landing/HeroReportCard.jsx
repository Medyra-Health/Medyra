'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useSpring, useReducedMotion } from 'framer-motion'
import { Brain, MessageSquare, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'

const MAX_TILT = 5 // degrees

export default function HeroReportCard() {
  const t = useTranslations('heroReportCard')
  const tReport = useTranslations('report')
  const reduced = useReducedMotion()

  const RESULTS = [
    { name: 'TSH', value: '4.2 mIU/L', status: tReport('normal'), bar: 'bg-emerald-500', badge: 'bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]' },
    { name: 'HbA1c', value: '6.1% ↑', status: tReport('high'), bar: 'bg-orange-500', badge: 'bg-orange-500/15 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.2)]' },
    { name: 'eGFR', value: '58 mL/min ↓', status: tReport('low'), bar: 'bg-orange-500', badge: 'bg-orange-500/15 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.2)]' },
    { name: 'CRP', value: '12.4 mg/L', status: tReport('critical'), bar: 'bg-red-500', badge: 'bg-red-500/15 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]' },
  ]
  const [tiltEnabled, setTiltEnabled] = useState(false)
  const ref = useRef(null)

  const rotateX = useSpring(0, { stiffness: 160, damping: 18 })
  const rotateY = useSpring(0, { stiffness: 160, damping: 18 })

  useEffect(() => {
    // Tilt only on precise pointers (desktop), never with reduced motion
    setTiltEnabled(window.matchMedia('(pointer: fine)').matches && !reduced)
  }, [reduced])

  function handleMouseMove(e) {
    if (!tiltEnabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * MAX_TILT * 2)
    rotateX.set(-py * MAX_TILT * 2)
  }

  function handleMouseLeave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  // Entrance: the card is a direct stagger child of the hero container.
  // Its rows only start revealing after the card itself has landed.
  const cardVariants = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4, when: 'beforeChildren' } } }
    : {
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delayChildren: 0.45, staggerChildren: 0.12 },
        },
      }

  const rowVariants = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } }
    : { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } }

  return (
    <motion.div variants={cardVariants} className="block max-w-sm mx-auto w-full lg:max-w-none" style={{ perspective: 900 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={tiltEnabled ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
        className="relative rounded-2xl border border-emerald-500/20 bg-[#06140e]/60 backdrop-blur-md md:backdrop-blur-xl shadow-[0_0_60px_-12px_rgba(16,185,129,0.35)] overflow-hidden"
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[#E8F5F0] font-semibold text-sm">{t('title')}</span>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full font-medium border border-emerald-400/20">{t('complete')}</span>
        </div>

        {/* Results, revealed sequentially after the card lands */}
        <div className="p-5 space-y-2.5">
          {RESULTS.map((r) => (
            <motion.div
              key={r.name}
              variants={rowVariants}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-emerald-500/10"
            >
              <div className={`w-1 h-8 rounded-full flex-shrink-0 ${r.bar}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#E8F5F0]">{r.name}</p>
                <p className="text-xs text-[#E8F5F0]/50 font-mono">{r.value}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.badge}`}>{r.status}</span>
            </motion.div>
          ))}
        </div>

        {/* AI summary */}
        <motion.div variants={rowVariants} className="px-5 pb-4">
          <div className="bg-emerald-950/50 border border-emerald-500/15 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-400 mb-1.5 flex items-center gap-1.5">
              <Brain className="h-3 w-3" /> {t('aiSummary')}
            </p>
            <p className="text-xs text-[#E8F5F0]/70 leading-relaxed">
              {t('aiSummaryText')}
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={rowVariants} className="flex gap-2 px-5 pb-5">
          <div className="flex-1 flex items-center gap-1.5 justify-center py-2 rounded-lg bg-white/[0.04] border border-emerald-500/10 text-xs text-[#E8F5F0]/50">
            <MessageSquare className="h-3.5 w-3.5" /> {t('askAI')}
          </div>
          <div className="flex-1 flex items-center gap-1.5 justify-center py-2 rounded-lg bg-white/[0.04] border border-emerald-500/10 text-xs text-[#E8F5F0]/50">
            <Download className="h-3.5 w-3.5" /> {t('savePDF')}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
