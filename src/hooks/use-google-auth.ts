// ============================================================
// USE GOOGLE AUTH - Hook para Google OAuth flow (backend)
// ============================================================

"use client"

import { useState } from 'react'
import { useAuth } from '@/providers/auth-provider'

export function useGoogleAuth() {
  const { initGoogleAuth, handleGoogleCallback, error, isLoading } = useAuth()
  const [isInitializing, setIsInitializing] = useState(false)

  const startGoogleAuth = async () => {
    try {
      setIsInitializing(true)
      const callbackUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/success`
        : 'http://localhost:3000/auth/success'

      await initGoogleAuth(callbackUrl)
    } catch (err) {
      console.error('Failed to start Google OAuth:', err)
    } finally {
      setIsInitializing(false)
    }
  }

  return {
    startGoogleAuth,
    handleGoogleCallback,
    isLoading: isLoading || isInitializing,
    error,
  }
}
