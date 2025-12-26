'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { tokenStore } from '@/lib/auth/stores/auth.store'
import { authService } from '@/lib/api/services/auth.service'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function MagicLinkContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loadingMessage, setLoadingMessage] = useState('Verificando magic link')

  useEffect(() => {
    const handleMagicLinkVerification = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      // Case 1: Error in URL
      if (error) {
        console.log('Magic link error:', error)
        setLoadingMessage('Erro na verificação. Redirecionando...')
        toast.error('Falha na autenticação', {
          description: error,
        })
        await new Promise((resolve) => setTimeout(resolve, 2000))
        router.replace('/login')
        return
      }

      // Case 2: No token
      if (!token) {
        console.log('No token found in magic link')
        setLoadingMessage('Token não encontrado. Redirecionando...')
        toast.error('Token inválido', {
          description: 'O link de magic link não contém um token válido',
        })
        await new Promise((resolve) => setTimeout(resolve, 2000))
        router.replace('/login')
        return
      }

      try {
        // Step 1: Verify magic link token
        setLoadingMessage('Verificando token')

        const authResult = await authService.verifyMagicLink(token)

        if (!authResult || !authResult.success || !authResult.sessionToken || !authResult.user) {
          throw new Error('Invalid response from server')
        }

        // Step 2: Save authentication data using tokenStore
        setLoadingMessage('Salvando credenciais')

        // Save session token in localStorage
        tokenStore.setTokens({
          accessToken: authResult.sessionToken,
          refreshToken: '',
        })

        // Save user info
        tokenStore.setUser(authResult.user)

        console.log('[MagicLink] User authenticated successfully:', authResult.user.email)

        // Wait a bit for tokenStore subscribers to update and auth context to sync
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Step 3: Redirect to organizations
        setLoadingMessage('Redirecionando')
        await new Promise((resolve) => setTimeout(resolve, 300))

        router.replace('/org')
      } catch (error) {
        console.error('Magic link verification failed:', error)
        
        // Check if it's a "magic link already used" error
        const errorMessage = error instanceof Error ? error.message : 'Não foi possível verificar o magic link'
        const isAlreadyUsed = errorMessage.toLowerCase().includes('already used') || 
                             errorMessage.toLowerCase().includes('já utilizado')
        
        if (isAlreadyUsed) {
          toast.error('Link já utilizado', {
            description: 'Este magic link já foi usado. Por favor, solicite um novo link.',
          })
        } else {
          toast.error('Falha na verificação', {
            description: errorMessage,
          })
        }
        
        setLoadingMessage('Erro na verificação. Redirecionando...')
        await new Promise((resolve) => setTimeout(resolve, 2000))
        router.replace('/login')
      }
    }

    handleMagicLinkVerification()
  }, [router, searchParams])

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 size={40} className="text-muted-foreground animate-spin mb-4" />
      <p className="text-sm text-muted-foreground">{loadingMessage}</p>
    </div>
  )
}
