'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/providers/auth-provider'
import { toast } from 'sonner'
import { LoginForm } from './login-form'
import { GoogleLoginButton } from './google-login-button'
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
      // Extract error message
      let errorMessage = 'Por favor, tente novamente'
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as any).message
      }
      
      toast.error('Falha no login', {
        description: errorMessage,
      })
      setIsGoogleLoading(false)
    }
  }

  const handleMagicLinkRequest = async (email: string) => {
    try {
      setIsMagicLinkLoading(true)
      await requestMagicLink(email)

      setMagicLinkSent(true)
      setEmail(email)
      toast.success('Magic link enviado!', {
        description: 'Verifique seu email para continuar',
      })
    } catch (error) {
      console.error('Magic link error:', error)
      toast.error('Falha ao enviar magic link', {
        description: error instanceof Error ? error.message : 'Por favor, tente novamente',
      })
      throw error
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
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left Side - Image with Logo */}
      <div className="hidden lg:block relative bg-muted overflow-hidden">
        <Image
          src="/bglogin.png"
          alt="Background"
          fill
          className="object-cover animate-zoom-in"
          priority
          quality={100}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        
        {/* Logo centered */}
        <div className="absolute inset-0 flex items-center justify-center p-12 z-20">
          <div className="relative w-full max-w-sm h-20">
            <Image
              src="/logoSca_branca.png"
              alt="Scaffold"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes zoom-in {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.1);
          }
        }

        .animate-zoom-in {
          animation: zoom-in 8s ease-out forwards;
        }
      `}</style>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Title */}
          <div className="flex flex-col items-center text-center space-y-2">
            {/* Mobile/Form Logo */}
            <div className="relative w-48 h-12 mb-4 lg:hidden">
              <Image 
                src="/logoSaca_preta.png" 
                alt="Scaffold" 
                fill
                className="object-contain dark:hidden"
                priority
              />
              <Image 
                src="/logoSca_branca.png" 
                alt="Scaffold" 
                fill
                className="object-contain hidden dark:block"
                priority
              />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Criar uma conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Digite seu email abaixo para criar sua conta
            </p>
          </div>

          {/* Forms */}
          <div className="space-y-4">
            {!magicLinkSent ? (
              <>
                <LoginForm
                  onMagicLinkRequest={handleMagicLinkRequest}
                  isMagicLinkLoading={isMagicLinkLoading}
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou continue com
                    </span>
                  </div>
                </div>

                <GoogleLoginButton
                  onGoogleLogin={handleGoogleLogin}
                  isGoogleLoading={isGoogleLoading}
                />

                <p className="text-center text-xs text-muted-foreground">
                  Ao clicar em continuar, você concorda com nossos{' '}
                  <a href="#" className="underline underline-offset-4 hover:text-foreground">
                    Termos de Serviço
                  </a>{' '}
                  e{' '}
                  <a href="#" className="underline underline-offset-4 hover:text-foreground">
                    Política de Privacidade
                  </a>
                  .
                </p>
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
      </div>
    </div>
  )
}
