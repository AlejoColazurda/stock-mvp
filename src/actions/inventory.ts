'use server'

import { prisma } from '@/lib/prisma'
import type { Product } from '@/lib/types'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
}

export async function discountStock(data: {
  productId: string
  quantity: number
  workerName: string
}) {
  const { productId, quantity, workerName } = data
  const name = workerName.trim()

  if (!name) {
    return { success: false as const, error: 'Debe ingresar el nombre del operario.' }
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { success: false as const, error: 'La cantidad debe ser un número entero mayor a cero.' }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const claimed = await tx.product.updateMany({
        where: { id: productId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      })

      if (claimed.count !== 1) {
        const product = await tx.product.findUnique({ where: { id: productId } })
        if (!product) throw new Error('Producto no encontrado.')
        throw new Error(`Stock insuficiente. Quedan solo ${product.stock} unidades.`)
      }

      const updated = await tx.product.findUniqueOrThrow({ where: { id: productId } })
      const stockBefore = updated.stock + quantity

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity,
          stockBefore,
          stockAfter: updated.stock,
          workerName: name,
        },
      })

      return { product: updated, movement }
    })

    revalidatePath('/')
    revalidatePath('/movimientos')
    return { success: true as const, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error procesando la transacción.'
    return { success: false as const, error: message }
  }
}

export async function getProducts(query = ''): Promise<{ products: Product[]; error?: string }> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    })

    const q = normalize(query.trim())
    const visible = q
      ? products.filter((product) => {
          const name = normalize(product.name)
          const sku = normalize(product.sku ?? '')
          return name.includes(q) || sku.includes(q)
        })
      : products

    return { products: visible.map(toProduct) }
  } catch (error) {
    console.error('getProducts failed', error)
    return { products: [], error: 'No se pudo leer el stock. Revisá la conexión con la base.' }
  }
}

export async function getMovements() {
  const session = await getSession()
  if (!session?.canViewMovements) return []

  return prisma.stockMovement.findMany({
    include: { product: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

function toProduct(product: {
  id: string
  sku: string | null
  name: string
  price: number
  stock: number
  minStock: number
  imageUrl: string
}): Product {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    price: product.price,
    stock: product.stock,
    minStock: product.minStock,
    imageUrl: product.imageUrl,
  }
}
