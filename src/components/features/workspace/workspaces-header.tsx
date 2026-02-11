"use client"

import { Button } from "@/components/ui/button"
import { Plus, CaretLeft, Buildings } from "@phosphor-icons/react"

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
          <CaretLeft weight="bold" className="size-4" />
          <span>Organizações</span>
        </Button>
        <span className="text-muted-foreground">/</span>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/50">
          <Buildings weight="bold" className="size-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">{organizationName}</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Projetos
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            Gerencie seus projetos de trabalho
          </p>
        </div>
        {canCreateWorkspace && (
          <Button
            onClick={onCreateClick}
            className="w-full sm:w-auto transition-all cursor-pointer duration-200 hover:shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] bg-red-600 hover:bg-red-700 text-white shadow-sm"
          >
            <Plus weight="bold" className="size-4 mr-2" />
            Novo Projeto
          </Button>
        )}
      </div>
    </div>
  )
}
