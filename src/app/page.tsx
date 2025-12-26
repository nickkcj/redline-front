'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/hooks/use-auth'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Don't redirect while checking auth
    if (isLoading) {
      return
    }

    // Redirect based on auth status
    if (isAuthenticated) {
      router.replace('/org')
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="text-sm text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}
