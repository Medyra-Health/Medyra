'use client'

import { useState } from 'react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Wrench } from 'lucide-react'

export default function AdvancedTools() {
  const [activating, setActivating] = useState(false)
  const [activateMsg, setActivateMsg] = useState(null)
  const [encVerify, setEncVerify] = useState(null)
  const [encLoading, setEncLoading] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [migrateResult, setMigrateResult] = useState(null)

  async function activateAdmin() {
    setActivating(true)
    setActivateMsg(null)
    try {
      const res = await fetch('/api/admin/activate', { method: 'POST' })
      const body = await res.json()
      if (res.ok) {
        setActivateMsg({ ok: true, text: '✓ Admin tier activated in database. Doctor Visit Prep is now unlimited.' })
      } else {
        setActivateMsg({ ok: false, text: body.error || 'Failed' })
      }
    } catch (e) {
      setActivateMsg({ ok: false, text: e.message })
    } finally {
      setActivating(false)
    }
  }

  async function runEncryptionCheck() {
    setEncLoading(true)
    try {
      const res = await fetch('/api/admin/verify-encryption')
      const json = await res.json()
      setEncVerify(json)
    } catch { setEncVerify({ error: 'Failed to fetch' }) }
    finally { setEncLoading(false) }
  }

  async function migrateEncryption() {
    setMigrating(true)
    setMigrateResult(null)
    try {
      const res = await fetch('/api/admin/migrate-encryption', { method: 'POST' })
      const json = await res.json()
      setMigrateResult(json)
      if (json.success) await runEncryptionCheck()
    } catch { setMigrateResult({ success: false, message: 'Request failed' }) }
    finally { setMigrating(false) }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value="advanced" className="border-b-0">
          <AccordionTrigger className="px-5 py-4 hover:no-underline">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Wrench className="h-4 w-4 text-gray-400" /> Advanced Tools
              <span className="text-xs font-normal text-gray-400">— one-time setup & compliance checks</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-5">
            <div className="space-y-5 pt-1">
              {/* Admin DB Activation */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50/40">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Admin Database Activation</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Sets <code className="bg-gray-100 px-1 rounded">subscription.tier = admin</code> in MongoDB for your account.
                  </p>
                  {activateMsg && (
                    <p className={`text-xs mt-2 font-medium ${activateMsg.ok ? 'text-emerald-700' : 'text-red-600'}`}>
                      {activateMsg.text}
                    </p>
                  )}
                </div>
                <button
                  onClick={activateAdmin}
                  disabled={activating}
                  className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {activating ? 'Activating…' : 'Activate Admin Tier'}
                </button>
              </div>

              {/* Encryption verification */}
              <div className="rounded-lg border border-gray-100">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Encryption Verification</p>
                  <button
                    onClick={runEncryptionCheck}
                    disabled={encLoading}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                  >
                    {encLoading ? 'Checking…' : 'Run Verification'}
                  </button>
                </div>

                {!encVerify && !encLoading && (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">
                    Click "Run Verification" to inspect raw MongoDB documents.
                  </p>
                )}

                {encVerify && !encVerify.error && (
                  <div className="p-4 space-y-3">
                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${encVerify.status === 'ENCRYPTED' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="text-xl flex-shrink-0">{encVerify.status === 'ENCRYPTED' ? '✅' : '⚠️'}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${encVerify.status === 'ENCRYPTED' ? 'text-emerald-700' : 'text-red-700'}`}>{encVerify.status}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Key configured: <strong>{encVerify.encryptionKeyConfigured ? 'Yes' : 'NO'}</strong>{' · '}{encVerify.totalChecked} reports checked
                        </p>
                        {encVerify.status !== 'ENCRYPTED' && (
                          <div className="mt-2 space-y-2">
                            {migrateResult && (
                              <div className={`text-xs px-3 py-2 rounded-lg font-medium ${migrateResult.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {migrateResult.message}
                              </div>
                            )}
                            <button
                              onClick={migrateEncryption}
                              disabled={migrating}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                            >
                              {migrating ? '⏳ Encrypting…' : '🔐 Encrypt existing records now'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {encVerify?.error && <p className="px-4 py-3 text-sm text-red-600">{encVerify.error}</p>}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
