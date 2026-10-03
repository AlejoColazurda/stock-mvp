'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { getProducts } from '@/actions/inventory'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/lib/types'
import { Search } from 'lucide-react'

const WORKER_KEY = 'stock_worker_name'
const workerListeners = new Set<() => void>()

function subscribeWorker(onStoreChange: () => void) {
  workerListeners.add(onStoreChange)
  return () => workerListeners.delete(onStoreChange)
}

function readWorkerName() {
  return localStorage.getItem(WORKER_KEY) ?? ''
}

function writeWorkerName(value: string) {
  localStorage.setItem(WORKER_KEY, value)
  workerListeners.forEach((listener) => listener())
}

export default function Catalog({
  initialProducts,
  initialError,
}: {
  initialProducts: Product[]
  initialError?: string
}) {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [ready, setReady] = useState(true)
  const [error, setError] = useState<string | null>(initialError ?? null)
  const workerName = useSyncExternalStore(subscribeWorker, readWorkerName, () => '')

  const handleWorkerChange = (val: string) => {
    writeWorkerName(val)
  }

  useEffect(() => {
    let ignore = false
    const delay = window.setTimeout(() => {
      getProducts(query).then((result) => {
        if (ignore) return
        setReady(true)
        if (result.error) {
          setError(result.error)
          return
        }
        setError(null)
        setProducts(result.products)
      })
    }, 150)

    return () => {
      ignore = true
      window.clearTimeout(delay)
    }
  }, [query])

  useEffect(() => {
    if (!ready || error) return
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      getProducts(query).then((result) => {
        if (result.error) return
        setProducts(result.products)
      })
    }, 15000)
    return () => window.clearInterval(id)
  }, [error, query, ready])

  const updateStock = (productId: string, stock: number) => {
    setProducts((current) =>
      current.map((product) => (product.id === productId ? { ...product, stock } : product)),
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:pt-8">
      <h1 className="text-[32px] font-semibold leading-none tracking-tight text-[#1d1d1f]">Productos</h1>
      <p className="mt-2 text-[15px] text-[#6e6e73]">Precio y stock al instante.</p>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6e6e73]" size={18} aria-hidden />
        <label htmlFor="product-search" className="sr-only">
          Buscar producto por nombre o código
        </label>
        <input
          id="product-search"
          type="search"
          autoFocus
          placeholder="Buscar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="field field-icon"
        />
      </div>

      <label className="mt-3 block">
        <span className="sr-only">Nombre del operario</span>
        <input
          type="text"
          placeholder="Tu nombre"
          value={workerName}
          onChange={(e) => handleWorkerChange(e.target.value)}
          autoComplete="name"
          className="field"
        />
      </label>
      <p className="mt-2 px-1 text-[13px] text-[#6e6e73]">Se guarda en este dispositivo.</p>

      {!ready ? (
        <p className="py-16 text-center text-[15px] text-[#6e6e73]">Cargando…</p>
      ) : error && products.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-[#ff3b30]">{error}</p>
      ) : products.length === 0 ? (
        <p className="py-16 text-center text-[15px] text-[#6e6e73]">Ningún producto coincide.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              workerName={workerName}
              onStockUpdated={updateStock}
            />
          ))}
        </div>
      )}
    </main>
  )
}
