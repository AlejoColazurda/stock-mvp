import { getMovements } from '@/actions/inventory'
import LiveRefresh from '@/components/LiveRefresh'
import LoginForm from '@/components/LoginForm'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function formatWhen(date: Date) {
  return new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function MovimientosPage() {
  const access = await getSession()

  if (!access?.canViewMovements) {
    return (
      <main className="mx-auto max-w-md px-4 pb-10 pt-8">
        <h1 className="text-[32px] font-semibold tracking-tight">Movimientos</h1>
        <p className="mt-2 mb-6 text-[15px] text-[#6e6e73]">
          Solo el administrador y las personas que él habilita pueden ver las salidas.
        </p>
        <LoginForm title="Ingresar" />
      </main>
    )
  }

  const movements = await getMovements()

  return (
    <main className="mx-auto max-w-5xl px-4 pb-10 pt-8">
      <LiveRefresh />
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold leading-none tracking-tight">Movimientos</h1>
          <p className="mt-2 text-[15px] text-[#6e6e73]">Se actualiza solo.</p>
        </div>
        <p className="text-[13px] text-[#6e6e73]">{movements.length}</p>
      </div>

      {movements.length === 0 ? (
        <div className="card px-6 py-16 text-center text-[15px] text-[#6e6e73]">
          Todavía no hay salidas.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-black/8 md:hidden">
            {movements.map((movement) => (
              <li key={movement.id} className="px-4 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold tracking-tight">{movement.product.name}</p>
                  <time className="shrink-0 text-[13px] text-[#6e6e73]" dateTime={movement.createdAt.toISOString()}>
                    {formatWhen(movement.createdAt)}
                  </time>
                </div>
                <p className="mt-1 text-[13px] text-[#6e6e73]">{movement.product.sku || 'Sin código'}</p>
                <p className="num mt-2 text-[15px]">
                  <span className="font-semibold text-[#ff3b30]">−{movement.quantity}</span>
                  <span className="text-[#6e6e73]"> · quedan {movement.stockAfter}</span>
                  <span className="text-[#6e6e73]"> · {movement.workerName}</span>
                </p>
              </li>
            ))}
          </ul>

          <table className="hidden w-full text-left md:table">
            <thead>
              <tr className="text-[12px] font-medium text-[#6e6e73]">
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Producto</th>
                <th className="px-5 py-3 font-medium">Salida</th>
                <th className="px-5 py-3 font-medium">Quedan</th>
                <th className="px-5 py-3 font-medium">Operario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/8">
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td className="whitespace-nowrap px-5 py-4 text-[15px] text-[#6e6e73]">
                    {formatWhen(movement.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-[15px] font-semibold tracking-tight">{movement.product.name}</p>
                    <p className="text-[12px] text-[#6e6e73]">{movement.product.sku || 'Sin código'}</p>
                  </td>
                  <td className="num whitespace-nowrap px-5 py-4 text-[17px] font-semibold text-[#ff3b30]">
                    −{movement.quantity}
                  </td>
                  <td className="num px-5 py-4 text-[17px] font-semibold">{movement.stockAfter}</td>
                  <td className="px-5 py-4 text-[15px]">{movement.workerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
