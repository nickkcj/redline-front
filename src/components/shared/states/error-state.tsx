"use client"

import { WarningCircle } from "@phosphor-icons/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  /**
   * Erro (pode ser Error object ou string)
   */
  error?: Error | string | null
  /**
   * Título customizado (padrão: "Erro")
   */
  title?: string
  /**
   * Mensagem customizada (se não passar error)
   */
  message?: string
  /**
   * Callback para tentar novamente
   */
  retry?: () => void
  /**
   * Texto do botão de retry (padrão: "Tentar novamente")
   */
  retryText?: string
  /**
   * Exibir como fullPage centralizado
   */
  fullPage?: boolean
  /**
   * Classes CSS adicionais
   */
  className?: string
}

export function ErrorState({
  error,
  title = "Erro",
  message,
  retry,
  retryText = "Tentar novamente",
  fullPage = false,
  className,
}: ErrorStateProps) {
  const errorMessage = message || (error instanceof Error ? error.message : error) || "Ocorreu um erro inesperado"

  const content = (
    <Alert variant="destructive" className={cn("", className)}>
      <WarningCircle weight="fill" className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {errorMessage}
      </AlertDescription>
      {retry && (
        <Button
          onClick={retry}
          variant="outline"
          size="sm"
          className="mt-4"
        >
          {retryText}
        </Button>
      )}
    </Alert>
  )

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {content}
        </div>
      </div>
    )
  }

  return content
}
