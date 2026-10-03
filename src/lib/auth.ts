import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import type { Access } from '@/lib/types'

const COOKIE = 'stock_session'
const SESSION_DAYS = 12

export type { Access }

export async function getSession(): Promise<Access | null> {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return null

  let session
  try {
    session = await prisma.session.findUnique({
      where: { token },
      include: { staff: true },
    })
  } catch (error) {
    console.error('getSession failed', error)
    return null
  }

  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined)
    return null
  }

  return {
    id: session.staff.id,
    name: session.staff.name,
    isAdmin: session.staff.isAdmin,
    canViewMovements: session.staff.isAdmin || session.staff.canViewMovements,
  }
}

export async function createSession(staffId: string) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await prisma.session.create({
    data: { token, staffId, expiresAt },
  })

  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })
}

export async function destroySession() {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }
  jar.delete(COOKIE)
}
