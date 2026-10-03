'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/actions/auth'
import type { Access } from '@/lib/types'

export default function SiteHeader({ access }: { access: Access | null }) {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { href: '/', label: 'Buscador' },
    ...(access?.canViewMovements ? [{ href: '/movimientos', label: 'Movimientos' }] : []),
    { href: '/admin', label: 'Admin' },
  ]

  const onLogout = async () => {
    await logout()
    router.refresh()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-black/8 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex min-h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
          StockExpress
        </Link>
        <div className="flex items-center gap-2">
          <nav className="flex rounded-full bg-black/5 p-1" aria-label="Principal">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex min-h-9 items-center rounded-full px-3 text-[14px] font-medium transition ${
                    active ? 'bg-white text-[#1d1d1f] shadow-sm' : 'text-[#6e6e73]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          {access && (
            <button
              type="button"
              onClick={onLogout}
              className="min-h-9 px-2 text-[14px] font-medium text-[#0071e3]"
            >
              Salir
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
