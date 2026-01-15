'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LoginFormProps {
  onMagicLinkRequest: (email: string) => Promise<void>
  isMagicLinkLoading: boolean
}

export function LoginForm({ onMagicLinkRequest, isMagicLinkLoading }: LoginFormProps) {
  const [email, setEmail] = useState('')

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !isValidEmail(email)) {
      toast.error('Email inválido', {
        description: 'Por favor, insira um email válido',
      })
      return
    }

    try {
      await onMagicLinkRequest(email)
    } catch (error) {
      // Error handling is done in the parent component
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Input
        type="email"
        name="email"
        id="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="nome@exemplo.com"
        disabled={isMagicLinkLoading}
        required
      />
      <Button
        type="submit"
        disabled={isMagicLinkLoading || !email || !isValidEmail(email)}
        className="w-full"
      >
        {isMagicLinkLoading && (
          <Loader2 className="size-4 animate-spin" />
        )}
        {isMagicLinkLoading ? 'Enviando...' : 'Entrar com Email'}
      </Button>
    </form>
  )
}
