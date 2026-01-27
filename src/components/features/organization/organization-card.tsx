"use client"

import type { OrganizationWithWorkspaces } from "@/lib/api/types/organization.types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Buildings, DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface OrganizationCardProps {
  organization: OrganizationWithWorkspaces
  isOwner: boolean
  onEnter: () => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}

export function OrganizationCard({
  organization,
  isOwner,
  onEnter,
  onEdit,
  onDelete,
}: OrganizationCardProps) {
  const workspaceCount = organization.workspaces?.length || 0

  return (
    <div
      className="bg-background/90 backdrop-blur-sm border border-border rounded-xl p-6 cursor-pointer relative group w-full sm:w-[calc(50%-12px)] sm:min-w-[320px] sm:max-w-[480px] shadow-sm hover:shadow-lg hover:border-border transition-all duration-200 hover:-translate-y-0.5"
      onClick={onEnter}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 font-medium">
            <Buildings weight="bold" className="size-3.5" />
            <span>Organização</span>
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-2 break-words group-hover:text-foreground transition-colors">
            {organization.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Show owner/member badge */}
          {isOwner ? (
            <Badge variant="default" className="text-xs bg-blue-50 text-blue-700 border-blue-200 font-medium">
              Proprietário
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-muted/50 text-foreground border-border font-medium">
              Membro
            </Badge>
          )}
          {/* Only show edit/delete options if user is the owner */}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-foreground hover:text-foreground hover:bg-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DotsThreeVertical weight="bold" className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40 text-sm !bg-background !border-border">
                <DropdownMenuItem
                  onClick={onEdit}
                  className="text-sm text-foreground hover:bg-muted"
                >
                  <PencilSimple weight="bold" className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash weight="bold" className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-1.5 mt-4">
        <p className="text-sm text-muted-foreground break-words line-clamp-2">
          {organization.description || <span className="text-muted-foreground italic">Sem descrição</span>}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
          <span className="font-medium">{workspaceCount} projeto{workspaceCount !== 1 ? 's' : ''}</span>
          {organization.createdAt && (
            <span className="text-xs">
              Criada em {new Date(organization.createdAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
