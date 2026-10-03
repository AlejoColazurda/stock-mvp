'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/actions/auth'

export default function LoginForm({
  title,
  hint,
}: {
  title: string
  hint?: string
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    const result = await login({ name, pin })
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="card p-6">
      <h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
      {hint && <p className="mt-1 text-[13px] text-[#6e6e73]">{hint}</p>}

      <label className="mt-5 block text-[13px] font-medium text-[#6e6e73]">
        Nombre
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="username"
          className="field mt-1.5"
        />
      </label>

      <label className="mt-3 block text-[13px] font-medium text-[#6e6e73]">
        Clave
        <input
          type="password"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          autoComplete="current-password"
          className="field mt-1.5"
        />
      </label>

      {error && (
        <p role="alert" className="mt-3 text-[13px] font-medium text-[#ff3b30]">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn btn-blue mt-5 w-full">
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  )
}
