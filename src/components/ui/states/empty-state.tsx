"use client"

import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/date.utils"
import { ReactNode } from "react"

interface EmptyStateProps {
  /**
   * Ícone do Lucide para exibir
   */
  icon?: LucideIcon
  /**
   * Título do empty state
   */
  title: string
  /**
   * Descrição opcional
   */
  description?: string
  /**
   * Ação/botão opcional
   */
  action?: ReactNode
  /**
   * Classes CSS adicionais
   */
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-12 text-center", className)}>
      {Icon && (
        <div className="rounded-full bg-muted p-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-1">
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
