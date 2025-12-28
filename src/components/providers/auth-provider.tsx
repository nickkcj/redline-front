"use client"

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { UserDTO } from '@/lib/api/types/user.types'
import {
  useGoogleOAuthUrl,
  useRequestMagicLink,
  useVerifyMagicLink,
  useLogout as useLogoutMutation,
  useUserInfo,
  useGoogleCallback
} from '@/hooks/auth/use-auth-api'

interface AuthContextType {
  user: UserDTO | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  initGoogleAuth: (callbackUrl: string) => Promise<void>
  handleGoogleCallback: (code: string, callbackUrl: string) => Promise<void>
  requestMagicLink: (email: string) => Promise<void>
  verifyMagicLink: (token: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mutations from hooks
  const { mutateAsync: getGoogleOAuthUrl } = useGoogleOAuthUrl()
  const { mutateAsync: handleGoogleAuth } = useGoogleCallback()
  const { mutateAsync: sendMagicLink } = useRequestMagicLink()
  const { mutateAsync: verifyMagic } = useVerifyMagicLink()
  const { mutateAsync: performLogout } = useLogoutMutation()
  const { mutateAsync: getUserInfo } = useUserInfo()

  const initGoogleAuth = useCallback(async (callbackUrl: string) => {
    try {
      setError(null)
      const authUrl = await getGoogleOAuthUrl(callbackUrl)
      window.location.href = authUrl
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Google Auth')
      throw err
    }
  }, [getGoogleOAuthUrl])

  const handleGoogleCallback = useCallback(async (code: string, callbackUrl: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await handleGoogleAuth({ code, callbackUrl })

      if (response.user) {
        setUser(response.user)
        router.push('/org')
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [handleGoogleAuth, router])

  const requestMagicLink = useCallback(async (email: string) => {
    try {
      setError(null)
      await sendMagicLink(email)
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link')
      throw err
    }
  }, [sendMagicLink])

  const verifyMagicLink = useCallback(async (token: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await verifyMagic(token)

      if (response.user) {
        setUser(response.user)
        router.push('/org')
      }
    } catch (err: any) {
      setError(err.message || 'Magic link verification failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [verifyMagic, router])

  const logout = useCallback(async () => {
    try {
      await performLogout()
      setUser(null)
      router.push('/login')
    } catch (err) {
      console.warn('Logout API call failed:', err)
      setUser(null)
      router.push('/login')
    }
  }, [performLogout, router])

  const refreshUser = useCallback(async () => {
    try {
      const userData = await getUserInfo()
      setUser(userData)
    } catch (err) {
      console.error('Failed to refresh user:', err)
      setUser(null)
    }
  }, [getUserInfo])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initialize user on mount
  useEffect(() => {
    async function initialize() {
      try {
        const userData = await getUserInfo()
        setUser(userData)
      } catch (err) {
        console.error('Auth initialization failed:', err)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [getUserInfo])

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
