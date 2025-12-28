'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { toast } from 'sonner'
import { BackgroundVideo } from '@/components/shared/layout/background-video'
import { LoginForm } from './login-form'
import { GoogleLoginButton } from './google-login-button'
import { LoginHeader } from './login-header'
import { MagicLinkSuccess } from './magic-link-success'
import { LoginLoading } from './login-loading'

export function LoginPage() {
  const { isAuthenticated, user, isLoading: authLoading, requestMagicLink, initGoogleAuth } = useAuth()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [mounted, setMounted] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Scaffold'

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle magic link token in query string - redirect to magic link page
  useEffect(() => {
    if (!mounted) return

    const token = searchParams.get('token')
    const error = searchParams.get('error')

    // If there's a token or error in the query string, redirect to magic link page
    if (token || error) {
      console.log('Magic link token detected in login page, redirecting to magic link handler')
      const params = new URLSearchParams()
      if (token) params.set('token', token)
      if (error) params.set('error', error)
      router.replace(`/auth/magic-link?${params.toString()}`)
      return
    }
  }, [mounted, searchParams, router])

  // Handle authentication redirect
  useEffect(() => {
    if (!mounted || authLoading) return

    if (isAuthenticated && user) {
      console.log('User authenticated, redirecting...')
      router.push('/')
    }
  }, [mounted, isAuthenticated, user, authLoading, router])

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)
      const frontendCallbackUrl = `${window.location.origin}/auth/success`
      await initGoogleAuth(frontendCallbackUrl)
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Falha no login', {
        description: 'Por favor, tente novamente',
      })
      setIsGoogleLoading(false)
    }
  }


  const handleMagicLinkRequest = async (email: string) => {
    try {
      setIsMagicLinkLoading(true)
      await requestMagicLink(email)

      setMagicLinkSent(true)
      setEmail(email) // Save email for success message
      toast.success('Magic link enviado!', {
        description: 'Verifique seu email para continuar',
      })
    } catch (error) {
      console.error('Magic link error:', error)
      toast.error('Falha ao enviar magic link', {
        description: error instanceof Error ? error.message : 'Por favor, tente novamente',
      })
      throw error // Re-throw to let LoginForm handle it
    } finally {
      setIsMagicLinkLoading(false)
    }
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  // Show loading state while checking auth
  if (authLoading) {
    return <LoginLoading />
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-background p-[70px] relative">
      <BackgroundVideo opacity={0.7} />
      <LoginHeader appName={appName} />
      <div className="flex flex-col items-center gap-4 relative z-10 max-w-md w-full">
        {!magicLinkSent ? (
          <>
            <LoginForm
              onMagicLinkRequest={handleMagicLinkRequest}
              isMagicLinkLoading={isMagicLinkLoading}
            />

            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-muted"></div>
              <span className="text-sm text-gray-500">ou</span>
              <div className="flex-1 h-px bg-muted"></div>
            </div>

            <GoogleLoginButton
              onGoogleLogin={handleGoogleLogin}
              isGoogleLoading={isGoogleLoading}
            />
          </>
        ) : (
          <MagicLinkSuccess
            email={email}
            onBackToLogin={() => {
              setMagicLinkSent(false)
              setEmail('')
            }}
          />
        )}
      </div>
    </div>
  )
}
