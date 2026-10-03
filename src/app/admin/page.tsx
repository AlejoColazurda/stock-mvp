import { listStaff } from '@/actions/admin'
import { getProducts } from '@/actions/inventory'
import AdminPanel from '@/components/AdminPanel'
import LoginForm from '@/components/LoginForm'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const access = await getSession()

  if (!access) {
    return (
      <main className="mx-auto max-w-md px-4 pb-10 pt-8">
        <h1 className="mb-6 text-[32px] font-semibold tracking-tight">Admin</h1>
        <LoginForm title="Ingresar" hint="Para empezar: Admin y clave 1234." />
      </main>
    )
  }

  if (!access.isAdmin) {
    return (
      <main className="mx-auto max-w-lg px-4 pb-10 pt-8">
        <div className="card p-6">
          <h1 className="text-[22px] font-semibold tracking-tight">Solo el administrador</h1>
          <p className="mt-2 text-[15px] text-[#6e6e73]">
            {access.name} puede ver movimientos. Los pisos y las habilitaciones los define el administrador.
          </p>
        </div>
      </main>
    )
  }

  const [products, staff] = await Promise.all([getProducts(), listStaff()])

  return (
    <main className="mx-auto max-w-5xl px-4 pb-10 pt-8">
      <h1 className="mb-6 text-[32px] font-semibold tracking-tight">Admin</h1>
      <AdminPanel products={products} staff={staff} />
    </main>
  )
}
