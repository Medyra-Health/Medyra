// Password and session credentials are stored only as verification hashes.
export const PRIVATE_COOKIE = 'medyra_private_access'
const DEFAULT_PASSWORD_HASH = 'cb79295c56e555470db5d676dd6a9998adb5d57a9556876a6d72085e4d254c7e'
const DEFAULT_SESSION_HASH = '1682a16a69b34d54dc702834080962674fad2a0cd6d23bb1c25fb0ef1b8cef6f'

async function hash(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}
function equal(a, b) {
  if (a.length !== b.length) return false
  let difference = 0
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return difference === 0
}
export async function verifyPrivatePassword(password) {
  return typeof password === 'string' && password.length <= 256 && equal(await hash(password), process.env.PRIVATE_SITE_PASSWORD_SHA256 || DEFAULT_PASSWORD_HASH)
}
export async function createPrivateSession(password) {
  return hash('Medyra private session:' + password)
}
export async function hasPrivateAccess(request) {
  if (process.env.PRIVATE_SITE_ENABLED === 'false') return true
  const token = request.cookies.get(PRIVATE_COOKIE)?.value
  return !!token && equal(await hash(token), process.env.PRIVATE_SITE_SESSION_SHA256 || DEFAULT_SESSION_HASH)
}
