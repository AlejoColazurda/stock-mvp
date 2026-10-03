'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createSession, destroySession, getSession } from '@/lib/auth'
import { nameKey, verifyPin } from '@/lib/pin'

export async function login(data: { name: string; pin: string }) {
  const key = nameKey(data.name)
  const pin = data.pin.trim()

  if (!key || pin.length < 4) {
    return { success: false as const, error: 'Ingresa el nombre y una clave de al menos 4 caracteres.' }
  }

  const staff = await prisma.staff.findUnique({ where: { nameKey: key } })
  if (!staff || !verifyPin(pin, staff.pinHash)) {
    return { success: false as const, error: 'Nombre o clave incorrectos.' }
  }

  await createSession(staff.id)
  revalidatePath('/', 'layout')
  return {
    success: true as const,
    isAdmin: staff.isAdmin,
    canViewMovements: staff.isAdmin || staff.canViewMovements,
  }
}

export async function logout() {
  await destroySession()
  revalidatePath('/', 'layout')
  return { success: true as const }
}

export async function currentAccess() {
  return getSession()
}
