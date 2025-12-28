"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

interface OrganizationsHeaderProps {
  organizationCount: number
  onCreateClick: () => void
}

export function OrganizationsHeader({ organizationCount, onCreateClick }: OrganizationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Organizações
          </h2>
          <Badge variant="secondary" className="text-sm font-medium bg-muted text-foreground border-border">
            {organizationCount}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
          Gerencie suas organizações e acesse seus projetos
        </p>
      </div>
      <Button
        onClick={onCreateClick}
        className="w-full sm:w-auto transition-all cursor-pointer duration-200 hover:shadow-lg hover:scale-[1.02] bg-primary hover:bg-primary/90 text-white shadow-sm"
      >
        <Plus className="size-4 mr-2" />
        <span className="sm:inline">Nova Organização</span>
      </Button>
    </div>
  )
}
