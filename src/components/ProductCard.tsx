'use client'

import { useState } from 'react'
import Image from 'next/image'
import { discountStock } from '@/actions/inventory'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'

export default function ProductCard({
  product,
  workerName,
  onStockUpdated,
}: {
  product: Product
  workerName: string
  onStockUpdated: (productId: string, stock: number) => void
}) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [customQty, setCustomQty] = useState(1)
  const shownQty = product.stock > 0 ? Math.min(Math.max(1, customQty), product.stock) : 1

  const handleDiscount = async (qty: number) => {
    if (!workerName.trim()) {
      const text = 'Ingresa tu nombre arriba antes de despachar.'
      setMsg({ type: 'err', text })
      toast.error(text)
      return
    }

    const quantity = Math.floor(qty)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      const text = 'La cantidad tiene que ser mayor a cero.'
      setMsg({ type: 'err', text })
      toast.error(text)
      return
    }

    setLoading(true)
    setMsg(null)

    const res = await discountStock({
      productId: product.id,
      quantity,
      workerName,
    })

    setLoading(false)

    if (res.success) {
      const stock = res.data.product.stock
      onStockUpdated(product.id, stock)
      const text = `Descontadas ${quantity} u. Quedan ${stock}`
      setMsg({ type: 'ok', text })
      toast.success(text)
      setTimeout(() => setMsg(null), 3000)
    } else {
      const text = res.error || 'Error'
      setMsg({ type: 'err', text })
      toast.error(text)
    }
  }

  const isLowStock = product.stock <= product.minStock && product.stock > 0
  const isOutOfStock = product.stock <= 0
  const stockStatus = isOutOfStock ? 'Sin stock' : isLowStock ? 'Queda poco' : 'Disponible'
  const stockColor = isOutOfStock ? 'text-[#ff3b30]' : isLowStock ? 'text-[#c93400]' : 'text-[#1d1d1f]'

  return (
    <article className="card flex flex-col overflow-hidden">
      <div className="relative bg-[#f5f5f7]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={800}
            height={600}
            className="aspect-[4/3] h-auto w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center text-[15px] text-[#6e6e73]">
            Sin imagen
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 bg-[#ffe8e6] px-3 py-2.5 text-center">
            <p className="text-[17px] font-black tracking-wide text-[#ff3b30]">SIN STOCK</p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <p className="text-[12px] font-medium text-[#6e6e73]">{product.sku || 'Sin código'}</p>
        <h2 className="mt-1 text-[17px] font-semibold leading-snug tracking-tight">{product.name}</h2>

        <div className="mt-4 flex items-end justify-between gap-3">
          <p>
            <span className="block text-[13px] font-medium text-[#6e6e73]">Stock</span>
            <span className={`mt-0.5 block text-[13px] font-semibold ${isOutOfStock ? 'text-[#ff3b30]' : isLowStock ? 'text-[#c93400]' : 'text-[#248a3d]'}`}>
              {stockStatus}
            </span>
          </p>
          <p className={`num text-[56px] font-semibold leading-none ${stockColor}`}>
            <span className="sr-only">Cantidad en stock: </span>
            {product.stock}
          </p>
        </div>

        <p className="num mt-3 text-[22px] font-semibold tracking-tight">
          <span className="sr-only">Precio: </span>${product.price.toLocaleString('es-AR')}
        </p>

        {msg && (
          <p
            role="status"
            className={`mt-3 text-[13px] font-medium ${msg.type === 'ok' ? 'text-[#248a3d]' : 'text-[#ff3b30]'}`}
          >
            {msg.text}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDiscount(1)}
            disabled={loading || isOutOfStock}
            className="btn btn-blue flex-1"
          >
            {loading ? 'Guardando…' : 'Despachar 1'}
          </button>
          <div className="flex h-11 items-center overflow-hidden rounded-full bg-[#f5f5f7]">
            <label className="sr-only" htmlFor={`qty-${product.id}`}>
              Cantidad a despachar de {product.name}
            </label>
            <input
              id={`qty-${product.id}`}
              type="number"
              inputMode="numeric"
              min={1}
              max={Math.max(product.stock, 1)}
              value={shownQty}
              disabled={isOutOfStock}
              onChange={(e) => setCustomQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleDiscount(shownQty)
              }}
              className="num w-12 bg-transparent text-center text-[17px] outline-none disabled:text-[#6e6e73]"
            />
            <button
              type="button"
              onClick={() => handleDiscount(shownQty)}
              disabled={loading || isOutOfStock}
              className="h-11 px-3 text-[15px] font-semibold text-[#0071e3] disabled:text-[#6e6e73]"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
