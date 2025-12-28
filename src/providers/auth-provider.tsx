// ============================================================
// AUTH PROVIDER - Gerencia autenticação global
// Alinhado com backend: Google OAuth + Magic Link
// ============================================================

"use client"

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { tokenStore } from '@/lib/store/token.store'
import { authService, userService } from '@/lib/api/services'
import { useAppStore } from '@/lib/store/app.store'
import type { UserDTO, GoogleAuthResponse, MagicLinkCallbackResponse } from '@/lib/api/types'

interface AuthContextType {
  user: UserDTO | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Google OAuth
  initGoogleAuth: (callbackUrl: string) => Promise<void>
  handleGoogleCallback: (code: string, callbackUrl: string) => Promise<void>

  // Magic Link
  requestMagicLink: (email: string) => Promise<void>
  verifyMagicLink: (token: string) => Promise<void>

  // Common
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, setUser, setAuthenticated } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ========== Google OAuth ==========

  const initGoogleAuth = useCallback(async (callbackUrl: string) => {
    try {
      setError(null)
      const { authUrl } = await AuthService.getGoogleAuthUrl(callbackUrl)
      window.location.href = authUrl
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Google Auth')
      throw err
    }
  }, [])

  const handleGoogleCallback = useCallback(async (code: string, callbackUrl: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response: GoogleAuthResponse = await AuthService.googleCallback(code, callbackUrl)

      // Save sessionToken
      tokenStore.setTokens({
        sessionToken: response.sessionToken,
        expiresIn: 86400, // 24 hours
      })

      // Update app store
      setUser(response.user)
      setAuthenticated(true)

      router.push('/org')
    } catch (err: any) {
      setError(err.message || 'Google authentication failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router, setUser, setAuthenticated])

  // ========== Magic Link ==========

  const requestMagicLink = useCallback(async (email: string) => {
    try {
      setError(null)
      await AuthService.requestMagicLink(email)
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link')
      throw err
    }
  }, [])

  const verifyMagicLink = useCallback(async (token: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response: MagicLinkCallbackResponse = await AuthService.verifyMagicLink(token)

      // Save sessionToken
      tokenStore.setTokens({
        sessionToken: response.sessionToken,
        expiresIn: 86400, // 24 hours
      })

      // Update app store
      setUser(response.user)
      setAuthenticated(true)

      router.push('/org')
    } catch (err: any) {
      setError(err.message || 'Magic link verification failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router, setUser, setAuthenticated])

  // ========== Common ==========

  const logout = useCallback(async () => {
    try {
      await AuthService.logout()
    } catch (err) {
      console.warn('Logout API call failed:', err)
    } finally {
      tokenStore.clear()
      setUser(null)
      setAuthenticated(false)
      router.push('/login')
    }
  }, [router, setUser, setAuthenticated])

  const refreshUser = useCallback(async () => {
    try {
      if (!tokenStore.isAuthenticated()) {
        setUser(null)
        setAuthenticated(false)
        return
      }

      const userData = await UserService.getUser()
      setUser(userData)
      setAuthenticated(true)
    } catch (err) {
      console.error('Failed to refresh user:', err)
      tokenStore.clear()
      setUser(null)
      setAuthenticated(false)
    }
  }, [setUser, setAuthenticated])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // ========== Initialize Auth ==========

  useEffect(() => {
    async function initialize() {
      try {
        if (!tokenStore.isAuthenticated()) {
          setUser(null)
          setAuthenticated(false)
          return
        }

        // Fetch user data
        const userData = await UserService.getUser()
        setUser(userData)
        setAuthenticated(true)
      } catch (err) {
        console.error('Auth initialization failed:', err)
        tokenStore.clear()
        setUser(null)
        setAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [setUser, setAuthenticated])

  // ========== Subscribe to token changes ==========

  useEffect(() => {
    const unsubscribe = tokenStore.subscribe(() => {
      const isAuth = tokenStore.isAuthenticated()
      if (!isAuth && user) {
        setUser(null)
        setAuthenticated(false)
      }
    })

    return unsubscribe
  }, [user, setUser, setAuthenticated])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    initGoogleAuth,
    handleGoogleCallback,
    requestMagicLink,
    verifyMagicLink,
    logout,
    refreshUser,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
