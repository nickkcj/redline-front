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
      className="group relative bg-background/90 backdrop-blur-sm border border-border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-red-500/10 hover:border-red-500/30 hover:-translate-y-0.5 w-full sm:w-[calc(50%-12px)] sm:min-w-[320px] sm:max-w-[480px] shadow-sm"
      onClick={onEnter}
    >
      {/* Menu Button - Always visible on hover */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <h3 className="text-2xl font-semibold text-foreground mb-2 break-words group-hover:text-foreground transition-colors">
          {workspace.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {workspace.description || <span className="italic">Sem descrição</span>}
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
