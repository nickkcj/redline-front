'use client'

import { Mail } from 'lucide-react'

interface MagicLinkSuccessProps {
  email: string
  onBackToLogin: () => void
}

export function MagicLinkSuccess({ email, onBackToLogin }: MagicLinkSuccessProps) {
  return (
    <div className="w-full bg-green-50 border border-green-200 rounded-xl p-6 text-center">
      <Mail size={40} className="mx-auto mb-3 text-green-600" />
      <h3 className="text-lg font-semibold text-green-800 mb-2">Email enviado com sucesso!</h3>
      <p className="text-sm text-green-700 mb-4">
        Verifique seu email ({email}) e clique no link para fazer login.
      </p>
      <button
        onClick={onBackToLogin}
        className="text-sm cursor-pointer text-green-600 hover:text-green-700 underline"
      >
        Voltar para o login
      </button>
    </div>
  )
}
