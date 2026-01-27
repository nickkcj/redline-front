'use client'

import { CircleNotch } from '@phosphor-icons/react'

export function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <CircleNotch weight="bold" className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}
