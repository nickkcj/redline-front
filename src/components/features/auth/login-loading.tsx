'use client'

import { Loader2 } from 'lucide-react'

export function LoginLoading() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-background">
      <Loader2 size={40} className="text-muted-foreground animate-spin" />
    </div>
  )
}
