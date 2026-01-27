'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { CircleNotch } from '@phosphor-icons/react'
import { tokenStore } from '@/lib/stores/token.store'

export function OAuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loadingMessage, setLoadingMessage] = useState('Autenticando')

  useEffect(() => {
    let isCancelled = false

    const handleCallback = async () => {
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
        if (!isCancelled) router.replace('/login')
        return
      }

      // Case 2: Missing token (backend already processed the code and returned token)
      if (!token) {
        console.log('Missing token in OAuth callback')
        setLoadingMessage('Dados incompletos. Redirecionando...')
        toast.error('Autenticação incompleta', {
          description: 'Token de sessão não foi recebido',
        })
        await new Promise((resolve) => setTimeout(resolve, 2000))
        if (!isCancelled) router.replace('/login')
        return
      }

      try {
        // Save token from backend
        setLoadingMessage('Salvando credenciais')

        tokenStore.setTokens({
          sessionToken: token,
          expiresIn: 24 * 60 * 60 * 1000, // 24 hours
        })

        console.log('[GoogleOAuth] Token saved successfully')

        // Wait for token to be persisted
        await new Promise((resolve) => setTimeout(resolve, 200))

        // Redirect to home
        setLoadingMessage('Redirecionando')
        toast.success('Login realizado com sucesso!')

        await new Promise((resolve) => setTimeout(resolve, 300))
        if (!isCancelled) router.push('/')
      } catch (error) {
        if (isCancelled) return

        console.error('Google OAuth callback failed:', error)
        toast.error('Falha no processamento', {
          description: error instanceof Error ? error.message : 'Não foi possível processar a autenticação',
        })
        setLoadingMessage('Erro. Redirecionando...')
        await new Promise((resolve) => setTimeout(resolve, 2000))
        if (!isCancelled) router.replace('/login')
      }
    }

    handleCallback()

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-background">
      <CircleNotch weight="bold" size={40} className="text-muted-foreground animate-spin mb-4" />
      <p className="text-sm text-muted-foreground">{loadingMessage}</p>
    </div>
  )
}
