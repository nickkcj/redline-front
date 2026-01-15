"use client"

import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, Building2 } from "lucide-react"

interface WorkspacesHeaderProps {
  organizationName: string
  canCreateWorkspace: boolean
  onBackClick: () => void
  onCreateClick: () => void
}

export function WorkspacesHeader({
  organizationName,
  canCreateWorkspace,
  onBackClick,
  onCreateClick,
}: WorkspacesHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackClick}
          className="gap-1 h-7 px-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
        >
          <ChevronLeft className="size-4" />
          <span>Organizações</span>
        </Button>
        <span className="text-muted-foreground">/</span>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/50">
          <Building2 className="size-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">{organizationName}</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Projetos
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie seus projetos de trabalho
          </p>
        </div>
        {canCreateWorkspace && (
          <Button
            onClick={onCreateClick}
            variant="default"
            size="sm"
            className="gap-1.5 h-8 px-3 bg-ring hover:bg-ring/90 text-white rounded-md"
          >
            <Plus className="size-4" />
            Novo Projeto
          </Button>
        )}
      </div>
    </div>
  )
}
