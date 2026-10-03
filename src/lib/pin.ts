import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

export function nameKey(name: string) {
  return name
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
}

export function hashPin(pin: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(pin, salt, 32).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPin(pin: string, stored: string) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const actual = scryptSync(pin, salt, 32)
  const expected = Buffer.from(hash, 'hex')
  if (expected.length !== actual.length) return false
  return timingSafeEqual(actual, expected)
}
