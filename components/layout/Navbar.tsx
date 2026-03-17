'use client'

import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Shield } from 'lucide-react'

export function Navbar() {
  const { user, isAdmin, mutate } = useUser()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    mutate(undefined)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-violet-600">
          Webmica
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="mr-1.5 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  Mi panel
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1.5 h-4 w-4" />
                Salir
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">Iniciar sesión</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
