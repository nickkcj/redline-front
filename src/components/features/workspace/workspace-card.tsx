"use client"

import type { WorkspaceSummary } from "@/lib/api/types/organization.types"
import { Button } from "@/components/ui/button"
import { DotsThree, PencilSimple, Trash, SignOut } from "@phosphor-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
      className="group relative bg-background border border-border rounded-lg p-4 cursor-pointer transition-all hover:bg-accent/30 w-full sm:w-[280px]"
      onClick={onEnter}
    >
      {/* Menu Button - Always visible on hover */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={(e) => e.stopPropagation()}
            >
              <DotsThree weight="bold" className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-sm">
            {canManage && (
              <>
                <DropdownMenuItem onClick={onEdit} className="gap-2 text-sm">
                  <PencilSimple weight="bold" className="h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onDelete} 
                  variant="destructive"
                  className="gap-2 text-sm"
                >
                  <Trash weight="bold" className="h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem 
              onClick={onLeave}
              className="gap-2 text-sm text-tag-orange-foreground focus:text-tag-orange-foreground"
            >
              <SignOut weight="bold" className="h-4 w-4" />
              Sair do projeto
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="pr-8">
        <h3 className="text-base font-medium text-foreground mb-1 truncate">
          {workspace.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {workspace.description || 'Sem descrição'}
        </p>
        {workspace.createdAt && (
          <p className="text-xs text-muted-foreground">
            Criado em {new Date(workspace.createdAt).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
    </div>
  )
}
