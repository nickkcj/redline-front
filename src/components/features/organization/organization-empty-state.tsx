"use client"

import { Button } from "@/components/ui/button"
import { Building, Plus } from "lucide-react"

interface OrganizationEmptyStateProps {
  onCreateClick: () => void
}

export function OrganizationEmptyState({ onCreateClick }: OrganizationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-background/90 border border-border rounded-xl p-8 text-center max-w-md">
        <Building className="size-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-base font-medium mb-2">Nenhuma organização disponível</p>
        <p className="text-muted-foreground text-sm mb-6">Crie sua primeira organização para começar</p>
        <Button
          onClick={onCreateClick}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="size-4 mr-2" />
          Criar Organização
        </Button>
      </div>
    </div>
  )
}
