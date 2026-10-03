import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import SiteHeader from '@/components/SiteHeader'
import { getSession } from '@/lib/auth'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stock & Precios Rápido',
  description: 'Control de stock y precios de alta velocidad',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const access = await getSession()

  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full font-sans">
        <SiteHeader access={access} />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '16px',
              color: '#1d1d1f',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
            },
          }}
        />
      </body>
    </html>
  )
}
