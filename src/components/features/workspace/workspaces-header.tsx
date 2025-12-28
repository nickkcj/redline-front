"use client"

import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft, Building } from "lucide-react"

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
    <>
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackClick}
          className="gap-2 text-base cursor-pointer text-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
          <span>Voltar para Organizações</span>
        </Button>
        <div className="flex items-center gap-2">
          <Building className="size-5 text-foreground" />
          <span className="text-base font-medium text-foreground">
            {organizationName}
          </span>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Projetos
          </h1>
          <p className="text-foreground mt-1 text-sm sm:text-base">
            Gerencie seus projetos de trabalho
          </p>
        </div>
        {canCreateWorkspace && (
          <Button
            onClick={onCreateClick}
            className="w-full sm:w-auto transition-all cursor-pointer duration-200 hover:shadow-md bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="size-4 mr-2" />
            <span className="sm:inline">Novo Projeto</span>
          </Button>
        )}
      </div>
    </>
  )
}
