'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { authService } from '@/lib/api/services/auth.service'
import { toast } from 'sonner'
import { Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginContent() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
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
      router.push('/org')
    }
  }, [mounted, isAuthenticated, user, authLoading, router])

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true)

      const frontendCallbackUrl = `${window.location.origin}/auth/success`

      const data = await authService.getGoogleOAuthUrl(frontendCallbackUrl)

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error('Auth URL not found')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Falha no login', {
        description: 'Por favor, tente novamente',
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !isValidEmail(email)) {
      toast.error('Email inválido', {
        description: 'Por favor, insira um email válido',
      })
      return
    }

    try {
      setIsMagicLinkLoading(true)

      await authService.requestMagicLink(email)

      setMagicLinkSent(true)
      toast.success('Magic link enviado!', {
        description: 'Verifique seu email para continuar',
      })
    } catch (error) {
      console.error('Magic link error:', error)
      toast.error('Falha ao enviar magic link', {
        description: error instanceof Error ? error.message : 'Por favor, tente novamente',
      })
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
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#FCFCFD]">
        <Loader2 size={40} className="text-[#5C6570] animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#FCFCFD] p-[70px] relative">
      <div className="absolute left-[10%] top-[70px] flex items-center gap-4 z-10">
        <img
          src="/seloDooorBlack.png"
          alt="Dooor Logo"
          width={56}
          height={56}
          className="w-16 h-16 object-contain"
        />
        <div className="flex flex-col">
          <div className="text-4xl font-serif font-bold text-foreground leading-tight">{appName}</div>
          <div className="text-sm font-serif font-bold text-muted-foreground mt-1">by dooor</div>
        </div>
      </div>
      <video
        src={'/mountain-vector-white.mp4'}
        autoPlay
        muted
        loop
        className="w-screen h-screen absolute bottom-0 pointer-events-none left-0 object-cover"
      >
        <source src="/mountain-vector-white.mp4" type="video/mp4" />
      </video>
      {/* Overlay for opacity effect */}
      <div className="w-screen h-screen absolute bottom-0 left-0 bg-background opacity-70 pointer-events-none"></div>
      <div className="flex flex-col items-center gap-4 relative z-10 max-w-md w-full">
        {!magicLinkSent ? (
          <>
            <form onSubmit={handleMagicLinkRequest} className="w-full flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  disabled={isMagicLinkLoading}
                  className="h-auto py-3 rounded-xl"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isMagicLinkLoading || !email || !isValidEmail(email)}
                className="w-full transition-all cursor-pointer duration-200 hover:shadow-md bg-primary hover:bg-gray-800 text-white rounded-xl px-5 py-3 h-auto"
              >
                {isMagicLinkLoading ? <Loader2 size={20} className="animate-spin" /> : <Mail size={20} />}
                <span className="text-sm font-medium">
                  {isMagicLinkLoading ? 'Enviando...' : 'Enviar email'}
                </span>
              </Button>
            </form>

            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-muted"></div>
              <span className="text-sm text-gray-500">ou</span>
              <div className="flex-1 h-px bg-muted"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full bg-gray-100 hover:bg-gray-200 text-[#5C6570] hover:text-zinc-800 cursor-pointer flex active:opacity-30 transition-all duration-100 items-center justify-center gap-2 rounded-xl px-5 py-3"
            >
              {isGoogleLoading ? (
                <Loader2 size={20} className="text-[#5C6570] animate-spin" />
              ) : (
                <img
                  src="/google-logo.png"
                  alt="Google Logo"
                  width={20}
                  height={20}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <span className="text-sm font-medium">
                {isGoogleLoading ? (
                  'Entrando com o Google...'
                ) : (
                  <>
                    Entrar com <span className="font-bold">Google</span>
                  </>
                )}
              </span>
            </button>
          </>
        ) : (
          <div className="w-full bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <Mail size={40} className="mx-auto mb-3 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">Email enviado com sucesso!</h3>
            <p className="text-sm text-green-700 mb-4">
              Verifique seu email ({email}) e clique no link para fazer login.
            </p>
            <button
              onClick={() => {
                setMagicLinkSent(false)
                setEmail('')
              }}
              className="text-sm cursor-pointer text-green-600 hover:text-green-700 underline"
            >
              Voltar para o login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
