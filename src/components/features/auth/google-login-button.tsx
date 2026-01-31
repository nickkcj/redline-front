'use client'

import { Loader2 } from 'lucide-react'

interface GoogleLoginButtonProps {
  onGoogleLogin: () => Promise<void>
  isGoogleLoading: boolean
}

export function GoogleLoginButton({ onGoogleLogin, isGoogleLoading }: GoogleLoginButtonProps) {
  return (
    <button
      onClick={onGoogleLogin}
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
  )
}
