'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Share2, Copy, Check, Link2Off, Loader2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { HeaderButton } from '@/components/AppHeader'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Header action: create / copy / revoke a read-only, 7-day share link.
export default function ShareReportButton({ reportId }) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [share, setShare] = useState(null) // { token, expiresAt, views }
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    fetch(`/api/reports/${reportId}/share`)
      .then(r => r.json())
      .then(d => setShare(d.share || null))
      .catch(() => {})
  }, [open, reportId])

  const shareUrl = share ? `${typeof window !== 'undefined' ? window.location.origin : 'https://medyra.de'}/share/${share.token}` : null

  async function createLink() {
    setBusy(true)
    try {
      const res = await fetch(`/api/reports/${reportId}/share`, { method: 'POST' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed')
      setShare({ token: d.token, expiresAt: d.expiresAt, views: 0 })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function revokeLink() {
    setBusy(true)
    try {
      await fetch(`/api/reports/${reportId}/share`, { method: 'DELETE' })
      setShare(null)
      toast.success(t('report.share.revoked'))
    } catch {
      toast.error(t('errors.uploadFailed'))
    } finally {
      setBusy(false)
    }
  }

  async function copyLink() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy failed')
    }
  }

  return (
    <>
      <HeaderButton
        variant="soft"
        onClick={() => setOpen(true)}
        icon={<Share2 className="h-4 w-4" />}
      >
        <span className="hidden xs:inline">{t('report.share.button')}</span>
      </HeaderButton>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-emerald-600" />
              {t('report.share.title')}
            </DialogTitle>
            <DialogDescription>{t('report.share.description')}</DialogDescription>
          </DialogHeader>

          {share ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-mono text-gray-600 truncate">
                  {shareUrl}
                </div>
                <Button size="sm" onClick={copyLink} className="bg-emerald-500 hover:bg-emerald-600 text-white flex-shrink-0">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-1.5">{copied ? t('report.share.copied') : t('report.share.copy')}</span>
                </Button>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {t('report.share.expires', {
                    date: new Date(share.expiresAt).toLocaleDateString(),
                  })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {share.views || 0}
                </span>
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800 leading-relaxed">
                {t('report.share.privacyNote')}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={revokeLink}
                disabled={busy}
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <Link2Off className="h-3.5 w-3.5 mr-1.5" />
                {t('report.share.revoke')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <ul className="text-sm text-gray-600 space-y-1.5">
                {[t('report.share.point1'), t('report.share.point2'), t('report.share.point3')].map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={createLink} disabled={busy} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Share2 className="h-4 w-4 mr-1.5" />}
                {t('report.share.create')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
