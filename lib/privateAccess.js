// Temporary private preview gate. The randomly generated password is never committed.
// Set PRIVATE_SITE_ENABLED=false to reopen the site.
const DEFAULT_PASSWORD_HASH = 'cb79295c56e555470db5d676dd6a9998adb5d57a9556876a6d72085e4d254c7e'

export async function hasPrivateAccess(request) {
  if (process.env.PRIVATE_SITE_ENABLED === 'false') return true
  const authorization = request.headers.get('authorization') || ''
  if (!authorization.startsWith('Basic ')) return false
  let credentials
  try { credentials = atob(authorization.slice(6)) } catch { return false }
  const separator = credentials.indexOf(':')
  if (separator < 0) return false
  const username = credentials.slice(0, separator)
  const password = credentials.slice(separator + 1)
  const expectedUsername = process.env.PRIVATE_SITE_USERNAME || 'medyra'
  if (username !== expectedUsername) return false
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  const actualHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
  const expectedHash = process.env.PRIVATE_SITE_PASSWORD_SHA256 || DEFAULT_PASSWORD_HASH
  if (actualHash.length !== expectedHash.length) return false
  let difference = 0
  for (let i = 0; i < actualHash.length; i++) difference |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i)
  return difference === 0
}
