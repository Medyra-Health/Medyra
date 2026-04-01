'use client'

import { useState } from 'react'
import { Shield, Lock, Trash2, Eye, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const CONSENT_VERSION = '1.0'

export default function ConsentModal({ onAccept, onDecline }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAccept() {
    setLoading(true)
    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: CONSENT_VERSION })
      })
      onAccept()
    } catch {
      onAccept() // still allow on network error, consent recorded next time
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-5 rounded-t-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Your Health Data — Your Control</h2>
              <p className="text-xs text-emerald-700 font-medium">Required before your first upload · GDPR Art. 9</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Plain language summary */}
          <p className="text-sm text-gray-700 leading-relaxed">
            To analyze your medical report, Medyra needs to process your health data. Under EU law (GDPR), we must ask for your <strong>explicit consent</strong> before doing this.
          </p>

          {/* Key points */}
          <div className="space-y-3">
            {[
              {
                icon: Eye,
                color: 'text-blue-500 bg-blue-50',
                title: 'What we process',
                desc: 'The text content of your uploaded medical report (lab values, test names, dates). We do not store the original file.'
              },
              {
                icon: Lock,
                color: 'text-emerald-500 bg-emerald-50',
                title: 'Who can see your data',
                desc: 'Only you. Your data is encrypted in transit and at rest. It is never shared with third parties, insurers, or employers.'
              },
              {
                icon: Trash2,
                color: 'text-orange-500 bg-orange-50',
                title: 'Automatic deletion',
                desc: 'Your reports are automatically and permanently deleted after 30 days. You can also delete them manually at any time from your dashboard.'
              },
              {
                icon: Shield,
                color: 'text-purple-500 bg-purple-50',
                title: 'AI processing disclosure',
                desc: 'Your report text is sent to Anthropic\'s Claude AI (USA/EU) for analysis. Anthropic does not train on your data. This is disclosed under GDPR Art. 13 and the EU AI Act.'
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Expandable full details */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-gray-600 py-2 border-t border-gray-100 transition-colors"
          >
            <span>Full details (data processors, legal basis, your rights)</span>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {expanded && (
            <div className="text-xs text-gray-500 space-y-3 leading-relaxed bg-gray-50 rounded-xl p-4">
              <div>
                <p className="font-semibold text-gray-700 mb-1">Legal basis</p>
                <p>GDPR Art. 9(2)(a) — explicit consent for processing special category health data. You may withdraw consent at any time by deleting your account or emailing privacy@medyra.de.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Data processors (sub-processors)</p>
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-400"><th className="text-left pb-1">Processor</th><th className="text-left pb-1">Purpose</th><th className="text-left pb-1">Location</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ['Anthropic (Claude AI)', 'Report text analysis', 'USA (SCCs)'],
                      ['MongoDB Atlas', 'Encrypted data storage', 'EU (Frankfurt)'],
                      ['Clerk', 'Authentication only', 'USA (SCCs)'],
                      ['Vercel', 'Hosting & delivery', 'EU edge'],
                    ].map(([p, pu, l]) => (
                      <tr key={p}><td className="py-1 pr-2">{p}</td><td className="py-1 pr-2">{pu}</td><td className="py-1">{l}</td></tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-gray-400">SCCs = Standard Contractual Clauses (GDPR Art. 46 transfer safeguard)</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Your rights under GDPR</p>
                <p>Access (Art. 15) · Correction (Art. 16) · Deletion (Art. 17) · Restriction (Art. 18) · Portability (Art. 20) · Object (Art. 21) · Withdraw consent at any time.</p>
                <p className="mt-1">Contact: <strong>privacy@medyra.de</strong> · Supervisory authority: Landesbeauftragter für Datenschutz Baden-Württemberg</p>
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex gap-4 text-xs text-emerald-600">
            <Link href="/privacy" target="_blank" className="flex items-center gap-1 hover:underline">
              <ExternalLink className="h-3 w-3" /> Privacy Policy
            </Link>
            <Link href="/terms" target="_blank" className="flex items-center gap-1 hover:underline">
              <ExternalLink className="h-3 w-3" /> Terms of Service
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2">
          <Button
            onClick={handleAccept}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-11"
          >
            {loading ? 'Saving…' : 'I consent — process my report'}
          </Button>
          <Button
            onClick={onDecline}
            variant="ghost"
            className="w-full text-gray-500 hover:text-gray-700 text-sm h-10"
          >
            No thanks — I do not consent
          </Button>
          <p className="text-center text-xs text-gray-400 mt-1">
            Declining means your report will not be uploaded or stored. You can change this decision at any time.
          </p>
        </div>
      </div>
    </div>
  )
}
