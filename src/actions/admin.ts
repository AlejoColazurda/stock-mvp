'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { hashPin, nameKey, verifyPin } from '@/lib/pin'

async function requireAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) return null
  return session
}

export async function updateMinStock(productId: string, minStock: number) {
  const session = await requireAdmin()
  if (!session) {
    return { success: false as const, error: 'Solo el administrador puede cambiar el piso de stock.' }
  }

  if (!Number.isInteger(minStock) || minStock < 0) {
    return { success: false as const, error: 'El piso tiene que ser un número entero, cero o más.' }
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: { minStock },
  })

  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true as const, minStock: product.minStock }
}

export async function listStaff() {
  const session = await requireAdmin()
  if (!session) return []

  return prisma.staff.findMany({
    orderBy: [{ isAdmin: 'desc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      isAdmin: true,
      canViewMovements: true,
    },
  })
}

export async function grantMovementAccess(data: { name: string; pin: string }) {
  const session = await requireAdmin()
  if (!session) {
    return { success: false as const, error: 'Solo el administrador puede habilitar personas.' }
  }

  const name = data.name.trim()
  const key = nameKey(name)
  const pin = data.pin.trim()

  if (name.length < 2) {
    return { success: false as const, error: 'Escribe el nombre de la persona.' }
  }

  if (pin.length < 4) {
    return { success: false as const, error: 'La clave tiene que tener al menos 4 caracteres.' }
  }

  const existing = await prisma.staff.findUnique({ where: { nameKey: key } })
  if (existing?.isAdmin) {
    return { success: false as const, error: 'El administrador ya puede ver los movimientos.' }
  }

  if (existing) {
    await prisma.staff.update({
      where: { id: existing.id },
      data: { name, pinHash: hashPin(pin), canViewMovements: true },
    })
  } else {
    await prisma.staff.create({
      data: {
        name,
        nameKey: key,
        pinHash: hashPin(pin),
        isAdmin: false,
        canViewMovements: true,
      },
    })
  }

  revalidatePath('/admin')
  revalidatePath('/', 'layout')
  return { success: true as const }
}

export async function revokeMovementAccess(staffId: string) {
  const session = await requireAdmin()
  if (!session) {
    return { success: false as const, error: 'Solo el administrador puede quitar el acceso.' }
  }

  const staff = await prisma.staff.findUnique({ where: { id: staffId } })
  if (!staff) return { success: false as const, error: 'No se encontró a esa persona.' }
  if (staff.isAdmin) {
    return { success: false as const, error: 'El administrador conserva el acceso a los movimientos.' }
  }

  await prisma.staff.delete({ where: { id: staffId } })
  revalidatePath('/admin')
  revalidatePath('/', 'layout')
  return { success: true as const }
}

export async function changeAdminPin(data: { currentPin: string; nextPin: string }) {
  const session = await requireAdmin()
  if (!session) {
    return { success: false as const, error: 'Solo el administrador puede cambiar su clave.' }
  }

  const nextPin = data.nextPin.trim()
  if (nextPin.length < 4) {
    return { success: false as const, error: 'La clave nueva tiene que tener al menos 4 caracteres.' }
  }

  const staff = await prisma.staff.findUnique({ where: { id: session.id } })
  if (!staff || !verifyPin(data.currentPin.trim(), staff.pinHash)) {
    return { success: false as const, error: 'La clave actual no coincide.' }
  }

  await prisma.staff.update({
    where: { id: staff.id },
    data: { pinHash: hashPin(nextPin) },
  })

  return { success: true as const }
}
