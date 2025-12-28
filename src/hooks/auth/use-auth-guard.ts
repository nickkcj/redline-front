// ============================================================
// USE AUTH GUARD - Hook para proteger rotas
// ============================================================

"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'

interface UseAuthGuardOptions {
  redirectTo?: string
  redirectAuthenticated?: boolean
  redirectUnauthenticated?: boolean
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const {
    redirectTo = '/login',
    redirectAuthenticated = false,
    redirectUnauthenticated = true,
  } = options

  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Don't redirect while still loading auth state
    if (isLoading) {
      return
    }

    // Redirect authenticated users away from public pages
    if (isAuthenticated && redirectAuthenticated) {
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl')
      const destination = returnUrl || '/org'
      router.push(destination)
      return
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated && redirectUnauthenticated) {
      const returnUrl = encodeURIComponent(pathname + window.location.search)
      router.push(`${redirectTo}?returnUrl=${returnUrl}`)
      return
    }
  }, [
    isAuthenticated,
    isLoading,
    redirectAuthenticated,
    redirectUnauthenticated,
    redirectTo,
    pathname,
    router,
  ])

  return {
    isAuthenticated,
    isLoading,
  }
}
