import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Webmica — Cursos de psicología',
  description: 'Plataforma de cursos y contenido digital',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
