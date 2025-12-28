'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function OAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleGoogleCallback } = useAuth()
  const [loadingMessage, setLoadingMessage] = useState('Autenticando')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
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

      // Case 2: Missing code
      if (!code) {
        console.log('Missing code in OAuth callback')
        setLoadingMessage('Dados incompletos. Redirecionando...')
        toast.error('Autenticação incompleta', {
          description: 'Código de autenticação não foi recebido',
        })
        await new Promise((resolve) => setTimeout(resolve, 2000))
        router.replace('/login')
        return
      }

      try {
        // Handle Google OAuth callback using auth provider
        setLoadingMessage('Salvando credenciais')

        const callbackUrl = `${window.location.origin}/auth/success`
        await handleGoogleCallback(code, callbackUrl)

        console.log('[GoogleOAuth] User authenticated successfully')

        // Wait for auth context to sync
        await new Promise((resolve) => setTimeout(resolve, 200))

        // Redirect to organizations
        setLoadingMessage('Redirecionando')
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Router push will be handled by auth provider
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

    handleCallback()
  }, [router, searchParams, handleGoogleCallback])

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 size={40} className="text-muted-foreground animate-spin mb-4" />
      <p className="text-sm text-muted-foreground">{loadingMessage}</p>
    </div>
  )
}
