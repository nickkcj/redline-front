'use client'

import { EnvelopeSimple, ArrowLeft } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface MagicLinkSuccessProps {
  email: string
  onBackToLogin: () => void
}

export function MagicLinkSuccess({ email, onBackToLogin }: MagicLinkSuccessProps) {
  return (
    <div className="flex flex-col gap-4">
      <Alert variant="success">
        <EnvelopeSimple weight="bold" className="size-4" />
        <AlertTitle>Email enviado!</AlertTitle>
        <AlertDescription>
          Verifique sua caixa de entrada em <span className="font-medium">{email}</span> e clique no link para entrar.
        </AlertDescription>
      </Alert>
      
      <Button
        variant="ghost"
        onClick={onBackToLogin}
        className="w-full"
      >
        <ArrowLeft weight="bold" className="size-4" />
        Voltar para o login
      </Button>
    </div>
  )
}
