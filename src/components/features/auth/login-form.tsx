'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Mail } from 'lucide-react'
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
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
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
  )
}
