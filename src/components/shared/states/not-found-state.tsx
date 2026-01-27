"use client"

import { FileX } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface NotFoundStateProps {
  /**
   * Entidade não encontrada (ex: "Workspace", "Documento", "Organização")
   */
  entity?: string
  /**
   * Mensagem customizada
   */
  message?: string
  /**
   * Link para voltar (ex: "/")
   */
  backLink?: string
  /**
   * Texto do botão de voltar (padrão: "Voltar")
   */
  backText?: string
  /**
   * Classes CSS adicionais
   */
  className?: string
}

export function NotFoundState({
  entity = "Página",
  message,
  backLink = "/",
  backText = "Voltar",
  className,
}: NotFoundStateProps) {
  const defaultMessage = `${entity} não encontrada`

  return (
    <div className={cn("flex min-h-screen flex-col items-center justify-center gap-6 p-4", className)}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-muted p-4">
          <FileX weight="fill" className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {message || defaultMessage}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            O recurso que você está procurando não existe ou foi removido.
          </p>
        </div>
      </div>
      <Button asChild>
        <Link href={backLink}>{backText}</Link>
      </Button>
    </div>
  )
}
