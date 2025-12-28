"use client"

import type { WorkspaceSummary } from "@/lib/api/types/organization.types"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Trash2, DoorOpen } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface WorkspaceCardProps {
  workspace: WorkspaceSummary
  canManage: boolean
  onEnter: () => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
  onLeave: (e: React.MouseEvent) => void
}

export function WorkspaceCard({
  workspace,
  canManage,
  onEnter,
  onEdit,
  onDelete,
  onLeave,
}: WorkspaceCardProps) {
  return (
    <div
      className="bg-background border border-border rounded-xl p-6 cursor-pointer relative group w-full sm:w-[calc(50%-12px)] sm:min-w-[320px] sm:max-w-[480px] shadow-sm hover:shadow-md transition-shadow"
      onClick={onEnter}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-semibold text-foreground mb-2 break-words">
            {workspace.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 !bg-background !border-border">
              {canManage && (
                <>
                  <DropdownMenuItem
                    onClick={onEdit}
                    className="text-foreground hover:bg-accent"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={onLeave}
                className="text-orange-600 hover:bg-orange-50"
              >
                <DoorOpen className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground break-words">
          {workspace.description || 'Sem descrição'}
        </p>
        {workspace.createdAt && (
          <p className="text-sm text-muted-foreground font-medium">
            Criado em {new Date(workspace.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  )
}
