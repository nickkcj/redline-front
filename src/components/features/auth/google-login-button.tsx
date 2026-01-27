'use client'

import Image from 'next/image'
import { CircleNotch } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface GoogleLoginButtonProps {
  onGoogleLogin: () => Promise<void>
  isGoogleLoading: boolean
}

export function GoogleLoginButton({ onGoogleLogin, isGoogleLoading }: GoogleLoginButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onGoogleLogin}
      disabled={isGoogleLoading}
      className="w-full"
    >
      {isGoogleLoading ? (
        <CircleNotch weight="bold" className="size-4 animate-spin" />
      ) : (
        <Image
          src="/google-logo.png"
          alt="Google"
          width={16}
          height={16}
          className="size-4"
        />
      )}
      {isGoogleLoading ? 'Entrando...' : 'Continuar com Google'}
    </Button>
  )
}
