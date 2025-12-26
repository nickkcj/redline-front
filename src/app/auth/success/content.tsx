'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { tokenStore } from '@/lib/auth/stores/auth.store'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function AuthSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loadingMessage, setLoadingMessage] = useState('Autenticando')

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const token = searchParams.get('token')
      const userParam = searchParams.get('user')
      const error = searchParams.get('error')

      // Case 1: Error in URL
      if (error) {
        console.log('Google OAuth error:', error)
        setLoadingMessage('Erro na autenticação. Redirecionando...')
        toast.error('Falha na autenticação', {
          description: error,
        })
        await new Promise((resolve) => setTimeout(resolve, 2000))
        router.replace('/login')
        return
      }

      // Case 2: Missing token or user
      if (!token || !userParam) {
        console.log('Missing token or user in callback')
        setLoadingMessage('Dados incompletos. Redirecionando...')
        toast.error('Autenticação incompleta', {
          description: 'Dados necessários não foram recebidos',
        })
        await new Promise((resolve) => setTimeout(resolve, 2000))
        router.replace('/login')
        return
      }

      try {
        // Parse user data
        const user = JSON.parse(decodeURIComponent(userParam))

        // Save authentication data
        setLoadingMessage('Salvando credenciais')

        // Save session token in localStorage
        tokenStore.setTokens({
          accessToken: token,
          refreshToken: '',
        })

        // Save user info
        tokenStore.setUser(user)

        console.log('[GoogleOAuth] User authenticated successfully:', user.email)

        // Wait for store to sync
        await new Promise((resolve) => setTimeout(resolve, 200))

        // Redirect to organizations
        setLoadingMessage('Redirecionando')
        await new Promise((resolve) => setTimeout(resolve, 300))

        router.replace('/org')
      } catch (error) {
        console.error('Google OAuth callback failed:', error)
        toast.error('Falha no processamento', {
          description: error instanceof Error ? error.message : 'Não foi possível processar a autenticação',
        })
        setLoadingMessage('Erro. Redirecionando...')
        await new Promise((resolve) => setTimeout(resolve, 2000))
        router.replace('/login')
      }
    }

    handleGoogleCallback()
  }, [router, searchParams])

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 size={40} className="text-muted-foreground animate-spin mb-4" />
      <p className="text-sm text-muted-foreground">{loadingMessage}</p>
    </div>
  )
}