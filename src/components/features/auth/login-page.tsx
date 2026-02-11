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
      {/* Left Side - Brand & CTA */}
      <div className="hidden lg:flex relative bg-zinc-950 overflow-hidden flex-col items-center justify-center p-12">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-md space-y-6">
          {/* Logo */}
          <div className="relative w-72 h-24">
            <Image
              src="/logo-removebg-preview.png"
              alt="Redline"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Tagline */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Governança e compliance potencializados por IA
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              Processos automatizados, conformidade monitorada e documentos centralizados em um só lugar.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-5 pt-2 w-full">
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm text-zinc-300">Gestão documental inteligente</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm text-zinc-300">Compliance automatizado</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-sm text-zinc-300">Dados protegidos e seguros</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm text-zinc-300">Equipe conectada em tempo real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-950">
        <div className="w-full max-w-sm space-y-10">
          {/* Title */}
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Mobile Logo */}
            <div className="relative w-56 h-16 mb-4 lg:hidden">
              <Image
                src="/logo-removebg-preview.png"
                alt="Redline"
                fill
                className="object-contain dark:invert"
                priority
              />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Bem-vindo ao RedLine
            </h1>
            <p className="text-sm text-zinc-400">
              Digite seu email para acessar a plataforma
            </p>
          </div>

          {/* Forms */}
          <div className="space-y-6">
            {!magicLinkSent ? (
              <>
                <LoginForm
                  onMagicLinkRequest={handleMagicLinkRequest}
                  isMagicLinkLoading={isMagicLinkLoading}
                />

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-950 px-2 text-zinc-500">
                      Ou continue com
                    </span>
                  </div>
                </div>

                <GoogleLoginButton
                  onGoogleLogin={handleGoogleLogin}
                  isGoogleLoading={isGoogleLoading}
                />

                <p className="text-center text-xs text-zinc-500 pt-2">
                  Ao clicar em continuar, você concorda com nossos{' '}
                  <a href="#" className="underline underline-offset-4 hover:text-zinc-300">
                    Termos de Serviço
                  </a>{' '}
                  e{' '}
                  <a href="#" className="underline underline-offset-4 hover:text-zinc-300">
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
