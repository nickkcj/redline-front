"use client"

import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils/date.utils"

interface LoadingStateProps {
  /**
   * Variant do loading
   * - spinner: Apenas o ícone de loading
   * - skeleton: Skeleton boxes (padrão)
   * - fullPage: Loading centralizado na página inteira
   */
  variant?: "spinner" | "skeleton" | "fullPage"
  /**
   * Texto opcional a ser exibido abaixo do loading
   */
  text?: string
  /**
   * Número de skeleton items (apenas para variant="skeleton")
   */
  count?: number
  /**
   * Classes CSS adicionais
   */
  className?: string
}

export function LoadingState({
  variant = "skeleton",
  text,
  count = 3,
  className,
}: LoadingStateProps) {
  if (variant === "fullPage") {
    return (
      <div className={cn("flex min-h-screen flex-col items-center justify-center gap-4", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    )
  }

  if (variant === "spinner") {
    return (
      <div className={cn("flex items-center justify-center gap-3", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    )
  }

  // Skeleton variant (padrão)
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
      {text && (
        <p className="mt-4 text-center text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )
}
