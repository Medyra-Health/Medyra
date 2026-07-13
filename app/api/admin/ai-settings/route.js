import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getAISettings, saveAISettings, AI_PROVIDERS, VISION_CAPABLE_PROVIDERS } from '@/lib/aiProvider'

const ADMIN_EMAILS = ['abralur28@gmail.com', 'philipp.mattar@googlemail.com']

async function requireAdmin() {
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress
  if (!user || !ADMIN_EMAILS.includes(email)) return null
  return email
}

export async function GET() {
  const email = await requireAdmin()
  if (!email) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const settings = await getAISettings()
  return NextResponse.json({
    tasks: settings.tasks,
    providers: AI_PROVIDERS,
    visionCapableProviders: VISION_CAPABLE_PROVIDERS,
  })
}

export async function POST(request) {
  const email = await requireAdmin()
  if (!email) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  if (!body?.tasks) return NextResponse.json({ error: 'Missing tasks' }, { status: 400 })

  try {
    const settings = await saveAISettings(body.tasks, email)
    return NextResponse.json({ success: true, tasks: settings.tasks })
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to save' }, { status: 400 })
  }
}
