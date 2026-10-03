import { PrismaClient } from '@prisma/client'
import { hashPin, nameKey } from '../src/lib/pin'

const prisma = new PrismaClient()

async function main() {
  const productos = [
    {
      sku: 'RUE-22',
      name: 'Rueda Rodado 22',
      price: 23000,
      stock: 15,
      minStock: 4,
      imageUrl: '/products/rue-22.jpg',
    },
    {
      sku: 'RUE-20',
      name: 'Rueda Rodado 20 Reforzada',
      price: 19500,
      stock: 8,
      minStock: 2,
      imageUrl: '/products/rue-20.jpg',
    },
    {
      sku: 'CAM-22',
      name: 'Cámara Rodado 22 Pico Auto',
      price: 4200,
      stock: 35,
      minStock: 10,
      imageUrl: '/products/cam-22.jpg',
    },
    {
      sku: 'ACE-10W40',
      name: 'Aceite 10W40 Semisintético 1L',
      price: 11500,
      stock: 20,
      minStock: 5,
      imageUrl: '/products/ace-10w40.jpg',
    },
    {
      sku: 'LUB-CAD',
      name: 'Lubricante para Cadenas 400ml',
      price: 6800,
      stock: 0,
      minStock: 5,
      imageUrl: '/products/lub-cad.jpg',
    },
  ]

  const productCount = await prisma.product.count()
  if (productCount === 0) {
    await prisma.product.createMany({ data: productos })
  }

  const adminKey = nameKey('Admin')
  const admin = await prisma.staff.findUnique({ where: { nameKey: adminKey } })
  if (!admin) {
    await prisma.staff.create({
      data: {
        name: 'Admin',
        nameKey: adminKey,
        pinHash: hashPin('1234'),
        isAdmin: true,
        canViewMovements: true,
      },
    })
  }

  console.log('Seed completado con éxito.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
