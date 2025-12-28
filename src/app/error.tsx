"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/shared/states"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error("Global error:", error)
  }, [error])

  return (
    <ErrorState
      error={error}
      title="Algo deu errado"
      retry={reset}
      retryText="Tentar novamente"
      fullPage
    />
  )
}
