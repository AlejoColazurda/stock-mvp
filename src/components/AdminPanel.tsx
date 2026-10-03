'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { changeAdminPin, grantMovementAccess, revokeMovementAccess, updateMinStock } from '@/actions/admin'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

type StaffRow = {
  id: string
  name: string
  isAdmin: boolean
  canViewMovements: boolean
}

export default function AdminPanel({
  products,
  staff,
}: {
  products: Product[]
  staff: StaffRow[]
}) {
  const router = useRouter()
  const [floors, setFloors] = useState<Record<string, number>>(() =>
    Object.fromEntries(products.map((product) => [product.id, product.minStock])),
  )
  const [savingId, setSavingId] = useState<string | null>(null)
  const [viewerName, setViewerName] = useState('')
  const [viewerPin, setViewerPin] = useState('')
  const [currentPin, setCurrentPin] = useState('')
  const [nextPin, setNextPin] = useState('')

  const saveFloor = async (productId: string) => {
    setSavingId(productId)
    const result = await updateMinStock(productId, floors[productId] ?? 0)
    setSavingId(null)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success('Piso de stock guardado')
    router.refresh()
  }

  const addViewer = async () => {
    const result = await grantMovementAccess({ name: viewerName, pin: viewerPin })
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setViewerName('')
    setViewerPin('')
    toast.success('Persona habilitada para ver movimientos')
    router.refresh()
  }

  const removeViewer = async (staffId: string) => {
    const result = await revokeMovementAccess(staffId)
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success('Acceso quitado')
    router.refresh()
  }

  const savePin = async () => {
    const result = await changeAdminPin({ currentPin, nextPin })
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setCurrentPin('')
    setNextPin('')
    toast.success('Clave actualizada')
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-[13px] font-medium text-[#6e6e73]">Pisos de stock</h2>
        <p className="mt-1 text-[13px] text-[#6e6e73]">
          Si la cantidad baja hasta este número, el producto se marca como “queda poco”.
        </p>
        <ul className="card mt-3 divide-y divide-black/8">
          {products.map((product) => (
            <li key={product.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={96}
                height={64}
                className="h-14 w-20 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold tracking-tight">{product.name}</p>
                <p className="num text-[13px] text-[#6e6e73]">Stock {product.stock}</p>
              </div>
              <label className="text-[13px] font-medium text-[#6e6e73]">
                Piso
                <input
                  type="number"
                  min={0}
                  value={floors[product.id] ?? 0}
                  onChange={(event) =>
                    setFloors((current) => ({
                      ...current,
                      [product.id]: Math.max(0, parseInt(event.target.value, 10) || 0),
                    }))
                  }
                  className="field num mt-1 sm:w-24"
                />
              </label>
              <button
                type="button"
                onClick={() => saveFloor(product.id)}
                disabled={savingId === product.id}
                className="btn btn-blue"
              >
                {savingId === product.id ? 'Guardando…' : 'Guardar'}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-[13px] font-medium text-[#6e6e73]">Quién ve los movimientos</h2>
        <p className="mt-1 text-[13px] text-[#6e6e73]">
          Vos siempre podés verlos. Acá das una clave a cada persona que también deba ver las salidas.
        </p>
        <ul className="card mt-3 divide-y divide-black/8">
          {staff.map((person) => (
            <li key={person.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-semibold tracking-tight">{person.name}</p>
                <p className="text-[13px] text-[#6e6e73]">
                  {person.isAdmin ? 'Administrador' : 'Puede ver movimientos'}
                </p>
              </div>
              {!person.isAdmin && (
                <button
                  type="button"
                  onClick={() => removeViewer(person.id)}
                  className="min-h-11 px-2 text-[15px] font-medium text-[#ff3b30]"
                >
                  Quitar
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-[13px] font-medium text-[#6e6e73]">
            Nombre
            <input
              value={viewerName}
              onChange={(event) => setViewerName(event.target.value)}
              className="field mt-1.5"
            />
          </label>
          <label className="text-[13px] font-medium text-[#6e6e73]">
            Clave
            <input
              type="password"
              value={viewerPin}
              onChange={(event) => setViewerPin(event.target.value)}
              className="field mt-1.5"
            />
          </label>
          <button type="button" onClick={addViewer} className="btn btn-blue">
            Habilitar
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-[13px] font-medium text-[#6e6e73]">Tu clave</h2>
        <div className="card mt-3 grid gap-3 p-4 sm:grid-cols-2">
          <label className="text-[13px] font-medium text-[#6e6e73]">
            Clave actual
            <input
              type="password"
              value={currentPin}
              onChange={(event) => setCurrentPin(event.target.value)}
              className="field mt-1.5"
            />
          </label>
          <label className="text-[13px] font-medium text-[#6e6e73]">
            Clave nueva
            <input
              type="password"
              value={nextPin}
              onChange={(event) => setNextPin(event.target.value)}
              className="field mt-1.5"
            />
          </label>
          <button type="button" onClick={savePin} className="btn btn-blue sm:col-span-2">
            Actualizar clave
          </button>
        </div>
      </section>
    </div>
  )
}
