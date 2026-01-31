'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function MagicLinkHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyMagicLink } = useAuth()
  const [loadingMessage, setLoadingMessage] = useState('Verificando magic link')

  useEffect(() => {
    let isCancelled = false

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
        if (!isCancelled) router.replace('/login')
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
        if (!isCancelled) router.replace('/login')
        return
      }

      try {
        // Verify magic link using auth provider
        setLoadingMessage('Verificando token')
        await verifyMagicLink(token)

        console.log('[MagicLink] User authenticated successfully')

        // Wait a bit for auth context to sync
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Redirect to organizations
        setLoadingMessage('Redirecionando')
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Router push will be handled by auth provider
      } catch (error) {
        if (isCancelled) return

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
        if (!isCancelled) router.replace('/login')
      }
    }

    handleMagicLinkVerification()

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 size={40} className="text-muted-foreground animate-spin mb-4" />
      <p className="text-sm text-muted-foreground">{loadingMessage}</p>
    </div>
  )
}
