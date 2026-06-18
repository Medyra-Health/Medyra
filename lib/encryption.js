import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ENC_ALGO = 'aes-256-gcm'

// Throws if key is missing or invalid — writes MUST fail rather than store plaintext.
export function getEncKey() {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY is missing or invalid — refusing to store health data without encryption')
  }
  return Buffer.from(hex, 'hex')
}

// Encrypts plaintext. Throws on any failure so callers get a 500, never silent plaintext storage.
export function encrypt(plaintext) {
  if (plaintext == null) return plaintext
  const key = getEncKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv(ENC_ALGO, key, iv)
  let enc = cipher.update(String(plaintext), 'utf8', 'hex')
  enc += cipher.final('hex')
  const tag = cipher.getAuthTag()
  // Format: {32-hex iv}:{ciphertext hex}:{32-hex auth tag}
  return `${iv.toString('hex')}:${enc}:${tag.toString('hex')}`
}

// Decrypts a value produced by encrypt(). Returns the raw value unchanged if it does not match
// our format (backward compat with old plaintext data) or if decryption fails.
export function decrypt(value) {
  if (!value || typeof value !== 'string') return value
  const parts = value.split(':')
  if (parts.length !== 3 || parts[0].length !== 32 || parts[2].length !== 32) return value
  try {
    const key = getEncKey()
    const iv = Buffer.from(parts[0], 'hex')
    const tag = Buffer.from(parts[2], 'hex')
    const decipher = createDecipheriv(ENC_ALGO, key, iv)
    decipher.setAuthTag(tag)
    let dec = decipher.update(parts[1], 'hex', 'utf8')
    dec += decipher.final('utf8')
    return dec
  } catch {
    return value
  }
}

// Decrypts PII fields of a profile object. Non-encrypted (old) values pass through unchanged.
export function decryptProfile(profile) {
  if (!profile) return profile
  return {
    ...profile,
    name: decrypt(profile.name),
    dob: profile.dob ? decrypt(profile.dob) : profile.dob,
    gender: profile.gender ? decrypt(profile.gender) : profile.gender,
  }
}
