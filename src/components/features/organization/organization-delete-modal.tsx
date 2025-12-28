"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { OrganizationWithWorkspaces } from "@/lib/api/types/organization.types"

interface OrganizationDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: OrganizationWithWorkspaces | null
  onConfirm: () => Promise<void>
  isDeleting: boolean
  error?: string | null
}

export function OrganizationDeleteModal({
  open,
  onOpenChange,
  organization,
  onConfirm,
  isDeleting,
  error,
}: OrganizationDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] !bg-background !border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">Excluir Organização</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-foreground leading-relaxed">
            Tem certeza que deseja excluir a organização <strong className="font-semibold">&ldquo;{organization?.name}&rdquo;</strong>?
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            Todos os workspaces e conteúdos da organização serão excluídos.
          </p>
          <p className="text-sm text-red-600 font-medium">
            Esta ação não pode ser desfeita.
          </p>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              size="default"
              disabled={isDeleting}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              variant="destructive"
              size="default"
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
